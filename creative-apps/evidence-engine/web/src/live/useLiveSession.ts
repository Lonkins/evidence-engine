import { useCallback, useReducer } from "react";
import * as api from "./api";
import type {
  ChallengeResponse,
  LiveTurn,
  Scorecard,
  TraceEntry,
} from "./types";

export type LiveStatus = "idle" | "probing" | "offline" | "ready" | "ended";

export interface LiveSessionState {
  status: LiveStatus;
  sessionId: string | null;
  /** Transcript per speaker name. */
  transcripts: Record<string, LiveTurn[]>;
  /** Challenge results keyed by claimId. */
  challenges: Record<string, ChallengeResponse>;
  /** Rolling engine trace — every live call the backend made for us. */
  trace: TraceEntry[];
  score: Scorecard | null;
  finalReport: { score: Scorecard; deletedTestimonyDocs: number } | null;
  askPending: boolean;
  challengePending: string | null;
  error: string | null;
}

const initialState: LiveSessionState = {
  status: "idle",
  sessionId: null,
  transcripts: {},
  challenges: {},
  trace: [],
  score: null,
  finalReport: null,
  askPending: false,
  challengePending: null,
  error: null,
};

type LiveAction =
  | { type: "PROBE_START" }
  | { type: "OFFLINE" }
  | { type: "READY"; sessionId: string }
  | { type: "ASK_START" }
  | { type: "ASK_DONE"; speaker: string; turn: LiveTurn; trace: TraceEntry[] }
  | { type: "CHALLENGE_START"; claimId: string }
  | { type: "CHALLENGE_DONE"; result: ChallengeResponse }
  | { type: "ENDED"; score: Scorecard; deletedTestimonyDocs: number; trace: TraceEntry[] }
  | { type: "ERROR"; message: string };

const TRACE_LIMIT = 80;

function appendTrace(existing: TraceEntry[], incoming: TraceEntry[]): TraceEntry[] {
  return [...existing, ...incoming].slice(-TRACE_LIMIT);
}

function reducer(state: LiveSessionState, action: LiveAction): LiveSessionState {
  switch (action.type) {
    case "PROBE_START":
      return { ...initialState, status: "probing" };
    case "OFFLINE":
      return { ...state, status: "offline" };
    case "READY":
      return { ...state, status: "ready", sessionId: action.sessionId, error: null };
    case "ASK_START":
      return { ...state, askPending: true, error: null };
    case "ASK_DONE": {
      const existing = state.transcripts[action.speaker] ?? [];
      return {
        ...state,
        askPending: false,
        transcripts: {
          ...state.transcripts,
          [action.speaker]: [...existing, action.turn],
        },
        trace: appendTrace(state.trace, action.trace),
      };
    }
    case "CHALLENGE_START":
      return { ...state, challengePending: action.claimId, error: null };
    case "CHALLENGE_DONE":
      return {
        ...state,
        challengePending: null,
        challenges: { ...state.challenges, [action.result.claimId]: action.result },
        score: action.result.score,
        trace: appendTrace(state.trace, action.result.trace),
      };
    case "ENDED":
      return {
        ...state,
        status: "ended",
        finalReport: {
          score: action.score,
          deletedTestimonyDocs: action.deletedTestimonyDocs,
        },
        trace: appendTrace(state.trace, action.trace),
      };
    case "ERROR":
      return { ...state, askPending: false, challengePending: null, error: action.message };
    default:
      return state;
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useLiveSession() {
  const [state, dispatch] = useReducer(reducer, initialState);

  /** Probe the backend and open a session. Offline is reported plainly. */
  const connect = useCallback(async () => {
    dispatch({ type: "PROBE_START" });
    const live = await api.probeHealth();
    if (!live) {
      dispatch({ type: "OFFLINE" });
      return;
    }
    try {
      const { sessionId } = await api.createSession();
      dispatch({ type: "READY", sessionId });
    } catch {
      dispatch({ type: "OFFLINE" });
    }
  }, []);

  const askQuestion = useCallback(
    async (sessionId: string, speaker: string, question: string, grounding = true) => {
      dispatch({ type: "ASK_START" });
      try {
        const response = await api.ask(sessionId, speaker, question, grounding);
        dispatch({
          type: "ASK_DONE",
          speaker,
          turn: {
            turnNo: response.turnNo,
            question,
            reply: response.reply,
            claims: response.claims,
            retrievedDocs: response.retrievedDocs,
          },
          trace: response.trace,
        });
      } catch (error) {
        dispatch({ type: "ERROR", message: describe(error) });
      }
    },
    []
  );

  const challengeClaim = useCallback(
    async (sessionId: string, claimId: string, grounding = true) => {
    dispatch({ type: "CHALLENGE_START", claimId });
    try {
      const result = await api.challenge(sessionId, claimId, grounding);
      dispatch({ type: "CHALLENGE_DONE", result });
    } catch (error) {
      dispatch({ type: "ERROR", message: describe(error) });
    }
  }, []);

  const endSession = useCallback(async (sessionId: string) => {
    try {
      const result = await api.reset(sessionId);
      dispatch({
        type: "ENDED",
        score: result.finalScore,
        deletedTestimonyDocs: result.deletedTestimonyDocs,
        trace: result.trace,
      });
    } catch (error) {
      dispatch({ type: "ERROR", message: describe(error) });
    }
  }, []);

  return { state, connect, askQuestion, challengeClaim, endSession };
}
