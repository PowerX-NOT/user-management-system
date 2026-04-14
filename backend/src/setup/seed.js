import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

export async function seedAdminIfNeeded() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Admin";
  if (!email || !password) return;

  const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (existing) return;

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: "admin",
    status: "active",
    createdBy: null,
    updatedBy: null,
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin: ${user.email}`);
}

