/**
 * True for plain objects suitable as translation maps (not arrays, Date, null, etc.).
 */
export function isPlainTranslationObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype
}

/**
 * Recursively traverses a JSON object and creates a flat list of dot-separated keys.
 *
 * @param obj - JSON object with translations
 * @param prefix - Prefix for nested keys (used recursively)
 * @returns Array of strings with flat keys (e.g. ['greeting', 'header.title', 'errors.404'])
 *
 * @example
 * ```typescript
 * const obj = {
 *   greeting: 'Hello',
 *   header: {
 *     title: 'Welcome',
 *     subtitle: 'Subtitle'
 *   }
 * }
 * flattenKeys(obj) // ['greeting', 'header.title', 'header.subtitle']
 * ```
 */
export function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  if (!isPlainTranslationObject(obj)) {
    return []
  }

  const keys: string[] = []

  for (const key in obj) {
    // Object.hasOwn is available in Node.js 18.17.0+ (required by engines)
    if (!Object.hasOwn(obj, key)) continue

    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    // Nested plain objects go deeper; arrays / scalars / null are leaf keys
    if (isPlainTranslationObject(value)) {
      keys.push(...flattenKeys(value, newKey))
    } else {
      // Leaf: string, number, boolean, null, or array (e.g. plural forms)
      keys.push(newKey)
    }
  }

  return keys
}
