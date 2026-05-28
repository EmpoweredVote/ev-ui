import { useState, useEffect } from 'react';

/**
 * useTheme — reports whether the host app is in dark mode.
 *
 * Dark mode is OPT-IN: a consumer signals it by adding a `dark` class or a
 * `data-theme="dark"` attribute to the document root (or <body>). This mirrors
 * the opt-in `darkMode` prop on PoliticianProfile/SocialLinks (which defaults to
 * false) so a light-themed consumer never gets dark chart colors unexpectedly.
 *
 * Deliberately does NOT read `prefers-color-scheme` — a user's OS dark setting
 * should not override a consumer app that is rendering a light UI.
 *
 * SSR-safe: returns { isDark: false } when there's no document.
 *
 * @returns {{ isDark: boolean }}
 */
export function useTheme() {
  const read = () => {
    if (typeof document === 'undefined') return false;
    const root = document.documentElement;
    const body = document.body;
    const hasDarkClass = (el) => el && el.classList && el.classList.contains('dark');
    const hasDarkAttr = (el) => el && el.getAttribute && el.getAttribute('data-theme') === 'dark';
    return hasDarkClass(root) || hasDarkAttr(root) || hasDarkClass(body) || hasDarkAttr(body);
  };

  const [isDark, setIsDark] = useState(read);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const update = () => setIsDark(read());
    update();
    const observer = new MutationObserver(update);
    const opts = { attributes: true, attributeFilter: ['class', 'data-theme'] };
    observer.observe(document.documentElement, opts);
    if (document.body) observer.observe(document.body, opts);
    return () => observer.disconnect();
  }, []);

  return { isDark };
}

export default useTheme;
