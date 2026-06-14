import type {
  AccusationResult,
  ArchiveResult,
  Claim,
  Question,
  SuspectId,
} from "./types";

export interface GameState {
  selectedSuspectId: SuspectId | null;
  askedQuestionIds: string[];
  /** Claim ids the player has pressed (verdict is revealed once pressed). */
  pressedClaimIds: string[];
  discoveredDocKeys: string[];
  archiveLog: ArchiveResult[];
  accusation: AccusationResult | null;
  caseOpened: boolean;
}

export type GameAction =
  | { type: "OPEN_CASE" }
  | { type: "CLOSE_CASE" }
  | { type: "SELECT_SUSPECT"; suspectId: SuspectId }
  | { type: "ASK_QUESTION"; question: Question }
  | { type: "PRESS_CLAIM"; claim: Claim }
  | { type: "ARCHIVE_SEARCH"; result: ArchiveResult }
  | { type: "ACCUSE"; result: AccusationResult }
  | { type: "RESET" };

export const INITIAL_DOC_KEYS = ["01-case-overview.md"];

export const initialGameState: GameState = {
  selectedSuspectId: null,
  askedQuestionIds: [],
  pressedClaimIds: [],
  discoveredDocKeys: INITIAL_DOC_KEYS,
  archiveLog: [],
  accusation: null,
  caseOpened: false,
};

function withDiscoveredDocs(state: GameState, docKeys: string[]): GameState {
  const merged = [
    ...state.discoveredDocKeys,
    ...docKeys.filter((key) => !state.discoveredDocKeys.includes(key)),
  ];
  return { ...state, discoveredDocKeys: merged };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "OPEN_CASE":
      return { ...state, caseOpened: true };

    case "CLOSE_CASE":
      return { ...state, caseOpened: false, selectedSuspectId: null };

    case "SELECT_SUSPECT":
      return { ...state, selectedSuspectId: action.suspectId };

    case "ASK_QUESTION": {
      if (state.askedQuestionIds.includes(action.question.id)) return state;
      return {
        ...state,
        askedQuestionIds: [...state.askedQuestionIds, action.question.id],
      };
    }

    case "PRESS_CLAIM": {
      if (state.pressedClaimIds.includes(action.claim.id)) return state;
      const next = {
        ...state,
        pressedClaimIds: [...state.pressedClaimIds, action.claim.id],
      };
      // Pressing a claim files its cited documents on the evidence board.
      return withDiscoveredDocs(
        next,
        action.claim.citations.map((c) => c.docKey)
      );
    }

    case "ARCHIVE_SEARCH": {
      const next = {
        ...state,
        archiveLog: [action.result, ...state.archiveLog].slice(0, 12),
      };
      return withDiscoveredDocs(
        next,
        action.result.hits.map((hit) => hit.docKey)
      );
    }

    case "ACCUSE":
      return { ...state, accusation: action.result };

    case "RESET":
      return { ...initialGameState, caseOpened: true };

    default:
      return state;
  }
}

/** A question is available once its required documents are on the board. */
export function isQuestionAvailable(
  question: Question,
  discoveredDocKeys: string[]
): boolean {
  return (question.requiresDocs ?? []).every((key) =>
    discoveredDocKeys.includes(key)
  );
}

export function contradictionsFound(
  state: GameState,
  claimsById: Record<string, Claim>
): Claim[] {
  return state.pressedClaimIds
    .map((id) => claimsById[id])
    .filter((claim): claim is Claim => Boolean(claim))
    .filter((claim) => claim.verdict === "CONTRADICTED");
}
