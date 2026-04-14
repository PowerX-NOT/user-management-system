import express from "express";

import { authRequired } from "../middleware/authRequired.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { validate } from "../middleware/validate.js";
import { userController } from "../controllers/userController.js";
import { userSchemas } from "../validation/userSchemas.js";

export const usersRouter = express.Router();

usersRouter.use(authRequired);

usersRouter.get(
  "/",
  requirePermission("users:read"),
  validate({ query: userSchemas.listQuery }),
  userController.list
);

usersRouter.post(
  "/",
  requirePermission("users:create"),
  validate({ body: userSchemas.createBody }),
  userController.create
);

usersRouter.get(
  "/:id",
  requirePermission("users:read"),
  validate({ params: userSchemas.idParams }),
  userController.getById
);

usersRouter.patch(
  "/:id",
  requirePermission("users:update"),
  validate({ params: userSchemas.idParams, body: userSchemas.updateBody }),
  userController.update
);

usersRouter.delete(
  "/:id",
  requirePermission("users:delete"),
  validate({ params: userSchemas.idParams }),
  userController.remove
);

