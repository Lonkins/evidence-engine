/** Wire types for the Live Interrogation backend (live-server). */

export interface TraceEntry {
  step: string;
  method: "POST" | "GET";
  target: string;
  latencyMs: number;
  status: number;
  detail?: string;
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
  score: Scorecard;
  trace: TraceEntry[];
}

export interface Scorecard {
  hallucinationsCaught: number;
  falseObjections: number;
  selfContradictionsExposed: number;
  turns: number;
  challenges: number;
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
