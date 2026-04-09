import {
  buildFullPath,
  buildFullPathNoPrefix,
  buildRouteName,
  cloneArray,
  isInternalPath,
  isLocaleDefault,
  isPageRedirectOnly,
  normalizeRoutePath as normalizePath,
  normalizeRouteKey,
  removeLeadingSlash,
  shouldAddLocalePrefix,
} from "@i18n-micro/utils";
import { extractLocalizedPaths, type LocalizedPathsMap } from "./core/localized-paths";
import { RouteGenerator, type RouteGeneratorOptions } from "./route-generator";

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
};
