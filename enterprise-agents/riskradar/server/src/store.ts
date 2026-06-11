import fs from "fs";
import path from "path";

import {
  isSharePointConfigured,
  getAssessmentFromSharePoint,
  saveAssessmentToSharePoint,
  getAllAssessmentsFromSharePoint,
} from "./graph-store";

export interface Assessment {
  id: string;
  toolName: string;
  vendorName: string;
  toolType: string;
  ageGroup: string;
  riskRating: "Low" | "Medium" | "High" | "Critical";
  totalScore: number;
  dataPrivacyScore: number;
  ageAppropriatenessScore: number;
  transparencyScore: number;
  biasScore: number;
  vendorAccountabilityScore: number;
  decision: "Approved" | "Approved with Controls" | "Not Approved" | "Escalate to DPO";
  reviewDate: string;
  aupClause?: string;
  notes?: string;
  assessedBy: string;
  assessedAt: string;
  reassessmentTriggered?: boolean;
  reassessmentReason?: string;
}

// ─── File-based fallback store (used when SharePoint env vars are not set) ─────

const DATA_FILE = path.join(__dirname, "..", "data", "assessments.json");

function loadFromDisk(): Assessment[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Assessment[];
  } catch {
    return [];
  }
}

function saveToDisk(assessments: Assessment[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(assessments, null, 2), "utf-8");
}

let fileStore: Assessment[] = loadFromDisk();

// ─── Public API — routes to SharePoint when configured, file store otherwise ───

export async function getAssessment(toolName: string): Promise<Assessment | null> {
  if (isSharePointConfigured()) {
    return getAssessmentFromSharePoint(toolName);
  }
  const normalised = toolName.toLowerCase().trim();
  return (
    fileStore.find(
      (a) =>
        a.toolName.toLowerCase() === normalised ||
        a.toolName.toLowerCase().includes(normalised)
    ) ?? null
  );
}

export async function saveAssessment(input: Omit<Assessment, "id" | "assessedBy" | "assessedAt">): Promise<Assessment> {
  const existing = await getAssessment(input.toolName);

  const record: Assessment = {
    ...input,
    id: existing?.id ?? crypto.randomUUID(),
    assessedBy: "RiskRadar via M365 Copilot",
    assessedAt: new Date().toISOString(),
  };

  if (isSharePointConfigured()) {
    await saveAssessmentToSharePoint(record);
    return record;
  }

  if (existing) {
    fileStore = fileStore.map((a) => (a.id === existing.id ? record : a));
  } else {
    fileStore = [...fileStore, record];
  }

  saveToDisk(fileStore);
  return record;
}

export async function getAllAssessments(): Promise<Assessment[]> {
  if (isSharePointConfigured()) {
    return getAllAssessmentsFromSharePoint();
  }
  return fileStore;
}
