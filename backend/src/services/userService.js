import crypto from "crypto";

import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import { toPublicUser as toPublicUserBase } from "../utils/userPublic.js";

function toPublicUserWithAudit(u) {
  return {
    ...toPublicUserBase(u),
    createdBy: u.createdBy
      ? {
          id: String(u.createdBy._id ?? u.createdBy),
          name: u.createdBy.name,
          email: u.createdBy.email,
        }
      : null,
    updatedBy: u.updatedBy
      ? {
          id: String(u.updatedBy._id ?? u.updatedBy),
          name: u.updatedBy.name,
          email: u.updatedBy.email,
        }
      : null,
  };
}

function randomPassword() {
  return crypto.randomBytes(9).toString("base64url"); // 12 chars-ish, URL safe
}

export const userService = {
  async listUsers({ query }) {
    const { page, limit, q, role, status } = query;
    const filter = { deletedAt: null };
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { name: { $regex: escapeRegex(q), $options: "i" } },
        { email: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-passwordHash")
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      items: items.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async createUser({ auth, input }) {
    const email = input.email;
    const existing = await User.findOne({ email }).lean();
    if (existing) throw { status: 409, code: "EMAIL_TAKEN", message: "Email already exists" };

    let plainPassword = input.password;
    if (!plainPassword && input.autoPassword) plainPassword = randomPassword();
    if (!plainPassword) plainPassword = randomPassword();

    const passwordHash = await hashPassword(plainPassword);
    const created = await User.create({
      name: input.name,
      email,
      role: input.role,
      status: input.status,
      passwordHash,
      createdBy: auth.userId,
      updatedBy: auth.userId,
    });

    return {
      user: toPublicUserBase(created),
      initialPassword: plainPassword, // shown once
    };
  },

  async getUserById({ id }) {
    const user = await User.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .select("-passwordHash")
      .lean();
    if (!user || user.deletedAt) throw { status: 404, code: "NOT_FOUND", message: "User not found" };
    return { user: toPublicUserWithAudit(user) };
  },

  async updateUser({ auth, id, input }) {
    const target = await User.findById(id);
    if (!target || target.deletedAt) throw { status: 404, code: "NOT_FOUND", message: "User not found" };

    // Manager constraints: cannot modify admin users; cannot set role.
    if (auth.role === "manager") {
      if (target.role === "admin") throw { status: 403, code: "FORBIDDEN", message: "Cannot modify admin user" };
      if (input.role) throw { status: 403, code: "FORBIDDEN", message: "Cannot change roles" };
    }

    if (input.email && input.email !== target.email) {
      const existing = await User.findOne({ email: input.email }).lean();
      if (existing) throw { status: 409, code: "EMAIL_TAKEN", message: "Email already exists" };
      target.email = input.email;
    }
    if (input.name) target.name = input.name;
    if (auth.role === "admin" && input.role) target.role = input.role;
    if (input.status) target.status = input.status;
    if (input.password) target.passwordHash = await hashPassword(input.password);
    target.updatedBy = auth.userId;

    await target.save();

    const user = await User.findById(target._id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .select("-passwordHash")
      .lean();
    return { user: toPublicUserWithAudit(user) };
  },

  async deleteUser({ id }) {
    const target = await User.findById(id);
    if (!target || target.deletedAt) return;
    target.status = "inactive";
    target.deletedAt = new Date();
    await target.save();
  },
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

