import { vi, describe, it, expect } from "vitest";

// Mock fs before importing the store so loadFromDisk() returns [] at module init.
vi.mock("fs", () => {
  const mock = {
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn().mockReturnValue("[]"),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
  return { default: mock, ...mock };
});

import { getAssessment, saveAssessment, getAllAssessments } from "../store";
import fs from "fs";

const base = {
  vendorName: "Test Vendor Inc.",
  toolType: "Writing Assistant",
  ageGroup: "Secondary (11-16)",
  riskRating: "Medium" as const,
  totalScore: 17,
  dataPrivacyScore: 3,
  ageAppropriatenessScore: 4,
  transparencyScore: 3,
  biasScore: 4,
  vendorAccountabilityScore: 3,
  decision: "Approved with Controls" as const,
  reviewDate: "2026-12-01",
};

describe("getAssessment", () => {
  it("returns null when no tool by that name has been saved", () => {
    expect(getAssessment("__sentinel_never_saved_abc123__")).toBeNull();
  });

  it("returns a saved assessment by exact tool name", () => {
    const toolName = "ExactMatchTool_alpha";
    saveAssessment({ ...base, toolName });
    const result = getAssessment(toolName);
    expect(result).not.toBeNull();
    expect(result?.toolName).toBe(toolName);
  });

  it("is case-insensitive on exact match", () => {
    const toolName = "CaseTool_beta";
    saveAssessment({ ...base, toolName });
    expect(getAssessment(toolName.toLowerCase())).not.toBeNull();
    expect(getAssessment(toolName.toUpperCase())).not.toBeNull();
  });

  it("returns an assessment by partial name match", () => {
    const toolName = "PartialMatchHelper_gamma";
    saveAssessment({ ...base, toolName });
    const result = getAssessment("PartialMatchHelper");
    expect(result).not.toBeNull();
    expect(result?.toolName).toBe(toolName);
  });

  it("returns null when partial name matches nothing", () => {
    expect(getAssessment("__xyz_partial_nomatch_zz99__")).toBeNull();
  });
});

describe("saveAssessment", () => {
  it("saves a new record and returns it with an id", () => {
    const toolName = "NewTool_delta";
    const record = saveAssessment({ ...base, toolName });
    expect(record.toolName).toBe(toolName);
    expect(typeof record.id).toBe("string");
    expect(record.id.length).toBeGreaterThan(0);
  });

  it("sets assessedBy to 'RiskRadar via M365 Copilot'", () => {
    const record = saveAssessment({ ...base, toolName: "AssessedByTool_epsilon" });
    expect(record.assessedBy).toBe("RiskRadar via M365 Copilot");
  });

  it("sets assessedAt to a current ISO timestamp", () => {
    const before = new Date().toISOString();
    const record = saveAssessment({ ...base, toolName: "TimestampTool_zeta" });
    const after = new Date().toISOString();
    expect(record.assessedAt >= before).toBe(true);
    expect(record.assessedAt <= after).toBe(true);
  });

  it("updates an existing record and preserves the original id", () => {
    const toolName = "UpdateTool_eta";
    const first = saveAssessment({ ...base, toolName, riskRating: "Low", totalScore: 22 });
    const second = saveAssessment({ ...base, toolName, riskRating: "High", totalScore: 9 });
    expect(second.id).toBe(first.id);
    expect(second.riskRating).toBe("High");
    expect(second.totalScore).toBe(9);
  });

  it("calls fs.writeFileSync after saving (persists to disk)", () => {
    saveAssessment({ ...base, toolName: "DiskPersistTool_theta" });
    expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalled();
  });

  it("preserves reassessmentTriggered flag through save and retrieve", () => {
    const toolName = "ReassessmentTool_iota";
    saveAssessment({
      ...base,
      toolName,
      reassessmentTriggered: true,
      reassessmentReason: "Vendor updated terms of service",
    });
    const retrieved = getAssessment(toolName);
    expect(retrieved?.reassessmentTriggered).toBe(true);
    expect(retrieved?.reassessmentReason).toBe("Vendor updated terms of service");
  });

  it("saves a Critical Risk / Not Approved record correctly", () => {
    const toolName = "CriticalRiskTool_kappa";
    const record = saveAssessment({
      ...base,
      toolName,
      riskRating: "Critical",
      totalScore: 7,
      decision: "Not Approved",
      dataPrivacyScore: 1,
      ageAppropriatenessScore: 1,
      vendorAccountabilityScore: 1,
      notes: "No DPA available. Romantic personas targeting minors.",
    });
    expect(record.riskRating).toBe("Critical");
    expect(record.decision).toBe("Not Approved");
    expect(record.notes).toContain("No DPA");
  });
});

describe("getAllAssessments", () => {
  it("returns an array", () => {
    expect(Array.isArray(getAllAssessments())).toBe(true);
  });

  it("includes a newly saved record", () => {
    const toolName = "GetAllTool_lambda";
    saveAssessment({ ...base, toolName });
    const all = getAllAssessments();
    expect(all.some((a) => a.toolName === toolName)).toBe(true);
  });

  it("total count increases after a save", () => {
    const before = getAllAssessments().length;
    saveAssessment({ ...base, toolName: `CountTool_mu_${Date.now()}` });
    expect(getAllAssessments().length).toBe(before + 1);
  });
});
