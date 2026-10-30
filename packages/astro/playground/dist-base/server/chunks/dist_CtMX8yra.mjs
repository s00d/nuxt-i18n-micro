import { _ as r, a as w, c as a, g as o$1, i as v, l as o, n as l$1, o as w$1 } from "./middleware-5NzrkLDL_oNfUmemX.mjs";
//#region ../../utils/dist/resolve-og-locale.mjs
function c(n) {
	const t = n.og?.trim();
	if (t) return t;
	const e = n.iso?.trim();
	if (!e) return null;
	const r = e.indexOf("_");
	if (r > 0) {
		const s = e.slice(0, r), o = e.slice(r + 1);
		if (s.length >= 2 && o.length === 2) return `${s.toLowerCase()}_${o.toUpperCase()}`;
	}
	const i = e.indexOf("-");
	if (i > 0) {
		const s = e.slice(0, i), o = e.slice(i + 1);
		if (s.length >= 2 && o.length === 2 && /^[A-Za-z]{2}$/.test(o)) return `${s.toLowerCase()}_${o.toUpperCase()}`;
	}
	return null;
}
function l(n, t = {}) {
	if (c(n) !== null || t.missingWarn === !1 || process.env.NODE_ENV === "production") return;
	const e = t.tag ?? "og:locale", r = String(n.code ?? "unknown"), i = n.iso ? `, iso: '${n.iso}'` : "";
	console.warn(`[i18n] Cannot derive ${e} for locale '${r}'${i}. Set locale.og (e.g. 'en_US') or use iso with a 2-letter region (e.g. 'en-US').`);
}
//#endregion
//#region ../../utils/dist/resolve-hreflang.mjs
function u(n) {
	return n.iso?.trim() || String(n.code);
}
function f(n) {
	const r = n.match(/^([A-Za-z]{2,3})(?:[-_](.+))?$/);
	return r ? {
		language: r[1],
		region: r[2]
	} : { language: n };
}
function d(n, r = {}) {
	const { hreflangBaseLanguage: l = !1 } = r;
	if (!l) return n.map((o) => {
		const t = String(o.code);
		return {
			hreflang: u(o),
			localeCode: t
		};
	});
	const g = /* @__PURE__ */ new Map();
	for (const o of n) {
		const t = String(o.code), a = u(o), { language: e, region: i } = f(a);
		e && i && !g.has(e) && g.set(e, t), g.set(a, t);
	}
	const c = /* @__PURE__ */ new Set(), s = [];
	for (const o of n) {
		const t = String(o.code), a = u(o), { language: e, region: i } = f(a);
		e && i && g.get(e) === t && !c.has(e) && (c.add(e), s.push({
			hreflang: e,
			localeCode: t
		})), c.has(a) || (c.add(a), s.push({
			hreflang: a,
			localeCode: t
		}));
	}
	return s;
}
//#endregion
//#region ../../utils/dist/locale-head.mjs
function O$1(t, e) {
	return `${t.replace(/\/+$/, "")}${e.startsWith("/") ? e : `/${e}`}`;
}
function S(t) {
	const { locale: e, seoLocales: o, hrefOf: i, canonical: a, xDefault: s, alternates: f = !0, addDirAttribute: u = !0, addSeoAttributes: c$1 = !0 } = t, { identifierAttribute: n = "id", hreflangBaseLanguage: A = !1, missingWarn: h = !0 } = t, p = {
		lang: e.iso || e.code,
		...u ? { dir: e.dir || "auto" } : {}
	};
	if (!c$1) return {
		htmlAttrs: p,
		link: [],
		meta: []
	};
	const g = [], m = c(e);
	m ? g.push({
		[n]: "i18n-og",
		property: "og:locale",
		content: m
	}) : l(e, {
		missingWarn: h,
		tag: "og:locale"
	}), g.push({
		[n]: "i18n-og-url",
		property: "og:url",
		content: a
	});
	for (const r of o) {
		if (r.code === e.code) continue;
		const l$2 = c(r);
		l$2 ? g.push({
			[n]: `i18n-og-alt-${l$2}`,
			property: "og:locale:alternate",
			content: l$2
		}) : l(r, {
			missingWarn: h,
			tag: "og:locale:alternate"
		});
	}
	const d$1 = [{
		[n]: "i18n-can",
		rel: "canonical",
		href: a
	}];
	if (f) for (const { hreflang: r, localeCode: l } of d(o, { hreflangBaseLanguage: A })) {
		const $ = i(l);
		$ && d$1.push({
			[n]: `i18n-alternate-${r}`,
			rel: "alternate",
			href: $,
			hreflang: r
		});
	}
	return s && d$1.push({
		[n]: "i18n-xd",
		rel: "alternate",
		href: s,
		hreflang: "x-default"
	}), {
		htmlAttrs: p,
		link: d$1,
		meta: g
	};
}
//#endregion
//#region ../dist/index.mjs
function E(e) {
	let t = e.locals.i18n;
	if (!t) throw Error("i18n instance not found. Make sure i18n middleware is configured.");
	return t;
}
function D(e) {
	return e.locals.locale ?? E(e).getLocale();
}
function O(e) {
	return e.locals.defaultLocale ?? E(e).getFallbackLocale();
}
function k(e) {
	return e.locals.locales || [];
}
function A(e) {
	let { locals: t } = e, n = t.i18nBase ?? "", r = O(e), a$3 = k(e);
	return {
		base: n,
		defaultLocale: r,
		codes: a(a$3),
		strategy: t.routingStrategy ?? w(a$3, r),
		path: w$1((t.currentUrl ?? e.url).pathname, n)
	};
}
function j(n) {
	let r = E(n), i = D(n), a = O(n), o = k(n), s = A(n), { strategy: c, codes: l, base: u, path: d } = s, f = (e) => w$1(e, u);
	return {
		locale: i,
		defaultLocale: a,
		locales: o,
		t: (e, t, n, i) => r.t(e, t, n, i),
		ts: (e, t, n, i) => r.ts(e, t, n, i),
		tc: (e, t, n) => r.tc(e, t, n),
		tn: r.tn.bind(r),
		td: r.td.bind(r),
		tdr: r.tdr.bind(r),
		has: (e, t) => r.has(e, t),
		getRoute: () => r.getRoute(),
		getRouteName: (e) => e === void 0 ? r.getRoute() : c.getRouteName(f(e), l),
		getLocaleFromPath: (e) => c.getLocaleFromPath(e === void 0 ? d : f(e), a, l),
		switchLocalePath: (t) => l$1(c.switchLocalePath(d, t, l, a), u),
		localizePath: (e, n) => v(e, n || i, s),
		getI18n: () => r,
		getBasePath: (e) => c.removeLocaleFromPath(e ? f(e.pathname) : d, l),
		addTranslations: (e, t, n = !0) => {
			r.addTranslations(e, t, n);
		},
		addRouteTranslations: (e, t, n, i = !0) => {
			r.addRouteTranslations(e, t, n, i);
		},
		mergeTranslations: (e, t, n) => {
			r.mergeTranslations(e, t, n);
		},
		clearCache: () => {
			r.clearCache();
		}
	};
}
function M(e) {
	return j(e).getBasePath(e.locals.currentUrl ?? e.url);
}
function N(e) {
	let { locale: t } = e.params;
	if (!t || !a(k(e)).includes(t)) return new Response(null, { status: 404 });
	let n = e.locals.i18n;
	return n && (n.locale = t, e.locals.locale = t), M(e);
}
function P(t, n = {}) {
	let { addDirAttribute: r, addSeoAttributes: i, hreflangBaseLanguage: a } = n, o$2 = n.baseUrl ?? t.site?.origin ?? "", { base: s, defaultLocale: c, codes: l, strategy: u, path: d } = A(t), p = D(t), g = o(k(t)), _ = g.find((e) => e.code === p);
	if (!_) return {
		htmlAttrs: {},
		link: [],
		meta: []
	};
	let v = (t) => O$1(o$2, l$1(u.switchLocalePath(d, t, l, c), s)), y = g.find((e) => e.code === c);
	return S({
		locale: _,
		seoLocales: g.filter((e) => e.seo !== !1),
		hrefOf: v,
		canonical: O$1(o$2, l$1(d, s)),
		xDefault: y?.seo === !1 ? void 0 : v(c),
		addDirAttribute: r,
		addSeoAttributes: i,
		hreflangBaseLanguage: a
	});
}
function F(e, t) {
	let n = {};
	for (let r$1 of t) {
		let t = r(e, r$1);
		t != null && (n = o$1(n, r$1, t));
	}
	return n;
}
function I(e, t) {
	let n = E(e), r = n.getRoute(), i = n.resolveTranslations(r);
	return {
		locale: D(e),
		fallbackLocale: n.getFallbackLocale(),
		currentRoute: r,
		translations: { [r]: t && t.length > 0 ? F(i, t) : i }
	};
}
//#endregion
export { j as i, N as n, P as r, I as t };
