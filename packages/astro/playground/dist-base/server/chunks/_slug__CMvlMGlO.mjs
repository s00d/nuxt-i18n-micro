import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro, f as renderHead, i as renderComponent, p as addAttribute, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { i as j, r as P, t as I } from "./dist_CtMX8yra.mjs";
import { n as ReactCard, t as VueCounter_default } from "./VueCounter_DG762xPR.mjs";
//#region src/pages/blog/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Slug = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const { t, getRoute } = j(Astro);
	const i18n = I(Astro);
	const head = P(Astro, { baseUrl: "https://site.test" });
	return renderTemplate`<html${addAttribute(head.htmlAttrs.lang, "lang")}><head>${head.link.map((link) => renderTemplate`<link${addAttribute(link.rel, "rel")}${addAttribute(link.href, "href")}${addAttribute(link.hreflang, "hreflang")}>`)}${renderHead($$result)}</head><body><p id="route">${getRoute()}</p><p id="title">${t("post.title")}</p><pre id="props">${JSON.stringify(i18n)}</pre>${renderComponent($$result, "VueCounter", VueCounter_default, {
		"client:load": true,
		"i18n": i18n,
		"client:component-hydration": "load",
		"client:component-path": "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/islands/VueCounter.vue",
		"client:component-export": "default"
	})}${renderComponent($$result, "ReactCard", ReactCard, {
		"client:load": true,
		"i18n": i18n,
		"client:component-hydration": "load",
		"client:component-path": "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/islands/ReactCard.tsx",
		"client:component-export": "default"
	})}</body></html>`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/blog/[slug].astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/blog/[slug].astro";
var $$url = "/docs/blog/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/blog/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
