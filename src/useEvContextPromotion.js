import { useEffect, useState, useCallback, useRef } from 'react';
import { evContext } from './evContext.js';

/**
 * 260426-mw6 — Detects the "I signed up later" gap.
 *
 * When a logged-in user lands on a page where the API has no data for a domain
 * (compass / address / verdicts) but ev-context has guest data captured before
 * signup, this hook returns shouldPrompt=true so the consumer can render an
 * inline "Save this to your account?" banner.
 *
 * On `promote()`:
 *   1. Calls the consumer-supplied `apiWriter(payload)` with the guest body.
 *   2. On success, mirrors into the userId-stamped authed slice via
 *      `setAuthedSlice(userId, { [domain]: payload })` so subsequent loads
 *      hydrate instantly (matches 260426-mc5 SWR semantics).
 *   3. Clears any prior promotionDismissed flag for this domain.
 *
 * On `dismiss()`: stamps `authed.promotionDismissed[domain] = true` so the
 * banner stays suppressed for this user on this domain until either a
 * successful promote or `clearAuthedSlice()` runs.
 *
 * Banners NEVER appear for guests, when the API already has data, or when the
 * dismissal stamp is set.
 *
 * @param {object} args
 * @param {'compass'|'address'|'verdicts'} args.domain
 * @param {boolean} args.isLoggedIn
 * @param {string|null|undefined} args.userId
 * @param {unknown} args.apiData         API state for the domain; falsy / empty treated as "API empty"
 * @param {(payload: unknown) => Promise<unknown>} args.apiWriter
 * @param {boolean} [args.enabled=true]
 *
 * @returns {{
 *   shouldPrompt: boolean,
 *   payload: unknown,
 *   promote: () => Promise<void>,
 *   dismiss: () => Promise<void>,
 *   status: 'idle'|'saving'|'saved'|'error',
 *   error: Error|null
 * }}
 */
export function useEvContextPromotion({
  domain,
  isLoggedIn,
  userId,
  apiData,
  apiWriter,
  enabled = true,
}) {
  const [shouldPrompt, setShouldPrompt] = useState(false);
  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Refs for callbacks/inputs so subscribe handler always reads current values
  const apiDataRef = useRef(apiData);
  apiDataRef.current = apiData;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const isLoggedInRef = useRef(isLoggedIn);
  isLoggedInRef.current = isLoggedIn;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const domainRef = useRef(domain);
  domainRef.current = domain;
  const apiWriterRef = useRef(apiWriter);
  apiWriterRef.current = apiWriter;

  const detect = useCallback(async () => {
    const _enabled = enabledRef.current;
    const _isLoggedIn = isLoggedInRef.current;
    const _userId = userIdRef.current;
    const _apiData = apiDataRef.current;
    const _domain = domainRef.current;

    if (!_enabled || !_isLoggedIn || !_userId) {
      setShouldPrompt(false);
      setPayload(null);
      return;
    }
    if (!isApiEmpty(_domain, _apiData)) {
      setShouldPrompt(false);
      setPayload(null);
      return;
    }

    try {
      const slice = await evContext.getAuthedSlice(_userId);
      if (slice && slice.promotionDismissed && slice.promotionDismissed[_domain] === true) {
        setShouldPrompt(false);
        setPayload(null);
        return;
      }
    } catch { /* broker offline — treat as no dismissal */ }

    let guest = null;
    try { guest = await evContext.get(); } catch { guest = null; }

    if (isGuestPopulated(_domain, guest)) {
      setShouldPrompt(true);
      setPayload(guest[_domain]);
    } else {
      setShouldPrompt(false);
      setPayload(null);
    }
  }, []);

  // Re-run detection when inputs change.
  useEffect(() => {
    detect();
  }, [detect, isLoggedIn, userId, apiData, enabled, domain]);

  // Live updates: dismissals/promotes from another tab/subdomain re-trigger
  // detection. The subscribe callback is fired on every broker update.
  useEffect(() => {
    const unsub = evContext.subscribe(() => { detect(); });
    return unsub;
  }, [detect]);

  const promote = useCallback(async () => {
    const _userId = userIdRef.current;
    const _domain = domainRef.current;
    const _writer = apiWriterRef.current;
    const _payload = payload;
    if (!_userId || !_payload || typeof _writer !== 'function') return;

    setStatus('saving');
    setError(null);
    try {
      await _writer(_payload);
      // Seed mirror cache so next mount hydrates instantly.
      try {
        await evContext.setAuthedSlice(_userId, { [_domain]: _payload });
      } catch { /* non-fatal */ }
      // Clear any prior dismissal flag for this domain.
      try {
        await evContext.setAuthedSlice(_userId, {
          promotionDismissed: { [_domain]: false },
        });
      } catch { /* non-fatal */ }
      setStatus('saved');
      setShouldPrompt(false);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err : new Error(String(err)));
      // Leave shouldPrompt as-is so the user can retry.
    }
  }, [payload]);

  const dismiss = useCallback(async () => {
    const _userId = userIdRef.current;
    const _domain = domainRef.current;
    if (!_userId) return;
    try {
      await evContext.setAuthedSlice(_userId, {
        promotionDismissed: { [_domain]: true },
      });
    } catch { /* non-fatal */ }
    setShouldPrompt(false);
  }, []);

  return { shouldPrompt, payload, promote, dismiss, status, error };
}

// ---------------------------------------------------------------------------
// Helpers (exported for unit-spot-checking; pure functions).
// ---------------------------------------------------------------------------

/**
 * Returns true when `apiData` is "empty" for the given domain. Conservative —
 * when in doubt, returns false (don't prompt).
 */
export function isApiEmpty(domain, apiData) {
  if (apiData === null || apiData === undefined) return true;
  if (domain === 'compass') {
    if (typeof apiData !== 'object') return false;
    if (Array.isArray(apiData)) return apiData.length === 0;
    if (apiData.answers && typeof apiData.answers === 'object') {
      return Object.keys(apiData.answers).length === 0;
    }
    return Object.keys(apiData).length === 0;
  }
  if (domain === 'address') {
    if (typeof apiData === 'string') return apiData.trim().length === 0;
    if (typeof apiData !== 'object') return false;
    // Object form: needs at least formatted/addr/lat to be non-empty
    const a = apiData;
    const hasAddr = typeof a.formatted === 'string' && a.formatted.length > 0;
    const hasAddrAlt = typeof a.addr === 'string' && a.addr.length > 0;
    const hasLat = typeof a.lat === 'number' || typeof a.latitude === 'number';
    return !(hasAddr || hasAddrAlt || hasLat);
  }
  if (domain === 'verdicts') {
    if (typeof apiData !== 'object') return false;
    if (Array.isArray(apiData)) return apiData.length === 0;
    return Object.keys(apiData).length === 0;
  }
  return false;
}

/**
 * Returns true when the ev-context guest top-level slice for `domain` has
 * meaningful data worth promoting.
 */
export function isGuestPopulated(domain, fullEvContext) {
  if (!fullEvContext || typeof fullEvContext !== 'object') return false;
  const slice = fullEvContext[domain];
  if (!slice || typeof slice !== 'object') return false;
  if (domain === 'compass') {
    // CompassV2/essentials use { a: {answers}, ... } where `a` is the answers map.
    const ans = slice.answers || slice.a;
    if (ans && typeof ans === 'object') return Object.keys(ans).length > 0;
    return false;
  }
  if (domain === 'address') {
    return (typeof slice.formatted === 'string' && slice.formatted.length > 0)
      || (typeof slice.addr === 'string' && slice.addr.length > 0);
  }
  if (domain === 'verdicts') {
    return Object.keys(slice).length > 0;
  }
  return false;
}
