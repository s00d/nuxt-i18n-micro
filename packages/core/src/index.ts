import { BaseI18n, type BaseI18nOptions } from './base'
import { FormatService } from './format-service'
import {
  defaultPlural,
  interpolate,
  isNoPrefixStrategy,
  isPrefixAndDefaultStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixStrategy,
  withPrefixStrategy,
} from './helpers'
import { type TranslationStorage, useTranslationHelper } from './translation'

export {
  useTranslationHelper,
  interpolate,
  withPrefixStrategy,
  isNoPrefixStrategy,
  isPrefixStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixAndDefaultStrategy,
  defaultPlural,
  FormatService,
  BaseI18n,
  type TranslationStorage,
  type BaseI18nOptions,
}
