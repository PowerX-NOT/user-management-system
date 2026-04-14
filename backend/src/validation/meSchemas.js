import { z } from "zod";

export const meSchemas = {
  updateBody: z
    .object({
      name: z.string().trim().min(1).max(120).optional(),
      password: z.string().min(8).max(200).optional(),
    })
    .strict(),
};


