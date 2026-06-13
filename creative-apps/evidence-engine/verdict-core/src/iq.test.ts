import { describe, expect, test } from "vitest";
import {
  buildVerdictInstruction,
  parseIqAnswer,
  combineWithCrossCheck,
  ungroundedVerdict,
  type IqReference,
} from "./iq-verdict.js";
import type { EvidenceCheck } from "./verdict.js";

const refs: IqReference[] = [
  { docKey: "gallery-09", title: "Electronic Access Log", rerankerScore: 3.2 },
];

describe("buildVerdictInstruction", () => {
  test("embeds the claim and speaker and asks for the parseable shape", () => {
    const instruction = buildVerdictInstruction("I left at 7:45pm", "Helena Voss");
    expect(instruction).toContain("Helena Voss");
    expect(instruction).toContain("I left at 7:45pm");
    expect(instruction).toContain("VERDICT:");
    expect(instruction).toContain("PASSAGE:");
  });
});

describe("parseIqAnswer", () => {
  test("parses a CONTRADICTED verdict with a verbatim passage", () => {
    const answer = [
      "VERDICT: CONTRADICTED",
      "PASSAGE: 20:47:33 | CARD_EXIT | HOLDER: Helena Voss",
      "WHY: the badge log records her exit at 20:47, not 19:45.",
    ].join("\n");
    const result = parseIqAnswer(answer, refs);
    expect(result.verdict).toBe("CONTRADICTED");
    expect(result.citedPassage).toContain("20:47:33");
    expect(result.justification).toContain("badge log");
  });

  test("parses SUPPORTED", () => {
    const answer = "VERDICT: SUPPORTED\nPASSAGE: NONE\nWHY: the passage affirms it.";
    expect(parseIqAnswer(answer, refs).verdict).toBe("SUPPORTED");
  });

  test("UNADDRESSED maps to UNSUPPORTED and fails closed", () => {
    const answer = "VERDICT: UNADDRESSED\nPASSAGE: NONE\nWHY: the case file is silent.";
    const result = parseIqAnswer(answer, refs);
    expect(result.verdict).toBe("UNSUPPORTED");
    expect(result.citedPassage).toBeNull();
  });

  test("missing verdict token fails closed to UNSUPPORTED", () => {
    const result = parseIqAnswer("I am not sure what to make of this.", refs);
    expect(result.verdict).toBe("UNSUPPORTED");
  });

  test("a CONTRADICTED verdict with no grounding reference fails closed", () => {
    // The KB must have grounded on something; an ungrounded catch is not trusted.
    const result = parseIqAnswer("VERDICT: CONTRADICTED\nPASSAGE: made up\nWHY: x", []);
    expect(result.verdict).toBe("UNSUPPORTED");
    expect(result.citedPassage).toBeNull();
  });

  test("scan fallback recognises the verdict word without the leading token", () => {
    const result = parseIqAnswer("The badge log contradicts her stated time.", refs);
    expect(result.verdict).toBe("CONTRADICTED");
  });

  test("real spike shape: strips wrapping quotes and trailing [ref_id:N] tags", () => {
    // Verbatim from spike/output/08-retrieve-verdict.json (gpt-4.1-mini, medium).
    const answer = [
      "VERDICT: CONTRADICTED  ",
      'PASSAGE: "Helena Voss\'s statement asserts she left the gallery at approximately 19:45. This is directly contradicted by the electronic access log, which records her badge exiting the main door at 20:47:33 — approximately one hour later, and within the time of death window."  ',
      "WHY: The electronic access log shows Helena Voss left the gallery at 20:47, one hour later than her claimed time of 19:45, contradicting her statement. [ref_id:0] [ref_id:4]",
    ].join("\n");
    const result = parseIqAnswer(answer, refs);
    expect(result.verdict).toBe("CONTRADICTED");
    // Wrapping quotes removed; verbatim badge time preserved.
    expect(result.citedPassage?.startsWith('"')).toBe(false);
    expect(result.citedPassage).toContain("20:47:33");
    // Inline grounding tags stripped from the justification.
    expect(result.justification).not.toContain("[ref_id");
    expect(result.justification).toContain("20:47");
  });
});

describe("combineWithCrossCheck", () => {
  const heuristicContradicted: EvidenceCheck = {
    verdict: "CONTRADICTED",
    citations: [{ docKey: "gallery-09", title: "Access Log", content: "20:47 exit ..." }],
    triggers: { "gallery-09": ["20:47:33 CARD_EXIT Helena Voss"] },
  };
  const heuristicUnsupported: EvidenceCheck = {
    verdict: "UNSUPPORTED",
    citations: [],
    triggers: {},
  };

  test("with no IQ verdict, falls back to the deterministic verdict, labelled honestly", () => {
    const combined = combineWithCrossCheck(null, heuristicContradicted);
    expect(combined.verdict).toBe("CONTRADICTED");
    expect(combined.source).toBe("heuristic");
    expect(combined.citedPassage).toContain("20:47:33");
  });

  test("IQ leads; agreement flagged true when both agree", () => {
    const iq = parseIqAnswer("VERDICT: CONTRADICTED\nPASSAGE: 20:47 exit\nWHY: log", refs);
    const combined = combineWithCrossCheck(iq, heuristicContradicted);
    expect(combined.source).toBe("iq");
    expect(combined.verdict).toBe("CONTRADICTED");
    expect(combined.agreement).toBe(true);
  });

  test("IQ leads and divergence is disclosed when the two disagree", () => {
    const iq = parseIqAnswer("VERDICT: CONTRADICTED\nPASSAGE: 20:47 exit\nWHY: log", refs);
    const combined = combineWithCrossCheck(iq, heuristicUnsupported);
    expect(combined.verdict).toBe("CONTRADICTED"); // IQ brain leads
    expect(combined.heuristic).toBe("UNSUPPORTED");
    expect(combined.agreement).toBe(false);
  });
});

describe("ungroundedVerdict (pull the plug)", () => {
  test("grounding off yields UNSUPPORTED, source ungrounded, never a catch", () => {
    const v = ungroundedVerdict();
    expect(v.verdict).toBe("UNSUPPORTED");
    expect(v.source).toBe("ungrounded");
    expect(v.citations).toEqual([]);
    expect(v.citedPassage).toBeNull();
    expect(v.iq).toBeNull();
  });
});
