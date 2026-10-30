import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { n as N } from "./dist_CtMX8yra.mjs";
//#region src/pages/[locale]/index.astro
var _locale__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Index = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const rewriteTarget = N(Astro);
	if (rewriteTarget instanceof Response) return rewriteTarget;
	return Astro.rewrite(rewriteTarget);
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/[locale]/index.astro", void 0);
var $$file = "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/pages/[locale]/index.astro";
var $$url = "/docs/[locale]";
//#endregion
//#region \0virtual:astro:page:src/pages/[locale]/index@_@astro
var page = () => _locale__exports;
//#endregion
export { page };
