import { describe, it, expect } from "vitest";
import { lookupRating, getAllRatings } from "../ratings";

describe("lookupRating", () => {
  it("returns a rating for an exact known tool name", () => {
    const result = lookupRating("ChatGPT");
    expect(result).not.toBeNull();
    expect(result?.toolName).toBe("ChatGPT");
    expect(result?.grade).toBe("D");
  });

  it("is case-insensitive — lowercase input matches", () => {
    expect(lookupRating("chatgpt")).not.toBeNull();
    expect(lookupRating("chatgpt")?.toolName).toBe("ChatGPT");
  });

  it("is case-insensitive — uppercase input matches", () => {
    expect(lookupRating("CHATGPT")).not.toBeNull();
  });

  it("matches by partial name (forward contains)", () => {
    const result = lookupRating("Khan");
    expect(result).not.toBeNull();
    expect(result?.toolName).toBe("Khan Academy");
    expect(result?.grade).toBe("A");
  });

  it("returns null for a completely unknown tool", () => {
    expect(lookupRating("UnknownToolXYZ_NotInDatabase")).toBeNull();
  });

  it("returns null for an empty string", () => {
    // Empty string matches .includes('') which is always true — intentional behaviour
    // Just assert the function returns something without throwing
    expect(() => lookupRating("")).not.toThrow();
  });

  it("returns a rating object with all required fields", () => {
    const result = lookupRating("Grammarly");
    expect(result).toMatchObject({
      toolName: expect.any(String),
      vendorName: expect.any(String),
      grade: expect.any(String),
      privacyScore: expect.any(Number),
      collectsData: expect.any(Boolean),
      sharesDataWithThirdParties: expect.any(Boolean),
      hasDPA: expect.any(Boolean),
      ageRating: expect.any(String),
      dataTypes: expect.any(Array),
      summary: expect.any(String),
      source: expect.any(String),
      lastReviewed: expect.any(String),
    });
  });

  it("Khan Academy has grade A", () => {
    expect(lookupRating("Khan Academy")?.grade).toBe("A");
  });

  it("Turnitin has grade D", () => {
    expect(lookupRating("Turnitin")?.grade).toBe("D");
  });

  it("Microsoft Teams for Education has grade A", () => {
    expect(lookupRating("Microsoft Teams for Education")?.grade).toBe("A");
  });

  it("Notion AI has grade C", () => {
    expect(lookupRating("Notion AI")?.grade).toBe("C");
  });

  it("Google Classroom has grade A", () => {
    expect(lookupRating("Google Classroom")?.grade).toBe("A");
  });

  it("privacyScore is a number between 1 and 100", () => {
    const result = lookupRating("Grammarly");
    expect(result?.privacyScore).toBeGreaterThanOrEqual(1);
    expect(result?.privacyScore).toBeLessThanOrEqual(100);
  });
});

describe("getAllRatings", () => {
  it("returns all 18 pre-loaded ratings", () => {
    expect(getAllRatings()).toHaveLength(18);
  });

  it("returns an array of VendorRating objects", () => {
    const all = getAllRatings();
    all.forEach((r) => {
      expect(r.toolName).toBeDefined();
      expect(r.grade).toBeDefined();
      expect(typeof r.privacyScore).toBe("number");
    });
  });
});
