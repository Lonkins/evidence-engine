import { randomUUID } from "node:crypto";
import type { Speaker } from "./characters.js";
import type { ChatMessage } from "./llm.js";

export interface StoredClaim {
  claimId: string;
  speaker: Speaker;
  turnNo: number;
  text: string;
  challenged: boolean;
}

export interface Scorecard {
  hallucinationsCaught: number;
  falseObjections: number;
  selfContradictionsExposed: number;
  turns: number;
  challenges: number;
}

export interface Session {
  sessionId: string;
  createdAt: string;
  /** Per-speaker turn counter (turn numbers are per speaker). */
  turnsBySpeaker: Map<Speaker, number>;
  /** Per-speaker chat history for the LLM (without system prompt). */
  historyBySpeaker: Map<Speaker, ChatMessage[]>;
  claims: Map<string, StoredClaim>;
  score: Scorecard;
}

const MAX_SESSIONS = 50;
const HISTORY_LIMIT = 12;

const sessions = new Map<string, Session>();

export function createSession(): Session {
  // Evict the oldest session if the in-memory store is full.
  if (sessions.size >= MAX_SESSIONS) {
    const oldest = sessions.keys().next().value;
    if (oldest) sessions.delete(oldest);
  }
  const session: Session = {
    sessionId: randomUUID(),
    createdAt: new Date().toISOString(),
    turnsBySpeaker: new Map(),
    historyBySpeaker: new Map(),
    claims: new Map(),
    score: {
      hallucinationsCaught: 0,
      falseObjections: 0,
      selfContradictionsExposed: 0,
      turns: 0,
      challenges: 0,
    },
  };
  sessions.set(session.sessionId, session);
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function nextTurn(session: Session, speaker: Speaker): number {
  const turn = (session.turnsBySpeaker.get(speaker) ?? 0) + 1;
  session.turnsBySpeaker.set(speaker, turn);
  session.score.turns += 1;
  return turn;
}

export function appendHistory(session: Session, speaker: Speaker, messages: ChatMessage[]): void {
  const history = session.historyBySpeaker.get(speaker) ?? [];
  const updated = [...history, ...messages].slice(-HISTORY_LIMIT);
  session.historyBySpeaker.set(speaker, updated);
}

export function getHistory(session: Session, speaker: Speaker): ChatMessage[] {
  return session.historyBySpeaker.get(speaker) ?? [];
}
