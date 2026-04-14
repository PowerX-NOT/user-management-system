import { z } from "zod";

const roleEnum = z.enum(["admin", "manager", "user"]);
const statusEnum = z.enum(["active", "inactive"]);
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const userSchemas = {
  idParams: z.object({
    id: objectId,
  }),

  listQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().optional().default(""),
    role: roleEnum.optional(),
    status: statusEnum.optional(),
  }),

  createBody: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().email().transform((s) => s.toLowerCase().trim()),
    role: roleEnum.default("user"),
    status: statusEnum.default("active"),
    password: z.string().min(8).max(200).optional(),
    autoPassword: z.boolean().optional().default(false),
  }),

  updateBody: z
    .object({
      name: z.string().trim().min(1).max(120).optional(),
      email: z.string().email().transform((s) => s.toLowerCase().trim()).optional(),
      role: roleEnum.optional(),
      status: statusEnum.optional(),
      password: z.string().min(8).max(200).optional(),
    })
    .strict(),
};

