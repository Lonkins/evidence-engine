import { describe, it, expect } from "vitest";
import { QUESTIONS, CLAIMS_BY_ID, DOC_META_BY_KEY, SUSPECTS } from "./caseData";
import { CORPUS } from "./corpus";
import { REQUIRED_EVIDENCE_KEYS } from "../engine/accusation";

/** Normalise typographic quotes/dashes and whitespace before comparison. */
function normalise(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/—/g, "—")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

describe("case data integrity", () => {
  it("every citation quote exists verbatim in the cited document", () => {
    // This is the game's core promise: a citation is never invented.
    for (const claim of Object.values(CLAIMS_BY_ID)) {
      for (const citation of claim.citations) {
        const doc = CORPUS[citation.docKey];
        expect(doc, `${claim.id} cites missing doc ${citation.docKey}`).toBeDefined();
        expect(
          normalise(doc).includes(normalise(citation.quote)),
          `${claim.id}: quote not found in ${citation.docKey}: "${citation.quote.slice(0, 60)}…"`
        ).toBe(true);
      }
    }
  });

  it("claim ids are unique", () => {
    const ids = QUESTIONS.flatMap((q) =>
      q.answer.filter((s) => s.kind === "claim").map((s) => (s.kind === "claim" ? s.claim.id : ""))
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("CONTRADICTED and SUPPORTED claims always carry citations; UNSUPPORTED never do", () => {
    for (const claim of Object.values(CLAIMS_BY_ID)) {
      if (claim.verdict === "UNSUPPORTED") {
        expect(claim.citations, claim.id).toEqual([]);
      } else {
        expect(claim.citations.length, claim.id).toBeGreaterThan(0);
      }
    }
  });

  it("question requirements reference real, reachable documents", () => {
    for (const question of QUESTIONS) {
      for (const docKey of question.requiresDocs ?? []) {
        expect(CORPUS[docKey], `${question.id} requires unknown doc ${docKey}`).toBeDefined();
      }
    }
  });

  it("the winning evidence chain is discoverable by pressing claims", () => {
    // Both documents required to convict must be citable from some claim,
    // otherwise the game cannot be won through play.
    const citedDocs = new Set(
      Object.values(CLAIMS_BY_ID).flatMap((c) => c.citations.map((x) => x.docKey))
    );
    for (const key of REQUIRED_EVIDENCE_KEYS) {
      expect(citedDocs.has(key), `required evidence ${key} is never cited`).toBe(true);
    }
  });

  it("exactly one suspect carries the planted lie about the departure time", () => {
    const lie = CLAIMS_BY_ID["c-h-departure"];
    expect(lie.verdict).toBe("CONTRADICTED");
    expect(lie.citations.map((c) => c.docKey)).toContain("09-security-log.md");
  });

  it("every document key referenced anywhere has index metadata", () => {
    for (const claim of Object.values(CLAIMS_BY_ID)) {
      for (const citation of claim.citations) {
        expect(DOC_META_BY_KEY[citation.docKey], citation.docKey).toBeDefined();
      }
    }
    for (const suspect of SUSPECTS) {
      expect(DOC_META_BY_KEY[suspect.dossierDocKey]).toBeDefined();
      expect(DOC_META_BY_KEY[suspect.statementDocKey]).toBeDefined();
    }
  });

  it("every suspect has at least one supported and Helena at least three contradicted claims", () => {
    const byVerdict = (suspectId: string, verdict: string) =>
      QUESTIONS.filter((q) => q.suspectId === suspectId)
        .flatMap((q) => q.answer)
        .filter((s) => s.kind === "claim" && s.claim.verdict === verdict).length;

    for (const suspect of SUSPECTS) {
      expect(byVerdict(suspect.id, "SUPPORTED"), suspect.id).toBeGreaterThan(0);
    }
    expect(byVerdict("helena", "CONTRADICTED")).toBeGreaterThanOrEqual(3);
  });
});
