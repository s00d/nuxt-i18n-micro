import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { t as $$I18nSwitcher } from "./i18n-switcher_Bgqjoolb.mjs";
import { i as j } from "./dist_CtMX8yra.mjs";
import { t as $$I18nLink } from "./i18n-link_BDLbWp-v.mjs";
import { t as $$I18nT } from "./i18n-t_DfaC1WRd.mjs";
//#region src/pages/links.astro
var links_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Links,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Links = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Links;
	const { locale } = j(Astro);
	return renderTemplate`<html>${maybeRenderHead($$result)}<body><i id="locale">${locale}</i><nav id="links">${renderComponent($$result, "I18nLink", $$I18nLink, { "href": "https://example.com/x" }, { "default": ($$result) => renderTemplate`external` })}${renderComponent($$result, "I18nLink", $$I18nLink, { "href": "mailto:a@b.c" }, { "default": ($$result) => renderTemplate`mail` })}${renderComponent($$result, "I18nLink", $$I18nLink, { "href": "#top" }, { "default": ($$result) => renderTemplate`hash` })}${renderComponent($$result, "I18nLink", $$I18nLink, { "href": "/about?x=1#y" }, { "default": ($$result) => renderTemplate`query` })}${renderComponent($$result, "I18nLink", $$I18nLink, { "href": "/about/" }, { "default": ($$result) => renderTemplate`slash` })}${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/about",
		"locale": "fr",
		"class": "to-fr",
		"data-x": "1"
	}, { "default": ($$result) => renderTemplate`locale` })}</nav>${renderComponent($$result, "I18nSwitcher", $$I18nSwitcher, {
		"class": "mine",
		"id": "switcher"
	})}${renderComponent($$result, "I18nSwitcher", $$I18nSwitcher, {})}<div id="texts">${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "greeting",
		"params": { name: "<b>x</b>" },
		"tag": "h2",
		"class": "t"
	})}${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "greeting",
		"params": { name: "<b>x</b>" },
		"html": true,
		"tag": "section"
	})}${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "apples",
		"plural": 5
	})}${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "nope",
		"defaultValue": "Fallback text",
		"tag": "em"
	})}</div></body></html>`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/links.astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/links.astro";
var $$url = "/docs/links";
//#endregion
//#region \0virtual:astro:page:src/pages/links@_@astro
var page = () => links_exports;
//#endregion
export { page };
