import { userService } from "../services/userService.js";

export const userController = {
  async list(req, res, next) {
    try {
      const result = await userService.listUsers({
        auth: req.auth,
        query: req.query,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const result = await userService.createUser({ auth: req.auth, input: req.body });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const result = await userService.getUserById({ auth: req.auth, id: req.params.id });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const result = await userService.updateUser({ auth: req.auth, id: req.params.id, input: req.body });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      await userService.deleteUser({ auth: req.auth, id: req.params.id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

