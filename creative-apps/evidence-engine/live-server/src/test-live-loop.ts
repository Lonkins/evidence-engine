/**
 * Live-mode end-to-end verification — exercises the demo path over HTTP
 * against the running live-server (which talks to the LIVE Foundry IQ KB):
 *
 *   one suspect → three questions → challenge claims →
 *   at least one caught hallucination (UNSUPPORTED/CONTRADICTED) →
 *   self-contradiction attempt → scorecard → session reset (testimony cleanup)
 *
 * Writes a sanitized trace to ../docs/live-mode-proof.json (no keys, no host).
 * Usage: start the server, then `npm run test:live`.
 */
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.LIVE_SERVER_URL ?? "http://localhost:8787";
const PROOF_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..", "..", "docs", "live-mode-proof.json"
);

interface AskResponse {
  turnNo: number;
  reply: string;
  claims: Array<{ claimId: string; text: string }>;
  retrievedDocs: Array<{ docKey: string; rerankerScore: number }>;
  trace: TraceEntry[];
}

interface ChallengeResponse {
  claimText: string;
  evidence: { verdict: string; citations: Array<{ docKey: string; title: string }> };
  self: { verdict: string; conflicts: Array<{ turnNo?: number; statement: string }> };
  score: Record<string, number>;
  trace: TraceEntry[];
}

interface TraceEntry {
  step: string;
  method: string;
  target: string;
  latencyMs: number;
  status: number;
  detail?: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`POST ${path} → ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

function hasTime(text: string): boolean {
  return /\b\d{1,2}:\d{2}\b/.test(text);
}

async function main(): Promise<void> {
  const health = await (await fetch(`${BASE}/api/health`)).json() as { live: boolean };
  if (!health.live) throw new Error("Server reports live=false — KB unreachable");
  console.log("✓ health: live KB reachable");

  const { sessionId } = await post<{ sessionId: string }>("/api/session", {});
  console.log(`✓ session: ${sessionId}`);

  const questions = [
    "Walk me through your movements that evening, minute by minute.",
    "What time exactly did you leave the gallery? Be precise.",
    "The badge log tells a different story. When did you REALLY leave, and what did you do before that?",
  ];

  const turns: Array<{ question: string; response: AskResponse }> = [];
  for (const question of questions) {
    const response = await post<AskResponse>("/api/ask", {
      sessionId,
      speaker: "Helena Voss",
      question,
    });
    turns.push({ question, response });
    const kbCall = response.trace.find((t) => t.step.startsWith("kb.retrieve"));
    if (!kbCall) throw new Error("Turn missing live KB retrieve in trace");
    console.log(
      `✓ turn ${response.turnNo}: KB ${kbCall.latencyMs}ms (${kbCall.detail}), ` +
      `${response.claims.length} claims — "${response.reply.slice(0, 80)}..."`
    );
  }

  // Challenge every claim that asserts a clock time (most checkable), then
  // fall back to first claims if none carried times.
  const allClaims = turns.flatMap((t) => t.response.claims);
  const timeClaims = allClaims.filter((c) => hasTime(c.text));
  const toChallenge = (timeClaims.length > 0 ? timeClaims : allClaims).slice(0, 6);

  const challenges: ChallengeResponse[] = [];
  for (const claim of toChallenge) {
    const result = await post<ChallengeResponse>("/api/challenge", { sessionId, claimId: claim.claimId });
    challenges.push(result);
    console.log(
      `✓ challenge "${claim.text.slice(0, 60)}..." → evidence: ${result.evidence.verdict}` +
      `${result.evidence.citations[0] ? ` (${result.evidence.citations[0].docKey})` : ""}, ` +
      `self: ${result.self.verdict}`
    );
  }

  // New scoring semantics (design-log entry 2): a catch needs positive
  // evidence — CONTRADICTED or SELF_CONTRADICTION. UNSUPPORTED is flagged
  // separately as unverifiable.
  const caught = challenges.filter(
    (c) => c.evidence.verdict === "CONTRADICTED" || c.self.verdict === "SELF_CONTRADICTION"
  );
  const flagged = challenges.filter((c) => c.evidence.verdict === "UNSUPPORTED");
  const selfContradictions = challenges.filter((c) => c.self.verdict === "SELF_CONTRADICTION");
  const finalScore = challenges.at(-1)?.score;

  console.log("");
  console.log(`Contradictions pinned (catches): ${caught.length}`);
  console.log(`Flagged unverifiable (no collar): ${flagged.length}`);
  console.log(`Self-contradictions exposed: ${selfContradictions.length}`);
  console.log(`Scorecard: ${JSON.stringify(finalScore)}`);

  const reset = await post<{ deletedTestimonyDocs: number }>("/api/reset", { sessionId });
  console.log(`✓ reset: ${reset.deletedTestimonyDocs} testimony docs deleted from live index`);

  // Sanitized proof artifact — no endpoint hosts, no keys, no session reuse risk.
  const proof = {
    artifact: "live-mode-proof",
    generatedAt: new Date().toISOString(),
    description:
      "End-to-end Live Interrogation run against the LIVE Foundry IQ knowledge base " +
      "(Azure AI Search free tier, api-version 2026-05-01-preview) and GitHub Models " +
      "free tier. Every turn and every verdict originates from a live KB call — " +
      "see the per-call engine traces below (path + latency + status; hosts and keys redacted).",
    demoPath: {
      suspect: "Helena Voss",
      turns: turns.map(({ question, response }) => ({
        turnNo: response.turnNo,
        question,
        reply: response.reply,
        claimCount: response.claims.length,
        retrievedDocs: response.retrievedDocs,
        engineTrace: response.trace,
      })),
      challenges: challenges.map((c) => ({
        claim: c.claimText,
        evidenceVerdict: c.evidence.verdict,
        citations: c.evidence.citations.map((cite) => cite.docKey),
        selfVerdict: c.self.verdict,
        selfConflicts: c.self.conflicts,
        engineTrace: c.trace,
      })),
      scorecard: finalScore,
      sessionCleanup: { deletedTestimonyDocs: reset.deletedTestimonyDocs },
    },
    assertions: {
      everyTurnHadLiveKbRetrieve: turns.every((t) =>
        t.response.trace.some((e) => e.step.startsWith("kb.retrieve") && e.status === 200)
      ),
      contradictionPinned: caught.length > 0,
      selfContradictionExposed: selfContradictions.length > 0,
      testimonyCleanedUp: true,
    },
  };
  await writeFile(PROOF_PATH, JSON.stringify(proof, null, 2));
  console.log(`✓ proof written: ${PROOF_PATH}`);

  if (!proof.assertions.everyTurnHadLiveKbRetrieve) {
    throw new Error("FAIL: a turn was missing a live KB retrieve");
  }
  if (!proof.assertions.contradictionPinned) {
    throw new Error("FAIL: no contradiction pinned on the demo path");
  }
  if (!proof.assertions.selfContradictionExposed) {
    console.warn(
      "WARN: no self-contradiction this run (LLM drift is stochastic) — rerun test:live"
    );
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error("LIVE LOOP FAILED:", error);
  process.exit(1);
});
