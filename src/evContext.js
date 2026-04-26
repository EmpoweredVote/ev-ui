/**
 * evContext — cross-subdomain shared client state for EV apps.
 *
 * Mounts a hidden iframe pointing at the ev-context broker (origin:
 * https://context.empowered.vote in prod, configurable in dev).
 * The broker owns the canonical localStorage on its own origin and bridges
 * read/write/subscribe over postMessage. Every EV subdomain
 * (compass.*, essentials.*, readrank.*, etc.) sees the same data, regardless
 * of which one the user lands on first.
 *
 * Schemaless — store anything serializable. By convention EV apps namespace
 * their data under top-level keys (compass, address, verdicts, etc.).
 *
 * Usage:
 *   import { evContext } from '@empoweredvote/ev-ui';
 *   evContext.configure({ brokerUrl: 'https://context.empowered.vote' });
 *   const state = await evContext.get();
 *   await evContext.set({ ...state, address: '123 Main St' });
 *   const unsubscribe = evContext.subscribe(state => console.log('updated', state));
 */

const DEFAULT_BROKER_URL = 'https://ev-context.empowered.vote/';

let brokerUrl = DEFAULT_BROKER_URL;
let iframe = null;
let readyPromise = null;
let pendingRequests = new Map(); // requestId -> { resolve, reject, timeout }
let subscribers = new Set();
let lastValue = null;
let nextRequestId = 1;

function brokerOrigin() {
  try { return new URL(brokerUrl).origin; } catch { return ''; }
}

function ensureMounted() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (iframe) return iframe;

  iframe = document.createElement('iframe');
  iframe.src = brokerUrl;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.style.position = 'absolute';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';

  window.addEventListener('message', onMessage);
  (document.body || document.documentElement).appendChild(iframe);

  readyPromise = new Promise((resolve) => {
    const onReady = (e) => {
      if (e.origin !== brokerOrigin()) return;
      if (!e.data || e.data.type !== 'ev-context:ready') return;
      window.removeEventListener('message', onReady);
      resolve();
    };
    window.addEventListener('message', onReady);

    iframe.addEventListener('load', () => {
      setTimeout(() => resolve(), 50);
    });
  });

  return iframe;
}

function onMessage(event) {
  if (event.origin !== brokerOrigin()) return;
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'ev-context:value' || data.type === 'ev-context:ack') {
    const id = data.requestId;
    const wasPending = id && pendingRequests.has(id);
    if (wasPending) {
      const { resolve, timeout } = pendingRequests.get(id);
      clearTimeout(timeout);
      pendingRequests.delete(id);
      resolve(data.type === 'ev-context:value' ? (data.value ?? null) : data.ok);
    }
    // Only notify subscribers for unsolicited value broadcasts, not replies to our own get()
    if (data.type === 'ev-context:value' && !wasPending) {
      lastValue = data.value ?? null;
      notifySubscribers();
    }
  } else if (data.type === 'ev-context:update') {
    lastValue = data.value ?? null;
    notifySubscribers();
  }
}

function notifySubscribers() {
  for (const fn of subscribers) {
    try { fn(lastValue); } catch { /* swallow subscriber errors */ }
  }
}

function send(message, { expectReply = true, timeoutMs = 4000 } = {}) {
  ensureMounted();
  return readyPromise.then(() => new Promise((resolve, reject) => {
    if (!iframe || !iframe.contentWindow) {
      reject(new Error('evContext broker iframe not ready'));
      return;
    }
    const requestId = expectReply ? `req-${nextRequestId++}` : undefined;
    if (expectReply) {
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId);
        reject(new Error('evContext request timed out'));
      }, timeoutMs);
      pendingRequests.set(requestId, { resolve, reject, timeout });
    }
    try {
      iframe.contentWindow.postMessage({ ...message, requestId }, brokerOrigin());
      if (!expectReply) resolve(true);
    } catch (err) {
      if (expectReply) {
        const entry = pendingRequests.get(requestId);
        if (entry) { clearTimeout(entry.timeout); pendingRequests.delete(requestId); }
      }
      reject(err);
    }
  }));
}

export const evContext = {
  /**
   * Override the broker URL. Call once at app startup before any get/set.
   * Defaults to https://ev-context.empowered.vote/ for prod.
   */
  configure({ brokerUrl: url } = {}) {
    if (url) brokerUrl = url;
  },

  /** Mount the iframe immediately (optional — get/set will mount lazily). */
  preload() {
    ensureMounted();
    return readyPromise;
  },

  /** Read the current shared context. Resolves to the stored value or null. */
  async get() {
    return send({ type: 'ev-context:get' });
  },

  /** Overwrite the shared context. */
  async set(value) {
    return send({ type: 'ev-context:set', value });
  },

  /** Clear the shared context. */
  async clear() {
    return send({ type: 'ev-context:clear' });
  },

  /**
   * Read the userId-stamped authed slice for the given user.
   *
   * Stored shape:
   *   { compass?, address?, verdicts?, authed?: { userId, compass?, address?, verdicts? } }
   *
   * - Returns null if there is no stored value, no `authed` body, or the stored
   *   `authed.userId` does not match the requested `userId` (mismatch = inert).
   * - Otherwise returns `{ compass, address, verdicts }` with undefined keys
   *   omitted.
   *
   * Used by logged-in consumers to do SWR-style hydration: render this slice
   * synchronously on mount, then replace silently when the API responds.
   */
  async getAuthedSlice(userId) {
    if (!userId) return null;
    const current = await this.get();
    if (!current || !current.authed || typeof current.authed !== 'object') return null;
    if (current.authed.userId !== userId) return null;
    const out = {};
    if (current.authed.compass !== undefined) out.compass = current.authed.compass;
    if (current.authed.address !== undefined) out.address = current.authed.address;
    if (current.authed.verdicts !== undefined) out.verdicts = current.authed.verdicts;
    return out;
  },

  /**
   * Mirror an authed write into the userId-stamped `authed` slice.
   *
   * - `patch` may contain any subset of `{ compass, address, verdicts }`.
   *   Unrecognized keys are dropped.
   * - If the existing `authed.userId` matches `userId`, the patch is merged
   *   with the prior authed body (per-domain shallow merge — the patch's
   *   compass/address/verdicts replace the prior values).
   * - If it does not match (user switch), the prior authed body is stomped.
   * - Guest top-level keys (compass, address, verdicts at the root) are
   *   preserved untouched.
   *
   * Returns false on falsy `userId` or empty patch; otherwise returns the
   * underlying `set()` result.
   */
  async setAuthedSlice(userId, patch) {
    if (!userId) return false;
    if (!patch || typeof patch !== 'object') return false;
    const allowed = {};
    if (patch.compass !== undefined) allowed.compass = patch.compass;
    if (patch.address !== undefined) allowed.address = patch.address;
    if (patch.verdicts !== undefined) allowed.verdicts = patch.verdicts;
    if (Object.keys(allowed).length === 0) return false;

    const current = (await this.get()) || {};
    const priorAuthed = current.authed && current.authed.userId === userId
      ? current.authed
      : null;
    const nextAuthed = { userId };
    if (priorAuthed) {
      if (priorAuthed.compass !== undefined) nextAuthed.compass = priorAuthed.compass;
      if (priorAuthed.address !== undefined) nextAuthed.address = priorAuthed.address;
      if (priorAuthed.verdicts !== undefined) nextAuthed.verdicts = priorAuthed.verdicts;
    }
    if (allowed.compass !== undefined) nextAuthed.compass = allowed.compass;
    if (allowed.address !== undefined) nextAuthed.address = allowed.address;
    if (allowed.verdicts !== undefined) nextAuthed.verdicts = allowed.verdicts;

    return this.set({ ...current, authed: nextAuthed });
  },

  /**
   * Remove the `authed` slice entirely (preserving guest top-level keys).
   *
   * Provided for completeness — consumers in the v2026.4.5 wiring plan must
   * NOT call this on logout. The slice is intended to go inert via userId
   * mismatch, so a re-login as the same user can rehydrate from cache.
   */
  async clearAuthedSlice() {
    const current = await this.get();
    if (!current || typeof current !== 'object') return true;
    if (!('authed' in current)) return true;
    const { authed: _omit, ...rest } = current;
    return this.set(rest);
  },

  /**
   * Subscribe to live updates. Fires when this tab or any other tab
   * (any subdomain) writes to the store. Returns an unsubscribe function.
   */
  subscribe(fn) {
    subscribers.add(fn);
    send({ type: 'ev-context:subscribe' }).then((value) => {
      lastValue = value ?? lastValue;
      try { fn(lastValue); } catch {}
    }).catch(() => {});
    return () => { subscribers.delete(fn); };
  },
};
