import { describe, expect, test } from "vitest";
import { segmentClaims, splitSentences } from "./claims.js";

describe("splitSentences", () => {
  test("splits on sentence enders followed by capitals", () => {
    const sentences = splitSentences(
      "I left at 7:45pm. The courier had already gone! Victor stayed behind."
    );
    expect(sentences).toEqual([
      "I left at 7:45pm.",
      "The courier had already gone!",
      "Victor stayed behind.",
    ]);
  });

  test("does not split on decimals or initials mid-sentence", () => {
    const sentences = splitSentences("Mr. holt signed at 8:15pm and left.");
    expect(sentences).toHaveLength(1);
  });

  test("returns empty array for blank input", () => {
    expect(splitSentences("   ")).toEqual([]);
  });
});

describe("segmentClaims", () => {
  test("keeps checkable assertions and preserves sentence indices", () => {
    const claims = segmentClaims(
      "Of course. I left the gallery at 7:45pm sharp. Why do you ask me that? The catalogue deadline kept me at my desk until seven."
    );
    expect(claims.map((c) => c.text)).toEqual([
      "I left the gallery at 7:45pm sharp.",
      "The catalogue deadline kept me at my desk until seven.",
    ]);
    // Indices reflect position in the original sentence list.
    expect(claims[0].index).toBe(1);
    expect(claims[1].index).toBe(3);
  });

  test("drops questions and short filler", () => {
    expect(segmentClaims("Yes. Who told you that? No.")).toEqual([]);
  });
});
