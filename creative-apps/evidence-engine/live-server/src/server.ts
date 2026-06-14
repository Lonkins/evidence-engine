import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { loadConfig } from "./config.js";
import { SearchClient, type TestimonyDoc, type CaseSourceDoc } from "./search.js";
import { chat } from "./llm.js";
import { segmentClaims } from "./claims.js";
import {
  checkAgainstEvidence,
  checkSelfConsistency,
  extractTimes,
  buildVerdictInstruction,
  parseIqAnswer,
  combineWithCrossCheck,
  ungroundedVerdict,
  type DocText,
  type IqVerdict,
} from "@evidence-engine/verdict-core";
import {
  buildSystemPrompt,
  buildByoSystemPrompt,
  isSpeaker,
  plantsFor,
  type Speaker,
} from "./characters.js";
import { heuristicEntry, iqActivityEntry } from "./trace.js";
import {
  appendHistory,
  createSession,
  deleteSession,
  expiredByoSessions,
  getHistory,
  getSession,
  nextTurn,
  touchSession,
  type Session,
  type Witness,
} from "./sessions.js";
import { extractWitnesses } from "./witnesses.js";
import type { TraceEntry } from "./trace.js";

const config = loadConfig();
const search = new SearchClient(config);

// Data hygiene: purge abandoned bring-your-own partitions. A BYO session that is
// never explicitly reset (the user just closes the tab) would otherwise leave its
// pasted source sitting in the shared index. Every few minutes, drop the
// partitions of BYO sessions idle past the TTL — reusing the hard-guarded
// deleteCaseDocs (byo- ids only), so it can never touch the Holbrooke corpus.
const BYO_SWEEP_INTERVAL_MS = 5 * 60_000;

async function sweepAbandonedByo(): Promise<void> {
  const expired = expiredByoSessions(config.byoTtlMinutes * 60_000);
  for (const session of expired) {
    try {
      await search.deleteCaseDocs(session.caseId);
    } catch (error) {
      console.error(`[live-server] BYO sweep failed for ${session.caseId}:`, describe(error));
    } finally {
      deleteSession(session.sessionId);
    }
  }
}

const byoSweepTimer = setInterval(() => {
  void sweepAbandonedByo();
}, BYO_SWEEP_INTERVAL_MS);
// Don't let the sweep timer keep the process alive on its own.
byoSweepTimer.unref?.();

/** The evidence partition this session interrogates (Holbrooke corpus or a BYO upload). */
function evidenceFilter(session: Session): string {
  return `doc_type eq 'evidence' and case_id eq '${session.caseId}'`;
}

// Source-chunking bounds for "bring your own trial".
const MAX_CHUNK_CHARS = 1800;
const MAX_CHUNKS = 40;
const MIN_SOURCE_CHARS = 80;
const MAX_SOURCE_CHARS = 24000;

/** Split user-supplied source text into indexable chunks (paragraph-greedy). */
function chunkSource(
  text: string,
  sourceTitle: string,
  caseId: string,
  sessionId: string
): CaseSourceDoc[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = "";
  for (const paragraph of paragraphs) {
    if (paragraph.length > MAX_CHUNK_CHARS) {
      if (buffer) {
        chunks.push(buffer);
        buffer = "";
      }
      for (let i = 0; i < paragraph.length; i += MAX_CHUNK_CHARS) {
        chunks.push(paragraph.slice(i, i + MAX_CHUNK_CHARS));
      }
      continue;
    }
    if (buffer && buffer.length + paragraph.length + 2 > MAX_CHUNK_CHARS) {
      chunks.push(buffer);
      buffer = "";
    }
    buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
  }
  if (buffer) chunks.push(buffer);

  return chunks.slice(0, MAX_CHUNKS).map((content, index) => ({
    id: `${caseId}-${index}`,
    title: `${sourceTitle} — part ${index + 1}`,
    content,
    doc_type: "evidence" as const,
    case_id: caseId,
    session_id: sessionId,
  }));
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

interface JsonBody {
  [key: string]: unknown;
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

function applyCors(req: IncomingMessage, res: ServerResponse): void {
  const origin = req.headers.origin;
  if (origin && config.corsOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

async function readJson(req: IncomingMessage): Promise<JsonBody> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
    if (Buffer.concat(chunks).length > 64_000) {
      throw new Error("Request body too large");
    }
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw) as JsonBody;
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleHealth(res: ServerResponse): Promise<void> {
  try {
    const { data: reachable, entry } = await search.ping();
    send(res, 200, {
      live: reachable,
      kb: config.knowledgeBaseName,
      model: config.githubModelsModel,
      trace: [entry],
    });
  } catch (error) {
    send(res, 200, { live: false, error: describe(error) });
  }
}

async function handleNewSession(body: JsonBody, res: ServerResponse): Promise<void> {
  const source = typeof body.source === "string" ? body.source.trim() : "";

  // No source → the built-in Holbrooke example case.
  if (!source) {
    const session = createSession();
    return send(res, 200, {
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      mode: session.mode,
    });
  }

  // "Bring your own trial": index the user's source as its own evidence
  // partition, then interrogate a single witness grounded in it.
  if (source.length < MIN_SOURCE_CHARS || source.length > MAX_SOURCE_CHARS) {
    return send(res, 400, {
      error: `Source must be ${MIN_SOURCE_CHARS}–${MAX_SOURCE_CHARS} characters`,
    });
  }
  const sourceTitle =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 120)
      : "Your source";
  const caseId = `byo-${randomUUID()}`;
  const session = createSession({ caseId, mode: "byo", sourceTitle, plantsTotal: 0 });

  const docs = chunkSource(source, sourceTitle, caseId, session.sessionId);
  try {
    await search.uploadCaseDocs(docs, "index.upload(source)");
    // Infer the interrogatable cast from the source (Entry 8).
    const cast = await extractWitnesses(config, source, sourceTitle);
    session.witnesses = cast.data;
    send(res, 200, {
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      mode: session.mode,
      witnesses: session.witnesses,
      sourceTitle,
      chunks: docs.length,
    });
  } catch (error) {
    deleteSession(session.sessionId);
    send(res, 502, { error: `Failed to set up the trial: ${describe(error)}` });
  }
}

async function handleAsk(body: JsonBody, res: ServerResponse): Promise<void> {
  const sessionId = String(body.sessionId ?? "");
  const question = String(body.question ?? "").trim();

  const session = sessionId ? getSession(sessionId) : undefined;
  if (!session) return send(res, 404, { error: "Unknown session — create one via POST /api/session" });
  touchSession(session);
  if (!question || question.length > 600) {
    return send(res, 400, { error: "Question must be 1–600 characters" });
  }

  // Holbrooke mode interrogates one of the three suspects; a "bring your own"
  // session interrogates one of the witnesses inferred from the user's source.
  let speaker: string;
  let byoWitness: Witness | undefined;
  if (session.mode === "byo") {
    if (session.witnesses.length === 0) {
      return send(res, 400, { error: "This session has no witnesses" });
    }
    const requested = String(body.speaker ?? "").trim();
    byoWitness = session.witnesses.find((w) => w.name === requested) ?? session.witnesses[0];
    speaker = byoWitness.name;
  } else {
    const speakerRaw = String(body.speaker ?? "");
    if (!isSpeaker(speakerRaw)) return send(res, 400, { error: `Unknown speaker: ${speakerRaw}` });
    speaker = speakerRaw;
  }
  // Grounding defaults ON. `grounding: false` is the "pull the plug" demo —
  // Foundry IQ is unplugged so the witness has nothing anchoring her answer.
  const grounding = body.grounding !== false;
  const trace: TraceEntry[] = [];

  // 1. Live KB retrieve against the evidence partition — Foundry IQ is in the
  //    loop on every turn; the character only ever sees retrieved passages.
  //    With grounding OFF we retrieve nothing: the witness is ungrounded and
  //    free to invent, and the engine has nothing to check her against.
  let passages: Array<{ refId: number; title: string; content: string }> = [];
  let retrievedRefs: Array<{ docKey: string; title: string; rerankerScore: number }> = [];
  if (grounding) {
    const retrieval = await search.kbRetrieve(
      `${speaker}: ${question}`,
      evidenceFilter(session),
      "kb.retrieve(evidence)"
    );
    trace.push(retrieval.entry);
    passages = retrieval.data.passages;
    retrievedRefs = retrieval.data.references;
  } else {
    trace.push(
      heuristicEntry(
        "kb.retrieve — DISABLED (grounding off)",
        0,
        "Foundry IQ unplugged — the witness is ungrounded and nothing checks her"
      )
    );
  }

  // 2. In-character reply from GitHub Models, grounded but free to drift.
  const systemPrompt =
    session.mode === "byo" && byoWitness
      ? buildByoSystemPrompt(byoWitness, session.sourceTitle ?? "the source", passages)
      : buildSystemPrompt(speaker as Speaker, passages);
  const history = getHistory(session, speaker);
  const llm = await chat(config, [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: question },
  ]);
  trace.push(llm.entry);
  const reply = llm.data;

  const turnNo = nextTurn(session, speaker);
  appendHistory(session, speaker, [
    { role: "user", content: question },
    { role: "assistant", content: reply },
  ]);

  // 3. Segment the reply into claims and index them as testimony documents —
  //    searchable within seconds, which is fine for turn-based play.
  const segments = segmentClaims(reply);
  const claims = segments.map((segment) => ({
    claimId: `${session.sessionId}-t${turnNo}-c${segment.index}`,
    text: segment.text,
    turnNo,
    speaker,
  }));

  if (claims.length > 0) {
    const docs: TestimonyDoc[] = claims.map((claim) => ({
      id: claim.claimId,
      title: `Testimony — ${speaker}, turn ${turnNo}`,
      content: claim.text,
      doc_type: "testimony",
      case_id: session.caseId,
      session_id: session.sessionId,
      speaker,
      turn_no: turnNo,
    }));
    const upload = await search.uploadTestimony(docs, "index.upload(testimony)");
    trace.push(upload.entry);

    for (const claim of claims) {
      session.claims.set(claim.claimId, {
        claimId: claim.claimId,
        speaker,
        turnNo,
        text: claim.text,
        challenged: false,
      });
    }
  }

  send(res, 200, {
    sessionId: session.sessionId,
    speaker,
    turnNo,
    reply,
    claims: claims.map(({ claimId, text }) => ({ claimId, text })),
    retrievedDocs: retrievedRefs,
    grounding,
    trace,
  });
}

async function handleChallenge(body: JsonBody, res: ServerResponse): Promise<void> {
  const sessionId = String(body.sessionId ?? "");
  const claimId = String(body.claimId ?? "");

  const session = sessionId ? getSession(sessionId) : undefined;
  if (!session) return send(res, 404, { error: "Unknown session" });
  touchSession(session);
  const claim = session.claims.get(claimId);
  if (!claim) return send(res, 404, { error: "Unknown claim" });

  const trace: TraceEntry[] = [];

  // "Pull the plug" demo: grounding off → nothing is retrieved, so nothing can
  // be checked and the witness's word stands. Re-challenging the same claim
  // with grounding on is what produces the CONTRADICTED stamp — the thesis,
  // made interactive. Not scored as a catch or a false objection.
  const grounding = body.grounding !== false;
  // Preview mode powers the "pull the plug" split-screen: the UI fires this
  // endpoint twice (grounding off + on) for the SAME claim to show the delta
  // side by side. A preview challenge must NOT mutate the scorecard or consume
  // the claim — it is a demonstration, not a scored move.
  const preview = body.preview === true;
  if (!grounding) {
    trace.push(
      heuristicEntry(
        "kb.retrieve — DISABLED (grounding off)",
        0,
        "Foundry IQ unplugged — no evidence retrieved, the claim cannot be checked"
      )
    );
    const combined = ungroundedVerdict();
    if (!preview && !claim.challenged) {
      claim.challenged = true;
      session.score.challenges += 1;
    }
    return send(res, 200, {
      claimId,
      claimText: claim.text,
      speaker: claim.speaker,
      turnNo: claim.turnNo,
      evidence: { verdict: combined.verdict, source: combined.source, agreement: false, citations: [], iq: null, reasoningTokens: null },
      self: { verdict: "SELF_CONSISTENT", conflicts: [] },
      plant: undefined,
      score: session.score,
      trace,
    });
  }

  // (a) Live retrieve against the evidence partition. Declarative claims
  // rerank lower than questions, so the challenge path uses its own
  // calibrated threshold (grounded ≥ 2.2 vs fabricated ≤ 1.5, measured live).
  const evidenceRetrieval = await search.kbRetrieve(
    `${claim.speaker}: ${claim.text}`,
    evidenceFilter(session),
    "kb.retrieve(evidence)",
    config.claimEvidenceThreshold
  );
  trace.push(evidenceRetrieval.entry);

  const evidenceDocs: DocText[] = [];
  for (const ref of evidenceRetrieval.data.references) {
    const lookup = await search.lookupDoc(ref.docKey, `index.lookup(${ref.docKey})`);
    trace.push(lookup.entry);
    if (lookup.data) {
      evidenceDocs.push({
        docKey: ref.docKey,
        title: String(lookup.data.title ?? ref.title),
        content: String(lookup.data.content ?? ""),
      });
    }
  }
  const evidenceStarted = Date.now();
  const evidence = checkAgainstEvidence(claim.text, evidenceDocs, [claim.speaker]);
  trace.push(
    heuristicEntry(
      "verdict.heuristic(evidence)",
      Date.now() - evidenceStarted,
      `negation + clock-time conflicts over ${evidenceDocs.length} retrieved doc(s) → ${evidence.verdict}`
    )
  );

  // IQ-brain verdict: when enabled, the KB's grounded reasoning (answerSynthesis)
  // produces the verdict and the deterministic check above becomes a disclosed
  // cross-check. Falls back safely to the deterministic verdict if the IQ call
  // is unavailable, so the demo never hard-fails on the new path.
  let iqVerdict: IqVerdict | null = null;
  let iqReasoningTokens: number | null = null;
  if (config.iqVerdictEnabled && config.reasoningEffort !== "minimal") {
    try {
      // BYO corpora rerank on an uncalibrated scale; use a lower grounding floor
      // so a real CONTRADICTED isn't silently downgraded to UNVERIFIABLE.
      const verdictThreshold =
        session.mode === "byo" ? config.byoVerdictThreshold : config.claimEvidenceThreshold;
      const reason = await search.kbReason(
        buildVerdictInstruction(claim.text, claim.speaker),
        evidenceFilter(session),
        "kb.reason(verdict)",
        config.reasoningEffort,
        verdictThreshold
      );
      trace.push(reason.entry);
      // A4: surface the KB's own agentic reasoning steps as engine-tap lines —
      // the IQ visibly planning, searching, synthesising, and reasoning.
      for (const act of reason.data.activity) {
        trace.push(iqActivityEntry(act.label, act.elapsedMs, act.detail));
      }
      iqVerdict = parseIqAnswer(reason.data.answer, reason.data.references);
      iqReasoningTokens = reason.data.reasoningTokens;
    } catch (error) {
      // Disclosed degradation: log a heuristic trace line and keep the
      // deterministic verdict. Never silently substitute while claiming IQ.
      trace.push(
        heuristicEntry(
          "kb.reason(verdict) — unavailable, using cross-check",
          0,
          error instanceof Error ? error.message.slice(0, 120) : "IQ verdict unavailable"
        )
      );
    }
  }
  const combined = combineWithCrossCheck(iqVerdict, evidence);

  // (b) Live retrieve against this speaker's earlier testimony in this session.
  const testimonyFilter =
    `doc_type eq 'testimony' and case_id eq '${session.caseId}'` +
    ` and session_id eq '${session.sessionId}'` +
    ` and speaker eq '${claim.speaker}' and turn_no lt ${claim.turnNo}`;
  const selfRetrieval = await search.kbRetrieve(
    claim.text,
    testimonyFilter,
    "kb.retrieve(testimony)",
    config.testimonyThreshold
  );
  trace.push(selfRetrieval.entry);

  const earlierStatements: DocText[] = [];
  for (const ref of selfRetrieval.data.references) {
    const lookup = await search.lookupDoc(ref.docKey, `index.lookup(testimony)`);
    trace.push(lookup.entry);
    if (lookup.data) {
      earlierStatements.push({
        docKey: ref.docKey,
        title: String(lookup.data.title ?? ""),
        content: String(lookup.data.content ?? ""),
        turnNo: Number(lookup.data.turn_no ?? 0),
      });
    }
  }

  // Full sweep of the speaker's earlier testimony partition (live index call)
  // so a low-ranked but time-conflicting statement is never missed.
  const sweep = await search.listSessionTestimony(
    session.sessionId,
    claim.speaker,
    claim.turnNo
  );
  trace.push(sweep.entry);
  for (const doc of sweep.data) {
    const id = String(doc.id ?? "");
    if (!earlierStatements.some((existing) => existing.docKey === id)) {
      earlierStatements.push({
        docKey: id,
        title: String(doc.title ?? ""),
        content: String(doc.content ?? ""),
        turnNo: Number(doc.turn_no ?? 0),
      });
    }
  }
  const selfStarted = Date.now();
  const self = checkSelfConsistency(claim.text, earlierStatements);
  trace.push(
    heuristicEntry(
      "verdict.heuristic(self)",
      Date.now() - selfStarted,
      `clock-time conflicts vs ${earlierStatements.length} earlier statement(s) → ${self.verdict}`
    )
  );

  // A catch requires positive evidence — CONTRADICTED or SELF_CONTRADICTION.
  // UNSUPPORTED is "the file is silent": flagged, never scored as a catch
  // (counting it would make "challenge everything" the dominant strategy and
  // conflate unverifiable with false). SUPPORTED costs a false objection.
  const isCatch =
    combined.verdict === "CONTRADICTED" || self.verdict === "SELF_CONTRADICTION";

  // Ground truth: was this claim one of the planted fabrications? A plant
  // counts as caught only when the player pinned it with a contradiction.
  const claimTimes = extractTimes(claim.text.toLowerCase());
  // Plants only exist in the scripted Holbrooke case; in a bring-your-own trial
  // the lies are emergent, so there is no ground-truth plant to confirm.
  const matchedPlant =
    session.mode === "holbrooke"
      ? plantsFor(claim.speaker as Speaker).find((plant) =>
          claimTimes.some((time) => Math.abs(time - plant.timeMinutes) <= 5)
        )
      : undefined;
  const plantConfirmed = Boolean(matchedPlant) && isCatch;

  // Score the challenge once per claim. Preview (split-screen A/B) never scores.
  if (!preview && !claim.challenged) {
    claim.challenged = true;
    session.score.challenges += 1;
    if (combined.verdict === "CONTRADICTED") {
      session.score.contradictionsPinned += 1;
    } else if (combined.verdict === "UNSUPPORTED") {
      session.score.flaggedUnverifiable += 1;
    } else if (combined.verdict === "SUPPORTED" && self.verdict !== "SELF_CONTRADICTION") {
      session.score.falseObjections += 1;
    }
    if (self.verdict === "SELF_CONTRADICTION") {
      session.score.selfContradictionsExposed += 1;
    }
    if (matchedPlant && plantConfirmed && !session.plantsCaught.has(matchedPlant.id)) {
      session.plantsCaught.add(matchedPlant.id);
      session.score.plantsCaught = session.plantsCaught.size;
    }
  }

  send(res, 200, {
    claimId,
    claimText: claim.text,
    speaker: claim.speaker,
    turnNo: claim.turnNo,
    evidence: {
      verdict: combined.verdict,
      // Honest disclosure of which system decided: `iq` = the KB's grounded
      // reasoning (answerSynthesis); `heuristic` = the deterministic fallback.
      source: combined.source,
      // Whether the IQ verdict and the deterministic cross-check agreed.
      agreement: combined.agreement,
      citations:
        evidence.citations.length > 0
          ? evidence.citations.map((doc) => ({
              docKey: doc.docKey,
              title: doc.title,
              // The specific segment(s) that triggered the contradiction,
              // verbatim — or the doc opening for supporting citations.
              excerpt: (evidence.triggers[doc.docKey] ?? [doc.content.slice(0, 400)]).join("\n"),
            }))
          : combined.citations.map((ref) => ({
              docKey: ref.docKey,
              title: ref.title,
              excerpt: combined.citedPassage ?? "",
            })),
      // The KB's own one-line reasoning + verbatim cited passage, when the IQ
      // path produced the verdict.
      iq: combined.iq
        ? { justification: combined.iq.justification, citedPassage: combined.iq.citedPassage }
        : null,
      // The receipt: how hard the brain worked. Reasoning tokens come from the
      // KB's answerSynthesis call (null when the deterministic cross-check
      // decided, i.e. no model reasoning was spent).
      reasoningTokens: combined.source === "iq" ? iqReasoningTokens : null,
      effort: config.reasoningEffort,
    },
    self: {
      verdict: self.verdict,
      conflicts: self.conflicts.map((doc) => ({
        turnNo: doc.turnNo,
        statement: doc.content,
      })),
    },
    // Revealed only when the player pinned a planted fabrication with a
    // contradiction — the "it provably was fabricated" moment.
    plant: plantConfirmed
      ? { confirmed: true, assertion: matchedPlant!.assertion }
      : undefined,
    score: session.score,
    trace,
  });
}

async function handleReset(body: JsonBody, res: ServerResponse): Promise<void> {
  const sessionId = String(body.sessionId ?? "");
  const session = sessionId ? getSession(sessionId) : undefined;
  if (!session) return send(res, 404, { error: "Unknown session" });

  // Delete this session's testimony docs so the shared index stays tiny.
  const { data: deleted, entry } = await search.deleteSessionTestimony(session.sessionId);
  const trace: TraceEntry[] = [entry];

  // For a bring-your-own trial, also purge the uploaded source partition.
  if (session.mode === "byo") {
    try {
      const cleanup = await search.deleteCaseDocs(session.caseId);
      trace.push(cleanup.entry);
    } catch (error) {
      trace.push(
        heuristicEntry("index.delete(source) — failed", 0, describe(error).slice(0, 120))
      );
    }
  }

  const finalScore = session.score;
  deleteSession(session.sessionId);
  send(res, 200, { deletedTestimonyDocs: deleted, finalScore, trace });
}

function handleScore(body: JsonBody, res: ServerResponse): void {
  const sessionId = String(body.sessionId ?? "");
  const session = sessionId ? getSession(sessionId) : undefined;
  if (!session) return send(res, 404, { error: "Unknown session" });
  send(res, 200, { score: session.score });
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = createServer(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url ?? "/", "http://localhost");

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return await handleHealth(res);
    }
    if (req.method === "POST") {
      const body = await readJson(req);
      switch (url.pathname) {
        case "/api/session":
          return await handleNewSession(body, res);
        case "/api/ask":
          return await handleAsk(body, res);
        case "/api/challenge":
          return await handleChallenge(body, res);
        case "/api/reset":
          return await handleReset(body, res);
        case "/api/score":
          return handleScore(body, res);
      }
    }
    send(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(`[live-server] ${req.method} ${url.pathname} failed:`, error);
    send(res, 502, { error: describe(error) });
  }
});

server.listen(config.port, () => {
  console.log(`[live-server] listening on http://localhost:${config.port}`);
  console.log(`[live-server] KB: ${config.knowledgeBaseName} via ${config.searchEndpoint}`);
  console.log(`[live-server] model: ${config.githubModelsModel} (GitHub Models free tier)`);
});
