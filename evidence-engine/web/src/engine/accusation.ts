import type { AccusationResult, SuspectId } from "./types";

// Mirrors the MCP server's case-store.ts — the web game and the Copilot Chat
// game must agree on the win condition.
export const CORRECT_SUSPECT: SuspectId = "helena";

export const REQUIRED_EVIDENCE_KEYS = [
  "09-security-log.md",
  "14-provenance-dispute.md",
];

export function evaluateAccusation(
  suspectId: SuspectId,
  evidenceDocKeys: string[]
): AccusationResult {
  if (suspectId !== CORRECT_SUSPECT) {
    return { suspectId, evidenceDocKeys, verdict: "incorrect", missingDocKeys: [] };
  }

  const missingDocKeys = REQUIRED_EVIDENCE_KEYS.filter(
    (key) => !evidenceDocKeys.includes(key)
  );

  if (missingDocKeys.length > 0) {
    return { suspectId, evidenceDocKeys, verdict: "insufficient_evidence", missingDocKeys };
  }

  return { suspectId, evidenceDocKeys, verdict: "correct", missingDocKeys: [] };
}
