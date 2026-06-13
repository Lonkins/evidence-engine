import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { loadConfig } from "./config.js";
import { SearchClient, type TestimonyDoc } from "./search.js";
import { chat } from "./llm.js";
import { segmentClaims } from "./claims.js";
import {
  checkAgainstEvidence,
  checkSelfConsistency,
  type DocText,
} from "./verdict.js";
import {
  buildSystemPrompt,
  isSpeaker,
  plantsFor,
  CASE_ID,
  type Speaker,
} from "./characters.js";
import { heuristicEntry } from "./trace.js";
import { extractTimes } from "./verdict.js";
import {
  buildVerdictInstruction,
  parseIqAnswer,
  combineWithCrossCheck,
  ungroundedVerdict,
  type IqVerdict,
} from "./iq-verdict.js";
import {
  appendHistory,
  createSession,
  deleteSession,
  getHistory,
  getSession,
  nextTurn,
  type Session,
} from "./sessions.js";
import type { TraceEntry } from "./trace.js";

const config = loadConfig();
const search = new SearchClient(config);

const EVIDENCE_FILTER = `doc_type eq 'evidence' and case_id eq '${CASE_ID}'`;

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

function handleNewSession(res: ServerResponse): void {
  const session = createSession();
  send(res, 200, { sessionId: session.sessionId, createdAt: session.createdAt });
}

async function handleAsk(body: JsonBody, res: ServerResponse): Promise<void> {
  const sessionId = String(body.sessionId ?? "");
  const speakerRaw = String(body.speaker ?? "");
  const question = String(body.question ?? "").trim();

  const session = sessionId ? getSession(sessionId) : undefined;
  if (!session) return send(res, 404, { error: "Unknown session — create one via POST /api/session" });
  if (!isSpeaker(speakerRaw)) return send(res, 400, { error: `Unknown speaker: ${speakerRaw}` });
  if (!question || question.length > 600) {
    return send(res, 400, { error: "Question must be 1–600 characters" });
  }
  const speaker: Speaker = speakerRaw;
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
      EVIDENCE_FILTER,
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
  const systemPrompt = buildSystemPrompt(speaker, passages);
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
      case_id: CASE_ID,
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
  const claim = session.claims.get(claimId);
  if (!claim) return send(res, 404, { error: "Unknown claim" });

  const trace: TraceEntry[] = [];

  // "Pull the plug" demo: grounding off → nothing is retrieved, so nothing can
  // be checked and the witness's word stands. Re-challenging the same claim
  // with grounding on is what produces the CONTRADICTED stamp — the thesis,
  // made interactive. Not scored as a catch or a false objection.
  const grounding = body.grounding !== false;
  if (!grounding) {
    trace.push(
      heuristicEntry(
        "kb.retrieve — DISABLED (grounding off)",
        0,
        "Foundry IQ unplugged — no evidence retrieved, the claim cannot be checked"
      )
    );
    const combined = ungroundedVerdict();
    if (!claim.challenged) {
      claim.challenged = true;
      session.score.challenges += 1;
    }
    return send(res, 200, {
      claimId,
      claimText: claim.text,
      speaker: claim.speaker,
      turnNo: claim.turnNo,
      evidence: { verdict: combined.verdict, source: combined.source, agreement: false, citations: [], iq: null },
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
    EVIDENCE_FILTER,
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
  if (config.iqVerdictEnabled && config.reasoningEffort !== "minimal") {
    try {
      const reason = await search.kbReason(
        buildVerdictInstruction(claim.text, claim.speaker),
        EVIDENCE_FILTER,
        "kb.reason(verdict)",
        config.reasoningEffort,
        config.claimEvidenceThreshold
      );
      trace.push(reason.entry);
      iqVerdict = parseIqAnswer(reason.data.answer, reason.data.references);
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
    `doc_type eq 'testimony' and case_id eq '${CASE_ID}'` +
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
  const matchedPlant = plantsFor(claim.speaker).find((plant) =>
    claimTimes.some((time) => Math.abs(time - plant.timeMinutes) <= 5)
  );
  const plantConfirmed = Boolean(matchedPlant) && isCatch;

  // Score the challenge once per claim.
  if (!claim.challenged) {
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
  const finalScore = session.score;
  deleteSession(session.sessionId);
  send(res, 200, { deletedTestimonyDocs: deleted, finalScore, trace: [entry] });
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
    if (req.method === "POST" && url.pathname === "/api/session") {
      return handleNewSession(res);
    }
    if (req.method === "POST") {
      const body = await readJson(req);
      switch (url.pathname) {
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
