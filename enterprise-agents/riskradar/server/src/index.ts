import express from "express";
import cors from "cors";
import { requireBearerToken } from "./auth";
import { getAssessment, saveAssessment, getAllAssessments, Assessment } from "./store";
import { lookupRating } from "./ratings";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", requireBearerToken);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({
    name: "RiskRadar MCP Server",
    version: "1.0.0",
    status: "running",
    tools: ["getAssessment", "saveAssessment", "vendorLookup"],
  });
});

// ─── MCP tool: getAssessment ──────────────────────────────────────────────────

app.post("/api/getAssessment", (req, res) => {
  const { toolName } = req.body as { toolName?: string };
  if (!toolName) {
    res.status(400).json({ error: "toolName is required" });
    return;
  }

  const assessment = getAssessment(toolName);
  if (!assessment) {
    res.json({
      found: false,
      message: `No existing assessment found for "${toolName}". A new assessment is required.`,
    });
    return;
  }

  res.json({
    found: true,
    assessment,
    message: `Existing assessment found for "${assessment.toolName}" (${assessment.riskRating} Risk, score ${assessment.totalScore}/25). Assessed on ${new Date(assessment.assessedAt).toLocaleDateString("en-GB")}. Decision: ${assessment.decision}.`,
  });
});

// ─── MCP tool: vendorLookup ───────────────────────────────────────────────────

app.post("/api/vendorLookup", (req, res) => {
  const { toolName } = req.body as { toolName?: string };
  if (!toolName) {
    res.status(400).json({ error: "toolName is required" });
    return;
  }

  const rating = lookupRating(toolName);
  if (!rating) {
    res.json({
      found: false,
      message: `No Common Sense Media EdTech Privacy rating found for "${toolName}". Consider checking https://www.commonsense.org/education/privacy directly.`,
    });
    return;
  }

  res.json({
    found: true,
    toolName: rating.toolName,
    vendorName: rating.vendorName,
    grade: rating.grade,
    privacyScore: rating.privacyScore,
    collectsData: rating.collectsData,
    sharesDataWithThirdParties: rating.sharesDataWithThirdParties,
    hasDPA: rating.hasDPA,
    ageRating: rating.ageRating,
    dataTypes: rating.dataTypes,
    summary: rating.summary,
    source: rating.source,
    lastReviewed: rating.lastReviewed,
    message: `Common Sense Media rates ${rating.toolName} (${rating.vendorName}) grade ${rating.grade} with a privacy score of ${rating.privacyScore}/100. ${rating.summary}`,
  });
});

// ─── MCP tool: saveAssessment ─────────────────────────────────────────────────

app.post("/api/saveAssessment", (req, res) => {
  const body = req.body as Partial<Assessment> & {
    toolName?: string;
    riskRating?: "Low" | "Medium" | "High" | "Critical";
    totalScore?: number;
    decision?: "Approved" | "Approved with Controls" | "Not Approved" | "Escalate to DPO";
  };

  if (!body.toolName || !body.riskRating || body.totalScore === undefined || !body.decision) {
    res.status(400).json({ error: "toolName, riskRating, totalScore, and decision are required" });
    return;
  }

  const defaultReviewDate = (): string => {
    const months = body.riskRating === "Low" ? 12 : 6;
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0] as string;
  };

  try {
    const record = saveAssessment({
      toolName: body.toolName,
      vendorName: body.vendorName ?? "Unknown",
      toolType: body.toolType ?? "Unknown",
      ageGroup: body.ageGroup ?? "Unknown",
      riskRating: body.riskRating,
      totalScore: body.totalScore,
      dataPrivacyScore: body.dataPrivacyScore ?? 0,
      ageAppropriatenessScore: body.ageAppropriatenessScore ?? 0,
      transparencyScore: body.transparencyScore ?? 0,
      biasScore: body.biasScore ?? 0,
      vendorAccountabilityScore: body.vendorAccountabilityScore ?? 0,
      decision: body.decision,
      reviewDate: body.reviewDate ?? defaultReviewDate(),
      aupClause: body.aupClause,
      notes: body.notes,
    });

    res.json({
      success: true,
      id: record.id,
      message: `Assessment for "${record.toolName}" saved to the Approved Tools Registry. Decision: ${record.decision}. Review due: ${record.reviewDate}.`,
      record,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Admin: list all assessments ──────────────────────────────────────────────

app.get("/api/assessments", (_req, res) => {
  res.json({ assessments: getAllAssessments(), total: getAllAssessments().length });
});

// ─── Start ────────────────────────────────────────────────────────────────────

export { app };

// Only start listening when run directly (not when imported by tests)
if (require.main === module) {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`\nRiskRadar MCP Server running on http://localhost:${PORT}`);
    console.log(`  POST /api/getAssessment  — check prior assessment`);
    console.log(`  POST /api/vendorLookup   — Common Sense Media privacy rating`);
    console.log(`  POST /api/saveAssessment — write to Approved Tools Registry`);
    console.log(`  GET  /api/assessments    — list all assessments (admin)\n`);
  });
}
