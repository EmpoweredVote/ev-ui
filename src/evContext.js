/**
 * evContext — cross-subdomain shared context broker.
 *
 * Uses a hidden iframe on ev-context.empowered.vote to store and sync
 * a shared JSON object across all EV sub-apps (essentials, compass, accounts, etc.)
 *
 * Ported from @empoweredvote/ev-ui npm package v0.6.5 for local dev.
 */

var DEFAULT_BROKER_URL = 'https://ev-context.empowered.vote/';
var brokerUrl = DEFAULT_BROKER_URL;
var iframe = null;
var readyPromise = null;
var pendingRequests = new Map();
var subscribers = new Set();
var lastValue = null;
var nextRequestId = 1;

function brokerOrigin() {
  try {
    return new URL(brokerUrl).origin;
  } catch {
    return '';
  }
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
    try {
      fn(lastValue);
    } catch {
      // ignore subscriber errors
    }
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
        if (entry) {
          clearTimeout(entry.timeout);
          pendingRequests.delete(requestId);
        }
      }
      reject(err);
    }
  }));
}

export var evContext = {
  configure({ brokerUrl: url } = {}) {
    if (url) brokerUrl = url;
  },
  preload() {
    ensureMounted();
    return readyPromise;
  },
  async get() {
    return send({ type: 'ev-context:get' });
  },
  async set(value) {
    return send({ type: 'ev-context:set', value });
  },
  async clear() {
    return send({ type: 'ev-context:clear' });
  },
  async getAuthedSlice(userId) {
    if (!userId) return null;
    const current = await this.get();
    if (!current || !current.authed || typeof current.authed !== 'object') return null;
    if (current.authed.userId !== userId) return null;
    const out = {};
    if (current.authed.compass !== undefined) out.compass = current.authed.compass;
    if (current.authed.address !== undefined) out.address = current.authed.address;
    if (current.authed.verdicts !== undefined) out.verdicts = current.authed.verdicts;
    if (current.authed.promotionDismissed !== undefined) {
      out.promotionDismissed = current.authed.promotionDismissed;
    }
    return out;
  },
  async setAuthedSlice(userId, patch) {
    if (!userId) return false;
    if (!patch || typeof patch !== 'object') return false;
    const allowed = {};
    if (patch.compass !== undefined) allowed.compass = patch.compass;
    if (patch.address !== undefined) allowed.address = patch.address;
    if (patch.verdicts !== undefined) allowed.verdicts = patch.verdicts;
    if (patch.promotionDismissed !== undefined) {
      allowed.promotionDismissed = patch.promotionDismissed;
    }
    if (Object.keys(allowed).length === 0) return false;
    const current = await this.get() || {};
    const priorAuthed = current.authed && current.authed.userId === userId ? current.authed : null;
    const nextAuthed = { userId };
    if (priorAuthed) {
      if (priorAuthed.compass !== undefined) nextAuthed.compass = priorAuthed.compass;
      if (priorAuthed.address !== undefined) nextAuthed.address = priorAuthed.address;
      if (priorAuthed.verdicts !== undefined) nextAuthed.verdicts = priorAuthed.verdicts;
      if (priorAuthed.promotionDismissed !== undefined) {
        nextAuthed.promotionDismissed = priorAuthed.promotionDismissed;
      }
    }
    if (allowed.compass !== undefined) nextAuthed.compass = allowed.compass;
    if (allowed.address !== undefined) nextAuthed.address = allowed.address;
    if (allowed.verdicts !== undefined) nextAuthed.verdicts = allowed.verdicts;
    if (allowed.promotionDismissed !== undefined && allowed.promotionDismissed !== null && typeof allowed.promotionDismissed === 'object') {
      const prior = priorAuthed && priorAuthed.promotionDismissed && typeof priorAuthed.promotionDismissed === 'object' ? priorAuthed.promotionDismissed : {};
      nextAuthed.promotionDismissed = { ...prior, ...allowed.promotionDismissed };
    }
    return this.set({ ...current, authed: nextAuthed });
  },
  async clearAuthedSlice() {
    const current = await this.get();
    if (!current || typeof current !== 'object') return true;
    if (!('authed' in current)) return true;
    const { authed: _omit, ...rest } = current;
    return this.set(rest);
  },
  subscribe(fn) {
    subscribers.add(fn);
    send({ type: 'ev-context:subscribe' }).then((value) => {
      lastValue = value != null ? value : lastValue;
      try {
        fn(lastValue);
      } catch {
        // ignore
      }
    }).catch(() => {});
    return () => {
      subscribers.delete(fn);
    };
  }
};
