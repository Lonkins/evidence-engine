import { describe, expect, test } from "vitest";
import { evaluateLiveAccusation, exhibitsAgainst } from "./accusation";
import type { ChallengeResponse } from "./types";

function challenge(
  partial: {
    claimId: string;
    speaker: string;
    claimText?: string;
    verdict?: ChallengeResponse["evidence"]["verdict"];
    self?: ChallengeResponse["self"]["verdict"];
    citedPassage?: string | null;
    docKeys?: string[];
  }
): ChallengeResponse {
  return {
    claimId: partial.claimId,
    claimText: partial.claimText ?? "a claim",
    speaker: partial.speaker,
    turnNo: 1,
    evidence: {
      verdict: partial.verdict ?? "UNSUPPORTED",
      source: "iq",
      agreement: true,
      iq: partial.citedPassage ? { justification: "j", citedPassage: partial.citedPassage } : null,
      citations: (partial.docKeys ?? []).map((docKey) => ({ docKey, title: docKey, excerpt: "e" })),
    },
    self: { verdict: partial.self ?? "SELF_CONSISTENT", conflicts: [] },
    score: {} as ChallengeResponse["score"],
    trace: [],
  };
}

function byId(list: ChallengeResponse[]): Record<string, ChallengeResponse> {
  return Object.fromEntries(list.map((c) => [c.claimId, c]));
}

describe("exhibitsAgainst", () => {
  test("collects only positive catches against the named speaker", () => {
    const challenges = byId([
      challenge({ claimId: "1", speaker: "Helena Voss", verdict: "CONTRADICTED", claimText: "I left at 19:45", citedPassage: "badge exit 20:47", docKeys: ["gallery-09"] }),
      challenge({ claimId: "2", speaker: "Helena Voss", verdict: "UNSUPPORTED" }), // file silent — not an exhibit
      challenge({ claimId: "3", speaker: "Felix Drummond", verdict: "CONTRADICTED" }), // different speaker
    ]);
    const exhibits = exhibitsAgainst("Helena Voss", challenges);
    expect(exhibits).toHaveLength(1);
    expect(exhibits[0].claimText).toBe("I left at 19:45");
    expect(exhibits[0].citedPassage).toBe("badge exit 20:47");
    expect(exhibits[0].docKeys).toEqual(["gallery-09"]);
  });

  test("a self-contradiction counts as an exhibit", () => {
    const challenges = byId([
      challenge({ claimId: "1", speaker: "Nora Ashton", self: "SELF_CONTRADICTION" }),
    ]);
    const exhibits = exhibitsAgainst("Nora Ashton", challenges);
    expect(exhibits).toHaveLength(1);
    expect(exhibits[0].kind).toBe("SELF_CONTRADICTION");
  });
});

describe("evaluateLiveAccusation", () => {
  test("SOLVED — accuse the killer with a pinned contradiction", () => {
    const challenges = byId([
      challenge({ claimId: "1", speaker: "Helena Voss", verdict: "CONTRADICTED" }),
    ]);
    const result = evaluateLiveAccusation("helena", "Helena Voss", challenges);
    expect(result.outcome).toBe("SOLVED");
    expect(result.exhibits).toHaveLength(1);
  });

  test("OVERRULED — accuse a witness you caught lying who isn't the killer", () => {
    const challenges = byId([
      challenge({ claimId: "1", speaker: "Felix Drummond", verdict: "CONTRADICTED" }),
    ]);
    const result = evaluateLiveAccusation("felix", "Felix Drummond", challenges);
    // A contradiction is not a confession.
    expect(result.outcome).toBe("OVERRULED");
    expect(result.exhibits).toHaveLength(1);
  });

  test("UNPROVEN — accuse anyone with no pinned contradiction, even the killer", () => {
    const challenges = byId([
      challenge({ claimId: "1", speaker: "Helena Voss", verdict: "UNSUPPORTED" }),
    ]);
    expect(evaluateLiveAccusation("helena", "Helena Voss", challenges).outcome).toBe("UNPROVEN");
    expect(evaluateLiveAccusation("nora", "Nora Ashton", {}).outcome).toBe("UNPROVEN");
  });
});
