import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";

// Mock the store and ratings modules so tests are not affected by disk state.
vi.mock("../store", () => ({
  getAssessment: vi.fn(),
  saveAssessment: vi.fn(),
  getAllAssessments: vi.fn(),
}));

vi.mock("../ratings", () => ({
  lookupRating: vi.fn(),
}));

import { app } from "../index";
import { getAssessment, saveAssessment, getAllAssessments } from "../store";
import { lookupRating } from "../ratings";
import type { Assessment } from "../store";

const mockAssessment: Assessment = {
  id: "test-id-123",
  toolName: "Grammarly",
  vendorName: "Grammarly Inc.",
  toolType: "Writing Assistant",
  ageGroup: "Secondary (11-16)",
  riskRating: "Medium",
  totalScore: 17,
  dataPrivacyScore: 3,
  ageAppropriatenessScore: 4,
  transparencyScore: 3,
  biasScore: 4,
  vendorAccountabilityScore: 3,
  decision: "Approved with Controls",
  reviewDate: "2026-12-01",
  assessedBy: "RiskRadar via M365 Copilot",
  assessedAt: "2026-06-10T08:00:00.000Z",
  aupClause: "Students may use Grammarly for spell-check only.",
  notes: "Medium risk — education tier recommended.",
};

const mockRating = {
  toolName: "Grammarly",
  vendorName: "Grammarly Inc.",
  grade: "B",
  privacyScore: 68,
  collectsData: true,
  sharesDataWithThirdParties: false,
  hasDPA: true,
  ageRating: "13+",
  dataTypes: ["text content", "usage data"],
  summary: "Low risk for secondary school use with controls.",
  source: "Common Sense Media EdTech Privacy",
  lastReviewed: "2024-09",
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ─── GET / ─────────────────────────────────────────────────────────────────────

describe("GET /", () => {
  it("returns a health check response with server metadata", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("RiskRadar MCP Server");
    expect(res.body.status).toBe("running");
    expect(res.body.tools).toEqual(
      expect.arrayContaining(["getAssessment", "saveAssessment", "vendorLookup"])
    );
  });
});

// ─── POST /api/getAssessment ───────────────────────────────────────────────────

describe("POST /api/getAssessment", () => {
  it("returns 400 when toolName is missing", async () => {
    const res = await request(app).post("/api/getAssessment").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/toolName/i);
  });

  it("returns found: false when no prior assessment exists", async () => {
    vi.mocked(getAssessment).mockReturnValue(null);
    const res = await request(app)
      .post("/api/getAssessment")
      .send({ toolName: "UnknownTool" });
    expect(res.status).toBe(200);
    expect(res.body.found).toBe(false);
    expect(res.body.message).toMatch(/UnknownTool/);
  });

  it("returns found: true with the assessment when one exists", async () => {
    vi.mocked(getAssessment).mockReturnValue(mockAssessment);
    const res = await request(app)
      .post("/api/getAssessment")
      .send({ toolName: "Grammarly" });
    expect(res.status).toBe(200);
    expect(res.body.found).toBe(true);
    expect(res.body.assessment.toolName).toBe("Grammarly");
    expect(res.body.message).toMatch(/Grammarly/);
  });
});

// ─── POST /api/vendorLookup ───────────────────────────────────────────────────

describe("POST /api/vendorLookup", () => {
  it("returns 400 when toolName is missing", async () => {
    const res = await request(app).post("/api/vendorLookup").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/toolName/i);
  });

  it("returns found: false for a tool not in the CSM database", async () => {
    vi.mocked(lookupRating).mockReturnValue(null);
    const res = await request(app)
      .post("/api/vendorLookup")
      .send({ toolName: "ObscureToolXYZ" });
    expect(res.status).toBe(200);
    expect(res.body.found).toBe(false);
    expect(res.body.message).toMatch(/ObscureToolXYZ/);
  });

  it("returns the CSM rating when the tool is found", async () => {
    vi.mocked(lookupRating).mockReturnValue(mockRating);
    const res = await request(app)
      .post("/api/vendorLookup")
      .send({ toolName: "Grammarly" });
    expect(res.status).toBe(200);
    expect(res.body.found).toBe(true);
    expect(res.body.grade).toBe("B");
    expect(res.body.privacyScore).toBe(68);
    expect(res.body.hasDPA).toBe(true);
    expect(res.body.message).toMatch(/Grammarly/);
  });
});

// ─── POST /api/saveAssessment ─────────────────────────────────────────────────

describe("POST /api/saveAssessment", () => {
  const validPayload = {
    toolName: "Grammarly",
    riskRating: "Medium",
    totalScore: 17,
    decision: "Approved with Controls",
  };

  it("returns 400 when toolName is missing", async () => {
    const res = await request(app)
      .post("/api/saveAssessment")
      .send({ riskRating: "Low", totalScore: 20, decision: "Approved" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("returns 400 when riskRating is missing", async () => {
    const res = await request(app)
      .post("/api/saveAssessment")
      .send({ toolName: "Test", totalScore: 20, decision: "Approved" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("returns 400 when totalScore is missing", async () => {
    const res = await request(app)
      .post("/api/saveAssessment")
      .send({ toolName: "Test", riskRating: "Low", decision: "Approved" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("returns 400 when decision is missing", async () => {
    const res = await request(app)
      .post("/api/saveAssessment")
      .send({ toolName: "Test", riskRating: "Low", totalScore: 20 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("returns 200 with the saved record on a valid payload", async () => {
    vi.mocked(saveAssessment).mockReturnValue(mockAssessment);
    vi.mocked(getAssessment).mockReturnValue(null); // new tool, no prior assessment

    const res = await request(app)
      .post("/api/saveAssessment")
      .send(validPayload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe("test-id-123");
    expect(res.body.record.toolName).toBe("Grammarly");
  });

  it("returns a message confirming the decision in the response", async () => {
    vi.mocked(saveAssessment).mockReturnValue(mockAssessment);
    const res = await request(app)
      .post("/api/saveAssessment")
      .send(validPayload);
    expect(res.body.message).toMatch(/Approved with Controls/);
  });

  it("uses 6-month review date for Medium risk tools by default", async () => {
    let capturedInput: Parameters<typeof saveAssessment>[0] | undefined;
    vi.mocked(saveAssessment).mockImplementation((input) => {
      capturedInput = input;
      return mockAssessment;
    });

    await request(app).post("/api/saveAssessment").send(validPayload);

    expect(capturedInput?.reviewDate).toBeDefined();
    const reviewDate = new Date(capturedInput!.reviewDate);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    // Allow a day's tolerance
    const diff = Math.abs(reviewDate.getTime() - sixMonthsFromNow.getTime());
    expect(diff).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it("uses 12-month review date for Low risk tools", async () => {
    let capturedInput: Parameters<typeof saveAssessment>[0] | undefined;
    vi.mocked(saveAssessment).mockImplementation((input) => {
      capturedInput = input;
      return { ...mockAssessment, riskRating: "Low" };
    });

    await request(app).post("/api/saveAssessment").send({
      toolName: "KhanAcademy",
      riskRating: "Low",
      totalScore: 24,
      decision: "Approved",
    });

    expect(capturedInput?.reviewDate).toBeDefined();
    const reviewDate = new Date(capturedInput!.reviewDate);
    const twelveMonthsFromNow = new Date();
    twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);
    const diff = Math.abs(reviewDate.getTime() - twelveMonthsFromNow.getTime());
    expect(diff).toBeLessThan(24 * 60 * 60 * 1000);
  });
});

// ─── GET /api/assessments ─────────────────────────────────────────────────────

describe("GET /api/assessments", () => {
  it("returns an assessments array and total count", async () => {
    vi.mocked(getAllAssessments).mockReturnValue([mockAssessment]);
    const res = await request(app).get("/api/assessments");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.assessments)).toBe(true);
    expect(res.body.total).toBe(1);
  });

  it("returns empty array when no assessments exist", async () => {
    vi.mocked(getAllAssessments).mockReturnValue([]);
    const res = await request(app).get("/api/assessments");
    expect(res.status).toBe(200);
    expect(res.body.assessments).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });
});
