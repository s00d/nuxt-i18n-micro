import type { Strategies } from '@i18n-micro/types'
import type { RouteStrategy } from './types'
import { NoPrefixStrategy } from './no-prefix'
import { PrefixStrategy } from './prefix'
import { PrefixAndDefaultStrategy } from './prefix-and-default'
import { PrefixExceptDefaultStrategy } from './prefix-except-default'

export function getStrategy(name: Strategies): RouteStrategy {
  switch (name) {
    case 'no_prefix':
      return new NoPrefixStrategy()
    case 'prefix':
      return new PrefixStrategy()
    case 'prefix_and_default':
      return new PrefixAndDefaultStrategy()
    case 'prefix_except_default':
      return new PrefixExceptDefaultStrategy()
    default:
      throw new Error(`Unknown route strategy: ${name}`)
  }
}
