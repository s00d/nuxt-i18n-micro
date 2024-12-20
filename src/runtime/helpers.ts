import type { Strategies } from '../types'

export const withPrefixStrategy = (strategy: Strategies) => strategy === 'prefix' || strategy === 'prefix_and_default'

export const isNoPrefixStrategy = (strategy: Strategies) => strategy === 'no_prefix'

export const isPrefixStrategy = (strategy: Strategies) => strategy === 'prefix'

export const isPrefixExceptDefaultStrategy = (strategy: Strategies) => strategy === 'prefix_except_default'

export const isPrefixAndDefaultStrategy = (strategy: Strategies) => strategy === 'prefix_and_default'
