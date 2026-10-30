import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { i as j } from "./dist_CtMX8yra.mjs";
import { t as $$Layout } from "./Layout_DAOroRq6.mjs";
import { t as $$I18nT } from "./i18n-t_DfaC1WRd.mjs";
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Index = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const { t } = j(Astro);
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<h1>${t("home.title")}</h1><p>${t("home.description")}</p><p>${t("greeting", { name: "World" })}</p><p>${renderComponent($$result, "I18nT", $$I18nT, { "keypath": "welcome" })}</p><p>${renderComponent($$result, "I18nT", $$I18nT, {
		"keypath": "apples",
		"plural": 5
	})}</p>` })}`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/index.astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/index.astro";
var $$url = "/docs";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
