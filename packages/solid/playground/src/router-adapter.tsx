// @ts-nocheck

import type { I18nRoutingStrategy } from "@i18n-micro/solid";
import type { Locale } from "@i18n-micro/types";
import { resolveLocalePrefixedPath } from "@i18n-micro/utils";
import { A, type Location, type useNavigate } from "@solidjs/router";
import { type Accessor, type Component, createEffect, createSignal, type JSX } from "solid-js";

type NavigateFunction = ReturnType<typeof useNavigate>;

export function createSolidRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  navigate: NavigateFunction,
  location: Location,
): I18nRoutingStrategy & { getCurrentPathAccessor: Accessor<string> } {
  const localeCodes = locales.map((loc) => loc.code);

  // Создаем сигнал для отслеживания изменений pathname
  const [pathname, setPathname] = createSignal(location.pathname);

  // Отслеживаем изменения location.pathname
  createEffect(() => {
    setPathname(location.pathname);
  });

  return {
    getCurrentPath: () => pathname(), // Returns current value for compatibility
    getCurrentPathAccessor: pathname, // Returns accessor for reactivity

    push: (target: { path: string }) => {
      // Используем navigate из @solidjs/router
      navigate(target.path);
    },

    replace: (target: { path: string }) => {
      // Используем navigate с replace опцией
      navigate(target.path, { replace: true });
    },

    resolvePath: (to: string | { path?: string }, locale: string) =>
      resolveLocalePrefixedPath(to, locale, localeCodes, defaultLocale),

    getRoute: () => ({
      fullPath: pathname(),
      query: {},
    }),

    // Используем компонент A из @solidjs/router
    linkComponent: ((props: {
      href: string;
      children?: JSX.Element;
      class?: string;
      style?: JSX.CSSProperties;
      [key: string]: unknown;
    }) => {
      const { href, children, class: className, style, ...restProps } = props;
      return (
        <A href={href} class={className} style={style} {...restProps}>
          {children}
        </A>
      );
    }) as unknown as Component<{
      href: string;
      children?: JSX.Element;
      style?: JSX.CSSProperties;
      class?: string;
      [key: string]: unknown;
    }>,
  };
}
