export {
  externalLinkHref,
  isActiveLink,
  isPlainClick,
  isSamePage,
  localeIsoMap,
  localizedPath,
  pathEnd,
  pathSegments,
  routeQuery,
  urlPath,
  withoutDots,
} from './link'
export {
  isNoPrefixStrategy,
  isPrefixAndDefaultStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixStrategy,
  translationCacheKey,
  withPrefixStrategy,
} from './strategy'
export {
  convertible,
  defaultPlural,
  escapeHtml,
  interpolate,
  pluralForm,
  resolveText,
  textOf,
  tokenize,
  type ResolvedText,
  type ResolveTextOptions,
  type TextHost,
} from './text'
export {
  collectTranslationPaths,
  getByPath,
  hasTranslationValue,
  mergeTranslationChunk,
  mergeTranslationLayers,
  ownValue,
  resolveTranslation,
  setTranslationAtKey,
  type MergeTranslationChunkOptions,
  type Tree,
} from './tree'

/** `process.env.NODE_ENV` as bundlers inline it; an unbundled browser has no `process` and counts as development. */
export function isProduction(): boolean {
  try {
    return process.env.NODE_ENV === 'production'
  } catch {
    return false
  }
}
