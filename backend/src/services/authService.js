import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { verifyPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { sha256 } from "../utils/crypto.js";
import { toPublicUser } from "../utils/userPublic.js";

function unauthorized() {
  return { status: 401, code: "UNAUTHORIZED", message: "Invalid credentials" };
}

export const authService = {
  async login({ email, password, ip, userAgent }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw unauthorized();
    if (user.status !== "active") throw { status: 403, code: "INACTIVE", message: "User is inactive" };
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw unauthorized();

    const refreshRecord = await RefreshToken.create({
      userId: user._id,
      tokenHash: "pending",
      expiresAt: refreshExpiryDate(),
      createdByIp: ip ?? null,
      userAgent,
    });

    const refreshToken = signRefreshToken({ userId: user._id, tokenId: refreshRecord._id });
    refreshRecord.tokenHash = sha256(refreshToken);
    await refreshRecord.save();

    const accessToken = signAccessToken({ userId: user._id, role: user.role });
    return { accessToken, refreshToken, user: toPublicUser(user) };
  },

  async refresh({ refreshToken, ip, userAgent }) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw { status: 401, code: "UNAUTHORIZED", message: "Invalid refresh token" };
    }

    const userId = payload.sub;
    const tokenId = payload.tid;
    const record = await RefreshToken.findById(tokenId);
    if (!record) throw { status: 401, code: "UNAUTHORIZED", message: "Invalid refresh token" };
    if (record.revokedAt) throw { status: 401, code: "UNAUTHORIZED", message: "Refresh token revoked" };
    if (record.expiresAt.getTime() < Date.now()) throw { status: 401, code: "UNAUTHORIZED", message: "Refresh token expired" };
    if (String(record.userId) !== String(userId)) throw { status: 401, code: "UNAUTHORIZED", message: "Invalid refresh token" };
    if (record.tokenHash !== sha256(refreshToken)) throw { status: 401, code: "UNAUTHORIZED", message: "Invalid refresh token" };

    const user = await User.findById(userId);
    if (!user) throw { status: 401, code: "UNAUTHORIZED", message: "Invalid refresh token" };
    if (user.status !== "active") throw { status: 403, code: "INACTIVE", message: "User is inactive" };

    // Rotate: revoke old and mint a new record
    record.revokedAt = new Date();
    await record.save();

    const nextRecord = await RefreshToken.create({
      userId: user._id,
      tokenHash: "pending",
      expiresAt: refreshExpiryDate(),
      createdByIp: ip ?? null,
      userAgent,
    });

    const nextRefreshToken = signRefreshToken({ userId: user._id, tokenId: nextRecord._id });
    nextRecord.tokenHash = sha256(nextRefreshToken);
    await nextRecord.save();

    const accessToken = signAccessToken({ userId: user._id, role: user.role });
    return { accessToken, refreshToken: nextRefreshToken, user: toPublicUser(user) };
  },

  async logout({ refreshToken }) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const record = await RefreshToken.findById(payload.tid);
      if (record && !record.revokedAt) {
        record.revokedAt = new Date();
        await record.save();
      }
    } catch {
      // ignore invalid token on logout
    }
  },
};

function refreshExpiryDate() {
  // We don't parse REFRESH_TOKEN_TTL here; keep a safe default. JWT enforces expiry anyway.
  const days = 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

