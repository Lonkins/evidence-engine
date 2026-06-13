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
  /**
   * When true, the challenge verdict is produced by the KB's grounded
   * reasoning (answerSynthesis) and the deterministic check is demoted to a
   * disclosed cross-check. Default false until a model is wired to the KB and
   * the answer-synthesis provisioning spike passes (design-log Entry 4) — so
   * the current demo path is unchanged until the upgrade is verified live.
   */
  iqVerdictEnabled: boolean;
  /**
   * KB retrieval reasoning effort. `minimal` is LLM-free (current proven path,
   * extractive only — cannot synthesise a verdict). `low`/`medium` require a
   * model bound to the KB and unlock answerSynthesis (the IQ-brain path).
   */
  reasoningEffort: "minimal" | "low" | "medium";
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
    iqVerdictEnabled: (process.env.IQ_VERDICT_ENABLED ?? "false").toLowerCase() === "true",
    reasoningEffort: (process.env.KB_REASONING_EFFORT ?? "minimal") as Config["reasoningEffort"],
    port: parseInt(process.env.PORT ?? "8787", 10),
    corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
