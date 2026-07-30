import { extractLocalizedPaths, type LocalizedPathsMap } from './core/localized-paths'
import { isLocalizationDisabledForPage } from './core/localization-disabled'
import { isLocaleAllowedForUnlocalizedRoute } from './locale-route-access'
import { RouteGenerator, type RouteGeneratorOptions } from './route-generator'
import {
  buildEncodedPathAliases,
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
  isLocaleAllowedForUnlocalizedRoute,
  extractLocalizedPaths,
  type LocalizedPathsMap,
  isLocalizationDisabledForPage,
  isInternalPath,
  normalizeRouteKey,
  normalizePath,
  cloneArray,
  isPageRedirectOnly,
  removeLeadingSlash,
  buildRouteName,
  shouldAddLocalePrefix,
  isLocaleDefault,
  buildEncodedPathAliases,
  buildFullPath,
  buildFullPathNoPrefix,
}
