import express from "express";
import rateLimit from "express-rate-limit";

import { validate } from "../middleware/validate.js";
import { authController } from "../controllers/authController.js";
import { authSchemas } from "../validation/authSchemas.js";

export const authRouter = express.Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post(
  "/login",
  authLimiter,
  validate({ body: authSchemas.loginBody }),
  authController.login
);
authRouter.post("/refresh", authLimiter, authController.refresh);
authRouter.post("/logout", authController.logout);

