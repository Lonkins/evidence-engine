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
  /** Whether Foundry IQ grounding was on for this turn (false = pull the plug). */
  grounding?: boolean;
  trace: TraceEntry[];
}

export type EvidenceVerdict = "SUPPORTED" | "UNSUPPORTED" | "CONTRADICTED";
export type SelfVerdict = "SELF_CONSISTENT" | "SELF_CONTRADICTION";

/**
 * Which system produced the verdict. `iq` = the KB's grounded reasoning,
 * `heuristic` = the deterministic cross-check, `ungrounded` = grounding was
 * switched off so nothing could be checked ("pull the plug").
 */
export type VerdictSource = "iq" | "heuristic" | "ungrounded";

export interface ChallengeResponse {
  claimId: string;
  claimText: string;
  speaker: string;
  turnNo: number;
  evidence: {
    verdict: EvidenceVerdict;
    /** Honest disclosure of who decided; absent on older responses. */
    source?: VerdictSource;
    /** Whether the IQ verdict and deterministic cross-check agreed. */
    agreement?: boolean;
    /** The KB's own reasoning + verbatim cited passage, when IQ produced it. */
    iq?: { justification: string; citedPassage: string | null } | null;
    /** Reasoning tokens the KB spent on the IQ verdict; null on the cross-check / unplugged path. */
    reasoningTokens?: number | null;
    /** Reasoning-effort tier used for the IQ verdict (e.g. "medium"). */
    effort?: string;
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

/**
 * "You take the stand" — the inversion. The player asserts a claim and Foundry
 * IQ checks it against the case file (or their own source), returning the same
 * grounded verdict the witnesses face. No score: a one-shot fact-check.
 */
export interface StandAnswerResponse {
  answer: string;
  evidence: {
    verdict: EvidenceVerdict;
    source?: VerdictSource;
    agreement?: boolean;
    iq?: { justification: string; citedPassage: string | null } | null;
    reasoningTokens?: number | null;
    effort?: string;
    citations: Array<{ docKey: string; title: string; excerpt: string }>;
  };
  trace: TraceEntry[];
}
