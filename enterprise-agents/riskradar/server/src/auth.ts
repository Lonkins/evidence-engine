import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

// OAuth 2.0 Bearer token validation using Azure AD JWKS.
//
// When OAUTH_TENANT_ID or OAUTH_AUDIENCE are absent (local dev), validation
// is skipped with a console warning. Set both env vars to enable full
// token validation against Azure Active Directory.

const TENANT_ID = process.env.OAUTH_TENANT_ID;
const AUDIENCE = process.env.OAUTH_AUDIENCE;
const oauthEnabled = Boolean(TENANT_ID && AUDIENCE);

let jwksClient: jwksRsa.JwksClient | null = null;

if (oauthEnabled) {
  jwksClient = jwksRsa({
    jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600_000, // 10 minutes
  });
}

function getSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwksClient!.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key!.getPublicKey());
    });
  });
}

export async function requireBearerToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!oauthEnabled) {
    console.warn(
      "[auth] OAUTH_TENANT_ID / OAUTH_AUDIENCE not configured — skipping token validation (development mode)"
    );
    next();
    return;
  }

  const authHeader = req.headers["authorization"] as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized — Bearer token required" });
    return;
  }

  const token = authHeader.slice(7);
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded === "string" || !decoded.header.kid) {
    res.status(401).json({ error: "Unauthorized — invalid token structure" });
    return;
  }

  try {
    const signingKey = await getSigningKey(decoded.header.kid);
    jwt.verify(token, signingKey, {
      audience: AUDIENCE,
      issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
      algorithms: ["RS256"],
    });
    next();
  } catch (err) {
    console.error("[auth] Token validation failed:", String(err));
    res.status(401).json({ error: "Unauthorized — token validation failed" });
  }
}
