import { z } from "zod";

export const authSchemas = {
  loginBody: z.object({
    email: z.string().email().transform((s) => s.toLowerCase().trim()),
    password: z.string().min(6).max(200),
  }),
};

