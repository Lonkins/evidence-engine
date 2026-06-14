/**
 * Shared verdict types — the single contract every Evidence Engine surface
 * speaks. A5 (design-log Entry 4/6): one typed core consumed by live-server and
 * the MCP server so the verdict, the citation, and the IQ reasoning trace are
 * identical everywhere — no more three drifting copies.
 */

/** A claim is SUPPORTED, CONTRADICTED, or UNSUPPORTED relative to the case file. */
export type EvidenceVerdict = "SUPPORTED" | "UNSUPPORTED" | "CONTRADICTED";

/** A witness is consistent with, or contradicts, their own earlier testimony. */
export type SelfVerdict = "SELF_CONSISTENT" | "SELF_CONTRADICTION";

export interface DocText {
  docKey: string;
  title: string;
  content: string;
  /** Turn number, present for testimony docs. */
  turnNo?: number;
}

export interface EvidenceCheck {
  verdict: EvidenceVerdict;
  /** Docs driving the verdict (contradicting docs when CONTRADICTED). */
  citations: DocText[];
  /** The specific segments that triggered a contradiction, per docKey. */
  triggers: Record<string, string[]>;
}

export interface SelfCheck {
  verdict: SelfVerdict;
  /** The earlier statements that conflict (verbatim, with turn numbers). */
  conflicts: DocText[];
}

/**
 * The verdict the knowledge base is asked to emit. Maps onto the three-state
 * EvidenceVerdict: UNADDRESSED -> UNSUPPORTED ("the case file is silent").
 */
export type IqVerdictLabel = "SUPPORTED" | "CONTRADICTED" | "UNADDRESSED";

export interface IqReference {
  docKey: string;
  title: string;
  rerankerScore: number;
}

/** Parsed structured verdict produced by the KB's grounded reasoning. */
export interface IqVerdict {
  verdict: EvidenceVerdict;
  /** Verbatim passage the KB cited as deciding, when it quoted one. */
  citedPassage: string | null;
  /** The KB's one-line justification, as it wrote it. */
  justification: string;
  /** Documents the KB grounded on (from references), most relevant first. */
  citations: IqReference[];
  /** The raw synthesised answer, kept for the engine-tap / debugging. */
  rawAnswer: string;
}

/** Final verdict after reconciling the IQ brain with the deterministic check. */
export interface CombinedVerdict {
  verdict: EvidenceVerdict;
  /**
   * Which system produced the leading verdict. `ungrounded` is the
   * "pull the plug" demo state: grounding was switched off, so no evidence was
   * retrieved and no verdict can be formed — the witness's word stands. This is
   * the thesis made interactive: remove Foundry IQ and the catch collapses.
   */
  source: "iq" | "heuristic" | "ungrounded";
  /** True when the IQ verdict and the deterministic check agree. */
  agreement: boolean;
  iq: IqVerdict | null;
  heuristic: EvidenceVerdict;
  citedPassage: string | null;
  citations: IqReference[];
}
