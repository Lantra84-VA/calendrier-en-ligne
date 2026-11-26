import { defineEventHandler, getRequestPath, proxyRequest } from "h3";

/**
 * Same-origin proxy to the API service, for hosts that serve the web app and the API on two
 * different origins (Render, Railway) and provide no gateway in front of both. The browser only
 * ever talks to this origin, so no CORS is involved. `API_TARGET` holds the API origin: a bare
 * host is read as `https://`. Unset — Mistral Apps, where the gateway routes `/api` itself —
 * the middleware lets every request through untouched.
 */
export default defineEventHandler((event) => {
  const raw = process.env.API_TARGET?.trim();
  if (!raw) {
    return undefined;
  }
  const target = /^https?:\/\//u.test(raw)
    ? raw.replace(/\/+$/u, "")
    : `https://${raw.replace(/\/+$/u, "")}`;

  const path = getRequestPath(event);
  if (path !== "/api" && !path.startsWith("/api/")) {
    return undefined;
  }

  return proxyRequest(event, `${target}${path}`);
});
