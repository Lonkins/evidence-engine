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
  /**
   * Grounding-reference floor for the IQ verdict call (kbReason) in a
   * bring-your-own trial. The Holbrooke threshold is calibrated against that
   * corpus; an arbitrary pasted source reranks on a different scale, so reusing
   * it can silently downgrade a real CONTRADICTED to UNVERIFIABLE when every
   * grounding ref scores below the Holbrooke floor. BYO uses a lower floor and
   * trusts the KB's synthesised citation.
   */
  byoVerdictThreshold: number;
  /**
   * Minutes of inactivity after which an abandoned bring-your-own session's
   * pasted-source partition is swept from the shared index, so user text does
   * not linger when a tab is closed without an explicit reset.
   */
  byoTtlMinutes: number;
  testimonyThreshold: number;
  /**
   * When true, the challenge verdict is produced by the KB's grounded
   * reasoning (answerSynthesis) and the deterministic check is demoted to a
   * disclosed cross-check. The answer-synthesis provisioning spike has PASSED
   * (design-log Entry 6; raw proof `spike/output/08-retrieve-verdict.json`),
   * so this is the verified hero path. It defaults false only so the
   * zero-config local fallback (no Azure model bound to the KB) runs the
   * deterministic check alone; the live deployment sets IQ_VERDICT_ENABLED=true
   * and KB_REASONING_EFFORT=medium.
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
    byoVerdictThreshold: parseFloat(process.env.BYO_VERDICT_THRESHOLD ?? "1.0"),
    byoTtlMinutes: parseFloat(process.env.BYO_TTL_MINUTES ?? "30"),
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
