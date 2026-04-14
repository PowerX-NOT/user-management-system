import express from "express";

import { authRequired } from "../middleware/authRequired.js";
import { validate } from "../middleware/validate.js";
import { meController } from "../controllers/meController.js";
import { meSchemas } from "../validation/meSchemas.js";
import { requirePermission } from "../middleware/requirePermission.js";

export const meRouter = express.Router();

meRouter.use(authRequired);

meRouter.get("/", requirePermission("me:read"), meController.get);
meRouter.patch(
  "/",
  requirePermission("me:update"),
  validate({ body: meSchemas.updateBody }),
  meController.update
);

