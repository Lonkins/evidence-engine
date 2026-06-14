export type SuspectId = "helena" | "felix" | "nora";

export type Verdict = "SUPPORTED" | "CONTRADICTED" | "UNSUPPORTED";

export interface Citation {
  docKey: string;
  /** Verbatim passage from the cited document. */
  quote: string;
}

export interface Claim {
  id: string;
  /** The claim as the suspect asserts it, phrased as a checkable fact. */
  text: string;
  verdict: Verdict;
  citations: Citation[];
  /** Evidence Engine annotation shown when the claim is pressed. */
  note: string;
}

export type AnswerSegment =
  | { kind: "text"; text: string }
  | { kind: "claim"; claim: Claim };

export interface Question {
  id: string;
  suspectId: SuspectId;
  /** Short label shown on the question card. */
  label: string;
  /** Document keys that must be discovered before this question unlocks. */
  requiresDocs?: string[];
  answer: AnswerSegment[];
}

export interface Suspect {
  id: SuspectId;
  name: string;
  role: string;
  /** One-line dossier hook. */
  hook: string;
  dossierDocKey: string;
  statementDocKey: string;
}

export interface DocMeta {
  docKey: string;
  title: string;
  kind:
    | "case file"
    | "statement"
    | "technical record"
    | "forensic"
    | "medical"
    | "business record"
    | "investigator notes";
}

export interface ArchiveHit {
  docKey: string;
  excerpt: string;
  score: number;
}

export interface ArchiveResult {
  query: string;
  hits: ArchiveHit[];
}

export type AccusationVerdict = "correct" | "incorrect" | "insufficient_evidence";

export interface AccusationResult {
  suspectId: SuspectId;
  evidenceDocKeys: string[];
  verdict: AccusationVerdict;
  missingDocKeys: string[];
}
