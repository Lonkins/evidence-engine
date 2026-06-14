import { describe, it, expect } from "vitest";
import { createSession, expiredByoSessions, touchSession } from "./sessions.js";

describe("expiredByoSessions (BYO TTL sweep)", () => {
  const TTL_MS = 30 * 60_000;

  it("returns BYO sessions idle past the TTL and never Holbrooke sessions", () => {
    const holbrooke = createSession({ mode: "holbrooke" });
    createSession({ mode: "byo", caseId: "byo-stale-1" });

    // 31 minutes later, a session created ~now is past the 30-minute TTL.
    const expired = expiredByoSessions(TTL_MS, Date.now() + 31 * 60_000);
    const caseIds = expired.map((s) => s.caseId);

    expect(caseIds).toContain("byo-stale-1");
    expect(expired.every((s) => s.mode === "byo")).toBe(true);
    expect(caseIds).not.toContain(holbrooke.caseId);
  });

  it("does not return a BYO session still within the TTL", () => {
    createSession({ mode: "byo", caseId: "byo-fresh-1" });
    const expired = expiredByoSessions(TTL_MS, Date.now() + 10 * 60_000);
    expect(expired.map((s) => s.caseId)).not.toContain("byo-fresh-1");
  });

  it("touchSession resets the idle clock so an active session is spared", () => {
    const byo = createSession({ mode: "byo", caseId: "byo-touch-1" });

    // Untouched, it would be swept at +31 minutes...
    expect(
      expiredByoSessions(TTL_MS, Date.now() + 31 * 60_000).map((s) => s.caseId)
    ).toContain("byo-touch-1");

    // ...but touching it moves lastSeenAt to ~now, so it is no longer idle.
    touchSession(byo);
    expect(
      expiredByoSessions(TTL_MS, Date.now() + 60_000).map((s) => s.caseId)
    ).not.toContain("byo-touch-1");
  });
});
