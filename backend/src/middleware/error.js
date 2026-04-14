export function notFound(_req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const code = err?.code || (status === 500 ? "INTERNAL" : "ERROR");
  const message = status === 500 ? "Internal server error" : err?.message || "Error";
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ error: { code, message } });
}

