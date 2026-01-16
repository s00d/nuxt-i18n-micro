/**
 * Recursively traverses JSON object and creates flat list of keys with dots.
 *
 * @param obj - JSON object with translations
 * @param prefix - Prefix for nested keys (used recursively)
 * @returns Array of strings with flat keys (e.g., ['greeting', 'header.title', 'errors.404'])
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
export function flattenKeys(
  obj: Record<string, unknown>,
  prefix = '',
): string[] {
  const keys: string[] = []

  for (const key in obj) {
    // Object.hasOwn is available in Node.js 18.17.0+ (required by engines)
    if (!Object.hasOwn(obj, key)) continue

    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    // If value is object and not array, go deeper
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, newKey))
    }
    else {
      // Otherwise this is final key (string, number or array for pluralization)
      // Pluralization is handled as single key (format "no | one | many" is not split)
      keys.push(newKey)
    }
  }

  return keys
}
