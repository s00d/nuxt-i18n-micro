import type { PathStrategy, PathStrategyContext } from '../core/types'
import { NoPrefixPathStrategy } from './no-prefix'
import { PrefixPathStrategy } from './prefix'
import { PrefixExceptDefaultPathStrategy } from './prefix-except-default'
import { PrefixAndDefaultPathStrategy } from './prefix-and-default'

/**
 * Creates the appropriate path strategy instance for the given context.
 * Used when all strategies are bundled (e.g. tests, server). For runtime client,
 * use Nuxt alias #i18n-strategy to import only the selected strategy.
 */
export function createPathStrategy(ctx: PathStrategyContext): PathStrategy {
  switch (ctx.strategy) {
    case 'no_prefix':
      return new NoPrefixPathStrategy(ctx)
    case 'prefix':
      return new PrefixPathStrategy(ctx)
    case 'prefix_except_default':
      return new PrefixExceptDefaultPathStrategy(ctx)
    case 'prefix_and_default':
      return new PrefixAndDefaultPathStrategy(ctx)
    default:
      return new PrefixExceptDefaultPathStrategy(ctx)
  }
}
