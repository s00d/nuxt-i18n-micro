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

const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

/** Recursive deep merge for build-time layer merging. */
export function deepMergeTranslationsRecursive(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = { ...target }
  for (const key of Object.keys(source)) {
    if (key === '__proto__') continue
    const src = source[key]
    const dst = output[key]
    // into `{}` where nothing merges: `__proto__` is dropped at every level, whatever the target holds
    if (isObject(src)) output[key] = deepMergeTranslationsRecursive(isObject(dst) ? dst : {}, src)
    else output[key] = src
  }
  return output
}
