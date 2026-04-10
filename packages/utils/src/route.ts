import type { Locale } from "@i18n-micro/types";
import { getPathSegments, withLeadingSlash } from "./path";
export const cloneArray = <T extends object>(array: T[]): T[] => array.map((item) => ({ ...item }));

export const isPageRedirectOnly = (page: { redirect?: unknown; file?: unknown }): boolean =>
  !!(page.redirect && !page.file);

export const buildRouteName = (
  baseName: string,
  localeCode: string,
  isCustom: boolean,
  prefix = "localized-",
): string => (isCustom ? `${prefix}${baseName}-${localeCode}` : `${prefix}${baseName}`);

export const buildRouteNameFromRoute = (
  name: string | null | undefined,
  routePath: string | null | undefined,
): string => name ?? (routePath ?? "").replace(/[^a-z0-9]/gi, "-").replace(/^-+|-+$/g, "");

export const shouldAddLocalePrefix = (
  locale: string,
  defaultLocale: Locale,
  addLocalePrefix: boolean,
): boolean => addLocalePrefix && locale !== defaultLocale.code;

export const isLocaleDefault = (locale: string | Locale, defaultLocale: Locale): boolean => {
  const localeCode = typeof locale === "string" ? locale : locale.code;
  return localeCode === defaultLocale.code;
};

const DEFAULT_STATIC_PATTERNS = [
  /^\/sitemap.*\.xml$/,
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/favicon\.ico$/,
  /^\/apple-touch-icon.*\.png$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
  /^\/workbox-.*\.js$/,
  /\.(xml|txt|ico|json|js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
];

export function isInternalPath(
  path: string,
  excludePatterns?: (string | RegExp | object)[],
): boolean {
  if (/(?:^|\/)__[^/]+/.test(path)) return true;
  for (const pattern of DEFAULT_STATIC_PATTERNS) {
    if (pattern.test(path)) return true;
  }
  if (!excludePatterns) return false;

  for (const pattern of excludePatterns) {
    if (typeof pattern === "string") {
      if (pattern.includes("*") || pattern.includes("?")) {
        const regex = new RegExp(pattern.replace(/\*/g, ".*").replace(/\?/g, "."));
        if (regex.test(path)) return true;
      } else if (path === pattern || path.startsWith(pattern)) {
        return true;
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(path)) return true;
    }
  }
  return false;
}

export function normalizeRouteKey(key: string): string {
  return key
    .split("/")
    .map((segment) => {
      if (segment.startsWith("[...") && segment.endsWith("]")) {
        const paramName = segment.substring(4, segment.length - 1);
        return `:${paramName}(.*)*`;
      }
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const paramName = segment.substring(1, segment.length - 1);
        return `:${paramName}`;
      }
      return segment;
    })
    .join("/");
}

export const removeLeadingSlash = (routePath: string): string =>
  routePath.startsWith("/") ? routePath.slice(1) : routePath;

export const normalizeRoutePath = (routePath: string): string => {
  if (!routePath) return "";
  if (routePath === "/") return "/";
  const normalized = routePath.replace(/\/+/g, "/").replace(/\/+$/, "");
  if (normalized === "" && routePath.includes("/")) return "/";
  if (normalized === "/" || normalized === "/.") return "/";
  if (normalized === "." || normalized === "") return "";
  return normalized;
};

export function joinPath(...segments: string[]): string {
  const cleaned = segments.filter((segment) => segment !== "");
  if (cleaned.length === 0) return ".";
  const joined = cleaned.join("/");
  return normalizeRoutePath(joined);
}

function normalizeRegex(toNorm?: string | RegExp): string | undefined {
  if (typeof toNorm === "undefined") return undefined;
  if (toNorm instanceof RegExp) return toNorm.source;

  const match = toNorm.match(/^\/(.+)\/[a-z]*$/i);
  if (match?.[1]) return match[1];
  return toNorm;
}

function encodeLiteralPathSegments(routePath: string): string {
  if (!routePath || !/[\u0080-\uFFFF]/.test(routePath)) return routePath;
  return routePath
    .split("/")
    .map((segment) => {
      if (!segment) return segment;
      if (segment.startsWith(":")) return segment;
      if (!/[\u0080-\uFFFF]/.test(segment)) return segment;
      return encodeURI(segment);
    })
    .join("/");
}

export function buildFullPath(
  locale: string | string[],
  basePath: string,
  customRegex?: string | RegExp,
): string {
  const regexString = normalizeRegex(customRegex);
  const localeParam = regexString ? regexString : Array.isArray(locale) ? locale.join("|") : locale;
  const encodedBase = encodeLiteralPathSegments(basePath);
  return normalizeRoutePath(joinPath("/", `:locale(${localeParam})`, encodedBase));
}

export function buildFullPathNoPrefix(basePath: string): string {
  const encodedBase = encodeLiteralPathSegments(basePath);
  return normalizeRoutePath(encodedBase);
}

export function resolveLocalePrefixedPath(
  to: string | { path?: string },
  locale: string,
  localeCodes: readonly string[],
  defaultLocale: string,
): string {
  const path = typeof to === "string" ? to : to.path || "/";
  const pathSegments = getPathSegments(path);
  const firstSegment = pathSegments[0];

  if (firstSegment !== undefined && localeCodes.includes(firstSegment)) {
    pathSegments.shift();
  }

  const cleanPath = withLeadingSlash(pathSegments.join("/"));
  if (locale === defaultLocale) {
    return cleanPath;
  }

  return withLeadingSlash(`${locale}${cleanPath === "/" ? "" : cleanPath}`);
}
