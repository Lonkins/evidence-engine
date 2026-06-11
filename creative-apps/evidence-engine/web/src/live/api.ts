import type {
  AskResponse,
  ChallengeResponse,
  ResetResponse,
} from "./types";

/**
 * Client for the Live Interrogation backend. The backend holds both secrets
 * (search admin key, GitHub Models token); this client only ever sees JSON.
 * If the backend is unreachable we say so plainly — live mode never falls
 * back to local retrieval while claiming to be live.
 */
const BASE_URL: string =
  (import.meta.env.VITE_LIVE_API_URL as string | undefined) ?? "http://localhost:8787";

const HEALTH_TIMEOUT_MS = 4000;

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Live backend error (${response.status}): ${detail.slice(0, 200)}`);
  }
  return (await response.json()) as T;
}

export async function probeHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
    const response = await fetch(`${BASE_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return false;
    const body = (await response.json()) as { live?: boolean };
    return body.live === true;
  } catch {
    return false;
  }
}

export function createSession(): Promise<{ sessionId: string }> {
  return post("/api/session", {});
}

export function ask(
  sessionId: string,
  speaker: string,
  question: string
): Promise<AskResponse> {
  return post("/api/ask", { sessionId, speaker, question });
}

export function challenge(sessionId: string, claimId: string): Promise<ChallengeResponse> {
  return post("/api/challenge", { sessionId, claimId });
}

export function reset(sessionId: string): Promise<ResetResponse> {
  return post("/api/reset", { sessionId });
}
