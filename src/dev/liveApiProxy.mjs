// Dev-server helpers so every Empowered Vote frontend shows live public data
// with no keys and no local backend. Node-only: import from vite.config, never
// from app code. Nothing here affects a production build.
//
// The live API's CORS allow-list holds only production domains, so a page on
// localhost cannot call it directly. Proxying /api through the dev server makes
// every request same-origin, and the browser never applies CORS.

export const LIVE_API_ORIGIN = "https://accounts-api.empowered.vote";

/**
 * Vite `server.proxy` entry for `/api`.
 * @param {{ target?: string }} [options] target overrides the live API, e.g.
 *   `http://localhost:3000` for a developer running the backend locally.
 * @returns {Record<string, import('vite').ProxyOptions>}
 */
export function liveApiProxy({ target } = {}) {
  return {
    "/api": {
      target: target || LIVE_API_ORIGIN,
      changeOrigin: true,
      secure: true,
      // A browser POST carries an Origin header, which the live API does not
      // recognise. Strip it so the API treats the call as same-origin.
      configure: (proxy) => {
        proxy.on("proxyReq", (proxyReq) => {
          proxyReq.removeHeader("origin");
        });
      },
    },
  };
}

const LOCAL_HOST = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(\/|$)/;

/**
 * Any absolute VITE_API_URL makes the app call that address directly and skip
 * the /api proxy. Pointed at the live API, the browser blocks it (CORS);
 * pointed at localhost, it only works while a local backend is running. Say
 * which, once, at startup. A relative value ("/api") keeps the proxy.
 * @param {Record<string, string | undefined>} env
 * @param {(message: string) => void} [log]
 * @returns {boolean} true when a warning was printed
 */
export function warnIfAbsoluteApiUrl(env, log = console.warn) {
  const url = (env.VITE_API_URL ?? "").trim();
  if (!url || url.startsWith("/")) return false;
  if (LOCAL_HOST.test(url)) {
    log(
      `[ev-ui] VITE_API_URL points at a local backend (${url}). If none is running, unset it to use live data through the /api proxy.`,
    );
  } else {
    log(
      `[ev-ui] VITE_API_URL is set to ${url}: the app will skip the /api proxy and the live API will block it. unset it for local dev.`,
    );
  }
  return true;
}
