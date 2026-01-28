import { RouteGenerator } from './route-generator'
import { isInternalPath } from './path-utils'
import {
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
