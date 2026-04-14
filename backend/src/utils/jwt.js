import jwt from "jsonwebtoken";

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export function signAccessToken({ userId, role }) {
  const secret = mustGetEnv("JWT_ACCESS_SECRET");
  const expiresIn = process.env.ACCESS_TOKEN_TTL || "15m";
  return jwt.sign({ role }, secret, { subject: String(userId), expiresIn });
}

export function signRefreshToken({ userId, tokenId }) {
  const secret = mustGetEnv("JWT_REFRESH_SECRET");
  const expiresIn = process.env.REFRESH_TOKEN_TTL || "30d";
  return jwt.sign({ tid: String(tokenId) }, secret, { subject: String(userId), expiresIn });
}

export function verifyAccessToken(token) {
  const secret = mustGetEnv("JWT_ACCESS_SECRET");
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token) {
  const secret = mustGetEnv("JWT_REFRESH_SECRET");
  return jwt.verify(token, secret);
}

export function refreshCookieName() {
  return process.env.REFRESH_COOKIE_NAME || "ums_refresh";
}

export function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  // For Render, frontend and backend will likely be on different subdomains.
  // If you set CORS_ORIGIN to the frontend URL, use SameSite=None + Secure in prod.
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth",
  };
}

