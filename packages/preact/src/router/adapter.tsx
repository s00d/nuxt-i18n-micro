import type { Locale } from "@i18n-micro/types";
import { resolveLocalePrefixedPath } from "@i18n-micro/utils";
import type { I18nRoutingStrategy } from "./types";

/**
 * Создает адаптер для работы с History API (универсальный для Pure Preact)
 * Работает с любым роутером, который использует History API (wouter, preact-router, и т.д.)
 */
export function createBrowserHistoryAdapter(
  locales: Locale[],
  defaultLocale: string,
): I18nRoutingStrategy {
  const localeCodes = locales.map((loc) => loc.code);

  return {
    // Просто рендерим <a>, навигацию перехватит onClick в I18nLink
    linkComponent: undefined,

    getCurrentPath: () => {
      if (typeof window !== "undefined") {
        return window.location.pathname;
      }
      return "/";
    },

    push: (target) => {
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", target.path);
        // Вызываем событие, чтобы роутеры (wouter/preact-router) узнали об изменении
        window.dispatchEvent(new Event("popstate"));
      }
    },

    replace: (target) => {
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", target.path);
        window.dispatchEvent(new Event("popstate"));
      }
    },

    resolvePath: (to, locale) => resolveLocalePrefixedPath(to, locale, localeCodes, defaultLocale),

    getRoute: () => {
      if (typeof window !== "undefined") {
        return {
          fullPath: window.location.pathname + window.location.search,
          query: Object.fromEntries(new URLSearchParams(window.location.search)),
        };
      }
      return {
        fullPath: "/",
        query: {},
      };
    },
  };
}

// Export for backward compatibility (old name)
export const createPreactRouterAdapter = createBrowserHistoryAdapter;
