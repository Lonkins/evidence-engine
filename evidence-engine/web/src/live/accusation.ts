/**
 * Live accusation verdict (A2) — the close of the live interrogation.
 *
 * The teaching beat the whole game builds to: catching a witness in a lie is not
 * the same as proving they killed anyone. The verdict is driven entirely by what
 * the player pinned *live* (the CONTRADICTED / SELF_CONTRADICTION challenges they
 * landed), so the three outcomes are earned, not scripted:
 *
 *   SOLVED    — you accused the killer AND pinned the record that places them at
 *               the scene. The contradiction is the case.
 *   OVERRULED — you accused someone you genuinely caught lying, but a
 *               contradiction is not a confession: the lie does not put them in
 *               the gallery when Victor died. (The Responsible-AI heart of A2.)
 *   UNPROVEN  — you named a name with no pinned contradiction at all. An
 *               accusation needs the receipt.
 */

import type { ChallengeResponse } from "./types";

export type SuspectId = "helena" | "felix" | "nora";

/** Ground truth — mirrors engine/accusation.ts and the MCP case-store. */
export const KILLER: SuspectId = "helena";

export type LiveAccusationOutcome = "SOLVED" | "OVERRULED" | "UNPROVEN";

/** A contradiction the player pinned against the accused — their convicting exhibit. */
export interface LiveExhibit {
  claimText: string;
  kind: "CONTRADICTED" | "SELF_CONTRADICTION";
  citedPassage: string | null;
  docKeys: string[];
}

export interface LiveAccusationResult {
  accused: SuspectId;
  accusedName: string;
  outcome: LiveAccusationOutcome;
  /** The pinned contradictions against the accused, most useful first. */
  exhibits: LiveExhibit[];
}

/**
 * The contradictions the player pinned against one speaker — only positive
 * catches count (CONTRADICTED against the record, or SELF_CONTRADICTION against
 * their own earlier testimony). UNSUPPORTED ("file silent") is never a catch and
 * never an exhibit.
 */
export function exhibitsAgainst(
  speakerName: string,
  challenges: Record<string, ChallengeResponse>
): LiveExhibit[] {
  const exhibits: LiveExhibit[] = [];
  for (const result of Object.values(challenges)) {
    if (result.speaker !== speakerName) continue;
    const contradicted = result.evidence.verdict === "CONTRADICTED";
    const selfConflict = result.self.verdict === "SELF_CONTRADICTION";
    if (!contradicted && !selfConflict) continue;
    exhibits.push({
      claimText: result.claimText,
      kind: contradicted ? "CONTRADICTED" : "SELF_CONTRADICTION",
      citedPassage:
        result.evidence.iq?.citedPassage ??
        result.evidence.citations[0]?.excerpt ??
        null,
      docKeys: result.evidence.citations.map((c) => c.docKey),
    });
  }
  return exhibits;
}

/**
 * Resolve a live accusation from the contradictions the player pinned. Pure and
 * deterministic so it is unit-testable and identical to what the UI renders.
 */
export function evaluateLiveAccusation(
  accused: SuspectId,
  accusedName: string,
  challenges: Record<string, ChallengeResponse>
): LiveAccusationResult {
  const exhibits = exhibitsAgainst(accusedName, challenges);
  const hasReceipt = exhibits.length > 0;

  let outcome: LiveAccusationOutcome;
  if (!hasReceipt) {
    outcome = "UNPROVEN";
  } else if (accused === KILLER) {
    outcome = "SOLVED";
  } else {
    outcome = "OVERRULED";
  }

  return { accused, accusedName, outcome, exhibits };
}

/**
 * The bring-your-own close — "Deliver your verdict." A user's own source has NO
 * ground truth: there is no killer, no scripted plant, no "correct" answer. So
 * this resolver is structurally incapable of returning SOLVED — the only honest
 * outcomes are whether the player built a cited case (CASE_MADE) or named someone
 * with no receipt (UNPROVEN). Outcomes are source-relative, never findings of
 * fact: "contradicted by your source", never "lying" or "guilty".
 */
export type ByoVerdictOutcome = "CASE_MADE" | "UNPROVEN";

export interface ByoVerdictResult {
  witnessName: string;
  outcome: ByoVerdictOutcome;
  exhibits: LiveExhibit[];
}

export function evaluateByoVerdict(
  witnessName: string,
  challenges: Record<string, ChallengeResponse>
): ByoVerdictResult {
  const exhibits = exhibitsAgainst(witnessName, challenges);
  return {
    witnessName,
    outcome: exhibits.length > 0 ? "CASE_MADE" : "UNPROVEN",
    exhibits,
  };
}
