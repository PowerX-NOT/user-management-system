import { authService } from "../services/authService.js";
import { refreshCookieName, refreshCookieOptions } from "../utils/jwt.js";

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await authService.login({
        email,
        password,
        ip: req.ip,
        userAgent: req.get("user-agent") ?? null,
      });
      res.cookie(refreshCookieName(), refreshToken, refreshCookieOptions());
      res.json({ accessToken, user });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const token = req.cookies?.[refreshCookieName()];
      if (!token) return next({ status: 401, code: "UNAUTHORIZED", message: "Missing refresh token" });
      const { accessToken, refreshToken, user } = await authService.refresh({
        refreshToken: token,
        ip: req.ip,
        userAgent: req.get("user-agent") ?? null,
      });
      res.cookie(refreshCookieName(), refreshToken, refreshCookieOptions());
      res.json({ accessToken, user });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const token = req.cookies?.[refreshCookieName()];
      if (token) await authService.logout({ refreshToken: token });
      res.clearCookie(refreshCookieName(), refreshCookieOptions());
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

