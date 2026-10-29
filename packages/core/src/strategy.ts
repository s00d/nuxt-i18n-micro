import type { Strategies } from '@i18n-micro/types'

export const withPrefixStrategy = (strategy: Strategies): boolean => strategy === 'prefix' || strategy === 'prefix_and_default'
export const isNoPrefixStrategy = (strategy: Strategies): boolean => strategy === 'no_prefix'
export const isPrefixStrategy = (strategy: Strategies): boolean => strategy === 'prefix'
export const isPrefixExceptDefaultStrategy = (strategy: Strategies): boolean => strategy === 'prefix_except_default'
export const isPrefixAndDefaultStrategy = (strategy: Strategies): boolean => strategy === 'prefix_and_default'

/** Storage key of one chunk: `locale:route` (`index` when the route is empty). */
export function translationCacheKey(locale: string, routeName?: string): string {
  return `${locale}:${routeName || 'index'}`
}
