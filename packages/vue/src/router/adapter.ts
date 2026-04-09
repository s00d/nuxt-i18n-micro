import { type Locale } from "@i18n-micro/types";
import { resolveLocalePrefixedPath } from "@i18n-micro/utils";
import { type Router, RouterLink } from "vue-router";
import { type I18nRoutingStrategy } from "./types";

/**
 * Factory for Vue Router adapter
 * Implements routing utilities for Vue Router
 * Uses vue-router APIs for navigation and path resolution
 */
export function createVueRouterAdapter(
  router: Router,
  locales: Locale[],
  defaultLocale: string,
): I18nRoutingStrategy {
  const localeCodes = locales.map((loc) => loc.code);

  return {
    linkComponent: RouterLink,

    getCurrentPath: () => {
      // currentRoute in Vue Router is reactive
      return router.currentRoute.value.path;
    },

    push: (target: { path: string }) => {
      router.push(target.path).catch(() => {});
    },

    replace: (target: { path: string }) => {
      router.replace(target.path).catch(() => {});
    },

    resolvePath: (to: string | { path?: string }, locale: string) =>
      resolveLocalePrefixedPath(to, locale, localeCodes, defaultLocale),

    getRoute: () => ({
      fullPath: router.currentRoute.value.fullPath,
      query: router.currentRoute.value.query,
    }),
  };
}
