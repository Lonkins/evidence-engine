import { describe, it, expect } from "vitest";
import { searchArchive, tokenize } from "./retrieval";
import { CORPUS } from "../data/corpus";

describe("tokenize", () => {
  it("drops short words and stop words", () => {
    expect(tokenize("who is the gallery landlord")).toEqual(["gallery", "landlord"]);
  });

  it("returns empty for noise-only queries", () => {
    expect(tokenize("is it me or")).toEqual([]);
  });
});

describe("searchArchive", () => {
  it("fails closed when the distinctive term is absent from the corpus", () => {
    // "gallery" appears everywhere (near-zero weight); "landlord" appears
    // nowhere (maximum weight) — the engine must stay silent, not match weakly.
    const result = searchArchive("who is the gallery landlord", CORPUS);
    expect(result.hits).toEqual([]);
  });

  it("returns hits for evidence that exists", () => {
    const result = searchArchive("provenance certificate forgery FARI", CORPUS);
    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.hits.map((h) => h.docKey)).toContain("14-provenance-dispute.md");
  });

  it("surfaces the security log for departure-time queries", () => {
    const result = searchArchive("card exit reader main door 20:47", CORPUS);
    expect(result.hits.map((h) => h.docKey)).toContain("09-security-log.md");
  });

  it("caps results at three and scores in descending order", () => {
    const result = searchArchive("statement gallery evening October", CORPUS);
    expect(result.hits.length).toBeLessThanOrEqual(3);
    const scores = result.hits.map((h) => h.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("returns no hits for an empty query", () => {
    expect(searchArchive("", CORPUS).hits).toEqual([]);
  });

  it("includes a readable excerpt around a matched term", () => {
    const result = searchArchive("ceramic desk lamp fracture", CORPUS);
    const excerpt = result.hits[0].excerpt.toLowerCase();
    const matchesSomeTerm = ["ceramic", "desk", "lamp", "fracture"].some((term) =>
      excerpt.includes(term)
    );
    expect(matchesSomeTerm).toBe(true);
  });
});
