import { S as createAstro, d as maybeRenderHead, m as createRenderInstruction, p as addAttribute, t as spreadAttributes, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { r as useI18n } from "./i18n-link_BDLbWp-v.mjs";
//#region ../../../node_modules/.pnpm/astro@7.3.5_@azure+identity@4.13.3_@azure+storage-blob@12.34.0_@netlify+blobs@9.1.2_@types+no_4etuxr5yyfgbp5sym7yhbht32a/node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region ../src/components/i18n-switcher.astro
createAstro("https://astro.build");
var $$I18nSwitcher = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$I18nSwitcher;
	const { class: className, activeClass = "active", customLabels = {}, ...attrs } = Astro.props;
	const { locale: currentLocale, locales, switchLocalePath } = useI18n(Astro);
	const { search } = Astro.locals.currentUrl ?? Astro.url;
	const labelOf = (locale) => customLabels[locale.code] || locale.displayName || locale.code;
	const links = locales.filter((locale) => !locale.disabled).map((locale) => ({
		code: locale.code,
		label: labelOf(locale),
		href: switchLocalePath(locale.code) + search,
		isActive: locale.code === currentLocale
	}));
	return renderTemplate`${links.length > 0 && renderTemplate`${maybeRenderHead($$result)}<div${addAttribute(`i18n-switcher-wrapper ${className || ""}`, "class")} data-i18n-switcher${spreadAttributes(attrs)} data-astro-cid-is5xgkfx><button type="button" class="i18n-switcher-button" aria-haspopup="true" aria-expanded="false" data-astro-cid-is5xgkfx><span data-astro-cid-is5xgkfx>${links.find((link) => link.isActive)?.label ?? currentLocale}</span><span class="i18n-switcher-icon" data-astro-cid-is5xgkfx>▼</span></button><ul class="i18n-switcher-dropdown" hidden data-astro-cid-is5xgkfx>${links.map((link) => renderTemplate`<li data-astro-cid-is5xgkfx><a${addAttribute(link.href, "href")}${addAttribute(link.isActive ? activeClass : "", "class")}${addAttribute(link.isActive ? "page" : void 0, "aria-current")}${addAttribute(link.code, "data-locale")} data-astro-cid-is5xgkfx>${link.label}</a></li>`)}</ul></div>`}${renderScript($$result, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/src/components/i18n-switcher.astro?astro&type=script&index=0&lang.ts")}`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/src/components/i18n-switcher.astro", void 0);
//#endregion
export { $$I18nSwitcher as t };
