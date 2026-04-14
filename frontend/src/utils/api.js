const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

async function request(method, path, body, { accessToken } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : null),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : null),
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.code = json?.error?.code;
    throw err;
  }
  return json;
}

export const api = {
  get(path, opts) {
    return request("GET", path, null, opts);
  },
  post(path, body, opts) {
    return request("POST", path, body, opts);
  },
  patch(path, body, opts) {
    return request("PATCH", path, body, opts);
  },
  delete(path, opts) {
    return request("DELETE", path, null, opts);
  },
};

