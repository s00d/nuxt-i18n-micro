import { useTranslationHelper } from './translation'
import { RouteService } from './route-service'
import { FormatService } from './format-service'
import { interpolate, withPrefixStrategy, isNoPrefixStrategy, isPrefixStrategy, isPrefixExceptDefaultStrategy, isPrefixAndDefaultStrategy } from './helpers'

export {
  useTranslationHelper,
  interpolate,
  withPrefixStrategy,
  isNoPrefixStrategy,
  isPrefixStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixAndDefaultStrategy,
  RouteService,
  FormatService,
}
