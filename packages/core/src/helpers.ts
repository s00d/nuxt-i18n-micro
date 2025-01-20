import type { Params, Strategies } from 'nuxt-i18n-micro-types'

export function interpolate(template: string, params: Params): string {
  let result = template

  for (const key in params) {
    result = result.split(`{${key}}`).join(String(params[key]))
  }

  return result
}

export const withPrefixStrategy = (strategy: Strategies) => strategy === 'prefix' || strategy === 'prefix_and_default'

export const isNoPrefixStrategy = (strategy: Strategies) => strategy === 'no_prefix'

export const isPrefixStrategy = (strategy: Strategies) => strategy === 'prefix'

export const isPrefixExceptDefaultStrategy = (strategy: Strategies) => strategy === 'prefix_except_default'

export const isPrefixAndDefaultStrategy = (strategy: Strategies) => strategy === 'prefix_and_default'
