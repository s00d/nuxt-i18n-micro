import { extractLocalizedPaths, type LocalizedPathsMap } from './core/localized-paths'
import { RouteGenerator, type RouteGeneratorOptions } from './route-generator'
import {
  buildFullPath,
  buildFullPathNoPrefix,
  buildRouteName,
  cloneArray,
  isInternalPath,
  isLocaleDefault,
  isPageRedirectOnly,
  normalizePath,
  normalizeRouteKey,
  removeLeadingSlash,
  shouldAddLocalePrefix,
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
