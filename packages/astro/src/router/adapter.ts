import type { Locale } from "@i18n-micro/types";
import type { I18nRoutingStrategy } from "./types";
import {
  getLocaleFromPath as getLocaleFromPathLegacy,
  getRouteName as getRouteNameLegacy,
  localizePath as localizePathLegacy,
  removeLocaleFromPath as removeLocaleFromPathLegacy,
  switchLocalePath as switchLocalePathLegacy,
} from "../routing";

/**
 * Factory for Astro router adapter
 * Implements routing utilities for Astro file-based routing
 * Uses standard Astro APIs: Astro.url, context.url
 */
export function createAstroRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  getCurrentUrl?: () => URL,
): I18nRoutingStrategy {
  const localeCodes = locales.map((loc) => loc.code);

  /**
   * Resolve path for specific locale
   */
  const resolvePath = (
    to: string | { path?: string },
    locale: string,
  ): string | { path?: string } => {
    const path = typeof to === "string" ? to : to.path || "/";
    return localizePathLegacy(path, locale, localeCodes, defaultLocale);
  };

  return {
    getCurrentPath: () => {
      // Use provided URL getter (from Astro.url or context.url)
      if (getCurrentUrl) {
        return getCurrentUrl().pathname;
      }
      // Fallback for client-side islands
      if (typeof window !== "undefined") {
        return window.location.pathname;
      }
      return "/";
    },
    getRouteName: getRouteNameLegacy,
    getLocaleFromPath: getLocaleFromPathLegacy,
    switchLocalePath: switchLocalePathLegacy,
    localizePath: localizePathLegacy,
    removeLocaleFromPath: removeLocaleFromPathLegacy,
    resolvePath,
    getRoute: () => {
      // Use provided URL getter (from Astro.url or context.url)
      if (getCurrentUrl) {
        const url = getCurrentUrl();
        return {
          fullPath: url.pathname + url.search,
          query: Object.fromEntries(url.searchParams),
        };
      }
      // Fallback for client-side islands
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        return {
          fullPath: url.pathname + url.search,
          query: Object.fromEntries(url.searchParams),
        };
      }
      return {
        fullPath: "/",
        query: {},
      };
    },
    // Optional: client-side navigation for islands
    push: (target: { path: string }) => {
      if (typeof window !== "undefined") {
        window.location.href = target.path;
      }
    },
    replace: (target: { path: string }) => {
      if (typeof window !== "undefined") {
        window.location.replace(target.path);
      }
    },
  };
}
