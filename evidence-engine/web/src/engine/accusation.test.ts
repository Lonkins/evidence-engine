import { describe, it, expect } from "vitest";
import { evaluateAccusation, REQUIRED_EVIDENCE_KEYS } from "./accusation";

describe("evaluateAccusation", () => {
  it("rejects the wrong suspect regardless of evidence", () => {
    const result = evaluateAccusation("nora", REQUIRED_EVIDENCE_KEYS);
    expect(result.verdict).toBe("incorrect");
  });

  it("requires the security log and the provenance email to convict", () => {
    const result = evaluateAccusation("helena", ["09-security-log.md"]);
    expect(result.verdict).toBe("insufficient_evidence");
    expect(result.missingDocKeys).toEqual(["14-provenance-dispute.md"]);
  });

  it("convicts Helena with the full evidence chain", () => {
    const result = evaluateAccusation("helena", [
      "09-security-log.md",
      "14-provenance-dispute.md",
      "13-phone-records.md",
    ]);
    expect(result.verdict).toBe("correct");
    expect(result.missingDocKeys).toEqual([]);
  });
});
