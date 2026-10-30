import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, s as renderSlot, t as spreadAttributes, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { t as $$I18nSwitcher } from "./i18n-switcher_Bgqjoolb.mjs";
import { i as j } from "./dist_CtMX8yra.mjs";
import { t as $$I18nLink } from "./i18n-link_BDLbWp-v.mjs";
import { t as $$Layout } from "./Layout_DAOroRq6.mjs";
import { t as $$I18nT } from "./i18n-t_DfaC1WRd.mjs";
//#region ../src/components/i18n-group.astro
createAstro("https://astro.build");
var $$I18nGroup = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$I18nGroup;
	const { route: _route, ...attrs } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div${spreadAttributes(attrs)}>${renderSlot($$result, $$slots["default"])}</div>`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/src/components/i18n-group.astro", void 0);
//#endregion
//#region src/pages/components.astro
var components_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Components,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Components = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Components;
	const { t, tn, td, tdr } = j(Astro);
	const now = /* @__PURE__ */ new Date();
	const oneHourAgo = /* @__PURE__ */ new Date(Date.now() - 36e5);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "data-astro-cid-urwc6qe6": true }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<h1 data-astro-cid-urwc6qe6>${t("components.title")}</h1><p data-astro-cid-urwc6qe6>${t("components.description")}</p><section data-astro-cid-urwc6qe6><h2 data-astro-cid-urwc6qe6>I18nT Component</h2><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "welcome",
		"data-astro-cid-urwc6qe6": true
	})}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "greeting",
		"params": { name: "Astro" },
		"data-astro-cid-urwc6qe6": true
	})}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "apples",
		"plural": 0,
		"data-astro-cid-urwc6qe6": true
	})}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "apples",
		"plural": 1,
		"data-astro-cid-urwc6qe6": true
	})}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "apples",
		"plural": 5,
		"data-astro-cid-urwc6qe6": true
	})}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "number",
		"number": 1234.56,
		"data-astro-cid-urwc6qe6": true
	})}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "date",
		"date": now,
		"data-astro-cid-urwc6qe6": true
	})}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "relativeDate",
		"relativeDate": oneHourAgo,
		"data-astro-cid-urwc6qe6": true
	})}</p></section><section data-astro-cid-urwc6qe6><h2 data-astro-cid-urwc6qe6>I18nLink Component</h2><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/",
		"data-astro-cid-urwc6qe6": true
	}, { "default": ($$result) => renderTemplate`Home Link` })}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/about",
		"data-astro-cid-urwc6qe6": true
	}, { "default": ($$result) => renderTemplate`About Link` })}</p><p data-astro-cid-urwc6qe6>${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/components",
		"data-astro-cid-urwc6qe6": true
	}, { "default": ($$result) => renderTemplate`Components Link` })}</p></section><section data-astro-cid-urwc6qe6><h2 data-astro-cid-urwc6qe6>I18nGroup Component</h2>${renderComponent($$result, "I18nGroup", $$I18nGroup, { "data-astro-cid-urwc6qe6": true }, { "default": ($$result) => renderTemplate`<p data-astro-cid-urwc6qe6>${t("home.title")}</p><p data-astro-cid-urwc6qe6>${t("home.description")}</p>` })}</section><section data-astro-cid-urwc6qe6><h2 data-astro-cid-urwc6qe6>I18nSwitcher Component</h2>${renderComponent($$result, "I18nSwitcher", $$I18nSwitcher, { "data-astro-cid-urwc6qe6": true })}</section><section data-astro-cid-urwc6qe6><h2 data-astro-cid-urwc6qe6>Formatting Examples</h2><p data-astro-cid-urwc6qe6>Number: ${tn(1234.56)}</p><p data-astro-cid-urwc6qe6>Date: ${td(now)}</p><p data-astro-cid-urwc6qe6>Relative Time: ${tdr(oneHourAgo)}</p></section>` })}`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/components.astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/components.astro";
var $$url = "/docs/components";
//#endregion
//#region \0virtual:astro:page:src/pages/components@_@astro
var page = () => components_exports;
//#endregion
export { page };
