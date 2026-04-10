import {
  getLocaleFromPath as getLocaleFromPathShared,
  getPathSegments,
  getPathWithoutLocale,
  withLeadingSlash,
} from "@i18n-micro/utils";

/**
 * Get route name from Astro path
 * Extracts route name from path (e.g., /en/about -> about)
 */
export function getRouteName(path: string, locales: string[] = []): string {
  const { pathWithoutLocale } = getPathWithoutLocale(path, locales);
  const segments = getPathSegments(pathWithoutLocale);
  return segments.length === 0 ? "index" : segments.join("-");
}

/**
 * Get locale from path
 * Checks if first segment is a locale code
 */
export function getLocaleFromPath(
  path: string,
  defaultLocale: string = "en",
  locales: string[] = [],
): string {
  return getLocaleFromPathShared(path, locales) ?? defaultLocale;
}

/**
 * Switch locale in path
 * Replaces or adds locale prefix to path
 */
export function switchLocalePath(
  path: string,
  newLocale: string,
  locales: string[] = [],
  defaultLocale?: string,
): string {
  const { pathWithoutLocale } = getPathWithoutLocale(path, locales);
  const segments = getPathSegments(pathWithoutLocale);
  if (newLocale !== defaultLocale || defaultLocale === undefined) {
    segments.unshift(newLocale);
  }
  return withLeadingSlash(segments.join("/"));
}

/**
 * Localize path with locale prefix
 */
export function localizePath(
  path: string,
  locale: string,
  locales: string[] = [],
  defaultLocale?: string,
): string {
  const { pathWithoutLocale } = getPathWithoutLocale(path, locales);
  const segments = getPathSegments(pathWithoutLocale);
  if (locale !== defaultLocale || defaultLocale === undefined) {
    segments.unshift(locale);
  }
  return withLeadingSlash(segments.join("/"));
}

/**
 * Remove locale from path
 */
export function removeLocaleFromPath(path: string, locales: string[] = []): string {
  return getPathWithoutLocale(path, locales).pathWithoutLocale;
}
