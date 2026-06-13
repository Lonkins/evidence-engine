/**
 * Evidence-relative verdict heuristics — the deterministic cross-check.
 * Evolved from the MCP server's original check_claim (cycle-13 fix): temporal
 * conflicts and explicit negation phrases only, and only inside segments
 * (sentences/log lines) that share a meaningful term with the claim, so a
 * statement-header timestamp or a stray "was not unusual" elsewhere in a
 * document cannot manufacture a contradiction. All verdicts are relative to the
 * case file or to the speaker's own indexed testimony, never absolute truth.
 *
 * This is the disclosed cross-check that runs alongside the Foundry IQ verdict
 * (see ./iq.ts). It is the single copy: live-server and the MCP server both
 * consume it, so "her badge says 20:47, not 19:45" is detected identically.
 */

import type { DocText, EvidenceCheck, SelfCheck } from "./types.js";

const EXPLICIT_CONTRADICTION_PHRASES = [
  "does not",
  "did not",
  "was not",
  "were not",
  "no record",
  "not present",
  "never arrived",
  "denied",
  "contradicts",
  "contradicted",
  "inconsistent with",
];

const TIME_CONFLICT_TOLERANCE_MINUTES = 5;
const MIN_TERM_LENGTH = 4;

/**
 * Generic words that must not make a document segment "relevant" to a claim —
 * without this, "that" or "with" links a claim to an unrelated sentence
 * containing a negation phrase and manufactures a contradiction.
 */
const STOP_WORDS = new Set([
  "that", "this", "with", "from", "have", "been", "were", "what", "when",
  "where", "which", "would", "could", "should", "there", "their", "they",
  "them", "then", "than", "your", "yours", "about", "after", "before",
  "into", "over", "under", "just", "very", "really", "quite", "rather",
  "some", "such", "only", "also", "more", "most", "much", "made", "make",
  "well", "said", "says", "told", "around", "exactly", "precisely",
  "evening", "morning", "afternoon", "night", "time", "moment",
]);

/** Extract HH:MM times as minutes since midnight. */
export function extractTimes(text: string): number[] {
  const matches = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/gi) ?? [];
  return matches
    .map((token) => {
      const parts = token.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      if (!parts) return -1;
      let hours = parseInt(parts[1], 10);
      const minutes = parseInt(parts[2], 10);
      const meridiem = (parts[3] ?? "").toLowerCase();
      if (meridiem === "pm" && hours !== 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;
      if (hours > 23 || minutes > 59) return -1;
      return hours * 60 + minutes;
    })
    .filter((value) => value >= 0);
}

function termsOf(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length >= MIN_TERM_LENGTH && !STOP_WORDS.has(term));
}

/** Split a document into checkable segments: sentences and log lines. */
export function segmentDocument(content: string): string[] {
  return content
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=["'“”A-Z0-9])/))
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

interface SegmentAnalysis {
  relevantSegments: string[];
  contradictionTriggers: string[];
}

function analyseDoc(doc: DocText, claimTerms: Set<string>, claimTimes: number[]): SegmentAnalysis {
  const relevantSegments: string[] = [];
  const contradictionTriggers: string[] = [];

  for (const segment of segmentDocument(doc.content)) {
    const lower = segment.toLowerCase();
    const isRelevant = [...claimTerms].some((term) => lower.includes(term));
    if (!isRelevant) continue;
    relevantSegments.push(segment);

    const hasNegation = EXPLICIT_CONTRADICTION_PHRASES.some((phrase) => lower.includes(phrase));

    let hasTimeConflict = false;
    if (claimTimes.length > 0) {
      const segmentTimes = extractTimes(lower);
      if (segmentTimes.length > 0) {
        // Conflict only when every time in the segment differs from every
        // claimed time by more than the tolerance.
        hasTimeConflict = claimTimes.every((ct) =>
          segmentTimes.every((st) => Math.abs(ct - st) > TIME_CONFLICT_TOLERANCE_MINUTES)
        );
      }
    }

    if (hasNegation || hasTimeConflict) {
      contradictionTriggers.push(segment);
    }
  }

  return { relevantSegments, contradictionTriggers };
}

/**
 * Check a claim against retrieved evidence-partition docs.
 * Empty/irrelevant retrieval = UNSUPPORTED ("the case file is silent on
 * this point") — fail closed. `extraTerms` lets the caller add the speaker's
 * name so log lines such as "20:47 CARD_EXIT ... Helena Voss" participate.
 */
export function checkAgainstEvidence(
  claim: string,
  docs: DocText[],
  extraTerms: string[] = []
): EvidenceCheck {
  const claimTerms = new Set([...termsOf(claim), ...extraTerms.flatMap(termsOf)]);
  const claimTimes = extractTimes(claim.toLowerCase());

  const supporting: DocText[] = [];
  const contradicting: DocText[] = [];
  const triggers: Record<string, string[]> = {};

  for (const doc of docs) {
    const analysis = analyseDoc(doc, claimTerms, claimTimes);
    if (analysis.relevantSegments.length === 0) continue;
    if (analysis.contradictionTriggers.length > 0) {
      contradicting.push(doc);
      triggers[doc.docKey] = analysis.contradictionTriggers;
    } else {
      supporting.push(doc);
    }
  }

  if (contradicting.length > 0) {
    return { verdict: "CONTRADICTED", citations: contradicting, triggers };
  }
  if (supporting.length > 0) {
    return { verdict: "SUPPORTED", citations: supporting, triggers: {} };
  }
  return { verdict: "UNSUPPORTED", citations: [], triggers: {} };
}

/**
 * Check a claim against the speaker's own earlier indexed testimony.
 * Only temporal conflicts count — a witness using negation words while
 * restating themselves is not a contradiction signal the way a record is.
 */
export function checkSelfConsistency(claim: string, earlier: DocText[]): SelfCheck {
  const claimTimes = extractTimes(claim.toLowerCase());
  if (claimTimes.length === 0) {
    return { verdict: "SELF_CONSISTENT", conflicts: [] };
  }

  const conflicts = earlier.filter((doc) => {
    const docTimes = extractTimes(doc.content.toLowerCase());
    if (docTimes.length === 0) return false;
    return claimTimes.every((ct) =>
      docTimes.every((dt) => Math.abs(ct - dt) > TIME_CONFLICT_TOLERANCE_MINUTES)
    );
  });

  if (conflicts.length > 0) {
    return { verdict: "SELF_CONTRADICTION", conflicts };
  }
  return { verdict: "SELF_CONSISTENT", conflicts: [] };
}
