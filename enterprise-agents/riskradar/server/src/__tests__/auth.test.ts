import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Request, Response, NextFunction } from "express";

function mockReqRes(headers: Record<string, string> = {}) {
  const req = { headers } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

// ─── Dev mode (no OAuth env vars) ─────────────────────────────────────────────

describe("requireBearerToken — dev mode (no env vars)", () => {
  let requireBearerToken: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;

  beforeAll(async () => {
    delete process.env.OAUTH_TENANT_ID;
    delete process.env.OAUTH_AUDIENCE;
    vi.resetModules();
    const mod = await import("../auth");
    requireBearerToken = mod.requireBearerToken;
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("calls next() without validating any token", async () => {
    const { req, res, next } = mockReqRes();
    await requireBearerToken(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("calls next() even when Authorization header is absent", async () => {
    const { req, res, next } = mockReqRes({});
    await requireBearerToken(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("calls next() even when a Bearer token is present (dev bypass)", async () => {
    const { req, res, next } = mockReqRes({ authorization: "Bearer sometoken" });
    await requireBearerToken(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ─── Prod mode (OAuth env vars present) ───────────────────────────────────────

describe("requireBearerToken — prod mode (env vars set)", () => {
  let requireBearerToken: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
  let mockGetSigningKey: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    vi.stubEnv("OAUTH_TENANT_ID", "test-tenant-id");
    vi.stubEnv("OAUTH_AUDIENCE", "api://test-audience");

    mockGetSigningKey = vi.fn();

    vi.doMock("jwks-rsa", () => ({
      default: vi.fn().mockReturnValue({ getSigningKey: mockGetSigningKey }),
    }));

    // Use the real jsonwebtoken (we rely on jwt.decode to parse fake JWTs)
    vi.doMock("jsonwebtoken", async () => {
      const actual = await vi.importActual<typeof import("jsonwebtoken")>("jsonwebtoken");
      return { default: actual, ...actual };
    });

    vi.resetModules();
    const mod = await import("../auth");
    requireBearerToken = mod.requireBearerToken;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns 401 when Authorization header is absent", async () => {
    const { req, res, next } = mockReqRes();
    await requireBearerToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized — Bearer token required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header lacks 'Bearer ' prefix", async () => {
    const { req, res, next } = mockReqRes({ authorization: "Basic sometoken" });
    await requireBearerToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized — Bearer token required",
    });
  });

  it("returns 401 for a string that is not a valid JWT", async () => {
    const { req, res, next } = mockReqRes({
      authorization: "Bearer notavalidjwtstring",
    });
    await requireBearerToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized — invalid token structure",
    });
  });

  it("returns 401 for a JWT header that is missing the kid field", async () => {
    // Valid base64url-encoded JWT header without 'kid'
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ sub: "user123" })
    ).toString("base64url");
    const noKidJwt = `${header}.${payload}.fakesignature`;

    const { req, res, next } = mockReqRes({
      authorization: `Bearer ${noKidJwt}`,
    });
    await requireBearerToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized — invalid token structure",
    });
  });

  it("returns 401 when JWKS signing key retrieval fails", async () => {
    // JWT with kid so we get past the decode check
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", kid: "test-kid-1" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ sub: "user123" })
    ).toString("base64url");
    const fakeJwt = `${header}.${payload}.fakesignature`;

    mockGetSigningKey.mockImplementationOnce(
      (_kid: string, cb: (err: Error | null) => void) => {
        cb(new Error("JWKS endpoint unreachable"));
      }
    );

    const { req, res, next } = mockReqRes({
      authorization: `Bearer ${fakeJwt}`,
    });
    await requireBearerToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized — token validation failed",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when JWT signature verification fails (wrong key)", async () => {
    // JWT with kid — JWKS returns a key but jwt.verify will fail (wrong key material)
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", kid: "test-kid-2" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ sub: "user456" })
    ).toString("base64url");
    const fakeJwt = `${header}.${payload}.badsignature`;

    mockGetSigningKey.mockImplementationOnce(
      (_kid: string, cb: (err: null, key: { getPublicKey: () => string }) => void) => {
        cb(null, { getPublicKey: () => "-----BEGIN PUBLIC KEY-----\nfakekey\n-----END PUBLIC KEY-----" });
      }
    );

    const { req, res, next } = mockReqRes({
      authorization: `Bearer ${fakeJwt}`,
    });
    await requireBearerToken(req, res, next);
    // jwt.verify will throw on the bad signature → catch block → 401
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized — token validation failed",
    });
  });
});
