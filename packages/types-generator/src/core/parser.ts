/**
 * Рекурсивно обходит JSON объект и создает плоский список ключей через точку.
 *
 * @param obj - JSON объект с переводами
 * @param prefix - Префикс для вложенных ключей (используется рекурсивно)
 * @returns Массив строк с плоскими ключами (например, ['greeting', 'header.title', 'errors.404'])
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

    // Если значение - объект и не массив, идем вглубь
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, newKey))
    }
    else {
      // Иначе это конечный ключ (строка, число или массив для плюрализации)
      // Плюрализация обрабатывается как один ключ (формат "no | one | many" не разбивается)
      keys.push(newKey)
    }
  }

  return keys
}
