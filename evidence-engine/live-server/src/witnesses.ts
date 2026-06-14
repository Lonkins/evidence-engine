import type { Config } from "./config.js";
import { chat } from "./llm.js";
import type { TraceEntry } from "./trace.js";
import type { Witness } from "./sessions.js";

const MAX_WITNESSES = 3;
const SOURCE_PREVIEW_CHARS = 4000;

const DEFAULT_WITNESS: Witness = {
  name: "The Witness",
  role: "Witness",
  hook: "Knows only this source.",
};

const EXTRACTION_SYSTEM = `You are setting up an interrogation game. The player will put "witnesses" on the stand and cross-examine them about a source the user supplied. Your job is to read that source and propose who the player can interrogate.

Rules:
- Propose 1 to 3 witnesses. Fewer is fine.
- A STORY or narrative → use its actual characters (the people in it).
- A factual DOCUMENT (spec, notes, rules, article) → its author, or a named person it centres on, or "The Author".
- CODE → the developer who wrote it, or "the assistant that wrote this code".
- Stay grounded in the material. Do not invent named people the source doesn't imply; for sourceless cases use a generic author/assistant.
- Each witness: a "name", a short "role" (2-4 words), and a one-line "hook" (intriguing, under 90 chars).

Return ONLY a strict JSON array, no prose, no code fences:
[{"name": "...", "role": "...", "hook": "..."}]`;

function clampWitness(raw: unknown): Witness | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const name = typeof obj.name === "string" ? obj.name.trim().slice(0, 60) : "";
  if (!name) return null;
  const role = typeof obj.role === "string" && obj.role.trim() ? obj.role.trim().slice(0, 40) : "Witness";
  const hook =
    typeof obj.hook === "string" && obj.hook.trim()
      ? obj.hook.trim().slice(0, 120)
      : "Knows only this source.";
  return { name, role, hook };
}

/** Pull the first JSON array out of a model reply (tolerant of stray prose/fences). */
function parseWitnesses(reply: string): Witness[] {
  const match = reply.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(parsed)) return [];
    const witnesses: Witness[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      const witness = clampWitness(item);
      if (witness && !seen.has(witness.name.toLowerCase())) {
        seen.add(witness.name.toLowerCase());
        witnesses.push(witness);
      }
      if (witnesses.length >= MAX_WITNESSES) break;
    }
    return witnesses;
  } catch {
    return [];
  }
}

/**
 * Infer the interrogatable cast from a user-supplied source (Entry 8). One LLM
 * call; fails closed to a single generic witness so a session always has someone
 * on the stand even if the model misbehaves or rate-limits.
 */
export async function extractWitnesses(
  config: Config,
  source: string,
  sourceTitle: string
): Promise<{ data: Witness[]; entry: TraceEntry }> {
  const userPrompt = `Source title: ${sourceTitle}\n\nSource:\n${source.slice(0, SOURCE_PREVIEW_CHARS)}`;
  try {
    const { data, entry } = await chat(
      config,
      [
        { role: "system", content: EXTRACTION_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.4, maxTokens: 400, step: "llm.castWitnesses" }
    );
    const witnesses = parseWitnesses(data);
    return {
      data: witnesses.length > 0 ? witnesses : [DEFAULT_WITNESS],
      entry: { ...entry, detail: `${witnesses.length || 1} witness(es) cast` },
    };
  } catch (error) {
    // Never block a session on the casting call.
    const detail = error instanceof Error ? error.message.slice(0, 120) : "cast failed";
    return {
      data: [DEFAULT_WITNESS],
      entry: {
        step: "llm.castWitnesses — fallback",
        method: "POST",
        target: "models.github.ai /inference/chat/completions",
        latencyMs: 0,
        status: 200,
        detail,
        origin: "model",
      },
    };
  }
}
