/**
 * Optimized deep merge for translation objects (2-level depth).
 *
 * Regular shallow spread `{ ...old, ...new }` overwrites nested objects entirely:
 *   { common: { fromA: "A" } } + { common: { fromB: "B" } } => { common: { fromB: "B" } }
 *
 * This function preserves sibling keys inside nested objects:
 *   { common: { fromA: "A" } } + { common: { fromB: "B" } } => { common: { fromA: "A", fromB: "B" } }
 *
 * Performance: only iterates top-level keys of `source`; inner merge is a single spread.
 *
 * Limitation: only merges 2 levels deep. At level 3+, source overwrites target.
 * For 99% of i18n files (Section → Key → Value), this is sufficient.
 */
export function deepMergeTranslations(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target }

  // Own keys only, and `__proto__` alone is unsafe to assign — a `constructor` key is an
  // ordinary own property on a plain object, and dropping it would drop a translation.
  for (const key of Object.keys(source)) {
    if (key === '__proto__') continue

    const src = source[key]
    const dst = result[key]

    if (src !== null && typeof src === 'object' && !Array.isArray(src) && dst !== null && typeof dst === 'object' && !Array.isArray(dst)) {
      result[key] = { ...(dst as Record<string, unknown>), ...(src as Record<string, unknown>) }
    } else {
      result[key] = src
    }
  }

  return result
}

/** Recursive deep merge for build-time layer merging. */
export function deepMergeTranslationsRecursive(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  if (!target || Object.keys(target).length === 0) return { ...source }
  const output = { ...target }
  for (const key of Object.keys(source)) {
    if (key === '__proto__') continue
    const src = source[key]
    const dst = output[key]
    if (src && typeof src === 'object' && !Array.isArray(src) && dst && typeof dst === 'object' && !Array.isArray(dst)) {
      output[key] = deepMergeTranslationsRecursive(dst as Record<string, unknown>, src as Record<string, unknown>)
    } else {
      output[key] = src
    }
  }
  return output
}
