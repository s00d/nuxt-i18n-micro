import { S as createAstro, f as renderHead, i as renderComponent, p as addAttribute, s as renderSlot, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { t as $$I18nSwitcher } from "./i18n-switcher_Bgqjoolb.mjs";
import { i as j } from "./dist_CtMX8yra.mjs";
import { t as $$I18nLink } from "./i18n-link_BDLbWp-v.mjs";
//#region src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { t, locale } = j(Astro);
	return renderTemplate`<html${addAttribute(locale, "lang")} data-astro-cid-ju4pidww><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t("welcome")}</title>${renderHead($$result)}</head><body data-astro-cid-ju4pidww><nav data-astro-cid-ju4pidww>${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/",
		"data-astro-cid-ju4pidww": true
	}, { "default": ($$result) => renderTemplate`${t("nav.home")}` })}${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/about",
		"data-astro-cid-ju4pidww": true
	}, { "default": ($$result) => renderTemplate`${t("nav.about")}` })}${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/components",
		"data-astro-cid-ju4pidww": true
	}, { "default": ($$result) => renderTemplate`${t("nav.components")}` })}${renderComponent($$result, "I18nLink", $$I18nLink, {
		"href": "/islands",
		"data-astro-cid-ju4pidww": true
	}, { "default": ($$result) => renderTemplate`${t("nav.islands")}` })}<div class="locale-switcher-container" data-astro-cid-ju4pidww>${renderComponent($$result, "I18nSwitcher", $$I18nSwitcher, {
		"activeClass": "active",
		"data-astro-cid-ju4pidww": true
	})}</div></nav><main data-astro-cid-ju4pidww>${renderSlot($$result, $$slots["default"])}</main></body></html>`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/playground/src/layouts/Layout.astro", void 0);
//#endregion
export { $$Layout as t };
