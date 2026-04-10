import { type H3Event, getCookie, getQuery, getRequestURL } from "h3";
import { getLocaleFromPath } from "@i18n-micro/utils";

export const detectCurrentLocale = (
  event: H3Event,
  config: { fallbackLocale?: string; defaultLocale?: string; locales?: { code: string }[] },
  defaultLocale?: string,
): string => {
  const { fallbackLocale, defaultLocale: configDefaultLocale, locales } = config;

  if (event.context.params?.locale) {
    return event.context.params.locale.toString();
  }

  const queryLocale = getQuery(event)?.locale;
  if (queryLocale) {
    return queryLocale.toString();
  }

  if (locales && locales.length > 0) {
    const url = getRequestURL(event);
    const localeCodes = locales.map((l) => l.code);
    const localeFromPath = getLocaleFromPath(url.pathname, localeCodes);
    if (localeFromPath) {
      return localeFromPath;
    }
  }

  return (
    getCookie(event, "user-locale") ||
    event.headers.get("accept-language")?.split(",")[0] ||
    fallbackLocale ||
    defaultLocale ||
    configDefaultLocale ||
    "en"
  ).toString();
};
