/**
 * Sentence-level claim segmentation. Every checkable sentence in a suspect's
 * reply becomes a claim the player can challenge — and a testimony document
 * indexed into the Foundry IQ knowledge base for self-consistency checks.
 */

const MIN_CLAIM_LENGTH = 20;

/** Sentences that are pure address/filler rather than checkable assertions. */
const FILLER_PATTERNS = [
  /^(yes|no|of course|certainly|naturally|very well|fine|alright)[,.!]?\s*$/i,
  /^(inspector|detective|officer)[,.!]?\s*$/i,
  /^(i (don't|do not) (know|recall|remember))[,.!]?\s*$/i,
  /^(what|why|how|who|where|when)\b.*\?$/i,
];

export interface SegmentedClaim {
  /** Position of the sentence within the reply (0-based). */
  index: number;
  text: string;
}

export function segmentClaims(reply: string): SegmentedClaim[] {
  return splitSentences(reply)
    .map((text, index) => ({ index, text }))
    .filter(({ text }) => isCheckable(text));
}

export function splitSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  // Split on sentence enders followed by whitespace + capital/quote/digit.
  const parts = normalized.split(/(?<=[.!?])\s+(?=["'“”A-Z0-9])/);
  return parts.map((s) => s.trim()).filter(Boolean);
}

function isCheckable(sentence: string): boolean {
  if (sentence.length < MIN_CLAIM_LENGTH) return false;
  if (sentence.endsWith("?")) return false;
  return !FILLER_PATTERNS.some((pattern) => pattern.test(sentence));
}
