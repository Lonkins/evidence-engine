import type { Config } from "./config.js";
import { timed, type TraceEntry } from "./trace.js";

const GITHUB_MODELS_URL = "https://models.github.ai/inference/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1000, 3000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * One chat completion against GitHub Models free tier. Free-tier rate limits
 * are tight, so 429/5xx are retried with backoff (honouring Retry-After)
 * rather than surfacing as a raw error mid-demo.
 */
export async function chat(
  config: Config,
  messages: ChatMessage[]
): Promise<{ data: string; entry: TraceEntry }> {
  return timed("llm.chat", "POST", "models.github.ai /inference/chat/completions", async () => {
    let response: Response | null = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      response = await fetch(GITHUB_MODELS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.githubModelsToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.githubModelsModel,
          messages,
          max_tokens: 300,
          temperature: 0.9,
        }),
      });

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === MAX_ATTEMPTS) break;

      const retryAfter = parseInt(response.headers.get("retry-after") ?? "", 10);
      const waitMs = Number.isFinite(retryAfter)
        ? Math.min(retryAfter * 1000, 15_000)
        : BACKOFF_MS[attempt - 1];
      await response.text().catch(() => "");
      await sleep(waitMs);
    }

    if (!response || !response.ok) {
      const text = response ? await response.text() : "";
      throw new Error(
        `GitHub Models call failed after ${MAX_ATTEMPTS} attempt(s): ${response?.status} — ${text.slice(0, 300)}`
      );
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = body.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error("GitHub Models returned an empty reply");
    }
    return {
      status: response.status,
      data: reply,
      detail: `${config.githubModelsModel}, ${reply.length} chars`,
    };
  }, "model");
}
