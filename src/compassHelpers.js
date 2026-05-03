// Ported verbatim from essentials/src/lib/compass.js.
// Private util — NOT exported from ev-ui barrel.

/**
 * Build { [short_title]: value } only for the allowed short titles.
 * Any missing answers default to 0.
 */
export function buildAnswerMapByShortTitle(
  allTopics,
  allAnswers,
  allowedShorts
) {
  const allowed = new Set(allowedShorts.map((s) => s.toLowerCase()));
  const topicById = new Map(allTopics.map((t) => [t.id, t]));
  const shortById = new Map(allTopics.map((t) => [t.id, t.short_title]));

  // Initialize with 0 for each allowed short title (in allowedShorts order to preserve spoke layout)
  const out = {};
  const topicByShortLower = new Map(allTopics.map((t) => [t.short_title.toLowerCase(), t]));
  for (const s of allowedShorts) {
    const t = topicByShortLower.get(s.toLowerCase());
    if (t) out[t.short_title] = 0;
  }

  // Fill in any provided answers that match our allowed set
  for (const a of allAnswers) {
    const st = shortById.get(a.topic_id);
    if (!st) continue;
    if (allowed.has(String(st).toLowerCase())) {
      out[st] = a.value ?? 0;
    }
  }

  // Return topics in the same order as allowedShorts (preserves user's spoke layout)
  const topicByShort = new Map(allTopics.map((t) => [t.short_title.toLowerCase(), t]));
  const topicsFiltered = allowedShorts
    .map((s) => topicByShort.get(s.toLowerCase()))
    .filter(Boolean);

  return { topicsFiltered, answersByShort: out };
}
