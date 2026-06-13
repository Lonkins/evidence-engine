import { randomUUID } from "node:crypto";
import { CASE_ID, PLANTS } from "./characters.js";
import type { ChatMessage } from "./llm.js";

// Speaker is a free string at the session layer: the Holbrooke suspects are a
// subset, and a "bring your own trial" session has a single custom witness.
export interface StoredClaim {
  claimId: string;
  speaker: string;
  turnNo: number;
  text: string;
  challenged: boolean;
}

/** A custom witness for a "bring your own trial" (Part 2) session. */
export interface Witness {
  name: string;
  role: string;
}

export type SessionMode = "holbrooke" | "byo";

export interface NewSessionOptions {
  /** Evidence partition this session interrogates (case_id filter). */
  caseId?: string;
  mode?: SessionMode;
  /** The single witness, for byo mode. */
  witness?: Witness;
  /** Title of the user-supplied source, for byo mode. */
  sourceTitle?: string;
  /** Ground-truth plant count (0 for byo — lies there are emergent). */
  plantsTotal?: number;
}

/**
 * Scoring semantics (design-log entry 2, June 12):
 * - A "catch" requires positive evidence: CONTRADICTED or SELF_CONTRADICTION.
 * - UNSUPPORTED is "the file is silent" — flagged, never a catch. Counting it
 *   would conflate *unverifiable* with *false* and make "challenge everything"
 *   the dominant strategy.
 * - plantsCaught counts ground-truthed fabrications (characters.ts PLANTS)
 *   the player actually pinned with a contradiction.
 */
export interface Scorecard {
  contradictionsPinned: number;
  selfContradictionsExposed: number;
  flaggedUnverifiable: number;
  falseObjections: number;
  turns: number;
  challenges: number;
  plantsCaught: number;
  plantsTotal: number;
}

export interface Session {
  sessionId: string;
  createdAt: string;
  /** Which evidence partition this session interrogates. */
  caseId: string;
  mode: SessionMode;
  /** The single custom witness, for byo mode. */
  witness?: Witness;
  /** Title of the user-supplied source, for byo mode. */
  sourceTitle?: string;
  /** Per-speaker turn counter (turn numbers are per speaker). */
  turnsBySpeaker: Map<string, number>;
  /** Per-speaker chat history for the LLM (without system prompt). */
  historyBySpeaker: Map<string, ChatMessage[]>;
  claims: Map<string, StoredClaim>;
  score: Scorecard;
  /** Plant ids the player has pinned with a contradiction this session. */
  plantsCaught: Set<string>;
}

const MAX_SESSIONS = 50;
const HISTORY_LIMIT = 12;

const sessions = new Map<string, Session>();

export function createSession(options: NewSessionOptions = {}): Session {
  // Evict the oldest session if the in-memory store is full.
  if (sessions.size >= MAX_SESSIONS) {
    const oldest = sessions.keys().next().value;
    if (oldest) sessions.delete(oldest);
  }
  const session: Session = {
    sessionId: randomUUID(),
    createdAt: new Date().toISOString(),
    caseId: options.caseId ?? CASE_ID,
    mode: options.mode ?? "holbrooke",
    witness: options.witness,
    sourceTitle: options.sourceTitle,
    turnsBySpeaker: new Map(),
    historyBySpeaker: new Map(),
    claims: new Map(),
    score: {
      contradictionsPinned: 0,
      selfContradictionsExposed: 0,
      flaggedUnverifiable: 0,
      falseObjections: 0,
      turns: 0,
      challenges: 0,
      plantsCaught: 0,
      plantsTotal: options.plantsTotal ?? PLANTS.length,
    },
    plantsCaught: new Set(),
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

export function nextTurn(session: Session, speaker: string): number {
  const turn = (session.turnsBySpeaker.get(speaker) ?? 0) + 1;
  session.turnsBySpeaker.set(speaker, turn);
  session.score.turns += 1;
  return turn;
}

export function appendHistory(session: Session, speaker: string, messages: ChatMessage[]): void {
  const history = session.historyBySpeaker.get(speaker) ?? [];
  const updated = [...history, ...messages].slice(-HISTORY_LIMIT);
  session.historyBySpeaker.set(speaker, updated);
}

export function getHistory(session: Session, speaker: string): ChatMessage[] {
  return session.historyBySpeaker.get(speaker) ?? [];
}
