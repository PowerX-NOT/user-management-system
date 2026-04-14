export function validate({ body, query, params }) {
  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      next();
    } catch (err) {
      // Support Zod v3 (issues) and v4 (errors), fall back gracefully
      const issues = err?.issues ?? err?.errors ?? [];
      const message = issues[0]?.message || err?.message || "Validation error";
      next({ status: 400, code: "VALIDATION_ERROR", message });
    }
  };
}

