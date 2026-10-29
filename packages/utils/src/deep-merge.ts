/**
 * Deep merge of two translation trees: nested objects merge at any depth, everything else
 * (arrays, scalars, null) replaces. Same as {@link deepMergeTranslationsRecursive}.
 *
 * It used to stop at two levels, which made premerged builds, source mode and dev disagree on
 * the same files (`a.b.c` survived in one mode and not in another).
 */
export function deepMergeTranslations(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  return deepMergeTranslationsRecursive(target, source)
}

/** Recursive deep merge for build-time layer merging. */
export function deepMergeTranslationsRecursive(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = { ...target }
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
