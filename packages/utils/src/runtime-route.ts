import { getPathSegments } from "./path";

const removeLeadingSlash = (routePath: string): string =>
  routePath.startsWith("/") ? routePath.slice(1) : routePath;

export interface RouteLike {
  path: string;
  name?: string | symbol | null;
  matched?: Array<{ path: string }>;
}

export function extractBaseRoutePattern(matchedPath: string): string {
  return matchedPath
    .replace(/\/:locale\([^)]+\)/g, "")
    .replace(/\/:([^()]+)\(\)/g, "/[$1]")
    .replace(/\/:([^()]+)/g, "/[$1]");
}

export function findAllowedLocalesForRoute(
  route: RouteLike,
  routeLocales: Record<string, string[]> | undefined,
  localizedRouteNamePrefix = "localized-",
  localeCodes?: string[],
): string[] | null {
  const routePath = route.path;
  const routeName = route.name?.toString();
  const normalizedRouteName = routeName?.replace(localizedRouteNamePrefix, "");
  const normalizedRoutePath = normalizedRouteName ? `/${normalizedRouteName}` : undefined;

  let allowedLocales =
    (routeName && routeLocales?.[routeName]) ||
    (normalizedRouteName && routeLocales?.[normalizedRouteName]) ||
    (normalizedRoutePath && routeLocales?.[normalizedRoutePath]) ||
    (normalizedRoutePath && routeLocales?.[removeLeadingSlash(normalizedRoutePath)]) ||
    routeLocales?.[routePath] ||
    (routePath && routeLocales?.[removeLeadingSlash(routePath)]);

  if (!allowedLocales && routeLocales && localeCodes?.length) {
    const segments = getPathSegments(routePath);
    const first = segments[0];
    if (first && localeCodes.includes(first) && segments.length > 1) {
      const pathWithoutLocale = `/${segments.slice(1).join("/")}`;
      const pathKey = pathWithoutLocale === "/" ? "/" : removeLeadingSlash(pathWithoutLocale);
      allowedLocales = routeLocales[pathWithoutLocale] ?? routeLocales[pathKey] ?? undefined;
    }
  }

  if (!allowedLocales && route.matched && route.matched.length > 0) {
    const matchedRoute = route.matched[0];
    if (!matchedRoute) return null;
    const baseRoutePattern = extractBaseRoutePattern(matchedRoute.path);
    if (routeLocales?.[baseRoutePattern]) allowedLocales = routeLocales[baseRoutePattern];
  }

  return allowedLocales || null;
}

export function isMetaDisabledForRoute(
  route: RouteLike,
  routeDisableMeta: Record<string, boolean | string[]> | undefined,
  currentLocale?: string,
  localizedRouteNamePrefix = "localized-",
): boolean {
  if (!routeDisableMeta) return false;

  const routePath = route.path;
  const routeName = route.name?.toString();
  const normalizedRouteName = routeName?.replace(localizedRouteNamePrefix, "");
  const normalizedRoutePath = normalizedRouteName ? `/${normalizedRouteName}` : undefined;

  const checkDisableMeta = (disableMetaValue: boolean | string[] | undefined): boolean => {
    if (disableMetaValue === undefined) return false;
    if (typeof disableMetaValue === "boolean") return disableMetaValue;
    if (Array.isArray(disableMetaValue)) return currentLocale ? disableMetaValue.includes(currentLocale) : false;
    return false;
  };

  if (
    checkDisableMeta(routeDisableMeta[routePath]) ||
    (routeName && checkDisableMeta(routeDisableMeta[routeName])) ||
    (normalizedRouteName && checkDisableMeta(routeDisableMeta[normalizedRouteName])) ||
    (normalizedRoutePath && checkDisableMeta(routeDisableMeta[normalizedRoutePath]))
  ) {
    return true;
  }

  if (route.matched && route.matched.length > 0) {
    const matchedRoute = route.matched[0];
    if (!matchedRoute) return false;
    const baseRoutePattern = extractBaseRoutePattern(matchedRoute.path);
    if (checkDisableMeta(routeDisableMeta[baseRoutePattern])) return true;
  }

  return false;
}
