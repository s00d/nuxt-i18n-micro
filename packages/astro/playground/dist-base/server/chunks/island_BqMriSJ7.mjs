import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { i as j } from "./dist_CtMX8yra.mjs";
import { t as $$Late } from "./Late_DuVTvOg-.mjs";
//#region src/pages/island.astro
var island_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Island,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Island = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Island;
	const { t, locale } = j(Astro);
	return renderTemplate`<html>${maybeRenderHead($$result)}<body><i id="page">${locale}:${t("welcome")}</i>${renderComponent($$result, "Late", $$Late, {
		"server:component-directive": "defer",
		"server:component-path": "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/components/Late.astro",
		"server:component-export": "default"
	})}</body></html>`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/island.astro", "self");
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/island.astro";
var $$url = "/docs/island";
//#endregion
//#region \0virtual:astro:page:src/pages/island@_@astro
var page = () => island_exports;
//#endregion
export { page };
