import type {
  CleanTranslation,
  Locale,
  Params,
  TranslationKey,
  Translations,
} from "@i18n-micro/types";
import {
  getLocaleFromPath,
  getPathSegments,
  getPathWithoutLocale,
  withLeadingSlash,
} from "@i18n-micro/utils";
import type { AstroGlobal } from "astro";
import type { AstroI18n } from "./composer";
import type { I18nRoutingStrategy } from "./router/types";
import "./env.d";

export function getI18n(astro: AstroGlobal): AstroI18n {
  const i18n = astro.locals.i18n;
  if (!i18n) {
    throw new Error("i18n instance not found. Make sure i18n middleware is configured.");
  }
  // @ts-ignore private property mismatch between src and dist types
  return i18n;
}

export function getLocale(astro: AstroGlobal): string {
  return astro.locals.locale || "en";
}

export function getDefaultLocale(astro: AstroGlobal): string {
  return astro.locals.defaultLocale || "en";
}

export function getLocales(astro: AstroGlobal): Locale[] {
  return astro.locals.locales || [];
}

function getRoutingStrategy(astro: AstroGlobal): I18nRoutingStrategy | null {
  return (astro.locals.routingStrategy as I18nRoutingStrategy | undefined) || null;
}

export function useI18n(astro: AstroGlobal) {
  const i18n = getI18n(astro);
  const locale = getLocale(astro);
  const defaultLocale = getDefaultLocale(astro);
  const locales = getLocales(astro);
  const localeCodes = locales.map((l) => l.code);
  const routingStrategy = getRoutingStrategy(astro);

  return {
    locale,
    defaultLocale,
    locales,
    t: (
      key: TranslationKey,
      params?: Params,
      defaultValue?: string | null,
      routeName?: string,
    ): CleanTranslation => i18n.t(key, params, defaultValue, routeName),
    ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string =>
      i18n.ts(key, params, defaultValue, routeName),
    tc: (key: TranslationKey, count: number | Params, defaultValue?: string): string =>
      i18n.tc(key, count, defaultValue),
    tn: (value: number, options?: Intl.NumberFormatOptions): string => i18n.tn(value, options),
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string =>
      i18n.td(value, options),
    tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string =>
      i18n.tdr(value, options),
    has: (key: TranslationKey, routeName?: string): boolean => i18n.has(key, routeName),
    getRoute: (): string => i18n.getRoute(),
    getRouteName: (path?: string): string => {
      const targetPath = path || astro.url.pathname;
      if (routingStrategy?.getRouteName)
        return routingStrategy.getRouteName(targetPath, localeCodes);
      const { pathWithoutLocale } = getPathWithoutLocale(targetPath, localeCodes);
      const segments = getPathSegments(pathWithoutLocale);
      return segments.length === 0 ? "index" : segments.join("-");
    },
    getLocaleFromPath: (path?: string): string => {
      const targetPath = path || astro.url.pathname;
      if (routingStrategy?.getLocaleFromPath) {
        return routingStrategy.getLocaleFromPath(targetPath, defaultLocale, localeCodes);
      }
      return getLocaleFromPath(targetPath, localeCodes) || defaultLocale;
    },
    switchLocalePath: (newLocale: string): string => {
      if (routingStrategy?.switchLocalePath) {
        return routingStrategy.switchLocalePath(
          astro.url.pathname,
          newLocale,
          localeCodes,
          defaultLocale,
        );
      }
      const { pathWithoutLocale } = getPathWithoutLocale(astro.url.pathname, localeCodes);
      const baseSegments = getPathSegments(pathWithoutLocale);
      if (newLocale !== defaultLocale) baseSegments.unshift(newLocale);
      return withLeadingSlash(baseSegments.join("/"));
    },
    localizePath: (path: string, targetLocale?: string): string => {
      if (routingStrategy?.localizePath) {
        return routingStrategy.localizePath(
          path,
          targetLocale || locale,
          localeCodes,
          defaultLocale,
        );
      }
      const { pathWithoutLocale } = getPathWithoutLocale(path, localeCodes);
      const segments = getPathSegments(pathWithoutLocale);
      if (targetLocale && targetLocale !== defaultLocale) segments.unshift(targetLocale);
      return withLeadingSlash(segments.join("/"));
    },
    getI18n: (): AstroI18n => i18n,
    getBasePath: (url?: URL): string => {
      const targetUrl = url || astro.url;
      const { pathWithoutLocale } = getPathWithoutLocale(targetUrl.pathname, localeCodes);
      return pathWithoutLocale;
    },
    addTranslations: (locale: string, translations: Record<string, unknown>, merge = true): void =>
      i18n.addTranslations(locale, translations, merge),
    addRouteTranslations: (
      locale: string,
      routeName: string,
      translations: Record<string, unknown>,
      merge = true,
    ): void => i18n.addRouteTranslations(locale, routeName, translations, merge),
    mergeTranslations: (
      locale: string,
      routeName: string,
      translations: Record<string, unknown>,
    ): void => i18n.mergeTranslations(locale, routeName, translations),
    clearCache: (): void => i18n.clearCache(),
  };
}

export interface LocaleHeadOptions {
  baseUrl?: string;
  addDirAttribute?: boolean;
  addSeoAttributes?: boolean;
}

export interface LocaleHeadResult {
  htmlAttrs: {
    lang?: string;
    dir?: "ltr" | "rtl" | "auto";
  };
  link: Array<{ rel: string; href: string; hreflang?: string }>;
  meta: Array<{ property: string; content: string }>;
}

export function useLocaleHead(
  astro: AstroGlobal,
  options: LocaleHeadOptions = {},
): LocaleHeadResult {
  const { baseUrl = "/", addDirAttribute = true, addSeoAttributes = true } = options;
  const locale = getLocale(astro);
  const defaultLocale = getDefaultLocale(astro);
  const allLocales = getLocales(astro);
  const locales = allLocales.filter((l) => !l.disabled);
  const localesForSeo = locales.filter((l) => l.seo !== false);
  const currentLocaleObj = locales.find((l) => l.code === locale);
  if (!currentLocaleObj) return { htmlAttrs: {}, link: [], meta: [] };

  const currentIso = currentLocaleObj.iso || locale;
  const currentDir = currentLocaleObj.dir || "auto";

  const result: LocaleHeadResult = {
    htmlAttrs: { lang: currentIso, ...(addDirAttribute ? { dir: currentDir } : {}) },
    link: [],
    meta: [],
  };
  if (!addSeoAttributes) return result;

  const canonicalUrl = `${baseUrl}${astro.url.pathname}`;
  result.link.push({ rel: "canonical", href: canonicalUrl });
  const routingStrategy = getRoutingStrategy(astro);
  const allLocaleCodes = locales.map((l) => l.code);

  for (const loc of localesForSeo) {
    let alternatePath = astro.url.pathname;
    if (routingStrategy?.switchLocalePath) {
      alternatePath = routingStrategy.switchLocalePath(
        astro.url.pathname,
        loc.code,
        allLocaleCodes,
        defaultLocale,
      );
    } else {
      const { pathWithoutLocale } = getPathWithoutLocale(astro.url.pathname, allLocaleCodes);
      const segments = getPathSegments(pathWithoutLocale);
      if (loc.code !== defaultLocale) segments.unshift(loc.code);
      alternatePath = withLeadingSlash(segments.join("/"));
    }

    const alternateUrl = `${baseUrl}${alternatePath}`;
    result.link.push({ rel: "alternate", href: alternateUrl, hreflang: loc.code });
    if (loc.iso && loc.iso !== loc.code) {
      result.link.push({ rel: "alternate", href: alternateUrl, hreflang: loc.iso });
    }
  }

  const defaultLocaleObj = locales.find((l) => l.code === defaultLocale);
  if (defaultLocaleObj?.seo !== false) {
    let xDefaultPath = astro.url.pathname;
    if (routingStrategy?.switchLocalePath) {
      xDefaultPath = routingStrategy.switchLocalePath(
        astro.url.pathname,
        defaultLocale,
        allLocaleCodes,
        defaultLocale,
      );
    } else {
      const { pathWithoutLocale } = getPathWithoutLocale(astro.url.pathname, allLocaleCodes);
      xDefaultPath = withLeadingSlash(getPathSegments(pathWithoutLocale).join("/"));
    }

    result.link.push({
      rel: "alternate",
      href: `${baseUrl}${xDefaultPath}`,
      hreflang: "x-default",
    });
  }

  result.meta.push({ property: "og:locale", content: currentIso });
  result.meta.push({ property: "og:url", content: canonicalUrl });

  for (const loc of localesForSeo) {
    if (loc.code === locale) continue;
    result.meta.push({
      property: "og:locale:alternate",
      content: loc.og || loc.iso || loc.code,
    });
  }

  return result;
}

export interface I18nClientProps {
  locale: string;
  fallbackLocale: string;
  translations: Record<string, Translations>;
  currentRoute: string;
}

function setNestedValue(obj: Translations, key: string, value: unknown): void {
  const parts = key.split(".");
  let current: Translations = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (!current[part]) current[part] = {};
    current = current[part] as Translations;
  }
  const last = parts[parts.length - 1];
  if (last !== undefined) current[last] = value;
}

export function getI18nProps(astro: AstroGlobal, keys?: string[]): I18nClientProps {
  const i18n = getI18n(astro);
  const locale = getLocale(astro);
  const fallbackLocale = getDefaultLocale(astro);
  const currentRoute = i18n.getRoute();
  const translations: Record<string, Translations> = {};

  if (keys && keys.length > 0) {
    const extracted: Translations = {};
    for (const key of keys) {
      const value = i18n.t(key, undefined, undefined, currentRoute);
      if (value !== null && value !== undefined && value !== key) {
        setNestedValue(extracted, key, value);
      }
    }
    if (Object.keys(extracted).length > 0) {
      translations[currentRoute] = extracted;
    }
  } else {
    const routeTrans = i18n.getRouteTranslations(locale, currentRoute);
    if (routeTrans) translations[currentRoute] = routeTrans;
  }

  return {
    locale,
    fallbackLocale,
    currentRoute,
    translations,
  };
}
