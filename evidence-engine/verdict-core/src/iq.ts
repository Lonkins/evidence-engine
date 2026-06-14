/**
 * IQ-driven verdict — Foundry IQ is the brain.
 *
 * Design-log Entry 4/6 (June 13 2026): the contradiction verdict comes from the
 * knowledge base's own grounded reasoning (answerSynthesis mode, reasoning
 * effort >= low, a model bound to the KB), not from a local regex. This module
 * turns the KB's synthesised answer into a structured verdict plus the deciding
 * citation, and combines it with the deterministic heuristic as a disclosed
 * cross-check.
 *
 * ✅ RECONCILED against the live answer-synthesis spike (June 13 2026,
 * spike/08-answer-synthesis.sh → spike/output/08-retrieve-verdict.json). With
 * gpt-4.1-mini bound to `evidence-kb` (outputMode: answerSynthesis, effort
 * medium), the KB honoured the leading `VERDICT:/PASSAGE:/WHY:` shape verbatim
 * and returned grounded `references[]`. The synthesised PASSAGE comes wrapped in
 * quotes and WHY trails `[ref_id:N]` citation tags; `parseIqAnswer` strips both.
 * The parser stays tolerant so wording drift does not break the verdict, and
 * `combineWithCrossCheck` keeps the deterministic verdict as a disclosed
 * guardrail.
 */

import type {
  EvidenceVerdict,
  EvidenceCheck,
  DocText,
  IqReference,
  IqVerdict,
  CombinedVerdict,
} from "./types.js";

/**
 * The verdict when grounding is switched OFF. Nothing is retrieved, so nothing
 * can be checked: the claim is UNSUPPORTED ("the engine has nothing to check
 * against") and — crucially — this is NOT a catch. Flipping grounding back on
 * and re-challenging the same claim is what produces the CONTRADICTED stamp,
 * proving Foundry IQ is load-bearing.
 */
export function ungroundedVerdict(): CombinedVerdict {
  return {
    verdict: "UNSUPPORTED",
    source: "ungrounded",
    agreement: false,
    iq: null,
    heuristic: "UNSUPPORTED",
    citedPassage: null,
    citations: [],
  };
}

/**
 * The instruction sent to the knowledge base. The KB retrieves over the
 * evidence partition and a bound model synthesises a grounded answer; we ask
 * it to lead with a machine-parseable verdict and quote the deciding passage
 * verbatim so the citation is the KB's, not ours.
 *
 * Confirmed by spike 08 (June 13 2026): bound to gpt-4.1-mini at medium effort,
 * the KB leads with `VERDICT:` and quotes the deciding passage verbatim, so this
 * instruction shape holds — no structured-output / tool-call fallback needed.
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
// The synthesis trails inline grounding tags like "[ref_id:0] [ref_id:4]" and
// wraps quoted passages in straight/smart quotes — strip both for clean display.
const REF_TAG = /\s*\[ref[_\s-]?id\s*[:\s]\s*\d+(?:\s*,\s*\d+)*\s*\]/gi;
const WRAPPING_QUOTES = /^["“”'']+|["“”'']+$/g;

/** Remove inline [ref_id:N] tags and collapse trailing whitespace. */
function stripRefTags(text: string): string {
  return text.replace(REF_TAG, "").replace(/[ \t]+$/gm, "").trim();
}

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
    const raw = stripRefTags(passageMatch[1]).replace(WRAPPING_QUOTES, "").trim();
    citedPassage = raw && !/^none$/i.test(raw) ? raw : null;
  }

  const whyMatch = answer.match(WHY_LINE);
  const justification = whyMatch
    ? stripRefTags(whyMatch[1])
    : stripRefTags(answer).slice(0, 200);

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
