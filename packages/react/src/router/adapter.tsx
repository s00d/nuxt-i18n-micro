import { type Locale } from "@i18n-micro/types";
import { resolveLocalePrefixedPath } from "@i18n-micro/utils";
import React from "react";
import { type useLocation, type useNavigate, Link } from "react-router-dom";
import { type I18nRoutingStrategy } from "./types";

/**
 * Factory for React Router adapter
 * Implements routing utilities for React Router
 * Uses react-router-dom APIs for navigation and path resolution
 */
export function createReactRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  location: ReturnType<typeof useLocation>,
  navigate: ReturnType<typeof useNavigate>,
): I18nRoutingStrategy {
  const localeCodes = locales.map((loc) => loc.code);

  return {
    linkComponent: ((props: {
      href: string;
      children?: React.ReactNode;
      className?: string;
      style?: React.CSSProperties;
      [key: string]: unknown;
    }) => {
      const { href, children, className, style, ...restProps } = props;
      return React.createElement(
        Link,
        {
          to: href,
          className,
          style,
          ...restProps,
        },
        children,
      );
    }) as React.ComponentType<{
      href: string;
      children?: React.ReactNode;
      style?: React.CSSProperties;
      className?: string;
      [key: string]: unknown;
    }>,

    getCurrentPath: () => location.pathname,

    push: (target: { path: string }) => {
      navigate(target.path);
    },

    replace: (target: { path: string }) => {
      navigate(target.path, { replace: true });
    },

    resolvePath: (to: string | { path?: string }, locale: string) =>
      resolveLocalePrefixedPath(to, locale, localeCodes, defaultLocale),

    getRoute: () => ({
      fullPath: location.pathname,
      query: Object.fromEntries(new URLSearchParams(location.search)),
    }),
  };
}
