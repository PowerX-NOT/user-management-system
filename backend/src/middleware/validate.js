export function validate({ body, query, params }) {
  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      next();
    } catch (err) {
      const message = err?.issues?.[0]?.message || "Validation error";
      next({ status: 400, code: "VALIDATION_ERROR", message });
    }
  };
}

