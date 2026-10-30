import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { i as j } from "./dist_CtMX8yra.mjs";
import { t as $$I18nLink } from "./i18n-link_BDLbWp-v.mjs";
//#region src/components/Late.astro
createAstro("https://astro.build");
var $$Late = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Late;
	const { t, locale, getRoute } = j(Astro);
	return renderTemplate`${maybeRenderHead($$result)}<b id="late">${locale}:${getRoute()}:${t("welcome")}</b>${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/about",
		"id": "late-link"
	}, { "default": ($$result) => renderTemplate`about` })}`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/Late.astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/Late.astro";
var $$url = void 0;
//#endregion
export { $$file as n, $$url as r, $$Late as t };
