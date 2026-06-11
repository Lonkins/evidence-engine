import type { Config } from "./config.js";
import { timed, type TraceEntry } from "./trace.js";

const GITHUB_MODELS_URL = "https://models.github.ai/inference/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** One chat completion against GitHub Models free tier. */
export async function chat(
  config: Config,
  messages: ChatMessage[]
): Promise<{ data: string; entry: TraceEntry }> {
  return timed("llm.chat", "POST", "models.github.ai /inference/chat/completions", async () => {
    const response = await fetch(GITHUB_MODELS_URL, {
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

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub Models call failed: ${response.status} — ${text.slice(0, 300)}`);
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
  });
}
