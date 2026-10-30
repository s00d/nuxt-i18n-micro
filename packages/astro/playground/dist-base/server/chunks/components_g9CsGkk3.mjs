import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { n as N } from "./dist_CtMX8yra.mjs";
//#region src/pages/[locale]/components.astro
var components_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Components,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Components = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Components;
	const rewriteTarget = N(Astro);
	if (rewriteTarget instanceof Response) return rewriteTarget;
	return Astro.rewrite(rewriteTarget);
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/[locale]/components.astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/[locale]/components.astro";
var $$url = "/docs/[locale]/components";
//#endregion
//#region \0virtual:astro:page:src/pages/[locale]/components@_@astro
var page = () => components_exports;
//#endregion
export { page };
