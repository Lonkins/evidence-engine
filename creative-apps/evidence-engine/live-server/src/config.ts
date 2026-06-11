import "dotenv/config";

export interface Config {
  searchEndpoint: string;
  searchAdminKey: string;
  knowledgeBaseName: string;
  knowledgeSourceName: string;
  indexName: string;
  githubModelsToken: string;
  githubModelsModel: string;
  noEvidenceThreshold: number;
  claimEvidenceThreshold: number;
  testimonyThreshold: number;
  port: number;
  corsOrigins: string[];
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): Config {
  return {
    searchEndpoint: required("AZURE_SEARCH_ENDPOINT").replace(/\/$/, ""),
    searchAdminKey: required("AZURE_SEARCH_ADMIN_KEY"),
    knowledgeBaseName: process.env.AZURE_KNOWLEDGE_BASE_NAME ?? "evidence-kb",
    knowledgeSourceName: process.env.AZURE_KNOWLEDGE_SOURCE_NAME ?? "evidence-ks",
    indexName: process.env.AZURE_SEARCH_INDEX_NAME ?? "evidence",
    githubModelsToken: required("GITHUB_MODELS_TOKEN"),
    githubModelsModel: process.env.GITHUB_MODELS_MODEL ?? "openai/gpt-4o-mini",
    noEvidenceThreshold: parseFloat(process.env.NO_EVIDENCE_THRESHOLD ?? "3.5"),
    // Declarative claim queries rerank systematically lower than question-style
    // queries; calibrated live June 11 2026 — grounded claims ≥ 2.2, fabricated
    // ≤ 1.5 (see HANDOFF.md, Live Interrogation calibration table).
    claimEvidenceThreshold: parseFloat(process.env.CLAIM_EVIDENCE_THRESHOLD ?? "2.0"),
    // Testimony sentences are short; any hit is then gated by the temporal
    // conflict heuristic, so the retrieval bar can sit low without false alarms.
    testimonyThreshold: parseFloat(process.env.TESTIMONY_THRESHOLD ?? "1.0"),
    port: parseInt(process.env.PORT ?? "8787", 10),
    corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
