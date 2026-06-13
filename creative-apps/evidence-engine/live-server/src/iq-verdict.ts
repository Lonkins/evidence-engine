/**
 * IQ-driven verdict — Foundry IQ is the brain.
 *
 * Design-log Entry 4 (June 13 2026): the contradiction verdict must come from
 * the knowledge base's own grounded reasoning, not from a local regex. This
 * module turns the KB's synthesised answer (answerSynthesis mode, reasoning
 * effort >= low, a model bound to the KB) into a structured verdict plus the
 * deciding citation, and combines it with the legacy deterministic check as a
 * disclosed cross-check.
 *
 * ⚠️ SPECULATIVE — built against the DOCUMENTED answerSynthesis response shape
 * (spike/SPIKE_LOG.md stage 3-4: `response[].content[].text` synthesised
 * answer, `references[]`, `activity[].agenticReasoning`). The exact synthesised
 * answer wording is unverified until a model is wired to `evidence-kb` and the
 * provisioning spike (build-order item 1) runs. Reconciliation points are
 * marked `RECONCILE:`. The parser is intentionally tolerant so wording drift
 * does not break the verdict, and `combineWithCrossCheck` keeps the legacy
 * deterministic verdict available as a guardrail.
 */

import type { EvidenceVerdict, EvidenceCheck, DocText } from "./verdict.js";

/**
 * The verdict the KB is asked to emit. Maps onto the legacy three-state
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
  /** Which system produced the leading verdict. */
  source: "iq" | "heuristic";
  /** True when the IQ verdict and the deterministic check agree. */
  agreement: boolean;
  iq: IqVerdict | null;
  heuristic: EvidenceVerdict;
  citedPassage: string | null;
  citations: IqReference[];
}

/**
 * The instruction sent to the knowledge base. The KB retrieves over the
 * evidence partition and a bound model synthesises a grounded answer; we ask
 * it to lead with a machine-parseable verdict and quote the deciding passage
 * verbatim so the citation is the KB's, not ours.
 *
 * RECONCILE: confirm the KB honours a leading `VERDICT:` token in
 * answerSynthesis mode once a model is bound; if it buries the verdict, switch
 * to a structured-output / tool-call shape.
 */
export function buildVerdictInstruction(claim: string, speaker: string): string {
  return [
    `You are the case-file evidence engine for a detective game.`,
    `Assess this claim by the witness ${speaker} strictly against the retrieved case-file passages — never outside knowledge.`,
    `Claim: "${claim}"`,
    ``,
    `Answer in exactly this shape:`,
    `VERDICT: <SUPPORTED|CONTRADICTED|UNADDRESSED>`,
    `PASSAGE: <the single most decisive sentence, copied verbatim from a passage, or NONE>`,
    `WHY: <one sentence>`,
    ``,
    `Rules: CONTRADICTED only if a passage states something incompatible with the claim.`,
    `SUPPORTED only if a passage affirms it. If the passages do not address the claim,`,
    `answer UNADDRESSED — do not guess. "Silent" is UNADDRESSED, not CONTRADICTED.`,
  ].join("\n");
}

const VERDICT_LINE = /verdict\s*[:\-]\s*([a-z_]+)/i;
const PASSAGE_LINE = /passage\s*[:\-]\s*([\s\S]*?)(?:\n\s*why\s*[:\-]|\n{2,}|$)/i;
const WHY_LINE = /why\s*[:\-]\s*([\s\S]*?)(?:\n{2,}|$)/i;

function mapLabel(token: string): EvidenceVerdict {
  const t = token.toUpperCase();
  if (t.startsWith("CONTRADICT")) return "CONTRADICTED";
  if (t.startsWith("SUPPORT")) return "SUPPORTED";
  // UNADDRESSED / SILENT / INSUFFICIENT / anything else -> fail closed.
  return "UNSUPPORTED";
}

/**
 * Parse the KB's synthesised answer into a structured verdict. Tolerant by
 * design: if the verdict token is missing or the shape drifts, fail closed to
 * UNSUPPORTED rather than inventing a catch. A scan fallback recognises the
 * verdict words anywhere in the answer when the leading token is absent.
 */
export function parseIqAnswer(rawAnswer: string, references: IqReference[]): IqVerdict {
  const answer = (rawAnswer ?? "").trim();

  let verdict: EvidenceVerdict = "UNSUPPORTED";
  const verdictMatch = answer.match(VERDICT_LINE);
  if (verdictMatch) {
    verdict = mapLabel(verdictMatch[1]);
  } else if (/\bcontradict/i.test(answer)) {
    verdict = "CONTRADICTED";
  } else if (/\bsupport(s|ed|ing)?\b/i.test(answer) && !/\bnot support/i.test(answer)) {
    verdict = "SUPPORTED";
  }

  let citedPassage: string | null = null;
  const passageMatch = answer.match(PASSAGE_LINE);
  if (passageMatch) {
    const raw = passageMatch[1].trim();
    citedPassage = raw && !/^none$/i.test(raw) ? raw : null;
  }

  const whyMatch = answer.match(WHY_LINE);
  const justification = whyMatch ? whyMatch[1].trim() : answer.slice(0, 200);

  // A CONTRADICTED/SUPPORTED verdict with no grounding reference is not
  // trustworthy — the KB must have grounded on something. Fail closed.
  if ((verdict === "CONTRADICTED" || verdict === "SUPPORTED") && references.length === 0) {
    verdict = "UNSUPPORTED";
    citedPassage = null;
  }

  return {
    verdict,
    citedPassage,
    justification,
    citations: references,
    rawAnswer: answer,
  };
}

/**
 * Reconcile the IQ verdict (the brain) with the deterministic check (the
 * guardrail). The IQ verdict leads. The deterministic result is surfaced for
 * the engine tap so divergence is disclosed, never hidden. If the IQ call was
 * unavailable (null), we fall back to the deterministic verdict and label the
 * source honestly.
 */
export function combineWithCrossCheck(
  iq: IqVerdict | null,
  heuristic: EvidenceCheck
): CombinedVerdict {
  if (!iq) {
    return {
      verdict: heuristic.verdict,
      source: "heuristic",
      agreement: false,
      iq: null,
      heuristic: heuristic.verdict,
      citedPassage: firstTrigger(heuristic),
      citations: heuristic.citations.map(toRef),
    };
  }

  return {
    verdict: iq.verdict,
    source: "iq",
    agreement: iq.verdict === heuristic.verdict,
    iq,
    heuristic: heuristic.verdict,
    citedPassage: iq.citedPassage ?? firstTrigger(heuristic),
    citations: iq.citations.length > 0 ? iq.citations : heuristic.citations.map(toRef),
  };
}

function firstTrigger(check: EvidenceCheck): string | null {
  const first = check.citations[0];
  if (!first) return null;
  return check.triggers[first.docKey]?.[0] ?? null;
}

function toRef(doc: DocText): IqReference {
  return { docKey: doc.docKey, title: doc.title, rerankerScore: 0 };
}
