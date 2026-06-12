/** Wire types for the Live Interrogation backend (live-server). */

export interface TraceEntry {
  step: string;
  method: "POST" | "GET";
  target: string;
  latencyMs: number;
  status: number;
  detail?: string;
  /** Which system did the work: live Azure call, GitHub Models, or local heuristic. */
  origin: "azure" | "model" | "heuristic";
}

export interface LiveClaimRef {
  claimId: string;
  text: string;
}

export interface RetrievedDoc {
  docKey: string;
  title: string;
  rerankerScore: number;
}

export interface AskResponse {
  sessionId: string;
  speaker: string;
  turnNo: number;
  reply: string;
  claims: LiveClaimRef[];
  retrievedDocs: RetrievedDoc[];
  trace: TraceEntry[];
}

export type EvidenceVerdict = "SUPPORTED" | "UNSUPPORTED" | "CONTRADICTED";
export type SelfVerdict = "SELF_CONSISTENT" | "SELF_CONTRADICTION";

export interface ChallengeResponse {
  claimId: string;
  claimText: string;
  speaker: string;
  turnNo: number;
  evidence: {
    verdict: EvidenceVerdict;
    citations: Array<{ docKey: string; title: string; excerpt: string }>;
  };
  self: {
    verdict: SelfVerdict;
    conflicts: Array<{ turnNo?: number; statement: string }>;
  };
  /** Present only when the player pinned a planted fabrication with a contradiction. */
  plant?: { confirmed: boolean; assertion: string };
  score: Scorecard;
  trace: TraceEntry[];
}

/**
 * Catches need positive evidence (CONTRADICTED / SELF_CONTRADICTION);
 * UNSUPPORTED is flagged separately — unverifiable, never "caught".
 */
export interface Scorecard {
  contradictionsPinned: number;
  selfContradictionsExposed: number;
  flaggedUnverifiable: number;
  falseObjections: number;
  turns: number;
  challenges: number;
  plantsCaught: number;
  plantsTotal: number;
}

export interface ResetResponse {
  deletedTestimonyDocs: number;
  finalScore: Scorecard;
  trace: TraceEntry[];
}

export interface LiveTurn {
  turnNo: number;
  question: string;
  reply: string;
  claims: LiveClaimRef[];
  retrievedDocs: RetrievedDoc[];
}
