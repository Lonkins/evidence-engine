import { describe, it, expect } from "vitest";
import {
  gameReducer,
  initialGameState,
  isQuestionAvailable,
  contradictionsFound,
} from "./gameState";
import { QUESTIONS, CLAIMS_BY_ID } from "../data/caseData";
import type { Claim } from "./types";

const lieClaim = CLAIMS_BY_ID["c-h-departure"];
const silentClaim = CLAIMS_BY_ID["c-h-walk-home"];

describe("gameReducer", () => {
  it("opens the case", () => {
    const state = gameReducer(initialGameState, { type: "OPEN_CASE" });
    expect(state.caseOpened).toBe(true);
  });

  it("records an asked question exactly once", () => {
    const question = QUESTIONS[0];
    const once = gameReducer(initialGameState, { type: "ASK_QUESTION", question });
    const twice = gameReducer(once, { type: "ASK_QUESTION", question });
    expect(twice.askedQuestionIds).toEqual([question.id]);
  });

  it("pressing a claim files its cited documents on the board", () => {
    const state = gameReducer(initialGameState, { type: "PRESS_CLAIM", claim: lieClaim });
    expect(state.pressedClaimIds).toContain("c-h-departure");
    expect(state.discoveredDocKeys).toContain("06-helena-statement.md");
    expect(state.discoveredDocKeys).toContain("09-security-log.md");
  });

  it("does not duplicate documents already on the board", () => {
    const once = gameReducer(initialGameState, { type: "PRESS_CLAIM", claim: lieClaim });
    const again = gameReducer(once, { type: "PRESS_CLAIM", claim: lieClaim });
    const keys = again.discoveredDocKeys;
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("does not mutate the previous state", () => {
    const before = { ...initialGameState };
    gameReducer(initialGameState, { type: "PRESS_CLAIM", claim: lieClaim });
    expect(initialGameState).toEqual(before);
  });

  it("archive hits discover their documents", () => {
    const state = gameReducer(initialGameState, {
      type: "ARCHIVE_SEARCH",
      result: {
        query: "phone records",
        hits: [{ docKey: "13-phone-records.md", excerpt: "…", score: 0.9 }],
      },
    });
    expect(state.discoveredDocKeys).toContain("13-phone-records.md");
  });

  it("RESET returns to a fresh investigation with the case open", () => {
    let state = gameReducer(initialGameState, { type: "PRESS_CLAIM", claim: lieClaim });
    state = gameReducer(state, { type: "RESET" });
    expect(state.pressedClaimIds).toEqual([]);
    expect(state.caseOpened).toBe(true);
  });
});

describe("isQuestionAvailable", () => {
  const locked = QUESTIONS.find((q) => q.id === "q-h4")!;

  it("locks questions until their required documents surface", () => {
    expect(isQuestionAvailable(locked, ["01-case-overview.md"])).toBe(false);
    expect(isQuestionAvailable(locked, ["09-security-log.md"])).toBe(true);
  });

  it("questions without requirements are always available", () => {
    expect(isQuestionAvailable(QUESTIONS[0], [])).toBe(true);
  });
});

describe("contradictionsFound", () => {
  it("counts only pressed CONTRADICTED claims", () => {
    let state = gameReducer(initialGameState, { type: "PRESS_CLAIM", claim: lieClaim });
    state = gameReducer(state, { type: "PRESS_CLAIM", claim: silentClaim });
    const found = contradictionsFound(state, CLAIMS_BY_ID);
    expect(found.map((c: Claim) => c.id)).toEqual(["c-h-departure"]);
  });
});
