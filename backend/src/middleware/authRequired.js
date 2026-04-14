import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export async function authRequired(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return next({ status: 401, code: "UNAUTHORIZED", message: "Missing token" });

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) return next({ status: 401, code: "UNAUTHORIZED", message: "Invalid token" });
    if (user.status !== "active") {
      return next({ status: 403, code: "INACTIVE", message: "User is inactive" });
    }
    req.auth = { userId: String(user._id), role: user.role };
    next();
  } catch {
    next({ status: 401, code: "UNAUTHORIZED", message: "Invalid token" });
  }
}

