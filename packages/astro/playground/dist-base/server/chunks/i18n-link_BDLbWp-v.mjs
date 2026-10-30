import { S as createAstro, d as maybeRenderHead, p as addAttribute, s as renderSlot, t as spreadAttributes, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { c as a, d as C, f as D, m as u, o as w, s as i } from "./middleware-5NzrkLDL_oNfUmemX.mjs";
//#region ../src/request.ts
/** `path`, which has no `base`, as a URL of the site. */
function withBase(path, base) {
	if (!base) return path;
	return path === "/" ? base : `${base}${path}`;
}
/** A scheme this router has no business with: `sms:`, `ftp:`, `javascript:`. `externalLinkHref` handles the common ones. */
var SCHEME = /^[a-z][a-z\d+.-]*:/i;
/**
* `href` as a link to `locale`. What leaves the app, and a bare `#hash` or `?query`, stays as
* written; a route is localized and keeps its query, hash and trailing slash.
*/
function localizeHref(href, locale, context) {
	if (href === "" || href[0] === "#" || href[0] === "?") return href;
	const external = D(href) ?? (SCHEME.test(href) ? href : void 0);
	if (external) return external;
	const { strategy, codes, defaultLocale, base, from = "/" } = context;
	const cut = href.search(/[?#]/);
	const raw = cut === -1 ? href : href.slice(0, cut);
	const path = raw[0] === "/" ? w(raw, base) : `${from === "/" ? "" : from}/${raw}`;
	const localized = strategy.localizePath(path, locale, codes, defaultLocale);
	return `${withBase(localized + (raw.length > 1 && raw.endsWith("/") && !localized.endsWith("/") ? "/" : ""), base)}${cut === -1 ? "" : href.slice(cut)}`;
}
//#endregion
//#region ../src/router/adapter.ts
/** A dynamic segment by its name: `[slug]` and `[...slug]` are `slug`, as a page dictionary's folder names them. */
var PARAM = /\[(?:\.\.\.)?([^\]]+)\]/g;
function segmentsOf(path, locales) {
	const segments = path.split("/").filter(Boolean);
	if (segments[0] !== void 0 && locales.includes(segments[0])) segments.shift();
	return segments;
}
/** `/en/blog/post` → `blog-post`, `/blog/[slug]` → `blog-slug`, `/` → `index`. */
function routeNameFromPath(path, locales = []) {
	const segments = segmentsOf(path, locales);
	return segments.length === 0 ? "index" : segments.join("-").replace(PARAM, "$1");
}
var removeLocale = (path, locales = []) => `/${segmentsOf(path, locales).join("/")}`;
/** `path` in `locale`: no prefix for the default locale, or for every locale when no default is given and `locale` is empty. */
function addLocale(path, locale, locales = [], defaultLocale) {
	const segments = segmentsOf(path, locales);
	if (locale !== defaultLocale) segments.unshift(locale);
	return `/${segments.join("/")}`;
}
/**
* Prefix-except-default routing over plain paths. Paths here never carry Astro's `base`: the
* middleware strips it from what comes in and adds it to what goes out.
*/
function createAstroRouterAdapter(locales, defaultLocale, getCurrentUrl) {
	const localeCodes = locales.map((locale) => locale.code);
	const currentUrl = () => getCurrentUrl?.() ?? (typeof window !== "undefined" ? new URL(window.location.href) : null);
	return {
		getCurrentPath: () => currentUrl()?.pathname ?? "/",
		getRouteName: (path, codes = [], pattern) => routeNameFromPath(pattern ?? path, codes),
		getLocaleFromPath: (path, fallback = "en", codes = []) => i(`/${path.replace(/^\/+/, "")}`, codes) ?? fallback,
		switchLocalePath: addLocale,
		localizePath: addLocale,
		removeLocaleFromPath: removeLocale,
		resolvePath: (to, locale) => addLocale(typeof to === "string" ? to : to.path || "/", locale, localeCodes, defaultLocale),
		getRoute: () => {
			const url = currentUrl();
			return url ? {
				fullPath: url.pathname + url.search,
				query: Object.fromEntries(url.searchParams)
			} : {
				fullPath: "/",
				query: {}
			};
		},
		push: (target) => {
			if (typeof window !== "undefined") window.location.href = target.path;
		},
		replace: (target) => {
			if (typeof window !== "undefined") window.location.replace(target.path);
		}
	};
}
//#endregion
//#region ../src/utils.ts
/**
* Get i18n instance from Astro context
*/
function getI18n(astro) {
	const i18n = astro.locals.i18n;
	if (!i18n) throw new Error("i18n instance not found. Make sure i18n middleware is configured.");
	return i18n;
}
/**
* Get current locale from Astro context
*/
function getLocale(astro) {
	return astro.locals.locale ?? getI18n(astro).getLocale();
}
/**
* Get default locale from Astro context
*/
function getDefaultLocale(astro) {
	return astro.locals.defaultLocale ?? getI18n(astro).getFallbackLocale();
}
/**
* Get all locales from Astro context
*/
function getLocales(astro) {
	return astro.locals.locales || [];
}
/** How this request builds URLs. Without the middleware's strategy, the default one. */
function hrefContext(astro) {
	const { locals } = astro;
	const base = locals.i18nBase ?? "";
	const defaultLocale = getDefaultLocale(astro);
	const locales = getLocales(astro);
	return {
		base,
		defaultLocale,
		codes: a(locales),
		strategy: locals.routingStrategy ?? createAstroRouterAdapter(locales, defaultLocale),
		path: w((locals.currentUrl ?? astro.url).pathname, base)
	};
}
/**
* Use i18n in Astro pages/components
* Returns helper functions for translations
*/
function useI18n(astro) {
	const i18n = getI18n(astro);
	const locale = getLocale(astro);
	const defaultLocale = getDefaultLocale(astro);
	const locales = getLocales(astro);
	const links = hrefContext(astro);
	const { strategy, codes, base, path: currentPath } = links;
	const bare = (path) => w(path, base);
	return {
		locale,
		defaultLocale,
		locales,
		t: (key, params, defaultValue, routeName) => {
			return i18n.t(key, params, defaultValue, routeName);
		},
		ts: (key, params, defaultValue, routeName) => {
			return i18n.ts(key, params, defaultValue, routeName);
		},
		tc: (key, count, defaultValue) => {
			return i18n.tc(key, count, defaultValue);
		},
		tn: i18n.tn.bind(i18n),
		td: i18n.td.bind(i18n),
		tdr: i18n.tdr.bind(i18n),
		has: (key, routeName) => {
			return i18n.has(key, routeName);
		},
		getRoute: () => {
			return i18n.getRoute();
		},
		getRouteName: (path) => path === void 0 ? i18n.getRoute() : strategy.getRouteName(bare(path), codes),
		getLocaleFromPath: (path) => strategy.getLocaleFromPath(path === void 0 ? currentPath : bare(path), defaultLocale, codes),
		switchLocalePath: (newLocale) => withBase(strategy.switchLocalePath(currentPath, newLocale, codes, defaultLocale), base),
		localizePath: (path, targetLocale) => localizeHref(path, targetLocale || locale, links),
		getI18n: () => {
			return i18n;
		},
		getBasePath: (url) => strategy.removeLocaleFromPath(url ? bare(url.pathname) : currentPath, codes),
		addTranslations: (locale, translations, merge = true) => {
			i18n.addTranslations(locale, translations, merge);
		},
		addRouteTranslations: (locale, routeName, translations, merge = true) => {
			i18n.addRouteTranslations(locale, routeName, translations, merge);
		},
		mergeTranslations: (locale, routeName, translations) => {
			i18n.mergeTranslations(locale, routeName, translations);
		},
		clearCache: () => {
			i18n.clearCache();
		}
	};
}
/** `href` of an `<I18nLink>`: relative to the page, in `locale` (default the current one). */
function resolveLinkHref(astro, href, locale) {
	const links = hrefContext(astro);
	return localizeHref(href, locale || getLocale(astro), {
		...links,
		from: links.path
	});
}
/** The text of an `<I18nT>`, `null` when `hideIfEmpty` hides it. With `html`, params arrive escaped; the translation is trusted. */
function resolveI18nT(astro, props) {
	const i18n = getI18n(astro);
	const { defaultValue } = props;
	const host = defaultValue ? Object.create(i18n, { t: { value: (key, params) => i18n.t(key, params, defaultValue) } }) : i18n;
	const text = C(host, props);
	return text && u(text.template, text.params);
}
//#endregion
//#region ../src/components/i18n-link.astro
createAstro("https://astro.build");
var $$I18nLink = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$I18nLink;
	const { href, locale, class: className, ...attrs } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<a${addAttribute(resolveLinkHref(Astro, href, locale), "href")}${addAttribute(className, "class")}${spreadAttributes(attrs)}>${renderSlot($$result, $$slots["default"])}</a>`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/src/components/i18n-link.astro", void 0);
//#endregion
export { resolveI18nT as n, useI18n as r, $$I18nLink as t };
