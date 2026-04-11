/**
 * computeTierCoverage
 *
 * Counts how many topics apply at each tier of government. A topic with
 * `applies_federal`, `applies_state`, `applies_local` booleans contributes
 * to each tier it's marked for; cross-cutting topics contribute to all three.
 *
 * Topics missing tier flag fields (e.g., from an older API response) are
 * treated as cross-cutting (all three tiers = true). This matches the
 * backend default behavior in getCompassTopics/getCompassCategories.
 *
 * @param {Array<{applies_federal?: boolean, applies_state?: boolean, applies_local?: boolean}>} topics
 * @returns {{ federal: number, state: number, local: number }}
 *
 * @example
 *   computeTierCoverage([
 *     { applies_federal: true, applies_state: true, applies_local: true },  // housing
 *     { applies_federal: true, applies_state: false, applies_local: false }, // tariffs
 *   ])
 *   // → { federal: 2, state: 1, local: 1 }
 */
export function computeTierCoverage(topics) {
  const counts = { federal: 0, state: 0, local: 0 };
  if (!Array.isArray(topics)) return counts;

  for (const t of topics) {
    if (!t) continue;
    // Default to cross-cutting if tier fields are missing entirely.
    const hasFlags =
      'applies_federal' in t || 'applies_state' in t || 'applies_local' in t;
    const f = hasFlags ? Boolean(t.applies_federal) : true;
    const s = hasFlags ? Boolean(t.applies_state) : true;
    const l = hasFlags ? Boolean(t.applies_local) : true;
    if (f) counts.federal++;
    if (s) counts.state++;
    if (l) counts.local++;
  }

  return counts;
}
