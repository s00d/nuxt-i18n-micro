import { S as createAstro, b as unescapeHTML, i as renderComponent, u as renderTemplate } from "./server_Dx_4z2w4.mjs";
import { t as createComponent } from "./compiler_CpocxmTU.mjs";
import { n as resolveI18nT } from "./i18n-link_BDLbWp-v.mjs";
//#region ../src/components/i18n-t.astro
createAstro("https://astro.build");
var $$I18nT = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$I18nT;
	const { keypath, plural, params, defaultValue, tag: Tag = "span", html = false, hideIfEmpty, number, date, relativeDate, ...attrs } = Astro.props;
	const text = resolveI18nT(Astro, {
		keypath,
		plural,
		params,
		defaultValue,
		html,
		hideIfEmpty,
		number,
		date,
		relativeDate
	});
	return renderTemplate`${text !== null && (html ? renderTemplate`${renderComponent($$result, "Tag", Tag, { ...attrs }, { "default": ($$result) => renderTemplate`${unescapeHTML(text)}` })}` : renderTemplate`${renderComponent($$result, "Tag", Tag, { ...attrs }, { "default": ($$result) => renderTemplate`${text}` })}`)}`;
}, "/private/tmp/claude-502/-Users-s00d--claude-spares-spare-5YuFU6/a0d8be98-18b9-414f-ae0b-ecb1a541e7d3/scratchpad/fwastro-wt/packages/astro/src/components/i18n-t.astro", void 0);
//#endregion
export { $$I18nT as t };
