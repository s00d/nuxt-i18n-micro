import * as devalue from "devalue";
import { clsx } from "clsx";
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/errors.js
/**
* The node API `AsyncLocalStorage` is not available, but is required to use async server rendering.
* @returns {never}
*/
function async_local_storage_unavailable() {
	const error = /* @__PURE__ */ new Error(`async_local_storage_unavailable\nThe node API \`AsyncLocalStorage\` is not available, but is required to use async server rendering.\nhttps://svelte.dev/e/async_local_storage_unavailable`);
	error.name = "Svelte error";
	throw error;
}
/**
* Encountered asynchronous work while rendering synchronously.
* @returns {never}
*/
function await_invalid() {
	const error = /* @__PURE__ */ new Error(`await_invalid\nEncountered asynchronous work while rendering synchronously.\nhttps://svelte.dev/e/await_invalid`);
	error.name = "Svelte error";
	throw error;
}
/**
* The `html` property of server render results has been deprecated. Use `body` instead.
* @returns {never}
*/
function html_deprecated() {
	const error = /* @__PURE__ */ new Error(`html_deprecated\nThe \`html\` property of server render results has been deprecated. Use \`body\` instead.\nhttps://svelte.dev/e/html_deprecated`);
	error.name = "Svelte error";
	throw error;
}
/**
* `csp.nonce` was set while `csp.hash` was `true`. These options cannot be used simultaneously.
* @returns {never}
*/
function invalid_csp() {
	const error = /* @__PURE__ */ new Error(`invalid_csp\n\`csp.nonce\` was set while \`csp.hash\` was \`true\`. These options cannot be used simultaneously.\nhttps://svelte.dev/e/invalid_csp`);
	error.name = "Svelte error";
	throw error;
}
/**
* The `idPrefix` option cannot include `--`.
* @returns {never}
*/
function invalid_id_prefix() {
	const error = /* @__PURE__ */ new Error(`invalid_id_prefix\nThe \`idPrefix\` option cannot include \`--\`.\nhttps://svelte.dev/e/invalid_id_prefix`);
	error.name = "Svelte error";
	throw error;
}
/**
* Could not resolve `render` context.
* @returns {never}
*/
function server_context_required() {
	const error = /* @__PURE__ */ new Error(`server_context_required\nCould not resolve \`render\` context.\nhttps://svelte.dev/e/server_context_required`);
	error.name = "Svelte error";
	throw error;
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/context.js
/** @import { SSRContext } from '#server' */
/** @type {SSRContext | null} */
var ssr_context = null;
/** @param {SSRContext | null} v */
function set_ssr_context(v) {
	ssr_context = v;
}
/**
* @param {Function} [fn]
*/
function push(fn) {
	ssr_context = {
		p: ssr_context,
		c: null,
		r: null,
		i: false
	};
	ssr_context.function = fn;
	ssr_context.element = ssr_context.p?.element;
}
function pop() {
	ssr_context = ssr_context.p;
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
Array.prototype.indexOf;
Array.prototype.includes;
Array.from;
Array.prototype;
var has_own_property = Object.prototype.hasOwnProperty;
var noop = () => {};
/**
* TODO replace with Promise.withResolvers once supported widely enough
* @template [T=void]
*/
function deferred() {
	/** @type {(value: T) => void} */
	var resolve;
	/** @type {(reason: any) => void} */
	var reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/flags/index.js
/** True if experimental.async=true */
var async_mode_flag = false;
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/render-context.js
/** @import { AsyncLocalStorage } from 'node:async_hooks' */
/** @import { RenderContext } from '#server' */
/** @type {Promise<void> | null} */
var current_render = null;
/** @type {RenderContext | null} */
var context = null;
/** @returns {RenderContext} */
function get_render_context() {
	const store = context ?? als?.getStore();
	if (!store) server_context_required();
	return store;
}
/**
* @template T
* @param {() => Promise<T>} fn
* @returns {Promise<T>}
*/
async function with_render_context(fn) {
	context = { hydratable: {
		lookup: /* @__PURE__ */ new Map(),
		comparisons: [],
		unresolved_promises: /* @__PURE__ */ new Map()
	} };
	if (in_webcontainer()) {
		const { promise, resolve } = deferred();
		const previous_render = current_render;
		current_render = promise;
		await previous_render;
		return fn().finally(resolve);
	}
	try {
		if (als === null) async_local_storage_unavailable();
		return als.run(context, fn);
	} finally {
		context = null;
	}
}
/** @type {AsyncLocalStorage<RenderContext | null> | null} */
var als = null;
/** @type {Promise<void> | null} */
var als_import = null;
/**
*
* @returns {Promise<void>}
*/
function init_render_context() {
	als_import ??= import("node:async_hooks").then((hooks) => {
		als = new hooks.AsyncLocalStorage();
	}).then(noop, noop);
	return als_import;
}
function in_webcontainer() {
	return !!globalThis.process?.versions?.webcontainer;
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/constants.js
var FILENAME = Symbol("filename");
/**
* Map of elements that have certain elements that are not allowed inside them, in the sense that the browser will somehow repair the HTML.
* There are more elements that are invalid inside other elements, but they're not repaired and so don't break SSR and are therefore not listed here.
* @type {Record<string, { direct: string[]} | { descendant: string[]; reset_by?: string[]; only?: string[] } | { only: string[] }>}
*/
var disallowed_children = {
	li: { direct: ["li"] },
	dt: {
		descendant: ["dt", "dd"],
		reset_by: ["dl"]
	},
	dd: {
		descendant: ["dt", "dd"],
		reset_by: ["dl"]
	},
	p: { descendant: [
		"address",
		"article",
		"aside",
		"blockquote",
		"div",
		"dl",
		"fieldset",
		"footer",
		"form",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"header",
		"hgroup",
		"hr",
		"main",
		"menu",
		"nav",
		"ol",
		"p",
		"pre",
		"section",
		"table",
		"ul"
	] },
	rt: { descendant: ["rt", "rp"] },
	rp: { descendant: ["rt", "rp"] },
	optgroup: { descendant: ["optgroup"] },
	option: { descendant: ["option", "optgroup"] },
	thead: { direct: ["tbody", "tfoot"] },
	tbody: { direct: ["tbody", "tfoot"] },
	tfoot: { direct: ["tbody"] },
	tr: { direct: ["tr", "tbody"] },
	td: { direct: [
		"td",
		"th",
		"tr"
	] },
	th: { direct: [
		"td",
		"th",
		"tr"
	] },
	form: { descendant: ["form"] },
	a: { descendant: ["a"] },
	button: { descendant: ["button"] },
	h1: { descendant: [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6"
	] },
	h2: { descendant: [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6"
	] },
	h3: { descendant: [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6"
	] },
	h4: { descendant: [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6"
	] },
	h5: { descendant: [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6"
	] },
	h6: { descendant: [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6"
	] },
	tr: { only: [
		"th",
		"td",
		"style",
		"script",
		"template"
	] },
	tbody: { only: [
		"tr",
		"style",
		"script",
		"template"
	] },
	thead: { only: [
		"tr",
		"style",
		"script",
		"template"
	] },
	tfoot: { only: [
		"tr",
		"style",
		"script",
		"template"
	] },
	colgroup: { only: ["col", "template"] },
	table: { only: [
		"caption",
		"colgroup",
		"tbody",
		"thead",
		"tfoot",
		"style",
		"script",
		"template"
	] },
	head: { only: [
		"base",
		"basefont",
		"bgsound",
		"link",
		"meta",
		"title",
		"noscript",
		"noframes",
		"style",
		"script",
		"template"
	] },
	html: { only: [
		"head",
		"body",
		"frameset"
	] },
	frameset: { only: ["frame"] },
	"#document": { only: ["html"] }
};
/**
* Returns an error message if the tag is not allowed inside the ancestor tag (which is grandparent and above) such that it will result
* in the browser repairing the HTML, which will likely result in an error during hydration.
* @param {string} child_tag
* @param {string[]} ancestors All nodes starting with the parent, up until the ancestor, which means two entries minimum
* @param {string} [child_loc]
* @param {string} [ancestor_loc]
* @returns {string | null}
*/
function is_tag_valid_with_ancestor(child_tag, ancestors, child_loc, ancestor_loc) {
	if (child_tag.includes("-")) return null;
	const ancestor_tag = ancestors[ancestors.length - 1];
	const disallowed = disallowed_children[ancestor_tag];
	if (!disallowed) return null;
	if ("reset_by" in disallowed && disallowed.reset_by) for (let i = ancestors.length - 2; i >= 0; i--) {
		if (ancestors[i].includes("-")) return null;
		if (disallowed.reset_by.includes(ancestors[i])) return null;
	}
	if ("descendant" in disallowed && disallowed.descendant.includes(child_tag)) return `${child_loc ? `\`<${child_tag}>\` (${child_loc})` : `\`<${child_tag}>\``} cannot be a descendant of ${ancestor_loc ? `\`<${ancestor_tag}>\` (${ancestor_loc})` : `\`<${ancestor_tag}>\``}`;
	return null;
}
/**
* Returns an error message if the tag is not allowed inside the parent tag such that it will result
* in the browser repairing the HTML, which will likely result in an error during hydration.
* @param {string} child_tag
* @param {string} parent_tag
* @param {string} [child_loc]
* @param {string} [parent_loc]
* @returns {string | null}
*/
function is_tag_valid_with_parent(child_tag, parent_tag, child_loc, parent_loc) {
	if (child_tag.includes("-") || parent_tag?.includes("-")) return null;
	if (parent_tag === "template") return null;
	const disallowed = disallowed_children[parent_tag];
	const child = child_loc ? `\`<${child_tag}>\` (${child_loc})` : `\`<${child_tag}>\``;
	const parent = parent_loc ? `\`<${parent_tag}>\` (${parent_loc})` : `\`<${parent_tag}>\``;
	if (disallowed) {
		if ("direct" in disallowed && disallowed.direct.includes(child_tag)) return `${child} cannot be a direct child of ${parent}`;
		if ("descendant" in disallowed && disallowed.descendant.includes(child_tag)) return `${child} cannot be a child of ${parent}`;
		if ("only" in disallowed && disallowed.only) {
			if (disallowed.only.includes(child_tag)) return null;
			else return `${child} cannot be a child of ${parent}. \`<${parent_tag}>\` only allows these children: ${disallowed.only.map((d) => `\`<${d}>\``).join(", ")}`;
		}
	}
	switch (child_tag) {
		case "body":
		case "caption":
		case "col":
		case "colgroup":
		case "frameset":
		case "frame":
		case "head":
		case "html": return `${child} cannot be a child of ${parent}`;
		case "thead":
		case "tbody":
		case "tfoot": return `${child} must be the child of a \`<table>\`, not a ${parent}`;
		case "td":
		case "th": return `${child} must be the child of a \`<tr>\`, not a ${parent}`;
		case "tr": return `\`<tr>\` must be the child of a \`<thead>\`, \`<tbody>\`, or \`<tfoot>\`, not a ${parent}`;
	}
	return null;
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/client/constants.js
var CLEAN = 1024;
var DIRTY = 2048;
var MAYBE_DIRTY = 4096;
/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
var STALE_REACTION = new class StaleReactionError extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/warnings.js
var bold = "font-weight: bold";
var normal = "font-weight: normal";
/**
* A `hydratable` value with key `%key%` was created, but at least part of it was not used during the render.
* 
* The `hydratable` was initialized in:
* %stack%
* @param {string} key
* @param {string} stack
*/
function unresolved_hydratable(key, stack) {
	console.warn(`%c[svelte] unresolved_hydratable\n%cA \`hydratable\` value with key \`${key}\` was created, but at least part of it was not used during the render.

The \`hydratable\` was initialized in:
${stack}\nhttps://svelte.dev/e/unresolved_hydratable`, bold, normal);
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/hydration.js
var BLOCK_OPEN = `<!--[-->`;
var BLOCK_CLOSE = `<!--]-->`;
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/escaping.js
var ATTR_REGEX = /[&"<]/g;
var CONTENT_REGEX = /[&<]/g;
/**
* @template V
* @param {V} value
* @param {boolean} [is_attr]
*/
function escape_html(value, is_attr) {
	const str = String(value ?? "");
	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;
	let escaped = "";
	let last = 0;
	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === "\"" ? "&quot;" : "&lt;");
		last = i + 1;
	}
	return escaped + str.substring(last);
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/shared/attributes.js
/**
* `<div translate={false}>` should be rendered as `<div translate="no">` and _not_
* `<div translate="false">`, which is equivalent to `<div translate="yes">`. There
* may be other odd cases that need to be added to this list in future
* @type {Record<string, Map<any, string>>}
*/
var replacements = { translate: /* @__PURE__ */ new Map([[true, "yes"], [false, "no"]]) };
/**
* @template V
* @param {string} name
* @param {V} value
* @param {boolean} [is_boolean]
* @returns {string}
*/
function attr(name, value, is_boolean = false) {
	if (name === "hidden" && value !== "until-found") is_boolean = true;
	if (value == null || is_boolean && !value && value !== "") return "";
	const normalized = has_own_property.call(replacements, name) && replacements[name].get(value) || value;
	return ` ${name}${is_boolean ? `=""` : `="${escape_html(normalized, true)}"`}`;
}
/**
* Small wrapper around clsx to preserve Svelte's (weird) handling of falsy values.
* TODO Svelte 6 revisit this, and likely turn all falsy values into the empty string (what clsx also does)
* @param  {any} value
*/
function clsx$1(value) {
	if (typeof value === "object") return clsx(value);
	else return value ?? "";
}
var whitespace = [..." 	\n\r\f\xA0\v﻿"];
/**
* @param {any} value
* @param {string | null} [hash]
* @param {Record<string, boolean>} [directives]
* @returns {string | null}
*/
function to_class(value, hash, directives) {
	var classname = value == null ? "" : "" + value;
	if (hash) classname = classname ? classname + " " + hash : hash;
	if (directives) {
		for (var key of Object.keys(directives)) if (directives[key]) classname = classname ? classname + " " + key : key;
		else if (classname.length) {
			var len = key.length;
			var a = 0;
			while ((a = classname.indexOf(key, a)) >= 0) {
				var b = a + len;
				if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
				else a = b;
			}
		}
	}
	return classname === "" ? null : classname;
}
/**
*
* @param {Record<string,any>} styles
* @param {boolean} important
*/
function append_styles(styles, important = false) {
	var separator = important ? " !important;" : ";";
	var css = "";
	for (var key of Object.keys(styles)) {
		var value = styles[key];
		if (value != null && value !== "") css += " " + key + ": " + value + separator;
	}
	return css;
}
/**
* @param {string} name
* @returns {string}
*/
function to_css_name(name) {
	if (name[0] !== "-" || name[1] !== "-") return name.toLowerCase();
	return name;
}
/**
* @param {any} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [styles]
* @returns {string | null}
*/
function to_style(value, styles) {
	if (styles) {
		var new_style = "";
		/** @type {Record<string,any> | undefined} */
		var normal_styles;
		/** @type {Record<string,any> | undefined} */
		var important_styles;
		if (Array.isArray(styles)) {
			normal_styles = styles[0];
			important_styles = styles[1];
		} else normal_styles = styles;
		if (value) {
			value = String(value).replaceAll(/\/\*.*?\*\//g, "").trim();
			/** @type {boolean | '"' | "'"} */
			var in_str = false;
			var in_apo = 0;
			var in_comment = false;
			var reserved_names = [];
			if (normal_styles) reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
			if (important_styles) reserved_names.push(...Object.keys(important_styles).map(to_css_name));
			var start_index = 0;
			var name_index = -1;
			const len = value.length;
			for (var i = 0; i < len; i++) {
				var c = value[i];
				if (in_comment) {
					if (c === "/" && value[i - 1] === "*") in_comment = false;
				} else if (in_str) {
					if (in_str === c) in_str = false;
				} else if (c === "/" && value[i + 1] === "*") in_comment = true;
				else if (c === "\"" || c === "'") in_str = c;
				else if (c === "(") in_apo++;
				else if (c === ")") in_apo--;
				if (!in_comment && in_str === false && in_apo === 0) {
					if (c === ":" && name_index === -1) name_index = i;
					else if (c === ";" || i === len - 1) {
						if (name_index !== -1) {
							var name = to_css_name(value.substring(start_index, name_index).trim());
							if (!reserved_names.includes(name)) {
								if (c !== ";") i++;
								var property = value.substring(start_index, i).trim();
								new_style += " " + property + ";";
							}
						}
						start_index = i + 1;
						name_index = -1;
					}
				}
			}
		}
		if (normal_styles) new_style += append_styles(normal_styles);
		if (important_styles) new_style += append_styles(important_styles, true);
		new_style = new_style.trim();
		return new_style === "" ? null : new_style;
	}
	return value == null ? null : String(value);
}
~(DIRTY | MAYBE_DIRTY | CLEAN);
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/client/runtime.js
var untracking = false;
/**
* When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
* any state read inside `fn` will not be treated as a dependency.
*
* ```ts
* $effect(() => {
*   // this will run when `data` changes, but not when `time` changes
*   save(data, {
*     timestamp: untrack(() => time)
*   });
* });
* ```
* @template T
* @param {() => T} fn
* @returns {T}
*/
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/store/utils.js
/** @import { Readable } from './public' */
/**
* @template T
* @param {Readable<T> | null | undefined} store
* @param {(value: T) => void} run
* @param {(value: T) => void} [invalidate]
* @returns {() => void}
*/
function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		run(void 0);
		if (invalidate) invalidate(void 0);
		return noop;
	}
	const unsub = untrack(() => store.subscribe(run, invalidate));
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/utils.js
/**
* Attributes that are boolean, i.e. they are present or not present.
*/
var DOM_BOOLEAN_ATTRIBUTES = [
	"allowfullscreen",
	"async",
	"autofocus",
	"autoplay",
	"checked",
	"controls",
	"default",
	"disabled",
	"formnovalidate",
	"indeterminate",
	"inert",
	"ismap",
	"loop",
	"multiple",
	"muted",
	"nomodule",
	"novalidate",
	"open",
	"playsinline",
	"readonly",
	"required",
	"reversed",
	"seamless",
	"selected",
	"webkitdirectory",
	"defer",
	"disablepictureinpicture",
	"disableremoteplayback"
];
/**
* Returns `true` if `name` is a boolean attribute
* @param {string} name
*/
function is_boolean_attribute(name) {
	return DOM_BOOLEAN_ATTRIBUTES.includes(name);
}
[...DOM_BOOLEAN_ATTRIBUTES];
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/index.js
var INVALID_ATTR_NAME_CHAR_REGEX = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
/**
* Only available on the server and when compiling with the `server` option.
* Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
* @template {Record<string, any>} Props
* @param {Component<Props> | ComponentType<SvelteComponent<Props>>} component
* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} [options]
* @returns {RenderOutput}
*/
function render(component, options = {}) {
	if (options.csp?.hash && options.csp.nonce) invalid_csp();
	return Renderer.render(component, options);
}
/**
* @param {Record<string, unknown>} attrs
* @param {string} [css_hash]
* @param {Record<string, boolean>} [classes]
* @param {Record<string, string>} [styles]
* @param {number} [flags]
* @returns {string}
*/
function attributes(attrs, css_hash, classes, styles, flags = 0) {
	if (styles) attrs.style = to_style(attrs.style, styles);
	if (attrs.class) attrs.class = clsx$1(attrs.class);
	if (css_hash || classes) attrs.class = to_class(attrs.class, css_hash, classes);
	let attr_str = "";
	let name;
	const is_html = (flags & 1) === 0;
	const lowercase = (flags & 2) === 0;
	const is_input = (flags & 4) !== 0;
	const names = Object.keys(attrs);
	outer: for (let i = 0; i < names.length; i++) {
		name = names[i];
		if (typeof attrs[name] === "function") continue;
		if (name[0] === "$" && name[1] === "$") continue;
		if (name === "" || INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;
		var value = attrs[name];
		var lower = name.toLowerCase();
		if (lowercase) name = lower;
		if (lower.length > 2 && lower.startsWith("on")) continue;
		if (is_input) {
			if (name === "defaultvalue" || name === "defaultchecked") {
				name = name === "defaultvalue" ? "value" : "checked";
				if (name in attrs) continue;
				for (let j = 0; j < names.length; j++) if (names[j].toLowerCase() === name) continue outer;
			}
		}
		attr_str += attr(name, value, is_html && is_boolean_attribute(name));
	}
	return attr_str;
}
/**
* Legacy mode: If the prop has a fallback and is bound in the
* parent component, propagate the fallback value upwards.
* @param {Record<string, unknown>} props_parent
* @param {Record<string, unknown>} props_now
*/
function bind_props(props_parent, props_now) {
	for (const key of Object.keys(props_now)) {
		const initial_value = props_parent[key];
		const value = props_now[key];
		if (initial_value === void 0 && value !== void 0 && Object.getOwnPropertyDescriptor(props_parent, key)?.set) props_parent[key] = value;
	}
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/crypto.js
var text_encoder;
var crypto;
/** @param {string} module_name */
var obfuscated_import = (module_name) => import(
	/* @vite-ignore */
	module_name
);
/** @param {string} data */
async function sha256(data) {
	text_encoder ??= new TextEncoder();
	crypto ??= globalThis.crypto?.subtle?.digest ? globalThis.crypto : (await obfuscated_import("node:crypto")).webcrypto;
	return base64_encode(await crypto.subtle.digest("SHA-256", text_encoder.encode(data)));
}
/**
* @param {Uint8Array} bytes
* @returns {string}
*/
function base64_encode(bytes) {
	if (globalThis.Buffer) return globalThis.Buffer.from(bytes).toString("base64");
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/renderer.js
/** @import { Component } from 'svelte' */
/** @import { HydratableContext, SSRContext } from './types.js' */
/** @import { Csp, RenderOutput, SyncRenderOutput, Sha256Source } from '../../server/public.js' */
/** @import { MaybePromise } from '#shared' */
/** @typedef {'head' | 'body'} RendererType */
/** @typedef {{ [key in RendererType]: string }} AccumulatedContent */
/**
* @typedef {string | Renderer} RendererItem
*/
var RenderResult = class {
	/** @type {() => AccumulatedContent} */
	#render;
	/** @type {() => Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }>} */
	#render_async;
	/** @type {AccumulatedContent | undefined} */
	#sync;
	/** @type {{ script: '' }} */
	#hashes = { script: "" };
	/** @type {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }> | undefined} */
	#promise;
	/**
	* @param {() => AccumulatedContent} render
	* @param {() => Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }>} render_async
	*/
	constructor(render, render_async) {
		this.#render = render;
		this.#render_async = render_async;
	}
	#get() {
		return this.#sync ??= this.#render();
	}
	get html() {
		return this.#get().body;
	}
	get head() {
		return this.#get().head;
	}
	get body() {
		return this.#get().body;
	}
	get hashes() {
		return this.#hashes;
	}
	/**
	* This is not type-safe, but honestly it's the best I can do right now, and it's a straightforward function.
	*
	* @template TResult1
	* @template [TResult2=never]
	* @param {(value: SyncRenderOutput) => TResult1} onfulfilled
	* @param {(reason: unknown) => TResult2} onrejected
	*/
	then(onfulfilled, onrejected) {
		if (!async_mode_flag) {
			const result = this.#get();
			const user_result = onfulfilled({
				head: result.head,
				body: result.body,
				html: result.body,
				hashes: { script: [] }
			});
			return Promise.resolve(user_result);
		}
		this.#promise ??= this.#render_async().then((result) => {
			Object.defineProperty(result, "html", { get: () => {
				html_deprecated();
			} });
			return result;
		});
		return this.#promise.then((result) => onfulfilled(result), onrejected);
	}
};
/**
* Renderers are basically a tree of `string | Renderer`s, where each `Renderer` in the tree represents
* work that may or may not have completed. A renderer can be {@link collect}ed to aggregate the
* content from itself and all of its children, but this will throw if any of the children are
* performing asynchronous work. To asynchronously collect a renderer, just `await` it.
*
* The `string` values within a renderer are always associated with the {@link type} of that renderer. To switch types,
* call {@link child} with a different `type` argument.
*/
var Renderer = class Renderer {
	/**
	* The contents of the renderer.
	* @type {RendererItem[]}
	*/
	#out = [];
	/**
	* Any `onDestroy` callbacks registered during execution of this renderer.
	* @type {(() => void)[] | undefined}
	*/
	#on_destroy = void 0;
	/**
	* Whether this renderer is a component body.
	* @type {boolean}
	*/
	#is_component_body = false;
	/**
	* If set, this renderer is an error boundary. When async collection
	* of the children fails, the failed snippet is rendered instead.
	* @type {{
	* 	failed: (renderer: Renderer, error: unknown, reset: () => void) => void;
	* 	transformError: (error: unknown) => unknown;
	* 	context: SSRContext | null;
	* } | null}
	*/
	#boundary = null;
	/**
	* The type of string content that this renderer is accumulating.
	* @type {RendererType}
	*/
	type;
	/** @type {Renderer | undefined} */
	#parent;
	/**
	* Asynchronous work associated with this renderer
	* @type {Promise<void> | undefined}
	*/
	promise = void 0;
	/**
	* State which is associated with the content tree as a whole.
	* It will be re-exposed, uncopied, on all children.
	* @type {SSRState}
	* @readonly
	*/
	global;
	/**
	* State that is local to the branch it is declared in.
	* It will be shallow-copied to all children.
	*
	* @type {{ select_value: any, multiple: boolean }}
	*/
	local;
	/**
	* @param {SSRState} global
	* @param {Renderer | undefined} [parent]
	*/
	constructor(global, parent) {
		this.#parent = parent;
		this.global = global;
		this.local = parent ? { ...parent.local } : {
			select_value: void 0,
			multiple: false
		};
		this.type = parent ? parent.type : "body";
	}
	/**
	* @param {(renderer: Renderer) => void} fn
	*/
	head(fn) {
		const head = new Renderer(this.global, this);
		head.type = "head";
		this.#out.push(head);
		head.child(fn);
	}
	/**
	* @param {Array<Promise<void>>} blockers
	* @param {(renderer: Renderer) => void} fn
	*/
	async_block(blockers, fn) {
		this.#out.push(BLOCK_OPEN);
		this.async(blockers, fn);
		this.#out.push(BLOCK_CLOSE);
	}
	/**
	* @param {Array<Promise<void>>} blockers
	* @param {(renderer: Renderer) => void} fn
	*/
	async(blockers, fn) {
		let callback = fn;
		if (blockers.length > 0) {
			const context = ssr_context;
			callback = (renderer) => {
				return Promise.all(blockers).then(() => {
					const previous_context = ssr_context;
					try {
						set_ssr_context(context);
						return fn(renderer);
					} finally {
						set_ssr_context(previous_context);
					}
				});
			};
		}
		this.child(callback);
	}
	/**
	* @param {Array<() => void>} thunks
	*/
	run(thunks) {
		const context = ssr_context;
		let promise = Promise.resolve(thunks[0]());
		const promises = [promise];
		if (context !== null && thunks.length > 1) context.i = true;
		for (const fn of thunks.slice(1)) {
			promise = promise.then(() => {
				const previous_context = ssr_context;
				set_ssr_context(context);
				try {
					return fn();
				} finally {
					set_ssr_context(previous_context);
				}
			});
			promises.push(promise);
		}
		promise.catch(noop);
		this.promise = this.global.track(promise);
		return promises;
	}
	/**
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	*/
	child_block(fn) {
		this.#out.push(BLOCK_OPEN);
		this.child(fn);
		this.#out.push(BLOCK_CLOSE);
	}
	/**
	* Create a child renderer. The child renderer inherits the state from the parent,
	* but has its own content.
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	*/
	child(fn) {
		const child = new Renderer(this.global, this);
		this.#out.push(child);
		const parent = ssr_context;
		set_ssr_context({
			...ssr_context,
			p: parent,
			c: null,
			r: child,
			i: ssr_context?.i ?? false
		});
		const result = fn(child);
		set_ssr_context(parent);
		if (result instanceof Promise) {
			result.catch(noop);
			result.finally(() => set_ssr_context(null)).catch(noop);
			if (child.global.mode === "sync") await_invalid();
			child.promise = child.global.track(result);
		}
		return child;
	}
	/**
	* Render children inside an error boundary. If the children throw and the API-level
	* `transformError` transform handles the error (doesn't re-throw), the `failed` snippet is
	* rendered instead. Otherwise the error propagates.
	*
	* @param {{ failed?: (renderer: Renderer, error: unknown, reset: () => void) => void }} props
	* @param {(renderer: Renderer) => MaybePromise<void>} children_fn
	*/
	boundary(props, children_fn) {
		const child = new Renderer(this.global, this);
		this.#out.push(child);
		const parent_context = ssr_context;
		if (props.failed) child.#boundary = {
			failed: props.failed,
			transformError: this.global.transformError,
			context: parent_context
		};
		set_ssr_context({
			...ssr_context,
			p: parent_context,
			c: null,
			r: child,
			i: ssr_context?.i ?? false
		});
		try {
			const result = children_fn(child);
			set_ssr_context(parent_context);
			if (result instanceof Promise) {
				if (child.global.mode === "sync") await_invalid();
				result.catch(noop);
				child.promise = child.global.track(result);
			}
		} catch (error) {
			set_ssr_context(parent_context);
			const failed_snippet = props.failed;
			if (!failed_snippet) throw error;
			const result = this.global.transformError(error);
			child.#out.length = 0;
			child.#boundary = null;
			if (result instanceof Promise) {
				if (this.global.mode === "sync") await_invalid();
				child.promise = child.global.track(
					/** @type {Promise<unknown>} */
					result.then((transformed) => {
						set_ssr_context(parent_context);
						child.#out.push(Renderer.#serialize_failed_boundary(transformed));
						failed_snippet(child, transformed, noop);
						child.#out.push(BLOCK_CLOSE);
					})
				);
				child.promise.catch(noop);
			} else {
				child.#out.push(Renderer.#serialize_failed_boundary(result));
				failed_snippet(child, result, noop);
				child.#out.push(BLOCK_CLOSE);
			}
		}
	}
	/**
	* Create a component renderer. The component renderer inherits the state from the parent,
	* but has its own content. It is treated as an ordering boundary for ondestroy callbacks.
	* @param {(renderer: Renderer) => MaybePromise<void>} fn
	* @param {Function} [component_fn]
	* @returns {void}
	*/
	component(fn, component_fn) {
		push(component_fn);
		this.child((renderer) => {
			renderer.#is_component_body = true;
			return fn(renderer);
		});
		pop();
	}
	/**
	* @param {Record<string, any>} attrs
	* @param {(renderer: Renderer) => void} fn
	* @param {string | undefined} [css_hash]
	* @param {Record<string, boolean> | undefined} [classes]
	* @param {Record<string, string> | undefined} [styles]
	* @param {number | undefined} [flags]
	* @param {boolean | undefined} [is_rich]
	* @returns {void}
	*/
	select(attrs, fn, css_hash, classes, styles, flags, is_rich) {
		const { value, defaultValue, ...select_attrs } = attrs;
		if (select_attrs.multiple === "") select_attrs.multiple = true;
		this.push(`<select${attributes(select_attrs, css_hash, classes, styles, flags)}>`);
		this.child((renderer) => {
			renderer.local.select_value = value === void 0 ? defaultValue : value;
			renderer.local.multiple = !!select_attrs.multiple;
			fn(renderer);
		});
		this.push(`${is_rich ? "<!>" : ""}</select>`);
	}
	/**
	* @param {Record<string, any>} attrs
	* @param {string | number | boolean | ((renderer: Renderer) => void)} body
	* @param {string | undefined} [css_hash]
	* @param {Record<string, boolean> | undefined} [classes]
	* @param {Record<string, string> | undefined} [styles]
	* @param {number | undefined} [flags]
	* @param {boolean | undefined} [is_rich]
	*/
	option(attrs, body, css_hash, classes, styles, flags, is_rich) {
		this.#out.push(`<option${attributes(attrs, css_hash, classes, styles, flags)}`);
		/**
		* @param {Renderer} renderer
		* @param {any} value
		* @param {{ head?: string, body: any }} content
		*/
		const close = (renderer, value, { head, body }) => {
			if (has_own_property.call(attrs, "value")) value = attrs.value;
			var select_value = this.local.select_value;
			if (this.local.multiple && is_array(select_value) ? select_value.includes(value) : value === select_value) renderer.#out.push(" selected=\"\"");
			renderer.#out.push(`>${body}${is_rich ? "<!>" : ""}</option>`);
			if (head) renderer.head((child) => child.push(head));
		};
		if (typeof body === "function") this.child((renderer) => {
			const r = new Renderer(this.global, this);
			body(r);
			if (this.global.mode === "async") return r.#collect_content_async().then((content) => {
				close(renderer, content.body.replaceAll("<!---->", ""), content);
			});
			else {
				const content = r.#collect_content();
				close(renderer, content.body.replaceAll("<!---->", ""), content);
			}
		});
		else close(this, body, { body: escape_html(body) });
	}
	/**
	* @param {(renderer: Renderer) => void} fn
	*/
	title(fn) {
		const path = this.get_path();
		/** @param {string} head */
		const close = (head) => {
			this.global.set_title(head, path);
		};
		this.child((renderer) => {
			const r = new Renderer(renderer.global, renderer);
			fn(r);
			if (renderer.global.mode === "async") return r.#collect_content_async().then((content) => {
				close(content.head);
			});
			else {
				const content = r.#collect_content();
				close(content.head);
			}
		});
	}
	/**
	* @param {string | (() => Promise<string>)} content
	*/
	push(content) {
		if (typeof content === "function") this.child(async (renderer) => renderer.push(await content()));
		else this.#out.push(content);
	}
	/**
	* @param {() => void} fn
	*/
	on_destroy(fn) {
		(this.#on_destroy ??= []).push(fn);
	}
	/**
	* @returns {number[]}
	*/
	get_path() {
		return this.#parent ? [...this.#parent.get_path(), this.#parent.#out.indexOf(this)] : [];
	}
	/**
	* @deprecated this is needed for legacy component bindings
	*/
	copy() {
		const copy = new Renderer(this.global, this.#parent);
		copy.type = this.type;
		copy.#out = this.#out.map((item) => item instanceof Renderer ? item.copy() : item);
		copy.promise = this.promise;
		return copy;
	}
	/**
	* @param {Renderer} other
	* @deprecated this is needed for legacy component bindings
	*/
	subsume(other) {
		if (this.global.mode !== other.global.mode) throw new Error("invariant: A renderer cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!");
		this.local = other.local;
		this.#out = other.#out.map((item, i) => {
			const current = this.#out[i];
			if (current instanceof Renderer && item instanceof Renderer) {
				current.subsume(item);
				return current;
			}
			return item;
		});
		this.promise = other.promise;
		this.type = other.type;
	}
	get length() {
		return this.#out.length;
	}
	/**
	* Creates the hydration comment that marks the start of a failed boundary.
	* The error is JSON-serialized and embedded inside an HTML comment for the client
	* to parse during hydration. The JSON is escaped to prevent `-->` or `<!--` sequences
	* from breaking out of the comment (XSS). Uses unicode escapes which `JSON.parse()`
	* handles transparently.
	* @param {unknown} error
	* @returns {string}
	*/
	static #serialize_failed_boundary(error) {
		return `<!--[?${JSON.stringify(error).replace(/>/g, "\\u003e").replace(/</g, "\\u003c")}-->`;
	}
	/**
	* Only available on the server and when compiling with the `server` option.
	* Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} [options]
	* @returns {RenderOutput}
	*/
	static render(component, options = {}) {
		return new RenderResult(() => Renderer.#render(component, options), () => init_render_context().then(() => with_render_context(() => Renderer.#render_async(component, options))));
	}
	/**
	* Collect all of the `onDestroy` callbacks registered during rendering. In an async context, this is only safe to call
	* after awaiting `collect_async`.
	*
	* Child renderers are "porous" and don't affect execution order, but component body renderers
	* create ordering boundaries. Within a renderer, callbacks run in order until hitting a component boundary.
	* @returns {Iterable<() => void>}
	*/
	*#collect_on_destroy() {
		for (const component of this.#traverse_components()) yield* component.#collect_ondestroy();
	}
	/**
	* Performs a depth-first search of renderers, yielding the deepest components first, then additional components as we backtrack up the tree.
	* @returns {Iterable<Renderer>}
	*/
	*#traverse_components() {
		for (const child of this.#out) if (typeof child !== "string") yield* child.#traverse_components();
		if (this.#is_component_body) yield this;
	}
	/**
	* @returns {Iterable<() => void>}
	*/
	*#collect_ondestroy() {
		if (this.#on_destroy) for (const fn of this.#on_destroy) yield fn;
		for (const child of this.#out) if (child instanceof Renderer && !child.#is_component_body) yield* child.#collect_ondestroy();
	}
	/**
	* Runs every `onDestroy` callback in this renderer tree. On a failed render,
	* cleanup errors are suppressed so they do not mask the render error.
	* @param {boolean} suppress_errors
	*/
	#run_on_destroy(suppress_errors) {
		let first_error;
		let has_error = false;
		for (const cleanup of this.#collect_on_destroy()) try {
			cleanup();
		} catch (error) {
			if (!suppress_errors && !has_error) {
				first_error = error;
				has_error = true;
			}
		}
		if (has_error) throw first_error;
	}
	/**
	* @param {'sync' | 'async'} mode
	* @param {{ idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} options
	* @returns {Renderer}
	*/
	static #create(mode, options) {
		if (options.idPrefix?.includes("--")) invalid_id_prefix();
		return new Renderer(new SSRState(mode, options.idPrefix ? options.idPrefix + "-" : "", options.csp, options.transformError));
	}
	/**
	* Render a component. Throws if any of the children are performing asynchronous work.
	*
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} options
	* @returns {AccumulatedContent}
	*/
	static #render(component, options) {
		var previous_context = ssr_context;
		const renderer = Renderer.#create("sync", options);
		/** @type {AccumulatedContent | undefined} */
		let result;
		let render_error;
		let failed = false;
		try {
			try {
				Renderer.#open_render(renderer, component, options);
				result = Renderer.#close_render(renderer.#collect_content(), renderer);
			} catch (error) {
				render_error = error;
				failed = true;
			}
			renderer.#run_on_destroy(failed);
			if (failed) throw render_error;
			return result;
		} finally {
			renderer.global.abort();
			set_ssr_context(previous_context);
		}
	}
	/**
	* Render a component.
	*
	* @template {Record<string, any>} Props
	* @param {Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp }} options
	* @returns {Promise<AccumulatedContent & { hashes: { script: Sha256Source[] } }>}
	*/
	static async #render_async(component, options) {
		const previous_context = ssr_context;
		const renderer = Renderer.#create("async", options);
		/** @type {(AccumulatedContent & { hashes: { script: Sha256Source[] } }) | undefined} */
		let result;
		let render_error;
		let failed = false;
		try {
			try {
				Renderer.#open_render(renderer, component, options);
				const content = await renderer.#collect_content_async();
				const hydratables = await renderer.#collect_hydratables();
				if (hydratables !== null) content.head = hydratables + content.head;
				result = Renderer.#close_render(content, renderer);
			} catch (error) {
				render_error = error;
				failed = true;
				renderer.global.abort();
				await renderer.global.settle();
			}
			renderer.#run_on_destroy(failed);
			if (failed) throw render_error;
			return result;
		} finally {
			set_ssr_context(previous_context);
			renderer.global.abort();
		}
	}
	/**
	* Collect all of the code from the `out` array and return it as a string, or a promise resolving to a string.
	* @param {AccumulatedContent} content
	* @returns {AccumulatedContent}
	*/
	#collect_content(content = {
		head: "",
		body: ""
	}) {
		for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
		else if (item instanceof Renderer) item.#collect_content(content);
		return content;
	}
	/**
	* Collect all of the code from the `out` array and return it as a string.
	* @param {AccumulatedContent} content
	* @returns {Promise<AccumulatedContent>}
	*/
	async #collect_content_async(content = {
		head: "",
		body: ""
	}) {
		await this.promise;
		for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
		else if (item instanceof Renderer) {
			if (item.#boundary) {
				/** @type {AccumulatedContent} */
				const boundary_content = {
					head: "",
					body: ""
				};
				try {
					await item.#collect_content_async(boundary_content);
					content.head += boundary_content.head;
					content.body += boundary_content.body;
				} catch (error) {
					const { context, failed, transformError } = item.#boundary;
					set_ssr_context(context);
					let promise = transformError(error);
					set_ssr_context(null);
					let transformed = await promise;
					set_ssr_context(context);
					const failed_renderer = new Renderer(item.global, item);
					failed_renderer.type = item.type;
					failed_renderer.#out.push(Renderer.#serialize_failed_boundary(transformed));
					failed(failed_renderer, transformed, noop);
					failed_renderer.#out.push(BLOCK_CLOSE);
					await failed_renderer.#collect_content_async(content);
				}
			} else await item.#collect_content_async(content);
		}
		return content;
	}
	async #collect_hydratables() {
		const ctx = get_render_context().hydratable;
		for (const [_, key] of ctx.unresolved_promises) unresolved_hydratable(key, ctx.lookup.get(key)?.stack ?? "<missing stack trace>");
		for (const comparison of ctx.comparisons) await comparison;
		return await this.#hydratable_block(ctx);
	}
	/**
	* @template {Record<string, any>} Props
	* @param {Renderer} renderer
	* @param {import('svelte').Component<Props>} component
	* @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string; csp?: Csp; transformError?: (error: unknown) => unknown }} options
	* @returns {void}
	*/
	static #open_render(renderer, component, options) {
		var previous_context = ssr_context;
		try {
			set_ssr_context({
				p: null,
				c: options.context ?? null,
				r: renderer,
				i: false
			});
			renderer.push(BLOCK_OPEN);
			component(renderer, options.props ?? {});
			renderer.push(BLOCK_CLOSE);
		} finally {
			set_ssr_context(previous_context);
		}
	}
	/**
	* @param {AccumulatedContent} content
	* @param {Renderer} renderer
	* @returns {AccumulatedContent & { hashes: { script: Sha256Source[] } }}
	*/
	static #close_render(content, renderer) {
		let head = content.head + renderer.global.get_title();
		let body = content.body;
		for (const { hash, code } of renderer.global.css) head += `<style id="${hash}">${code}</style>`;
		return {
			head,
			body,
			hashes: { script: renderer.global.csp.script_hashes }
		};
	}
	/**
	* @param {HydratableContext} ctx
	*/
	async #hydratable_block(ctx) {
		if (ctx.lookup.size === 0) return null;
		let entries = [];
		let has_promises = false;
		for (const [k, v] of ctx.lookup) {
			if (v.promises) {
				has_promises = true;
				for (const p of v.promises) await p;
			}
			entries.push(`[${devalue.uneval(k)},${v.serialized}]`);
		}
		let prelude = `const h = (window.__svelte ??= {}).h ??= new Map();`;
		if (has_promises) prelude = `const r = (v) => Promise.resolve(v);
				${prelude}`;
		const body = `
			{
				${prelude}

				for (const [k, v] of [
					${entries.join(",\n					")}
				]) {
					h.set(k, v);
				}
			}
		`;
		let csp_attr = "";
		if (this.global.csp.nonce) csp_attr = ` nonce="${this.global.csp.nonce}"`;
		else if (this.global.csp.hash) {
			const hash = await sha256(body);
			this.global.csp.script_hashes.push(`sha256-${hash}`);
		}
		return `\n\t\t<script${csp_attr}>${body}<\/script>`;
	}
};
var SSRState = class {
	/** @readonly @type {Csp & { script_hashes: Sha256Source[] }} */
	csp;
	/** @readonly @type {'sync' | 'async'} */
	mode;
	/** @readonly @type {() => string} */
	uid;
	/** @readonly @type {Set<{ hash: string; code: string }>} */
	css = /* @__PURE__ */ new Set();
	/** @type {Set<Promise<unknown>>} */
	#pending = /* @__PURE__ */ new Set();
	/** @type {AbortController | null} */
	#controller = null;
	#aborted = false;
	/**
	* `transformError` passed to `render`. Called when an error boundary catches an error.
	* Throws by default if unset in `render`.
	* @type {(error: unknown) => unknown}
	*/
	transformError;
	/** @type {{ path: number[], value: string }} */
	#title = {
		path: [],
		value: ""
	};
	/**
	* @param {'sync' | 'async'} mode
	* @param {string} id_prefix
	* @param {Csp} csp
	* @param {((error: unknown) => unknown) | undefined} [transformError]
	*/
	constructor(mode, id_prefix = "", csp = { hash: false }, transformError) {
		this.mode = mode;
		this.csp = {
			...csp,
			script_hashes: []
		};
		this.transformError = transformError ?? ((error) => {
			throw error;
		});
		let uid = 1;
		this.uid = () => `${id_prefix}s${uid++}`;
	}
	/**
	* @template T
	* @param {Promise<T>} promise
	* @returns {Promise<T>}
	*/
	track(promise) {
		this.#pending.add(promise);
		promise.then(() => this.#pending.delete(promise), () => this.#pending.delete(promise));
		return promise;
	}
	async settle() {
		while (this.#pending.size > 0) await Promise.allSettled([...this.#pending]);
	}
	abort() {
		if (this.#aborted) return;
		this.#aborted = true;
		this.#controller?.abort(STALE_REACTION);
	}
	get_abort_signal() {
		const controller = this.#controller ??= new AbortController();
		if (this.#aborted) controller.abort(STALE_REACTION);
		return controller.signal;
	}
	get_title() {
		return this.#title.value;
	}
	/**
	* Performs a depth-first (lexicographic) comparison using the path. Rejects sets
	* from earlier than or equal to the current value.
	* @param {string} value
	* @param {number[]} path
	*/
	set_title(value, path) {
		const current = this.#title.path;
		let i = 0;
		let l = Math.min(path.length, current.length);
		while (i < l && path[i] === current[i]) i += 1;
		if (path[i] === void 0) return;
		if (current[i] === void 0 || path[i] > current[i]) {
			this.#title.path = path;
			this.#title.value = value;
		}
	}
};
//#endregion
//#region ../../../node_modules/.pnpm/svelte@5.57.1_@typescript-eslint+types@8.41.0/node_modules/svelte/src/internal/server/dev.js
/** @import { SSRContext } from '#server' */
/**
* @typedef {{
* 	tag: string;
* 	parent: undefined | Element;
*  filename: undefined | string;
*  line: number;
*  column: number;
* }} Element
*/
/**
* This is exported so that it can be cleared between tests
* @type {Set<string>}
*/
var seen;
/**
* @param {Renderer} renderer
* @param {string} message
*/
function print_error(renderer, message) {
	message = `node_invalid_placement_ssr: ${message}\n\nThis can cause content to shift around as the browser repairs the HTML, and will likely result in a \`hydration_mismatch\` warning.`;
	if ((seen ??= /* @__PURE__ */ new Set()).has(message)) return;
	seen.add(message);
	console.error(message);
	renderer.head((r) => r.push(`<script>console.error(${JSON.stringify(message).replaceAll("</", "<\\u002f")})<\/script>`));
}
/**
* @param {Renderer} renderer
* @param {string} tag
* @param {number} line
* @param {number} column
*/
function push_element(renderer, tag, line, column) {
	var context = ssr_context;
	var filename = context.function[FILENAME];
	var parent = context.element;
	var element = {
		tag,
		parent,
		filename,
		line,
		column
	};
	if (parent !== void 0) {
		var ancestor = parent.parent;
		var ancestors = [parent.tag];
		const child_loc = filename ? `${filename}:${line}:${column}` : void 0;
		const parent_loc = parent.filename ? `${parent.filename}:${parent.line}:${parent.column}` : void 0;
		const message = is_tag_valid_with_parent(tag, parent.tag, child_loc, parent_loc);
		if (message) print_error(renderer, message);
		while (ancestor != null) {
			ancestors.push(ancestor.tag);
			const message = is_tag_valid_with_ancestor(tag, ancestors, child_loc, ancestor.filename ? `${ancestor.filename}:${ancestor.line}:${ancestor.column}` : void 0);
			if (message) print_error(renderer, message);
			ancestor = ancestor.parent;
		}
	}
	set_ssr_context({
		...context,
		p: context,
		element
	});
}
function pop_element() {
	set_ssr_context(
		/** @type {SSRContext} */
		ssr_context.p
	);
}
//#endregion
export { subscribe_to_store as a, noop as c, render as i, push_element as n, escape_html as o, bind_props as r, FILENAME as s, pop_element as t };
