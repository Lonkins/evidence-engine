import { describe, expect, test } from "vitest";
import {
  checkAgainstEvidence,
  checkSelfConsistency,
  extractTimes,
  segmentDocument,
} from "./heuristic.js";

const securityLog = {
  docKey: "gallery-09",
  title: "Electronic Access Log",
  content: [
    "**Export generated:** 2025-10-15 08:12:44",
    "2025-10-14 20:47:33 | CARD_EXIT | READER_01_MAIN_DOOR | HOLDER: Helena Voss (HV-0041) | STATUS: VALID",
    "Main door alarm set 21:02 by night service.",
  ].join("\n"),
};

const helenaStatement = {
  docKey: "gallery-06",
  title: "Witness Statement — H. Voss",
  content: [
    "**Date of statement:** 15 October 2025, 10:30",
    "I left the gallery at around a quarter to eight and went straight home.",
    "He seemed distracted, which was not unusual for him before a significant sale.",
  ].join("\n"),
};

describe("extractTimes", () => {
  test("parses 24h and 12h formats to minutes since midnight", () => {
    expect(extractTimes("exit at 20:47")).toEqual([20 * 60 + 47]);
    expect(extractTimes("left at 7:45pm")).toEqual([19 * 60 + 45]);
    expect(extractTimes("at 12:10am")).toEqual([10]);
  });

  test("returns empty array when no times present", () => {
    expect(extractTimes("no times here")).toEqual([]);
  });
});

describe("segmentDocument", () => {
  test("splits on both newlines and sentence boundaries", () => {
    const segments = segmentDocument("Line one.\nFirst sentence. Second sentence.");
    expect(segments).toEqual(["Line one.", "First sentence.", "Second sentence."]);
  });
});

describe("checkAgainstEvidence", () => {
  test("fails closed: empty retrieval is UNSUPPORTED", () => {
    const result = checkAgainstEvidence("I fed the gallery cat at nine.", []);
    expect(result.verdict).toBe("UNSUPPORTED");
    expect(result.citations).toEqual([]);
  });

  test("speaker-tagged log line with conflicting time yields CONTRADICTED", () => {
    const result = checkAgainstEvidence(
      "I left the gallery at 7:45pm.",
      [securityLog],
      ["Helena Voss"]
    );
    expect(result.verdict).toBe("CONTRADICTED");
    expect(result.citations[0].docKey).toBe("gallery-09");
    // The trigger is the verbatim badge-exit line, not the export header.
    expect(result.triggers["gallery-09"]).toHaveLength(1);
    expect(result.triggers["gallery-09"][0]).toContain("20:47:33");
  });

  test("header timestamps in irrelevant segments do not trigger conflicts", () => {
    // Without the speaker term, only the statement's own relevant sentence
    // (no HH:MM times, no negation) participates → SUPPORTED, not a false
    // contradiction from the 10:30 statement-date header.
    const result = checkAgainstEvidence("I left the gallery at 7:45pm.", [helenaStatement]);
    expect(result.verdict).toBe("SUPPORTED");
  });

  test("negation phrases in irrelevant segments are ignored", () => {
    // "was not unusual" lives in a sentence sharing no claim term.
    const result = checkAgainstEvidence("I left the gallery and went home.", [helenaStatement]);
    expect(result.verdict).toBe("SUPPORTED");
  });

  test("explicit negation in a relevant segment yields CONTRADICTED", () => {
    const doc = {
      docKey: "gallery-13",
      title: "Phone Records",
      content: "There is no record of any call placed from the office that evening.",
    };
    const result = checkAgainstEvidence("I phoned my sister from the office.", [doc]);
    expect(result.verdict).toBe("CONTRADICTED");
  });

  test("contradiction outranks support when both retrieved", () => {
    const result = checkAgainstEvidence(
      "I left the gallery at 7:45pm.",
      [helenaStatement, securityLog],
      ["Helena Voss"]
    );
    expect(result.verdict).toBe("CONTRADICTED");
    expect(result.citations.map((d) => d.docKey)).toEqual(["gallery-09"]);
  });
});

describe("checkSelfConsistency", () => {
  const earlier = {
    docKey: "s-t1-c0",
    title: "Testimony — Helena Voss, turn 1",
    content: "I left the gallery at 7:45pm sharp.",
    turnNo: 1,
  };

  test("conflicting time in later claim is a SELF_CONTRADICTION", () => {
    const result = checkSelfConsistency("Fine — I left around 8:15pm, not earlier.", [earlier]);
    expect(result.verdict).toBe("SELF_CONTRADICTION");
    expect(result.conflicts[0].turnNo).toBe(1);
  });

  test("same time restated is SELF_CONSISTENT", () => {
    const result = checkSelfConsistency("As I said, I left at 7:45pm.", [earlier]);
    expect(result.verdict).toBe("SELF_CONSISTENT");
  });

  test("claims without times are never self-contradictions", () => {
    const result = checkSelfConsistency("I went straight home afterwards.", [earlier]);
    expect(result.verdict).toBe("SELF_CONSISTENT");
  });

  test("no earlier statements means SELF_CONSISTENT", () => {
    const result = checkSelfConsistency("I left at 9:00pm.", []);
    expect(result.verdict).toBe("SELF_CONSISTENT");
  });
});
