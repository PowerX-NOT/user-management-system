import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import { toPublicUser } from "../utils/userPublic.js";

export const meController = {
  async get(req, res, next) {
    try {
      const user = await User.findById(req.auth.userId).lean();
      if (!user) return next({ status: 404, code: "NOT_FOUND", message: "User not found" });
      res.json({ user: toPublicUser(user) });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { name, password } = req.body;

      if (!name && !password) {
        return next({ status: 400, code: "VALIDATION_ERROR", message: "Provide at least one field to update" });
      }

      const update = { updatedBy: req.auth.userId };
      if (name) update.name = name;
      if (password) update.passwordHash = await hashPassword(password);

      const user = await User.findByIdAndUpdate(req.auth.userId, update, { new: true }).lean();
      if (!user) return next({ status: 404, code: "NOT_FOUND", message: "User not found" });
      res.json({ user: toPublicUser(user) });
    } catch (err) {
      next(err);
    }
  },
};
