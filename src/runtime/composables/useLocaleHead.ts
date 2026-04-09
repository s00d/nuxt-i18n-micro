import { isNoPrefixStrategy } from "@i18n-micro/core";
import type { Locale, ModuleOptionsExtend } from "@i18n-micro/types";
import { filterQueryByWhitelist, getPathSegments } from "@i18n-micro/utils";
import { joinURL, parseURL } from "ufo";
import { ref, unref, watch } from "vue";
import { useNuxtApp, useRoute } from "#app";
import { findAllowedLocalesForRoute } from "../utils/route-utils";

interface MetaLink {
  [key: string]: string | undefined;
  rel: string;
  href: string;
  hreflang?: string;
}

interface MetaTag {
  [key: string]: string;
  property: string;
  content: string;
}

interface MetaObject {
  htmlAttrs: {
    lang?: string;
    dir?: "ltr" | "rtl" | "auto";
  };
  link: MetaLink[];
  meta: MetaTag[];
}

interface UseLocaleHeadOptions {
  addDirAttribute?: boolean;
  identifierAttribute?: string;
  addSeoAttributes?: boolean;
  baseUrl?: string;
  autoUpdate?: boolean;
}

export const useLocaleHead = ({
  addDirAttribute = true,
  identifierAttribute = "id",
  addSeoAttributes = true,
  baseUrl = "/",
  autoUpdate = true,
}: UseLocaleHeadOptions = {}) => {
  const nuxtApp = useNuxtApp();
  const route = useRoute();
  const metaObject = ref<MetaObject>({
    htmlAttrs: {},
    link: [],
    meta: [],
  });

  function filterLocalizedHref(pathOrUrl: string, whitelist: string[]): string {
    if (!pathOrUrl) return "";

    const parsed = parseURL(pathOrUrl);
    const filteredPath = filterQueryByWhitelist(pathOrUrl, whitelist);

    // Keep absolute locale URLs absolute (multi-domain mode).
    if (parsed.protocol && parsed.host) {
      return `${parsed.protocol}//${parsed.host}${filteredPath}`;
    }

    return filteredPath;
  }

  function updateMeta() {
    // On 404 pages, route.matched will be empty.
    // We should not generate SEO tags for pages that don't exist.
    if (
      route.matched.length === 0 ||
      route.matched.some((record) => record.name === "custom-fallback-route")
    ) {
      // Clear metaObject to ensure no tags are generated for 404 pages
      metaObject.value = { htmlAttrs: {}, link: [], meta: [] };
      return;
    }

    const i18nConfig = nuxtApp.$getI18nConfig() as ModuleOptionsExtend;
    const { canonicalQueryWhitelist, routeLocales, localizedRouteNamePrefix } = i18nConfig;
    const strategy = i18nConfig.strategy;
    const localizedRouteNamePrefixResolved = localizedRouteNamePrefix || "localized-";
    const { $getLocales, $getLocale, $switchLocalePath } = nuxtApp;
    const allLocales = ($getLocales ? unref($getLocales()) : i18nConfig.locales) ?? [];
    const firstSegment = getPathSegments(route.path)[0];
    const fallbackLocale =
      allLocales.find((loc: Locale) => loc.code === firstSegment)?.code ||
      i18nConfig.defaultLocale ||
      "en";
    const locale = ($getLocale ? unref($getLocale()) : fallbackLocale) || fallbackLocale;
    const switchLocalePath = $switchLocalePath || (() => "");
    const routeName = (route.name ?? "").toString();
    const currentLocale = allLocales.find((loc: Locale) => loc.code === locale);
    if (!currentLocale) return;

    // Find allowed locales for this route using the utility function
    const currentRouteLocales = findAllowedLocalesForRoute(
      route,
      routeLocales,
      localizedRouteNamePrefixResolved,
    );

    // Filter out disabled locales and apply $defineI18nRoute restrictions
    const enabledLocales = allLocales.filter((loc: Locale) => !loc.disabled);
    const locales = currentRouteLocales
      ? enabledLocales.filter((loc: Locale) => currentRouteLocales.includes(loc.code))
      : enabledLocales;

    const currentIso = currentLocale.iso || locale;
    const currentOg = currentLocale.og || currentIso;
    const currentDir = currentLocale.dir || "auto";

    let fullPath = unref(route.fullPath);
    if (!fullPath.startsWith("/")) {
      fullPath = `/${fullPath}`;
    }

    // Sort locales by code length (longest first) to avoid
    // partial matching (e.g. 'en' matching inside '/enGB')
    const matchedLocale = [...locales]
      .sort((a, b) => b.code.length - a.code.length)
      .find((locale) => fullPath.startsWith(`/${locale.code}`));

    let localizedPath = fullPath;
    let ogUrl: string;
    let canonicalPath: string;

    if (routeName.startsWith(localizedRouteNamePrefixResolved) && matchedLocale) {
      localizedPath = fullPath.slice(matchedLocale.code.length + 1);
      canonicalPath = filterQueryByWhitelist(localizedPath, canonicalQueryWhitelist ?? []);
      ogUrl = joinURL(unref(baseUrl), locale, canonicalPath);
    } else {
      canonicalPath = filterQueryByWhitelist(fullPath, canonicalQueryWhitelist ?? []);
      ogUrl = joinURL(unref(baseUrl), canonicalPath);
    }

    metaObject.value = {
      htmlAttrs: {
        lang: currentIso,
        ...(addDirAttribute ? { dir: currentDir } : {}),
      },
      link: [],
      meta: [],
    };

    if (!addSeoAttributes) return;

    // Locales included in hreflang / og:locale:alternate (omit `seo: false`)
    const localesForSeo = locales.filter((loc: Locale) => loc.seo !== false);

    const ogLocaleMeta = {
      [identifierAttribute]: "i18n-og",
      property: "og:locale",
      content: unref(currentOg),
    };

    const ogUrlMeta = {
      [identifierAttribute]: "i18n-og-url",
      property: "og:url",
      content: ogUrl,
    };

    const alternateOgLocalesMeta = localesForSeo
      .filter((loc: Locale) => loc.code !== locale)
      .map((loc: Locale) => {
        const ogAlt = loc.og || loc.iso || loc.code;
        return {
          [identifierAttribute]: `i18n-og-alt-${ogAlt}`,
          property: "og:locale:alternate",
          content: unref(ogAlt),
        };
      });

    const canonicalLink = {
      [identifierAttribute]: "i18n-can",
      rel: "canonical",
      href: ogUrl,
    };

    const defaultLocale = i18nConfig.defaultLocale || "en";
    const defaultLocaleObj = allLocales.find((loc: Locale) => loc.code === defaultLocale);
    const whitelist = canonicalQueryWhitelist ?? [];

    const alternateLinks = isNoPrefixStrategy(strategy!)
      ? []
      : localesForSeo.flatMap((loc: Locale) => {
          const switchedPath = switchLocalePath(loc.code);
          if (!switchedPath) {
            return [];
          }

          // $switchLocalePath returns a full URL (with baseUrl) if locale has baseUrl, otherwise just a path
          let href: string;
          if (switchedPath.startsWith("http://") || switchedPath.startsWith("https://")) {
            // It's already a full URL, preserve origin but filter query params.
            href = filterLocalizedHref(switchedPath, whitelist);
          } else {
            // It's just a path, prepend baseUrl
            const filteredPath = filterLocalizedHref(switchedPath, whitelist);
            href = joinURL(
              unref(baseUrl),
              filteredPath.startsWith("/") ? filteredPath : `/${filteredPath}`,
            );
          }

          const links: MetaLink[] = [
            {
              [identifierAttribute]: `i18n-alternate-${loc.code}`,
              rel: "alternate",
              href,
              hreflang: unref(loc.code),
            },
          ];

          if (loc.iso && loc.iso !== loc.code) {
            links.push({
              [identifierAttribute]: `i18n-alternate-${loc.iso}`,
              rel: "alternate",
              href,
              hreflang: unref(loc.iso),
            });
          }

          return links;
        });

    // Generate x-default hreflang link pointing to the default locale's URL.
    // x-default tells search engines which URL to show when none of the
    // specified languages match the user's browser settings.
    let xDefaultLink: MetaLink | null = null;
    if (!isNoPrefixStrategy(strategy!) && defaultLocaleObj?.seo !== false) {
      const defaultSwitchedPath = switchLocalePath(defaultLocale);
      if (defaultSwitchedPath) {
        let xDefaultHref: string;
        if (
          defaultSwitchedPath.startsWith("http://") ||
          defaultSwitchedPath.startsWith("https://")
        ) {
          xDefaultHref = filterLocalizedHref(defaultSwitchedPath, whitelist);
        } else {
          const filteredPath = filterLocalizedHref(defaultSwitchedPath, whitelist);
          xDefaultHref = joinURL(
            unref(baseUrl),
            filteredPath.startsWith("/") ? filteredPath : `/${filteredPath}`,
          );
        }
        xDefaultLink = {
          [identifierAttribute]: "i18n-xd",
          rel: "alternate",
          href: xDefaultHref,
          hreflang: "x-default",
        };
      }
    }

    metaObject.value.meta = [ogLocaleMeta, ogUrlMeta, ...alternateOgLocalesMeta];
    metaObject.value.link = [
      canonicalLink,
      ...alternateLinks,
      ...(xDefaultLink ? [xDefaultLink] : []),
    ];
  }

  if (autoUpdate) {
    // Keep head payload in sync automatically for manual usage
    // (e.g. when 02.meta plugin is disabled with `meta: false`).
    watch(
      () => [route.fullPath, route.name, route.matched.length],
      () => updateMeta(),
      { immediate: true },
    );
  }

  return { metaObject, updateMeta };
};
