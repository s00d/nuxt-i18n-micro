import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { a as subscribe_to_store, c as noop, n as push_element, o as escape_html, r as bind_props, s as FILENAME, t as pop_element } from "./dev_D9TJDQoK.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { i as j, t as I } from "./dist_CtMX8yra.mjs";
import { t as $$Layout } from "./Layout_DAOroRq6.mjs";
import { n as ReactCard, r as l, t as VueCounter_default } from "./VueCounter_DG762xPR.mjs";
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/client/reactivity/equality.js
/**
* @param {unknown} a
* @param {unknown} b
* @returns {boolean}
*/
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/store/shared/index.js
/** @import { Readable, StartStopNotifier, Subscriber, Unsubscriber, Updater, Writable } from '../public.js' */
/** @import { Stores, StoresValues, SubscribeInvalidateTuple } from '../private.js' */
/**
* @type {Array<SubscribeInvalidateTuple<any> | any>}
*/
var subscriber_queue = [];
/**
* Create a `Writable` store that allows both updating and reading by subscription.
*
* @template T
* @param {T} [value] initial value
* @param {StartStopNotifier<T>} [start]
* @returns {Writable<T>}
*/
function writable(value, start = noop) {
	/** @type {Unsubscriber | null} */
	let stop = null;
	/** @type {Set<SubscribeInvalidateTuple<T>>} */
	const subscribers = /* @__PURE__ */ new Set();
	/**
	* @param {T} new_value
	* @returns {void}
	*/
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) subscriber_queue[i][0](subscriber_queue[i + 1]);
					subscriber_queue.length = 0;
				}
			}
		}
	}
	/**
	* @param {Updater<T>} fn
	* @returns {void}
	*/
	function update(fn) {
		set(fn(value));
	}
	/**
	* @param {Subscriber<T>} run
	* @param {() => void} [invalidate]
	* @returns {Unsubscriber}
	*/
	function subscribe(run, invalidate = noop) {
		/** @type {SubscribeInvalidateTuple<T>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) stop = start(set, update) || noop;
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return {
		set,
		update,
		subscribe
	};
}
/**
* Get the current value from a store by subscribing and immediately unsubscribing.
*
* @template T
* @param {Readable<T>} store
* @returns {T}
*/
function get(store) {
	let value;
	subscribe_to_store(store, (_) => value = _)();
	return value;
}
//#endregion
//#region ../dist/client/svelte.js
function r(e) {
	return writable(e);
}
function i(n) {
	let r = () => get(n);
	return {
		store: n,
		...l(r),
		get locale() {
			return r().locale;
		},
		get fallbackLocale() {
			return r().fallbackLocale;
		},
		get currentRoute() {
			return r().currentRoute;
		},
		setLocale: (e) => {
			n.update((t) => ({
				...t,
				locale: e
			}));
		},
		setRoute: (e) => {
			n.update((t) => ({
				...t,
				currentRoute: e
			}));
		}
	};
}
//#endregion
//#region src/components/islands/SvelteWidget.svelte
SvelteWidget[FILENAME] = "src/components/islands/SvelteWidget.svelte";
function SvelteWidget($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let i18n = $$props["i18n"];
		const { t, locale, tn, tc } = i(r(i18n));
		let count = 0;
		$$renderer.push(`<div class="island-card svelte-card svelte-1ra3epg">`);
		push_element($$renderer, "div", 15, 0);
		$$renderer.push(`<h3>`);
		push_element($$renderer, "h3", 16, 2);
		$$renderer.push(`${escape_html(t("islands.svelte.title"))}</h3>`);
		pop_element();
		$$renderer.push(` <p>`);
		push_element($$renderer, "p", 17, 2);
		$$renderer.push(`${escape_html(t("islands.svelte.description"))}</p>`);
		pop_element();
		$$renderer.push(` <div class="counter svelte-1ra3epg">`);
		push_element($$renderer, "div", 18, 2);
		$$renderer.push(`<button class="svelte-1ra3epg">`);
		push_element($$renderer, "button", 19, 4);
		$$renderer.push(`+</button>`);
		pop_element();
		$$renderer.push(` <span>`);
		push_element($$renderer, "span", 20, 4);
		$$renderer.push(`${escape_html(count)}</span>`);
		pop_element();
		$$renderer.push(` <p>`);
		push_element($$renderer, "p", 21, 4);
		$$renderer.push(`${escape_html(tc("islands.apples", count))}</p>`);
		pop_element();
		$$renderer.push(` <p>`);
		push_element($$renderer, "p", 22, 4);
		$$renderer.push(`${escape_html(t("islands.number", { number: tn(count) }))}</p>`);
		pop_element();
		$$renderer.push(`</div>`);
		pop_element();
		$$renderer.push(` <p class="locale-info svelte-1ra3epg">`);
		push_element($$renderer, "p", 24, 2);
		$$renderer.push(`Locale: ${escape_html(locale)}</p>`);
		pop_element();
		$$renderer.push(`</div>`);
		pop_element();
		bind_props($$props, { i18n });
	}, SvelteWidget);
}
SvelteWidget.render = function() {
	throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
//#endregion
//#region src/pages/islands.astro
var islands_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Islands,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Islands = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Islands;
	const { t } = j(Astro);
	const i18nProps = I(Astro, [
		"islands.vue.title",
		"islands.vue.description",
		"islands.react.title",
		"islands.react.description",
		"islands.svelte.title",
		"islands.svelte.description",
		"islands.apples",
		"islands.number"
	]);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": t("islands.title"),
		"data-astro-cid-lspwwl4o": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main data-astro-cid-lspwwl4o><h1 data-astro-cid-lspwwl4o>${t("islands.title")}</h1><p data-astro-cid-lspwwl4o>${t("islands.description")}</p><section data-astro-cid-lspwwl4o><h2 data-astro-cid-lspwwl4o>${t("islands.vue.title")}</h2>${renderComponent($$result, "VueCounter", VueCounter_default, {
		"client:load": true,
		"i18n": i18nProps,
		"data-astro-cid-lspwwl4o": true,
		"client:component-hydration": "load",
		"client:component-path": "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/islands/VueCounter.vue",
		"client:component-export": "default"
	})}</section><section data-astro-cid-lspwwl4o><h2 data-astro-cid-lspwwl4o>${t("islands.react.title")}</h2>${renderComponent($$result, "ReactCard", ReactCard, {
		"client:load": true,
		"i18n": i18nProps,
		"data-astro-cid-lspwwl4o": true,
		"client:component-hydration": "load",
		"client:component-path": "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/islands/ReactCard.tsx",
		"client:component-export": "default"
	})}</section><section data-astro-cid-lspwwl4o><h2 data-astro-cid-lspwwl4o>${t("islands.svelte.title")}</h2>${renderComponent($$result, "SvelteWidget", SvelteWidget, {
		"client:load": true,
		"i18n": i18nProps,
		"data-astro-cid-lspwwl4o": true,
		"client:component-hydration": "load",
		"client:component-path": "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/islands/SvelteWidget.svelte",
		"client:component-export": "default"
	})}</section></main>` })}`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/islands.astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/islands.astro";
var $$url = "/docs/islands";
//#endregion
//#region \0virtual:astro:page:src/pages/islands@_@astro
var page = () => islands_exports;
//#endregion
export { page };
