import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

function toPublicUser(u) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

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
      const update = {};
      if (req.body.name) update.name = req.body.name;
      if (req.body.password) update.passwordHash = await hashPassword(req.body.password);
      update.updatedBy = req.auth.userId;

      const user = await User.findByIdAndUpdate(req.auth.userId, update, { new: true }).lean();
      if (!user) return next({ status: 404, code: "NOT_FOUND", message: "User not found" });
      res.json({ user: toPublicUser(user) });
    } catch (err) {
      next(err);
    }
  },
};

