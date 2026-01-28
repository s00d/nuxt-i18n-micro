import { RouteGenerator, type RouteGeneratorOptions } from './route-generator'
import { extractLocalizedPaths, type LocalizedPathsMap } from './core/localized-paths'
import {
  isInternalPath,
  normalizeRouteKey,
  normalizePath,
  cloneArray,
  isPageRedirectOnly,
  removeLeadingSlash,
  buildRouteName,
  shouldAddLocalePrefix,
  isLocaleDefault,
  buildFullPath,
  buildFullPathNoPrefix,
} from './utils'

export {
  RouteGenerator,
  type RouteGeneratorOptions,
  extractLocalizedPaths,
  type LocalizedPathsMap,
  isInternalPath,
  normalizeRouteKey,
  normalizePath,
  cloneArray,
  isPageRedirectOnly,
  removeLeadingSlash,
  buildRouteName,
  shouldAddLocalePrefix,
  isLocaleDefault,
  buildFullPath,
  buildFullPathNoPrefix,
}
