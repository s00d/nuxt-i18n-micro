import { BaseI18n, type BaseI18nOptions } from './base'
import { FormatService } from './format-service'
import {
  defaultPlural,
  getByPath,
  hasTranslationValue,
  interpolate,
  isNoPrefixStrategy,
  isPrefixAndDefaultStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixStrategy,
  mergeTranslationChunk,
  resolveTranslation,
  translationCacheKey,
  withPrefixStrategy,
  type MergeTranslationChunkOptions,
} from './helpers'
import { type TranslationStorage, useTranslationHelper } from './translation'

export {
  useTranslationHelper,
  interpolate,
  getByPath,
  hasTranslationValue,
  mergeTranslationChunk,
  resolveTranslation,
  translationCacheKey,
  withPrefixStrategy,
  isNoPrefixStrategy,
  isPrefixStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixAndDefaultStrategy,
  defaultPlural,
  FormatService,
  BaseI18n,
  type MergeTranslationChunkOptions,
  type TranslationStorage,
  type BaseI18nOptions,
}
