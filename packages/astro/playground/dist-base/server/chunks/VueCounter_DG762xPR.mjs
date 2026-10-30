import { h as i$1, m as u, p as b, u as M } from "./middleware-5NzrkLDL_oNfUmemX.mjs";
import { computed, defineComponent, mergeProps, provide, ref, shallowRef, toValue, useSSRContext, watch } from "vue";
import { ssrInterpolate, ssrRenderAttrs } from "vue/server-renderer";
import React, { createContext, useContext, useMemo, useState } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region ../dist/core-UsCull9I.js
function i(e, t, n) {
	let i = n || e.currentRoute, a = Object.prototype.hasOwnProperty.call(e.translations, i) ? e.translations[i] : void 0;
	return i$1(a, t) ?? null;
}
function a(e, t, r, a, o) {
	if (!t) return "";
	let s = i(e, t, o) ?? (a || t);
	return typeof s == "string" && r ? u(s, r) : s;
}
function o$1(e, r, a, o) {
	let { count: s, ...c } = typeof a == "number" ? { count: a } : a;
	return s == null ? o ?? r : b(r, Number(s), c, e.locale, (t, r, a) => {
		let o = i(e, t);
		return o === null ? a === void 0 ? void 0 : a || t : r && typeof o == "string" ? u(o, r) : o;
	}) ?? o ?? r;
}
function s$2(e, t, n) {
	return i(e, t, n) !== null;
}
var c$2 = /*#__PURE__*/ new M();
function l(e) {
	let t = (t, n, r, i) => a(e(), t, n, r, i);
	return {
		t,
		ts: (e, n, r, i) => t(e, n, r, i)?.toString() ?? r ?? e,
		tc: (t, n, r) => o$1(e(), t, n, r),
		tn: (t, n) => c$2.formatNumber(t, e().locale, n),
		td: (t, n) => c$2.formatDate(t, e().locale, n),
		tdr: (t, n) => c$2.formatRelativeTime(t, e().locale, n),
		has: (t, n) => s$2(e(), t, n),
		getRoute: () => e().currentRoute
	};
}
//#endregion
//#region ../dist/client/react.js
var o = createContext(null);
function s$1({ children: e, value: n }) {
	let [r, s] = useState(n), [c, l] = useState(n);
	c !== n && (l(n), s(n));
	let u = useMemo(() => ({
		state: r,
		setState: s
	}), [r]);
	return React.createElement(o.Provider, { value: u }, e);
}
function c$1() {
	let t = useContext(o);
	if (!t) throw Error("useAstroI18n must be used within an I18nProvider");
	let { state: n, setState: a } = t;
	return {
		...useMemo(() => l(() => n), [n]),
		locale: n.locale,
		fallbackLocale: n.fallbackLocale,
		currentRoute: n.currentRoute,
		setLocale: (e) => a((t) => ({
			...t,
			locale: e
		})),
		setRoute: (e) => a((t) => ({
			...t,
			currentRoute: e
		}))
	};
}
//#endregion
//#region src/components/islands/ReactCard.tsx
var _jsxFileName = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/islands/ReactCard.tsx";
function CardContent() {
	const { t, locale, tn, tc } = c$1();
	const [count, setCount] = useState(0);
	return /* @__PURE__ */ jsxDEV("div", {
		className: "island-card react-card",
		children: [
			/* @__PURE__ */ jsxDEV("h3", { children: t("islands.react.title") }, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 18,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ jsxDEV("p", { children: t("islands.react.description") }, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 19,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ jsxDEV("div", {
				className: "counter",
				children: [
					/* @__PURE__ */ jsxDEV("button", {
						type: "button",
						onClick: () => setCount(count + 1),
						children: "+"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 21,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ jsxDEV("span", { children: count }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 24,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ jsxDEV("p", { children: tc("islands.apples", count) }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 25,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ jsxDEV("p", { children: t("islands.number", { number: tn(count) }) }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 26,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 20,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ jsxDEV("p", {
				className: "locale-info",
				children: ["Locale:", locale]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 28,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 17,
		columnNumber: 5
	}, this);
}
function ReactCard({ i18n }) {
	return /* @__PURE__ */ jsxDEV(s$1, {
		value: i18n,
		children: /* @__PURE__ */ jsxDEV(CardContent, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 39,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 38,
		columnNumber: 5
	}, this);
}
//#endregion
//#region ../dist/client/vue.js
var s = Symbol("i18n-astro");
function c(e) {
	let t = shallowRef(toValue(e));
	return watch(() => toValue(e), (e) => {
		t.value = e;
	}), provide(s, t), t;
}
//#endregion
//#region \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
//#endregion
//#region src/components/islands/VueCounter.vue
var _sfc_main = /*@__PURE__*/ defineComponent({
	__name: "VueCounter",
	props: { i18n: {
		type: Object,
		required: true
	} },
	setup(__props, { expose: __expose }) {
		__expose();
		const props = __props;
		const state = c(() => props.i18n);
		const formatter = new M();
		const t = (key, params, defaultValue, routeName) => {
			return a(state.value, key, params, defaultValue, routeName);
		};
		const tc = (key, count, defaultValue) => {
			const { count: countValue, ...params } = typeof count === "number" ? { count } : count;
			if (countValue === void 0) return defaultValue ?? key;
			const getter = (k, p, dv) => {
				return t(k, p, dv);
			};
			return b(key, Number.parseInt(countValue.toString(), 10), params, state.value.locale, getter) ?? defaultValue ?? key;
		};
		const tn = (value, options) => {
			return formatter.formatNumber(value, state.value.locale, options);
		};
		const locale = computed(() => state.value.locale);
		const count = ref(0);
		const increment = () => count.value++;
		const __returned__ = {
			props,
			state,
			formatter,
			t,
			tc,
			tn,
			locale,
			count,
			increment
		};
		Object.defineProperty(__returned__, "__isScriptSetup", {
			enumerable: false,
			value: true
		});
		return __returned__;
	}
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "island-card vue-card" }, _attrs))} data-v-808640ab><h3 data-v-808640ab>${ssrInterpolate($setup.t("islands.vue.title"))}</h3><p data-v-808640ab>${ssrInterpolate($setup.t("islands.vue.description"))}</p><div class="counter" data-v-808640ab><button data-v-808640ab>+</button><span data-v-808640ab>${ssrInterpolate($setup.count)}</span><p data-v-808640ab>${ssrInterpolate($setup.tc("islands.apples", $setup.count))}</p><p data-v-808640ab>${ssrInterpolate($setup.t("islands.number", { number: $setup.tn($setup.count) }))}</p></div><p class="locale-info" data-v-808640ab>Locale: ${ssrInterpolate($setup.locale)}</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/islands/VueCounter.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var VueCounter_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [
	["ssrRender", _sfc_ssrRender],
	["__scopeId", "data-v-808640ab"],
	["__file", "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/islands/VueCounter.vue"]
]);
//#endregion
export { ReactCard as n, l as r, VueCounter_default as t };
