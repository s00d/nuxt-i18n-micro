//#region ../../core/dist/helpers-nhpL41NQ.js
function a$4(e, t) {
	return `${e}:${t || "index"}`;
}
//#endregion
//#region ../../core/dist/tree-DXUnDc7t.js
var e = (e, t) => Object.prototype.hasOwnProperty.call(e, t);
function t$2(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function n$1(t, n) {
	let r = t[n];
	if (r !== void 0) return (typeof r == "function" || n === "__proto__" || r === Object.prototype[n]) && !e(t, n) ? void 0 : r;
}
function r$2(e, t) {
	if (!e || typeof t != "string" || t === "") return;
	let r = n$1(e, t);
	if (r !== void 0 || t.indexOf(".") === -1) return r;
	let i = e;
	for (let e of t.split(".")) {
		if (typeof i != "object" || !i || e === "length" && Array.isArray(i)) return;
		i = n$1(i, e);
	}
	return i;
}
function i$2(e, t) {
	let n = r$2(e, t);
	return n === void 0 ? null : n;
}
function a$3(e, t) {
	return i$2(e, t) !== null;
}
function o$4(n, r, i) {
	if (typeof r != "string" || r === "" || r === "__proto__") return n;
	if (e(n, r) || r.indexOf(".") === -1) return {
		...n,
		[r]: i
	};
	let a = r.split(".");
	if (a.includes("__proto__")) return n;
	let o = { ...n }, s = a.pop(), c = o;
	for (let e of a) {
		let n = t$2(c[e]) ? { ...c[e] } : {};
		c[e] = n, c = n;
	}
	return c[s] = i, o;
}
function s$3(e, t, n) {
	if (Object.keys(e).length === 0) return c$2(t);
	let r = /* @__PURE__ */ new WeakSet(), i = l$4(e, r);
	return u$4(i, t, r, n?.preserveExisting === !0), i;
}
function c$2(e, n = /* @__PURE__ */ new WeakMap()) {
	let r = n.get(e);
	if (r) return r;
	let i = {};
	n.set(e, i);
	for (let r of Object.keys(e)) {
		if (r === "__proto__") continue;
		let a = e[r];
		i[r] = t$2(a) ? c$2(a, n) : a;
	}
	return i;
}
function l$4(e, t) {
	if (t.has(e)) return e;
	let n = { ...e };
	return t.add(n), n;
}
function u$4(e, t, n, r) {
	for (let i of Object.keys(t)) i !== "__proto__" && (e[i] = d$3(e, i, t[i], n, r));
}
function d$3(n, r, i, a, o) {
	let s = n[r];
	if (t$2(s) && t$2(i)) {
		let e = l$4(s, a);
		return u$4(e, i, a, o), e;
	}
	return o && e(n, r) ? s : i;
}
function f$3(t, n) {
	let r = {}, i = p$3(t, n, "", r, /* @__PURE__ */ new Set());
	for (let r of Object.keys(t)) r.includes(".") && !e(n, r) && a$3(n, r) && delete i[r];
	return Object.keys(r).length === 0 ? i : {
		...i,
		...r
	};
}
function p$3(e, t, n, r, i) {
	let a = { ...e };
	if (i.has(t) || i.has(e)) return a;
	i.add(t).add(e);
	for (let o of Object.keys(t)) {
		let s = t[o];
		o !== "__proto__" && s != null && (a[o] = m$3(e[o], s, g$3(n, o), r, i));
	}
	return i.delete(t), i.delete(e), a;
}
function m$3(e, n, r, i, a) {
	return t$2(e) ? t$2(n) ? p$3(e, n, r, i, a) : (h$3(e, r, i, a), n) : n;
}
function h$3(e, n, r, i) {
	if (!i.has(e)) {
		i.add(e);
		for (let a of Object.keys(e)) {
			let o = e[a], s = `${n}.${a}`;
			a !== "__proto__" && (t$2(o) ? h$3(o, s, r, i) : r[s] = o);
		}
		i.delete(e);
	}
}
var g$3 = (e, t) => e ? `${e}.${t}` : t;
//#endregion
//#region ../../core/dist/link-Czi6PWbc.js
var t$1 = /\{([^{}\s]+)\}/;
var n = 2e3;
var r$1 = 64;
var i$1 = 200;
var a$2 = [
	"zero",
	"one",
	"two",
	"few",
	"many",
	"other"
];
var o$3 = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
};
var s$2 = /* @__PURE__ */ new Map();
function c$1() {
	s$2.clear();
}
function l$3(e) {
	let r = s$2.get(e);
	if (r) return r;
	let i = e.split(t$1);
	return s$2.size >= n && s$2.clear(), s$2.set(e, i), i;
}
function u$3(t, n) {
	if (!n || t.indexOf("{") === -1) return t;
	let r = l$3(t), i = r[0];
	for (let t = 1; t < r.length; t += 2) {
		let a = n$1(n, r[t]);
		i += (a === void 0 ? `{${r[t]}}` : String(a)) + r[t + 1];
	}
	return i;
}
var d$2 = (e) => e.replace(/[&<>"']/g, (e) => o$3[e]);
function f$2(e) {
	let t = {};
	for (let n of Object.keys(e)) {
		let r = e[n];
		r !== void 0 && (t[n] = typeof r == "number" || typeof r == "boolean" ? r : d$2(String(r)));
	}
	return t;
}
var p$2 = /* @__PURE__ */ new Map();
function m$2(e) {
	try {
		let t = new Intl.PluralRules(e), n = Array.from({ length: i$1 }, (e, n) => t.select(n)), r = new Set(n);
		return r.size < 3 ? null : {
			rules: t,
			small: n,
			categories: a$2.filter((e) => r.has(e))
		};
	} catch {
		return null;
	}
}
function h$2(e) {
	let t = p$2.get(e);
	if (t !== void 0) return t;
	p$2.size >= r$1 && p$2.clear();
	let n = m$2(e);
	return p$2.set(e, n), n;
}
var g$2 = (e) => !e[0].includes("{count}") && e.some((e) => e.includes("{count}"));
function _$1(e, t, { rules: n, categories: r, small: i }) {
	let a = r[0] === "zero", o = r.indexOf(i[t] ?? n.select(t));
	return e.length === r.length + 1 && !a ? t === 0 ? 0 : o + 1 : e.length !== r.length || !a && g$2(e) ? -1 : o;
}
function v$1(e, t, n) {
	let r = e.length - 1;
	if (!Number.isInteger(t) || t < 0) return r;
	let i = h$2(n), a = i ? _$1(e, t, i) : -1;
	return a === -1 ? Math.min(t, r) : a;
}
function y$1(e, t, n) {
	let r = e.split("|");
	return r[v$1(r, t, n)].trim();
}
var b$1 = (e, t, n, r, i) => {
	let a = i(e);
	return typeof a != "string" && typeof a != "number" || a === "" ? null : u$3(y$1(String(a), t, r), {
		...n,
		count: t
	});
};
function x$2(e, t) {
	return t.number !== void 0 && t.number !== null ? { number: e.tn(Number(t.number)) } : t.date !== void 0 && t.date !== null ? { date: e.td(t.date) } : t.relativeDate !== void 0 && t.relativeDate !== null ? { relativeDate: e.tdr(t.relativeDate) } : null;
}
function S$1(e, t, n) {
	let { keypath: r, customPluralRule: i } = t, a = Number(t.plural);
	return i ? {
		template: String(i(r, a, n, e.getLocale(), (t, n, r) => e.t(t, n, r)) ?? ""),
		params: {}
	} : e.pluralFunc === b$1 ? {
		template: y$1(String(e.t(r) ?? ""), a, e.getLocale()),
		params: {
			...n,
			count: a
		}
	} : {
		template: e.tc(r, {
			...n,
			count: a
		}),
		params: {}
	};
}
function C$1(e, t) {
	let n = t.html && t.params ? f$2(t.params) : t.params ?? {}, r = x$2(e, t), i = r === null && t.plural !== void 0 && t.plural !== null ? S$1(e, t, n) : {
		template: String(e.t(t.keypath) ?? ""),
		params: r ? {
			...n,
			...r
		} : n
	};
	return t.hideIfEmpty && !i.template.trim() ? null : i;
}
var w$3 = /^(?:https?:\/\/|\/\/|tel:|mailto:)/i;
var T$2 = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:[/?#]|$)/i;
var E$2 = /^[^/?#]+\.(?:html?|php|aspx?|pdf|txt|md|csv|json|xml|ya?ml|js|mjs|css|png|jpe?g|gif|svg|webp|avif|ico|zip|gz|docx?|xlsx?|pptx?)(?:[?#]|$)/i;
function D$2(e) {
	if (typeof e == "string") return w$3.test(e) ? e : T$2.test(e) && !E$2.test(e) ? `https://${e}` : void 0;
}
//#endregion
//#region ../../core/dist/index.mjs
var w$2 = [
	["year", 31536e3],
	["month", 2592e3],
	["day", 86400],
	["hour", 3600],
	["minute", 60],
	["second", 1]
];
function T$1(e) {
	if (!e) return "";
	let t = "";
	for (let n of Object.keys(e).sort()) {
		let r = e[n];
		t += `${n}=${typeof r}:${String(r)}\u0001`;
	}
	return t;
}
var E$1 = 500;
function D$1(e, t, n, r) {
	let i = `${t}\0${T$1(n)}`, a = e.get(i);
	return a === void 0 && (a = r(t, n), e.size >= E$1 && e.clear(), e.set(i, a)), a;
}
var O$2 = (e, t) => new Intl.NumberFormat(e, t);
var k$1 = (e, t) => new Intl.DateTimeFormat(e, t);
var A$1 = (e, t) => new Intl.RelativeTimeFormat(e, t);
function j$1(e, t, n) {
	for (let r = t; r; r = r.slice(0, Math.max(r.lastIndexOf("-"), 0))) {
		let t = e[r]?.[n];
		if (t !== void 0) return t;
	}
}
var M$1 = class {
	constructor(e = {}) {
		this.numberCache = /* @__PURE__ */ new Map(), this.dateCache = /* @__PURE__ */ new Map(), this.relativeCache = /* @__PURE__ */ new Map(), this.numberFormats = e.numberFormats ?? {}, this.datetimeFormats = e.datetimeFormats ?? {}, this.timeZone = e.timeZone;
	}
	setNumberFormats(e) {
		this.numberFormats = e, this.numberCache.clear();
	}
	setDateTimeFormats(e) {
		this.datetimeFormats = e, this.dateCache.clear();
	}
	getNumberFormats() {
		return this.numberFormats;
	}
	getDateTimeFormats() {
		return this.datetimeFormats;
	}
	clearCache() {
		this.numberCache.clear(), this.dateCache.clear(), this.relativeCache.clear();
	}
	resolveNumberFormat(e, t) {
		return j$1(this.numberFormats, e, t);
	}
	resolveDateTimeFormat(e, t) {
		return j$1(this.datetimeFormats, e, t);
	}
	getNumberFormatter(e, t) {
		return D$1(this.numberCache, e, t, O$2);
	}
	getDateTimeFormatter(e, t) {
		return D$1(this.dateCache, e, t, k$1);
	}
	getRelativeTimeFormatter(e, t) {
		return D$1(this.relativeCache, e, t, A$1);
	}
	formatNumber(e, t, n) {
		return this.getNumberFormatter(t, n).format(e);
	}
	formatDate(e, t, n) {
		let r = new Date(e).getTime();
		return Number.isNaN(r) ? "Invalid Date" : this.getDateTimeFormatter(t, this.timeZone ? {
			timeZone: this.timeZone,
			...n
		} : n).format(r);
	}
	formatRelativeTime(e, t, n) {
		let r = (new Date(e).getTime() - Date.now()) / 1e3;
		if (Number.isNaN(r)) return "Invalid Date";
		let i = this.getRelativeTimeFormatter(t, n), a = Math.abs(r), o = w$2.find(([, e]) => a >= e);
		return o ? i.format(Math.sign(r) * Math.floor(a / o[1]), o[0]) : i.format(0, "second");
	}
};
var N$1 = 2e3;
var P$1 = /* @__PURE__ */ new WeakMap();
var F = class {
	constructor(e) {
		this.lastLeaves = /* @__PURE__ */ new Map(), this.translations = e?.translations ?? /* @__PURE__ */ new Map();
	}
	getCache(t, n) {
		return this.translations.get(a$4(t, n));
	}
	hasCache(t, n) {
		return this.translations.has(a$4(t, n));
	}
	hasPageTranslation(e, t) {
		return this.hasCache(e, t);
	}
	getTranslation(t, n, r) {
		return this.lookup(a$4(t, n), r);
	}
	lookup(e, t) {
		let n = this.translations.get(e);
		return n === void 0 ? null : I(this.leavesOf(n), n, t);
	}
	leavesOf(e) {
		if (e === this.lastTree) return this.lastLeaves;
		let t = P$1.get(e);
		return t === void 0 && (t = /* @__PURE__ */ new Map(), P$1.set(e, t)), this.lastTree = e, this.lastLeaves = t, t;
	}
	hasTranslation(e, t) {
		let n = `${e}:`;
		for (let [e, r] of this.translations) if (e.startsWith(n) && i$2(r, t) !== null) return !0;
		return !1;
	}
	setTranslations(t, n, r = "index") {
		this.translations.set(a$4(t, r), n);
	}
	mergeTranslation(t, n, r, i = !1) {
		let a = a$4(t, n), c = s$3(this.translations.get(a) ?? {}, r);
		this.translations.set(a, c);
	}
	loadTranslations(e, t, n = "index") {
		this.mergeTranslation(e, n, t);
	}
	loadPageTranslations(e, t, n) {
		this.mergeTranslation(e, t, n);
	}
	clearCache() {
		this.translations.clear(), this.lastTree = void 0, this.lastLeaves = /* @__PURE__ */ new Map();
	}
};
function I(e, t, n) {
	let r = e.get(n);
	if (r !== void 0) return r;
	let i = i$2(t, n);
	return i === null ? null : (e.size >= N$1 && e.clear(), e.set(n, i), i);
}
var z = class {
	constructor() {
		this.locale = "", this.route = "", this.key = "";
	}
	of(t, n) {
		return (t !== this.locale || n !== this.route || this.key === "") && (this.locale = t, this.route = n, this.key = a$4(t, n)), this.key;
	}
};
function B() {
	try {
		return process.env.NODE_ENV === "production";
	} catch {
		return !1;
	}
}
var V = /* @__PURE__ */ new WeakMap();
var H = (e) => e === "index" || e === "";
var U = class {
	constructor(e = {}) {
		this.activeKey = new z(), this.activeRootKey = new z(), this.fallbackKey = new z(), this.fallbackRootKey = new z(), this.helper = e.helper ?? new F(e.storage), this.formatter = e.formatter ?? new M$1(e);
		let t = e.plural;
		this.pluralFunc = t && t !== b$1 ? (...e) => t(...e) ?? b$1(...e) : b$1, this.missingWarn = e.missingWarn ?? !0, this.missingHandler = e.missingHandler, this.getCustomMissingHandler = e.getCustomMissingHandler;
	}
	touch() {}
	resolveRouteName(e) {
		return typeof e == "string" ? e : this.getRoute();
	}
	resolveLookup(e, t) {
		let n = this.getLocale(), r = this.resolveRouteName(t), i = String(e), a = this.lookupLocale(n, r, i, this.activeKey, this.activeRootKey);
		if (a !== null) return a;
		let o = this.getFallbackLocale();
		return o === n ? null : this.lookupLocale(o, r, i, this.fallbackKey, this.fallbackRootKey);
	}
	lookupLocale(e, t, n, r, i) {
		let a = this.helper.lookup(r.of(e, t), n);
		return a !== null || H(t) ? a : this.helper.lookup(i.of(e, "index"), n);
	}
	resolveHas(e, t) {
		return this.lookupLocale(this.getLocale(), this.resolveRouteName(t), String(e), this.activeKey, this.activeRootKey) !== null;
	}
	resolveTranslationTree(e, t) {
		let n = V.get(e);
		n || V.set(e, n = /* @__PURE__ */ new WeakMap());
		let r = n.get(t);
		return r || n.set(t, r = f$3(e, t)), r;
	}
	resolveTranslations(e) {
		this.touch();
		let t = this.getLocale(), n = this.resolveRouteName(e), r = this.getFallbackLocale(), i = (r === t ? [t] : [r, t]).flatMap((e) => H(n) ? [this.helper.getCache(e, "index")] : [this.helper.getCache(e, "index"), this.helper.getCache(e, n)]).filter((e) => e !== void 0);
		return i.length === 0 ? {} : i.reduce((e, t) => this.resolveTranslationTree(e, t));
	}
	onTranslationsChanged() {}
	getMissingContext(e) {
		return {
			locale: this.getLocale(),
			routeName: this.resolveRouteName(e)
		};
	}
	warnDev(e) {
		this.missingWarn && typeof window < "u" && !B() && console.warn(e);
	}
	warnMissing(e, t) {
		let { locale: n, routeName: r } = this.getMissingContext(t), i = this.getCustomMissingHandler?.() ?? this.missingHandler;
		i ? i(n, String(e), r) : this.warnDev(`Not found '${e}' key in '${n}' locale messages for route '${r}'.`);
	}
	warnMissingFormat(e, t, n) {
		this.warnDev(`Not found '${t}' ${e} format in '${n}' locale. Falling back to default Intl options.`);
	}
	t(e, t, n, r) {
		if (!e) return "";
		this.touch();
		let i = this.resolveLookup(e, r);
		return i == null ? (this.warnMissing(e, r), n || e) : t && typeof i == "string" ? u$3(i, t) : i;
	}
	ts(e, t, n, r) {
		return this.t(e, t, n, r)?.toString() ?? n ?? e;
	}
	tc(e, t, n) {
		this.touch();
		let { count: r, ...i } = typeof t == "number" ? { count: t } : t;
		return r == null ? n ?? e : this.pluralFunc(e, Number(r), i, this.getLocale(), (e, t, n) => {
			let r = this.resolveLookup(e);
			return r == null ? n === void 0 ? void 0 : n || e : t && typeof r == "string" ? u$3(r, t) : r;
		}) ?? (this.resolveLookup(e) === null && this.warnMissing(e), n ?? e);
	}
	tn(e, ...t) {
		this.touch();
		let [n, r] = this.formatArgs("number", t);
		return this.formatter.formatNumber(e, n, r);
	}
	td(e, ...t) {
		this.touch();
		let [n, r] = this.formatArgs("datetime", t);
		return this.formatter.formatDate(e, n, r);
	}
	tdr(e, t) {
		return this.touch(), this.formatter.formatRelativeTime(e, this.getLocale(), t);
	}
	has(e, t) {
		return this.touch(), this.resolveHas(e, t);
	}
	setTranslation(e, t) {
		let n = this.getLocale(), r = this.getRoute(), i = this.helper.getCache(n, r) ?? {};
		this.helper.setTranslations(n, o$4(i, String(e), t), r), this.onTranslationsChanged();
	}
	clearCache() {
		this.helper.clearCache(), this.formatter.clearCache(), c$1(), this.onTranslationsChanged();
	}
	loadTranslationsCore(e, t, n, r = "index") {
		this.write(e, r, t, n);
	}
	loadRouteTranslationsCore(e, t, n, r) {
		this.write(e, t, n, r);
	}
	write(e, t, n, r) {
		r ? this.helper.mergeTranslation(e, t, n) : this.helper.setTranslations(e, n, t), this.onTranslationsChanged();
	}
	extend(e) {
		return Object.assign(this, e);
	}
	formatArgs(e, [t, n, r]) {
		let i = this.getLocale();
		if (typeof t != "string") return [i, t];
		let a = typeof n == "string" ? n : i, o = typeof n == "string" ? r : n, s = e === "number" ? this.formatter.resolveNumberFormat(a, t) : this.formatter.resolveDateTimeFormat(a, t);
		return s || this.warnMissingFormat(e, t, a), [a, s && o ? {
			...s,
			...o
		} : s ?? o];
	}
};
function W(e) {
	let t = e.locale, n = e.fallbackLocale ?? e.locale, r = e.route ?? "index", i = 0, a = /* @__PURE__ */ new Set(), o = () => {
		i++;
		let e;
		for (let t of [...a]) if (a.has(t)) try {
			t();
		} catch (t) {
			e ??= { error: t };
		}
		if (e) throw e.error;
	};
	return {
		subscribe(e) {
			return a.add(e), () => a.delete(e);
		},
		getSnapshot() {
			return `${t}:${r}:${i}`;
		},
		getLocale() {
			return t;
		},
		setLocale(e) {
			t !== e && (t = e, o());
		},
		getFallbackLocale() {
			return n;
		},
		setFallbackLocale(e) {
			n !== e && (n = e, o());
		},
		getRoute() {
			return r;
		},
		setRoute(e) {
			r !== e && (r = e, o());
		},
		notify: o
	};
}
//#endregion
//#region ../../runtime/dist/index.mjs
async function a$1(e, t) {
	let n = await fetch(e, t);
	if (!n.ok) throw Error(`[i18n-runtime] Failed to fetch ${e}: ${n.status} ${n.statusText}`);
	return await n.json();
}
var o$2 = class extends F {
	constructor(...e) {
		super(...e), this.shared = !0;
	}
	detach() {
		this.shared && (this.shared = !1, this.translations = new Map(this.translations));
	}
	setTranslations(e, t, n) {
		this.detach(), super.setTranslations(e, t, n);
	}
	mergeTranslation(e, t, n) {
		this.detach(), super.mergeTranslation(e, t, n);
	}
	clearCache() {
		this.detach(), super.clearCache();
	}
};
var s$1 = class extends U {
	constructor(e) {
		let { parent: t } = e;
		super({
			helper: t ? new o$2(t.helper) : void 0,
			formatter: t?.formatter,
			plural: e.plural,
			missingWarn: e.missingWarn,
			missingHandler: e.missingHandler,
			numberFormats: e.numberFormats,
			datetimeFormats: e.datetimeFormats
		}), this.subscribe = (e) => this.store.subscribe(e), this.getSnapshot = () => this.store.getSnapshot(), this.ownStore = W({
			locale: e.locale,
			fallbackLocale: e.fallbackLocale || e.locale,
			route: t?.getRoute()
		}), t && (this.pluralFunc = t.pluralFunc, this.missingWarn = t.missingWarn, this.missingHandler = t.missingHandler, this.getCustomMissingHandler = t.getCustomMissingHandler), (e.messages || e.routeMessages) && this.loadMessages(e.messages, e.routeMessages);
	}
	get storage() {
		return this.helper instanceof o$2 && this.helper.detach(), this.helper;
	}
	get store() {
		return this.ownStore;
	}
	fork(e = this.getLocale()) {
		let t = this.constructor;
		return new t({
			locale: e,
			fallbackLocale: this.getFallbackLocale(),
			parent: this
		});
	}
	get locale() {
		return this.store.getLocale();
	}
	set locale(e) {
		this.store.setLocale(e);
	}
	get fallbackLocale() {
		return this.store.getFallbackLocale();
	}
	set fallbackLocale(e) {
		this.store.setFallbackLocale(e);
	}
	get currentRoute() {
		return this.store.getRoute();
	}
	setRoute(e) {
		this.store.setRoute(e);
	}
	getLocale() {
		return this.store.getLocale();
	}
	getFallbackLocale() {
		return this.store.getFallbackLocale();
	}
	getRoute() {
		return this.store.getRoute();
	}
	loadMessages(e, t) {
		for (let [t, n] of Object.entries(e ?? {})) this.helper.mergeTranslation(t, "index", n);
		for (let [e, n] of Object.entries(t ?? {})) for (let [t, r] of Object.entries(n)) this.helper.mergeTranslation(t, e, r);
		this.onTranslationsChanged();
	}
	async loadFromUrl(e, t = {}) {
		let n = t.locale ?? this.getLocale(), r = await a$1(e, t.init);
		this.addRouteTranslations(n, t.routeName || "index", r);
	}
	async loadFromUrls(e) {
		(await Promise.all(e.map((e) => a$1(e.url, e.init)))).forEach((t, n) => {
			let r = e[n];
			this.addRouteTranslations(r.locale, r.routeName || "index", t);
		});
	}
	addTranslations(e, t, n = !0) {
		this.loadTranslationsCore(e, t, n);
	}
	addRouteTranslations(e, t, n, r = !0) {
		this.loadRouteTranslationsCore(e, t, n, r);
	}
	hasTranslation(e) {
		return this.helper.hasTranslation(this.getLocale(), e);
	}
	clear() {
		this.clearCache();
	}
	onTranslationsChanged() {
		this.store.notify();
	}
};
//#endregion
//#region ../../utils/dist/active-locales.mjs
function o$1(e) {
	return (e ?? []).filter((n) => !n.disabled);
}
function a(e) {
	return o$1(e).map((n) => n.code);
}
//#endregion
//#region ../../utils/dist/cookie.mjs
var o = 31536e3;
//#endregion
//#region ../../utils/dist/accept-language.mjs
var f$1 = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/;
function l$2(t) {
	const n = t.search(/(?:^|;)\s*q=/i);
	if (n === -1) return 1;
	const r = t.indexOf("=", n) + 1, e = t.indexOf(";", r), i = t.slice(r, e === -1 ? void 0 : e).trim();
	return f$1.test(i) ? Number(i) : NaN;
}
var h$1 = (t) => t.includes("_") ? t.replace(/([a-z0-9])_(?=[a-z0-9])/gi, "$1-") : t;
function g$1(t) {
	const n = t.indexOf(";"), r = h$1((n === -1 ? t : t.slice(0, n)).trim()), e = n === -1 ? 1 : l$2(t.slice(n + 1));
	return r && e > 0 ? {
		tag: r,
		q: e
	} : null;
}
function p$1(t) {
	if (!t) return [];
	const n = [];
	let r = !0;
	for (const e of t.split(",")) {
		const i = g$1(e);
		i && (r &&= n.length === 0 || n[n.length - 1].q >= i.q, n.push(i));
	}
	return r || n.sort((e, i) => i.q - e.q), n.map((e) => e.tag);
}
var d$1 = /* @__PURE__ */ new Map([
	["cn", "hans"],
	["sg", "hans"],
	["my", "hans"],
	["tw", "hant"],
	["hk", "hant"],
	["mo", "hant"]
]);
function u$2(t) {
	const n = t.split("-");
	return n.find((e, i) => i > 0 && e.length === 4) || n[0] === "zh" && d$1.get(n[1] ?? "") || "";
}
function m$1(t, n) {
	if (t === "") return !0;
	const r = u$2(n);
	return r === "" || r === t;
}
function x$1(t, n, r) {
	let e = t, i = e.length;
	for (; i !== -1;) {
		e = e.slice(0, i);
		const s = r.indexOf(e);
		if (s !== -1) return n[s];
		i = e.lastIndexOf("-");
	}
	const c = `${e}-`, a = r.some((s) => s.startsWith(c)) ? u$2(t) : "", o = r.findIndex((s) => s.startsWith(c) && m$1(a, s));
	return o === -1 ? null : n[o];
}
function O$1(t, n) {
	const r = p$1(t);
	if (r.length === 0) return null;
	const e = n.map((i) => i.toLowerCase());
	for (const i of r) {
		const c = x$1(i.toLowerCase(), n, e);
		if (c) return c;
	}
	return null;
}
//#endregion
//#region ../../utils/dist/resolve-locale.mjs
var t = (e, a) => typeof e == "string" && a.includes(e);
var r = (e, a) => t(e, a) ? e : null;
function u$1(e) {
	const { validLocales: a } = e, o = e.queryFirst ? e.query : e.url, c = e.queryFirst ? e.url : e.query;
	return r(o, a) ?? r(c, a) ?? r(e.state, a) ?? r(e.cookie, a);
}
function l$1(e) {
	const a = u$1(e);
	if (a) return a;
	const { validLocales: o } = e;
	return e.autoDetectLanguage ? O$1(e.acceptLanguage ?? void 0, o) ?? e.defaultLocale : e.defaultLocale;
}
function i(e, a) {
	const o = e.indexOf("/", 1), c = e.slice(1, o === -1 ? void 0 : o);
	return t(c, a) ? c : null;
}
//#endregion
//#region ../../utils/dist/app-path.mjs
function w$1(e, t) {
	if (!t || t === "/") return e;
	const n = t.endsWith("/") ? t.slice(0, -1) : t;
	return !n || n === "/" ? e : e === n || e === `${n}/` ? "/" : e.startsWith(`${n}/`) ? e.slice(n.length) || "/" : e;
}
//#endregion
//#region ../dist/middleware-5NzrkLDL.js
var s = class extends s$1 {
	constructor(e) {
		super(e), this.initialMessages = e.parent?.initialMessages ?? e.messages ?? {};
	}
	getRouteTranslations(e, t) {
		return this.helper.getCache(e, t) ?? null;
	}
	mergeTranslations(e, t, n) {
		this.addRouteTranslations(e, t, n);
	}
	clearCache() {
		super.clearCache(), this.loadMessages(this.initialMessages);
	}
};
var c = (e) => (e ?? "").replace(/\/+$/, "");
function l(e, t) {
	return t ? e === "/" ? t : `${t}${e}` : e;
}
function u(e, t) {
	try {
		return e.request.headers.get(t);
	} catch {
		return null;
	}
}
function d(e) {
	if (e.isPrerendered) return null;
	let t = u(e, "referer");
	if (!t) return null;
	try {
		let n = new URL(t);
		return n.origin === e.url.origin ? n : null;
	} catch {
		return null;
	}
}
var f = (e) => e?.startsWith("/_server-islands/") === !0 || e?.startsWith("/_actions/") === !0;
function p(e, t) {
	let { routePattern: n, params: r } = e;
	if (!n) return;
	let i = /^\/\[([^\].]+)\]/.exec(n), a = i ? r?.[i[1]] : void 0;
	return a && t.includes(a) ? `/${a}${n.slice(i[0].length)}` : n;
}
function m(e, { defaultLocale: t, locales: n, strategy: r }) {
	let a = i(e, n);
	if (a) return a;
	let o = r.getLocaleFromPath?.(e, t, n) ?? null;
	return o !== t && o !== null && n.includes(o) ? o : null;
}
function h(e, t) {
	let { strategy: n, locales: r, defaultLocale: i, base: a } = t, s = f(e.routePattern), c = s && d(e) || e.url, l = w$1(c.pathname, a), u = m(l, t), h = s ? void 0 : p(e, r);
	return {
		url: c,
		path: l,
		urlLocale: u,
		locale: u ?? i,
		route: n.getRouteName(l, r, h)
	};
}
function g(e, t, n) {
	let r = d(e);
	if (!r || f(e.routePattern)) return null;
	let i = m(w$1(r.pathname, n.base), n) ?? n.defaultLocale;
	return i === t.locale ? null : i;
}
var _ = /^[a-z][a-z\d+.-]*:/i;
function v(t, n, r) {
	if (t === "" || t[0] === "#" || t[0] === "?") return t;
	let i = D$2(t) ?? (_.test(t) ? t : void 0);
	if (i) return i;
	let { strategy: a, codes: s, defaultLocale: c, base: u, from: d = "/" } = r, f = t.search(/[?#]/), p = f === -1 ? t : t.slice(0, f), m = p[0] === "/" ? w$1(p, u) : `${d === "/" ? "" : d}/${p}`, h = a.localizePath(m, n, s, c);
	return `${l(h + (p.length > 1 && p.endsWith("/") && !h.endsWith("/") ? "/" : ""), u)}${f === -1 ? "" : t.slice(f)}`;
}
var y = /\[(?:\.\.\.)?([^\]]+)\]/g;
function b(e, t) {
	let n = e.split("/").filter(Boolean);
	return n[0] !== void 0 && t.includes(n[0]) && n.shift(), n;
}
function x(e, t = []) {
	let n = b(e, t);
	return n.length === 0 ? "index" : n.join("-").replace(y, "$1");
}
var S = (e, t = []) => `/${b(e, t).join("/")}`;
function C(e, t, n = [], r) {
	let i = b(e, n);
	return t !== r && i.unshift(t), `/${i.join("/")}`;
}
function w(e, t, n) {
	let r = e.map((e) => e.code), a = () => n?.() ?? (typeof window < "u" ? new URL(window.location.href) : null);
	return {
		getCurrentPath: () => a()?.pathname ?? "/",
		getRouteName: (e, t = [], n) => x(n ?? e, t),
		getLocaleFromPath: (e, t = "en", n = []) => i(`/${e.replace(/^\/+/, "")}`, n) ?? t,
		switchLocalePath: C,
		localizePath: C,
		removeLocaleFromPath: S,
		resolvePath: (e, n) => C(typeof e == "string" ? e : e.path || "/", n, r, t),
		getRoute: () => {
			let e = a();
			return e ? {
				fullPath: e.pathname + e.search,
				query: Object.fromEntries(e.searchParams)
			} : {
				fullPath: "/",
				query: {}
			};
		},
		push: (e) => {
			typeof window < "u" && (window.location.href = e.path);
		},
		replace: (e) => {
			typeof window < "u" && window.location.replace(e.path);
		}
	};
}
var T = "i18n-locale";
function E(e, t) {
	if (t === null) return null;
	try {
		return e.get(t)?.value ?? null;
	} catch {
		return null;
	}
}
function D(e, t, n) {
	let r = w(t, n);
	if (!e) return r;
	let i = Object.create(e);
	for (let [e, t] of Object.entries(r)) i[e] ??= t;
	return i;
}
function O(e, t, n, r, i, o = T, s, c = !0) {
	return l$1({
		defaultLocale: r,
		validLocales: i,
		autoDetectLanguage: c,
		url: m(e, {
			defaultLocale: r,
			locales: i,
			strategy: D(s, i.map((e) => ({ code: e })), r)
		}),
		cookie: c ? E(t, o) : null,
		acceptLanguage: c ? u({ request: { headers: n } }, "accept-language") : null
	});
}
var k = !1;
function A() {
	k || (k = !0, console.warn("[i18n-micro] i18nIntegration already installs the middleware: pass `middleware: false` to it to use your own createI18nMiddleware."));
}
function j(e) {
	let { i18n: t, defaultLocale: i, localeObjects: a$5, autoDetect: o$5 = !0 } = e, s = e.localeCookie === void 0 ? T : e.localeCookie, u = a$5 ?? e.locales.map((e) => ({ code: e })), d = c(e.base), f = {
		defaultLocale: i,
		base: d,
		locales: a(u).filter((t) => e.locales.includes(t)),
		strategy: D(e.routingStrategy, u, i)
	}, p = {
		path: d || "/",
		maxAge: o,
		sameSite: "lax"
	}, m = async (n, r) => {
		if (n.locals.locale && n.locals.i18n) return n.locals.i18nHandler && n.locals.i18nHandler !== m && A(), r();
		let a = h(n, f), { path: c, url: _, locale: v } = a, y = g(n, a, f) !== null;
		y && s !== null && n.cookies.set(s, v, p);
		let b = !n.isPrerendered && c === "/", x = o$5 && b && !y, S = x ? O(c, n.cookies, n.request.headers, i, f.locales, s, f.strategy) : v, C = S !== v || b && e.redirectToDefault ? N(S, f) : c;
		return C === c ? (Object.assign(n.locals, M(t, a, f, u, m)), P(await r(), x, s)) : P(n.redirect(l(C, d) + _.search, 302), x, s);
	};
	return m;
}
function M(e, t, n, r, i) {
	let { url: a, path: o, locale: s, route: c } = t, l = e.fork(s);
	l.setRoute(c);
	let u = Object.create(n.strategy);
	return u.getCurrentPath = () => o, u.getRoute = () => ({
		fullPath: o + a.search,
		query: Object.fromEntries(a.searchParams)
	}), {
		i18n: l,
		locale: s,
		defaultLocale: n.defaultLocale,
		locales: r,
		currentUrl: a,
		routingStrategy: u,
		i18nBase: n.base,
		i18nHandler: i
	};
}
function N(e, { strategy: t }) {
	let n = t.resolvePath("/", e);
	return (typeof n == "string" ? n : n.path) || "/";
}
function P(e, t, n) {
	if (!t) return e;
	try {
		e.headers.append("Vary", n === null ? "Accept-Language" : "Cookie, Accept-Language");
	} catch {}
	return e;
}
//#endregion
export { r$2 as _, w as a, a as c, C$1 as d, D$2 as f, o$4 as g, i$2 as h, v as i, o$1 as l, u$3 as m, l as n, w$1 as o, b$1 as p, s as r, i as s, j as t, M$1 as u };
