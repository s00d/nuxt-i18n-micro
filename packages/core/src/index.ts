import { BaseI18n, type BaseI18nOptions } from './base'
import { FormatService, type DateTimeFormatsConfig, type FormatServiceOptions, type NumberFormatsConfig } from './format-service'
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
import { createReactiveI18nStore, type ReactiveI18nStore } from './reactive-store'

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
  createReactiveI18nStore,
  type MergeTranslationChunkOptions,
  type TranslationStorage,
  type BaseI18nOptions,
  type ReactiveI18nStore,
  type NumberFormatsConfig,
  type DateTimeFormatsConfig,
  type FormatServiceOptions,
}
