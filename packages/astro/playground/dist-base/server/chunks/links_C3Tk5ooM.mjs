import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { n as N } from "./dist_CtMX8yra.mjs";
//#region src/pages/[locale]/links.astro
var links_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Links,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Links = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Links;
	const rewriteTarget = N(Astro);
	if (rewriteTarget instanceof Response) return rewriteTarget;
	return Astro.rewrite(rewriteTarget);
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/[locale]/links.astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/[locale]/links.astro";
var $$url = "/docs/[locale]/links";
//#endregion
//#region \0virtual:astro:page:src/pages/[locale]/links@_@astro
var page = () => links_exports;
//#endregion
export { page };
