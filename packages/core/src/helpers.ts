import type { Params, Strategies, PluralFunc, Getter, TranslationKey, MessageCompilerFunc } from '@i18n-micro/types'

/**
 * Cache for compiled messages
 * Key format: "locale:route:key:contentLength:contentPrefix"
 */
export type CompiledMessageCache = Map<string, (params?: Params) => string>

/**
 * Generate cache key for compiled message
 * Includes content info to invalidate when translation changes
 */
export function getCompiledCacheKey(
  locale: string,
  route: string,
  key: string,
  content: string,
): string {
  // Use content length + first 50 chars as hash to detect changes
  return `${locale}:${route}:${key}:${content.length}:${content.slice(0, 50)}`
}

/**
 * Create a new compiled message cache
 */
export function createCompiledCache(): CompiledMessageCache {
  return new Map()
}

export function interpolate(template: string, params: Params): string {
  let result = template

  for (const key in params) {
    result = result.split(`{${key}}`).join(String(params[key]))
  }

  return result
}

export function withPrefixStrategy(strategy: Strategies) {
  return strategy === 'prefix' || strategy === 'prefix_and_default'
}

export function isNoPrefixStrategy(strategy: Strategies) {
  return strategy === 'no_prefix'
}

export function isPrefixStrategy(strategy: Strategies) {
  return strategy === 'prefix'
}

export function isPrefixExceptDefaultStrategy(strategy: Strategies) {
  return strategy === 'prefix_except_default'
}

export function isPrefixAndDefaultStrategy(strategy: Strategies) {
  return strategy === 'prefix_and_default'
}

/**
 * Default pluralization function
 * Splits translation by '|' and selects form based on count
 * @param key - Translation key
 * @param count - Count for pluralization
 * @param params - Parameters for translation
 * @param _locale - Current locale (unused in default implementation)
 * @param getTranslation - Function to get translation value
 * @returns Selected plural form or null if not found
 */
export const defaultPlural: PluralFunc = (key: TranslationKey, count: number, params: Params, _locale: string, getTranslation: Getter) => {
  const translation = getTranslation(key, params)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  if (forms.length === 0) return null
  const selectedForm = count < forms.length ? forms[count] : forms[forms.length - 1]
  if (!selectedForm) return null
  return selectedForm.trim().replace('{count}', count.toString())
}

/**
 * Compile message or fallback to simple interpolation
 * Centralized function for all adapters
 *
 * @param value - The translation string to compile/interpolate
 * @param locale - Current locale code
 * @param route - Current route name
 * @param key - Translation key
 * @param params - Parameters for interpolation
 * @param messageCompiler - Optional custom message compiler function
 * @param cache - Optional cache for compiled messages
 * @returns Compiled/interpolated string
 */
export function compileOrInterpolate(
  value: string,
  locale: string,
  route: string,
  key: string,
  params: Params | undefined,
  messageCompiler: MessageCompilerFunc | undefined,
  cache: CompiledMessageCache | undefined,
): string {
  // Если messageCompiler не задан, используем простую интерполяцию
  if (!messageCompiler) {
    return params ? interpolate(value, params) : value
  }

  try {
    const cacheKey = getCompiledCacheKey(locale, route, key, value)
    let compiledFn = cache?.get(cacheKey)

    if (!compiledFn) {
      // Оборачиваем компиляцию в try/catch
      compiledFn = messageCompiler(value, locale, key)
      cache?.set(cacheKey, compiledFn)
    }

    // Оборачиваем выполнение скомпилированной функции в try/catch
    return compiledFn(params ?? {})
  }
  catch (err: unknown) {
    // В режиме разработки выводим предупреждение с деталями
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] Error compiling message for key '${key}'. Falling back to simple interpolation.`, {
        locale,
        key,
        message: value,
        error: err,
      })
    }
    // Откат к простой интерполяции в случае ошибки
    return params ? interpolate(value, params) : value
  }
}
