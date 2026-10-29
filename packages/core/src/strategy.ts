import type { Strategies } from '@i18n-micro/types'

export const withPrefixStrategy = (strategy: Strategies): strategy is 'prefix' | 'prefix_and_default' =>
  strategy === 'prefix' || strategy === 'prefix_and_default'
export const isNoPrefixStrategy = (strategy: Strategies): strategy is 'no_prefix' => strategy === 'no_prefix'
export const isPrefixStrategy = (strategy: Strategies): strategy is 'prefix' => strategy === 'prefix'
export const isPrefixExceptDefaultStrategy = (strategy: Strategies): strategy is 'prefix_except_default' => strategy === 'prefix_except_default'
export const isPrefixAndDefaultStrategy = (strategy: Strategies): strategy is 'prefix_and_default' => strategy === 'prefix_and_default'

/** Storage key of one chunk: `locale:route` (`index` when the route is empty). */
export function translationCacheKey(locale: string, routeName?: string): string {
  return `${locale}:${routeName || 'index'}`
}
