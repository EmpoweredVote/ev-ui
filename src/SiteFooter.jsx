import React, { useEffect, useId, useRef, useState } from 'react';
import { fonts, fontWeights } from './tokens';

/**
 * SiteFooter — the shared Empowered Vote site footer with a newsletter sign-up.
 *
 * Mirrors the footer shipped on ev-landing (EmpoweredVote/ev-landing#7): a brand
 * mark, a links row (© year · Mind Map · Briefing · Financials · Newsletter), and
 * a horizontally-sliding email + Subscribe form that posts to our AWS Lambda relay,
 * which adds the contact in Givebutter tagged `newsletter` (the API key stays
 * server-side). The Lambda's CORS already allows any https://*.empowered.vote
 * origin plus localhost, so the same endpoint works from every feature app.
 *
 * Styling follows the ev-ui convention: theme values are applied inline and
 * switched by the `darkMode` boolean prop, so consumers just pass their own
 * `isDark` signal (defaults to light). A single scoped <style> block handles the
 * things inline styles can't express — ::placeholder, :focus-visible, the
 * slide-in transition, prefers-reduced-motion, and the small-screen layout.
 *
 * On a successful sign-up the form slides closed (reverse of the open animation)
 * and a fixed, bottom-center toast confirms it — matching ev-landing (#8):
 * auto-hides after ~6s (8s for errors), can be dismissed with an ✕, and pauses
 * its auto-hide while hovered. On error the form stays open and the toast shows
 * in its error (coral) style.
 *
 * Accessibility: sr-only label on the email input; the Newsletter toggle is a
 * real <button> with aria-expanded + aria-controls; the email/Subscribe controls
 * are not tab-reachable until the form is open; the toast's message span is the
 * role="status" live region (the ✕ button sits outside it); motion collapses
 * under prefers-reduced-motion.
 *
 * @param {Object} props
 * @param {boolean} [props.darkMode=false] - render the dark palette
 * @param {string}  [props.brandLabel='Empowered Vote · Alpha'] - brand text
 * @param {number}  [props.year] - copyright year (defaults to the current year)
 * @param {Array<{label:string, href:string, external?:boolean}>} [props.links]
 *   - the links rendered before the Newsletter toggle. Defaults point at the
 *     canonical empowered.vote destinations so they resolve from any subdomain.
 * @param {boolean} [props.newsletter=true] - render the Newsletter sign-up
 * @param {string}  [props.endpoint] - override the sign-up relay URL
 * @param {string}  [props.className] - extra class names on the <footer>
 * @param {Object}  [props.style] - extra inline styles on the <footer>
 */

// AWS Lambda relay that adds the contact in Givebutter (key stays server-side).
const SIGNUP_ENDPOINT_DEFAULT =
  'https://gq2nohazl3447rhtau34o6yqs40vpude.lambda-url.us-east-1.on.aws/';

const DEFAULT_LINKS = [
  { label: 'Mind Map', href: 'https://empowered.vote/maps/purpose-map.html' },
  { label: 'Briefing', href: 'https://empowered.vote/briefing' },
  { label: 'Financials', href: 'https://financials.empowered.vote', external: true },
];

export default function SiteFooter({
  darkMode = false,
  brandLabel = 'Empowered Vote · Alpha',
  year,
  links = DEFAULT_LINKS,
  newsletter = true,
  endpoint = SIGNUP_ENDPOINT_DEFAULT,
  className = '',
  style = {},
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { msg, isError }
  const [toastShown, setToastShown] = useState(false);
  const formRef = useRef(null);
  const emailRef = useRef(null);
  const toggleRef = useRef(null);
  const toastTimerRef = useRef(null);

  const uid = useId().replace(/:/g, '');
  const formId = `ev-sf-form-${uid}`;
  const emailId = `ev-sf-email-${uid}`;

  const resolvedYear = year ?? new Date().getFullYear();

  const t = darkMode
    ? {
        bg: '#131416',
        borderTop: '#2D2D32',
        brand: '#F2F2F2',
        muted: '#8B949E',
        link: '#8B949E',
        linkHover: '#F2F2F2',
        dot: '#FFD740',
        inputBg: '#1C1C1F',
        inputBorder: '#41454E',
        inputText: '#F2F2F2',
        placeholder: '#8B949E',
        btnBg: '#F2F2F2',
        btnText: '#111113',
        btnHover: '#FFFFFF',
        teal: '#1DA8C6',
        coral: '#FF6B52',
        card: '#1C1C1F',
        heading: '#F2F2F2',
      }
    : {
        bg: '#F7F7F8',
        borderTop: '#E5E7EB',
        brand: '#1C1C1C',
        muted: '#6B7280',
        link: '#6B7280',
        linkHover: '#1C1C1C',
        dot: '#FED12E',
        inputBg: '#FFFFFF',
        inputBorder: '#D3D7DE',
        inputText: '#1C1C1C',
        placeholder: '#6B7280',
        btnBg: '#1C1C1C',
        btnText: '#FFFFFF',
        btnHover: '#000000',
        teal: '#00657C',
        coral: '#FF5740',
        card: '#FFFFFF',
        heading: '#1C1C1C',
      };

  // Clear any pending auto-hide timer when the component unmounts.
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        // Focus the email once the slide-in has (roughly) settled.
        setTimeout(() => emailRef.current && emailRef.current.focus(), 260);
      }
      return next;
    });
  }

  // Fixed toast: mirrors ev-landing's #signup-toast. Auto-hides after ~6s
  // (8s for errors); pauses while hovered; dismissable with the ✕.
  function showToast(msg, isError) {
    setToast({ msg, isError: !!isError });
    setToastShown(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastShown(false), isError ? 8000 : 6000);
  }
  function hideToast() {
    clearTimeout(toastTimerRef.current);
    setToastShown(false);
  }
  function pauseToastHide() {
    clearTimeout(toastTimerRef.current);
  }
  function resumeToastHide() {
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastShown(false), 2500);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const emailInput = form.elements.email;
    if (emailInput && !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }
    const payload = {
      email: emailInput ? emailInput.value.trim() : '',
      company: (form.elements.company && form.elements.company.value) || '', // honeypot
    };

    setSubmitting(true);

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json().catch(() => ({ ok: r.ok })))
      .then((data) => {
        if (data && data.ok) {
          // Success: reset, slide the form closed, and confirm via the toast.
          form.reset();
          setOpen(false);
          // Move focus back to the toggle so it doesn't strand on the now
          // aria-hidden / untabbable Subscribe button.
          if (toggleRef.current) toggleRef.current.focus();
          showToast('You’re on the list — thanks for following the build. 🎉', false);
        } else {
          // Error: keep the form open so they can retry; toast in error style.
          showToast((data && data.error) || 'Something went wrong. Please try again.', true);
        }
      })
      .catch(() => {
        showToast('Couldn’t reach us just now. Please try again in a moment.', true);
      })
      .then(() => setSubmitting(false));
  }

  const rootStyle = {
    borderTop: `1px solid ${t.borderTop}`,
    padding: '32px 0 40px',
    background: t.bg,
    color: t.muted,
    fontFamily: fonts.primary,
    fontSize: '0.88rem',
    // CSS custom props consumed by the scoped <style> for pseudo-selectors.
    '--ev-sf-placeholder': t.placeholder,
    '--ev-sf-focus': t.teal,
    '--ev-sf-input-bg': t.inputBg,
    '--ev-sf-input-border': t.inputBorder,
    '--ev-sf-input-text': t.inputText,
    '--ev-sf-card': t.card,
    '--ev-sf-heading': t.heading,
    '--ev-sf-coral': t.coral,
    '--ev-sf-muted': t.muted,
    ...style,
  };

  const linkBase = { color: t.link, textDecoration: 'none', transition: 'color 0.15s ease' };
  const onLinkEnter = (e) => { e.currentTarget.style.color = t.linkHover; };
  const onLinkLeave = (e) => { e.currentTarget.style.color = t.link; };

  return (
    <footer className={`ev-site-footer ${className}`.trim()} style={rootStyle}>
      <style>{CSS}</style>
      <div className="ev-sf-wrap">
        <span className="ev-sf-brand" style={{ color: t.brand, fontWeight: fontWeights.bold }}>
          <span className="ev-sf-dot" style={{ background: t.dot }} />
          {brandLabel}
        </span>

        <span className="ev-sf-links">
          <span style={{ color: t.muted }}>© {resolvedYear}</span>

          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={linkBase}
              onMouseEnter={onLinkEnter}
              onMouseLeave={onLinkLeave}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {link.label}
            </a>
          ))}

          {newsletter && (
            <>
              <button
                ref={toggleRef}
                type="button"
                className="ev-sf-toggle"
                aria-expanded={open}
                aria-controls={formId}
                onClick={toggle}
                style={{ color: open ? t.linkHover : t.link }}
                onMouseEnter={(e) => { e.currentTarget.style.color = t.linkHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = open ? t.linkHover : t.link; }}
              >
                Newsletter <span className="ev-sf-caret" aria-hidden="true">▸</span>
              </button>

              <form
                ref={formRef}
                className={`ev-sf-form${open ? ' open' : ''}`}
                id={formId}
                method="post"
                noValidate
                aria-hidden={!open}
                onSubmit={handleSubmit}
              >
                <label className="ev-sf-sr-only" htmlFor={emailId}>Email address</label>
                <input
                  ref={emailRef}
                  id={emailId}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  tabIndex={open ? 0 : -1}
                  style={{
                    background: t.inputBg,
                    borderColor: t.inputBorder,
                    color: t.inputText,
                  }}
                />
                {/* Honeypot — off-screen field real people never fill; catches bots */}
                <div className="ev-sf-hp" aria-hidden="true">
                  <label>
                    Company
                    <input type="text" name="company" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <button
                  type="submit"
                  className="ev-sf-btn"
                  tabIndex={open ? 0 : -1}
                  disabled={submitting}
                  style={{ background: t.btnBg, color: t.btnText }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = t.btnHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = t.btnBg; }}
                >
                  Subscribe
                </button>
              </form>

              {/* Fixed confirmation toast. Position:fixed keeps it out of the
                  footer's flow, so nesting it here never shifts the layout.
                  The message span is the live region; the ✕ sits outside it. */}
              <div
                className={
                  `ev-sf-toast${toastShown ? ' show' : ''}` +
                  (toast && toast.isError ? ' is-error' : '')
                }
                onMouseEnter={pauseToastHide}
                onMouseLeave={resumeToastHide}
              >
                <span className="ev-sf-toast-msg" role="status" aria-live="polite">
                  {toast ? toast.msg : ''}
                </span>
                <button
                  type="button"
                  className="ev-sf-toast-close"
                  aria-label="Dismiss"
                  tabIndex={toastShown ? 0 : -1}
                  onClick={hideToast}
                >
                  ×
                </button>
              </div>
            </>
          )}
        </span>
      </div>
    </footer>
  );
}

// Scoped styles for the pieces inline styles can't express. Kept theme-neutral;
// theme colors arrive via the --ev-sf-* custom properties set on the root.
const CSS = `
.ev-site-footer .ev-sf-wrap {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
}
.ev-site-footer .ev-sf-brand {
  display: inline-flex; align-items: center; gap: 10px;
}
.ev-site-footer .ev-sf-dot {
  width: 10px; height: 10px; border-radius: 2px; flex: 0 0 auto;
}
.ev-site-footer .ev-sf-links {
  display: inline-flex; align-items: center; gap: 18px; flex-wrap: wrap;
}
.ev-site-footer .ev-sf-sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
.ev-site-footer .ev-sf-hp {
  position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;
}
.ev-site-footer .ev-sf-toggle {
  font: inherit; background: none; border: none; padding: 0; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
  transition: color 0.15s ease;
}
.ev-site-footer .ev-sf-toggle:focus-visible {
  outline: 2px solid var(--ev-sf-focus); outline-offset: 3px; border-radius: 4px;
}
.ev-site-footer .ev-sf-caret {
  font-size: 0.7em; display: inline-block; transition: transform 0.25s ease;
}
.ev-site-footer .ev-sf-toggle[aria-expanded="true"] .ev-sf-caret {
  transform: rotate(90deg);
}
/* Collapsed by default; slides open to the right, pushing the links left.
   margin-left cancels the parent flex gap so there is no phantom slot when closed. */
.ev-site-footer .ev-sf-form {
  display: flex; align-items: center; gap: 8px;
  max-width: 0; opacity: 0; margin-left: -18px;
  overflow: hidden; pointer-events: none;
  transition: max-width 0.4s cubic-bezier(.4, 0, .2, 1), opacity 0.3s ease, margin-left 0.4s ease;
}
.ev-site-footer .ev-sf-form.open {
  max-width: 360px; opacity: 1; margin-left: 0; pointer-events: auto;
}
.ev-site-footer .ev-sf-form input[type="email"] {
  width: 188px; flex: 0 0 auto; min-width: 0;
  font-family: inherit; font-size: 0.9rem;
  color: var(--ev-sf-input-text); background: var(--ev-sf-input-bg);
  border: 1.5px solid var(--ev-sf-input-border);
  border-radius: 999px; padding: 9px 15px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.ev-site-footer .ev-sf-form input[type="email"]::placeholder { color: var(--ev-sf-placeholder); }
.ev-site-footer .ev-sf-form input[type="email"]:focus {
  outline: 2px solid transparent; outline-offset: 1px;
  border-color: var(--ev-sf-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ev-sf-focus) 20%, transparent);
}
.ev-site-footer .ev-sf-btn {
  font-family: inherit; font-weight: 700; font-size: 0.88rem;
  white-space: nowrap; padding: 9px 18px;
  border: 1.5px solid transparent; border-radius: 999px; cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}
.ev-site-footer .ev-sf-btn:hover { transform: translateY(-1px); }
.ev-site-footer .ev-sf-btn:disabled { opacity: 0.7; cursor: default; transform: none; }
.ev-site-footer .ev-sf-btn:focus-visible {
  outline: 2px solid var(--ev-sf-focus); outline-offset: 2px;
}
/* Fixed confirmation toast — bottom-center popup; never affects page layout.
   Auto-hides (~6s / 8s errors), pauses on hover, ✕ dismisses. Ported from
   ev-landing's .signup-toast, themed via the --ev-sf-* custom properties. */
.ev-site-footer .ev-sf-toast {
  position: fixed; left: 50%; bottom: 24px;
  transform: translateX(-50%) translateY(10px);
  max-width: calc(100vw - 32px);
  display: flex; align-items: center; gap: 12px;
  background: var(--ev-sf-card); color: var(--ev-sf-heading);
  border: 1px solid var(--ev-sf-focus); border-left: 4px solid var(--ev-sf-focus);
  border-radius: 12px; padding: 11px 12px 11px 18px;
  font-size: 0.9rem; line-height: 1.35;
  box-shadow: 0 10px 34px -12px rgba(0, 0, 0, 0.45);
  opacity: 0; pointer-events: none; z-index: 1000;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.ev-site-footer .ev-sf-toast.show {
  opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto;
}
.ev-site-footer .ev-sf-toast.is-error {
  border-color: var(--ev-sf-coral); border-left-color: var(--ev-sf-coral);
}
.ev-site-footer .ev-sf-toast-msg { flex: 1 1 auto; }
.ev-site-footer .ev-sf-toast-close {
  flex: none; width: 26px; height: 26px; border-radius: 6px;
  border: none; background: transparent; color: var(--ev-sf-muted);
  font-size: 1.15rem; line-height: 1; cursor: pointer;
  display: grid; place-items: center;
  transition: background 0.15s ease, color 0.15s ease;
}
.ev-site-footer .ev-sf-toast-close:hover {
  background: color-mix(in srgb, var(--ev-sf-focus) 14%, transparent);
  color: var(--ev-sf-heading);
}
.ev-site-footer .ev-sf-toast.is-error .ev-sf-toast-close:hover {
  background: color-mix(in srgb, var(--ev-sf-coral) 14%, transparent);
}
.ev-site-footer .ev-sf-toast-close:focus-visible {
  outline: 2px solid var(--ev-sf-focus); outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .ev-site-footer .ev-sf-form { transition: opacity 0.2s ease; }
  .ev-site-footer .ev-sf-caret { transition: none; }
  .ev-site-footer .ev-sf-btn:hover { transform: none; }
  .ev-site-footer .ev-sf-toast { transition: opacity 0.2s ease; }
}
@media (max-width: 640px) {
  .ev-site-footer .ev-sf-wrap { flex-direction: column; align-items: flex-start; gap: 10px; }
}
@media (max-width: 480px) {
  .ev-site-footer .ev-sf-form.open { flex-basis: 100%; max-width: 100%; margin-left: 0; }
  .ev-site-footer .ev-sf-form.open input[type="email"] { flex: 1; width: auto; }
}
`;
