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
  it("returns null when no tool by that name has been saved", async () => {
    expect(await getAssessment("__sentinel_never_saved_abc123__")).toBeNull();
  });

  it("returns a saved assessment by exact tool name", async () => {
    const toolName = "ExactMatchTool_alpha";
    await saveAssessment({ ...base, toolName });
    const result = await getAssessment(toolName);
    expect(result).not.toBeNull();
    expect(result?.toolName).toBe(toolName);
  });

  it("is case-insensitive on exact match", async () => {
    const toolName = "CaseTool_beta";
    await saveAssessment({ ...base, toolName });
    expect(await getAssessment(toolName.toLowerCase())).not.toBeNull();
    expect(await getAssessment(toolName.toUpperCase())).not.toBeNull();
  });

  it("returns an assessment by partial name match", async () => {
    const toolName = "PartialMatchHelper_gamma";
    await saveAssessment({ ...base, toolName });
    const result = await getAssessment("PartialMatchHelper");
    expect(result).not.toBeNull();
    expect(result?.toolName).toBe(toolName);
  });

  it("returns null when partial name matches nothing", async () => {
    expect(await getAssessment("__xyz_partial_nomatch_zz99__")).toBeNull();
  });
});

describe("saveAssessment", () => {
  it("saves a new record and returns it with an id", async () => {
    const toolName = "NewTool_delta";
    const record = await saveAssessment({ ...base, toolName });
    expect(record.toolName).toBe(toolName);
    expect(typeof record.id).toBe("string");
    expect(record.id.length).toBeGreaterThan(0);
  });

  it("sets assessedBy to 'RiskRadar via M365 Copilot'", async () => {
    const record = await saveAssessment({ ...base, toolName: "AssessedByTool_epsilon" });
    expect(record.assessedBy).toBe("RiskRadar via M365 Copilot");
  });

  it("sets assessedAt to a current ISO timestamp", async () => {
    const before = new Date().toISOString();
    const record = await saveAssessment({ ...base, toolName: "TimestampTool_zeta" });
    const after = new Date().toISOString();
    expect(record.assessedAt >= before).toBe(true);
    expect(record.assessedAt <= after).toBe(true);
  });

  it("updates an existing record and preserves the original id", async () => {
    const toolName = "UpdateTool_eta";
    const first = await saveAssessment({ ...base, toolName, riskRating: "Low", totalScore: 22 });
    const second = await saveAssessment({ ...base, toolName, riskRating: "High", totalScore: 9 });
    expect(second.id).toBe(first.id);
    expect(second.riskRating).toBe("High");
    expect(second.totalScore).toBe(9);
  });

  it("calls fs.writeFileSync after saving (persists to disk)", async () => {
    await saveAssessment({ ...base, toolName: "DiskPersistTool_theta" });
    expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalled();
  });

  it("preserves reassessmentTriggered flag through save and retrieve", async () => {
    const toolName = "ReassessmentTool_iota";
    await saveAssessment({
      ...base,
      toolName,
      reassessmentTriggered: true,
      reassessmentReason: "Vendor updated terms of service",
    });
    const retrieved = await getAssessment(toolName);
    expect(retrieved?.reassessmentTriggered).toBe(true);
    expect(retrieved?.reassessmentReason).toBe("Vendor updated terms of service");
  });

  it("saves a Critical Risk / Not Approved record correctly", async () => {
    const toolName = "CriticalRiskTool_kappa";
    const record = await saveAssessment({
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
  it("returns an array", async () => {
    expect(Array.isArray(await getAllAssessments())).toBe(true);
  });

  it("includes a newly saved record", async () => {
    const toolName = "GetAllTool_lambda";
    await saveAssessment({ ...base, toolName });
    const all = await getAllAssessments();
    expect(all.some((a) => a.toolName === toolName)).toBe(true);
  });

  it("total count increases after a save", async () => {
    const before = (await getAllAssessments()).length;
    await saveAssessment({ ...base, toolName: `CountTool_mu_${Date.now()}` });
    expect((await getAllAssessments()).length).toBe(before + 1);
  });
});
