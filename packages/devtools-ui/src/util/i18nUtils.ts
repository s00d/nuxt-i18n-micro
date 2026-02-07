export function flattenTranslations(obj: Record<string, unknown>, parentKey = '', result: Record<string, string> = {}): Record<string, string> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key
      const value = obj[key]

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // If it's an array, add `[]` prefix to the index
          value.forEach((item, index) => {
            flattenTranslations(item as Record<string, unknown>, `${newKey}.[]${index}`, result)
          })
        } else {
          // If it's an object, recursively call flattenTranslations
          flattenTranslations(value as Record<string, unknown>, newKey, result)
        }
      } else {
        // If it's a primitive, save the value
        result[newKey] = value?.toString() ?? ('' as string)
      }
    }
  }
  return result
}

export const unflattenTranslations = <T = Record<string, unknown>>(flat: Record<string, string>): T => {
  const result = {} as T

  for (const key in flat) {
    if (Object.prototype.hasOwnProperty.call(flat, key)) {
      const keys = key.split('.')
      let current: unknown = result
      let parent: unknown = null
      let parentKey: string | number | null = null

      for (let i = 0; i < keys.length; i++) {
        const part = keys[i]
        if (!part) continue
        const isArrayElement = part.startsWith('[]')
        const arrayIndex = isArrayElement ? Number(part.slice(2)) : Number.NaN

        if (i === keys.length - 1) {
          // Set value for the last key
          if (typeof current === 'object' && current !== null && part) {
            const currentObj = current as Record<string, unknown>
            const value = flat[key]
            // Convert value to the correct type
            if (typeof value === 'string') {
              if (value === 'true' || value === 'false') {
                currentObj[part] = value === 'true'
              } else if (!Number.isNaN(Number(value)) && value.trim() !== '') {
                currentObj[part] = Number(value)
              } else {
                currentObj[part] = value
              }
            } else {
              currentObj[part] = value
            }
          }
        } else {
          if (typeof current !== 'object' || current === null) {
            current = {}
          }

          const currentObj = current as Record<string, unknown>

          if (isArrayElement) {
            // Check if current node is an array, if not - convert it
            if (!Array.isArray(currentObj)) {
              const newArray: unknown[] = []
              if (parent !== null && parentKey !== null && typeof parentKey === 'string') {
                ;(parent as Record<string, unknown>)[parentKey] = newArray
              } else if (part) {
                // Если это корневой элемент (не должен случаться для массива)
                ;(result as Record<string, unknown>)[part] = newArray
              }
              current = newArray
            }

            const arr = current as unknown[]
            if (Number.isNaN(arrayIndex)) {
              continue // Пропускаем некорректный индекс
            }

            // Создаем элемент массива, если его нет
            if (arr[arrayIndex] === undefined) {
              arr[arrayIndex] = {}
            }

            // Обновляем родителя и текущий узел
            parent = arr
            parentKey = arrayIndex
            current = arr[arrayIndex]
          } else if (part) {
            // Обработка обычного объекта
            if (currentObj[part] === undefined) {
              currentObj[part] = {}
            }

            parent = currentObj
            parentKey = part
            current = currentObj[part]
          }
        }
      }
    }
  }

  return result
}
