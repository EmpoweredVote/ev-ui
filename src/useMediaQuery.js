import { useState, useEffect } from 'react';

/**
 * Hook that listens to a CSS media query and returns whether it matches.
 *
 * @param {string} query - A valid CSS media query string, e.g. '(max-width: 768px)'
 * @returns {boolean} Whether the media query currently matches
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
