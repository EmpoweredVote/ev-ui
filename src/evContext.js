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
    if (id && pendingRequests.has(id)) {
      const { resolve, timeout } = pendingRequests.get(id);
      clearTimeout(timeout);
      pendingRequests.delete(id);
      resolve(data.type === 'ev-context:value' ? (data.value ?? null) : data.ok);
    }
    if (data.type === 'ev-context:value') {
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
