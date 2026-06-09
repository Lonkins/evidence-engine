import fs from "fs";
import path from "path";

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

let store: Assessment[] = loadFromDisk();

export function getAssessment(toolName: string): Assessment | null {
  const normalised = toolName.toLowerCase().trim();
  return (
    store.find(
      (a) =>
        a.toolName.toLowerCase() === normalised ||
        a.toolName.toLowerCase().includes(normalised)
    ) ?? null
  );
}

export function saveAssessment(input: Omit<Assessment, "id" | "assessedBy" | "assessedAt">): Assessment {
  const existing = getAssessment(input.toolName);

  const record: Assessment = {
    ...input,
    id: existing?.id ?? crypto.randomUUID(),
    assessedBy: "RiskRadar via M365 Copilot",
    assessedAt: new Date().toISOString(),
  };

  if (existing) {
    store = store.map((a) => (a.id === existing.id ? record : a));
  } else {
    store = [...store, record];
  }

  saveToDisk(store);
  return record;
}

export function getAllAssessments(): Assessment[] {
  return store;
}
