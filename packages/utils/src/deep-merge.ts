const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * Deep merge of two translation trees: nested objects merge at any depth, everything else
 * (arrays, scalars, null) replaces.
 */
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
