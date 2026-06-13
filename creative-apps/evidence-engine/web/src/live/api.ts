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

/** Config for a "bring your own trial" — the user's source on the stand. */
export interface ByoConfig {
  source: string;
  title?: string;
  witnessName?: string;
}

export interface SessionInfo {
  sessionId: string;
  mode: "holbrooke" | "byo";
  witness?: { name: string; role: string };
  sourceTitle?: string;
}

export function createSession(byo?: ByoConfig): Promise<SessionInfo> {
  return post(
    "/api/session",
    byo ? { source: byo.source, title: byo.title, witnessName: byo.witnessName } : {}
  );
}

export function ask(
  sessionId: string,
  speaker: string,
  question: string,
  grounding = true
): Promise<AskResponse> {
  return post("/api/ask", { sessionId, speaker, question, grounding });
}

export function challenge(
  sessionId: string,
  claimId: string,
  grounding = true
): Promise<ChallengeResponse> {
  return post("/api/challenge", { sessionId, claimId, grounding });
}

export function reset(sessionId: string): Promise<ResetResponse> {
  return post("/api/reset", { sessionId });
}
