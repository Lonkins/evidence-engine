export interface Accusation {
  suspect: string;
  evidence: string[];
  timestamp: string;
  verdict: "correct" | "incorrect" | "insufficient_evidence";
}

export interface GameState {
  questionsAsked: number;
  claimsChecked: number;
  accusation?: Accusation;
  startedAt: string;
}

let state: GameState = {
  questionsAsked: 0,
  claimsChecked: 0,
  startedAt: new Date().toISOString(),
};

export function getState(): Readonly<GameState> {
  return state;
}

export function recordQuestion(): void {
  state = { ...state, questionsAsked: state.questionsAsked + 1 };
}

export function recordClaimCheck(): void {
  state = { ...state, claimsChecked: state.claimsChecked + 1 };
}

export function recordAccusation(accusation: Accusation): void {
  state = { ...state, accusation };
}

export function resetGame(): void {
  state = {
    questionsAsked: 0,
    claimsChecked: 0,
    startedAt: new Date().toISOString(),
  };
}

export const CHARACTERS = ["Helena Voss", "Felix Drummond", "Nora Ashton"] as const;
export type Character = (typeof CHARACTERS)[number];

export const CORRECT_SUSPECT: Character = "Helena Voss";

export const REQUIRED_EVIDENCE_KEYS = [
  "09-security-log.md",
  "14-provenance-dispute.md",
];
