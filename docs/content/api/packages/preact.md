---
title: '@i18n-micro/preact'
description: 'Exported API of @i18n-micro/preact, generated from the source.'
navigation:
  title: 'preact'
---

# `@i18n-micro/preact`

Preact bindings for i18n-micro — hooks, context, and UI components.

Entry points: `@i18n-micro/preact`, `@i18n-micro/preact/router`.

## `@i18n-micro/preact`

### Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/core`](/api/packages/core): [`defaultPlural`](/api/packages/core#defaultplural) · [`interpolate`](/api/packages/core#interpolate) · [`FormatService`](/api/packages/core#formatservice)
- From [`@i18n-micro/react`](/api/packages/react): [`I18nGroup`](/api/packages/react#i18ngroup) · [`I18nLink`](/api/packages/react#i18nlink) · [`I18nProvider`](/api/packages/react#i18nprovider) · [`I18nSwitcher`](/api/packages/react#i18nswitcher) · [`I18nT`](/api/packages/react#i18nt) · [`useI18n`](/api/packages/react#usei18n) · [`useI18nContext`](/api/packages/react#usei18ncontext) · [`useI18nDefaultLocale`](/api/packages/react#usei18ndefaultlocale) · [`useI18nLocales`](/api/packages/react#usei18nlocales) · [`useI18nRouter`](/api/packages/react#usei18nrouter) · [`useLocaleSwitch`](/api/packages/react#uselocaleswitch) · [`useT`](/api/packages/react#uset) · [`I18nConfigContext`](/api/packages/react#i18nconfigcontext) · [`I18nContext`](/api/packages/react#i18ncontext) · [`I18nConfig`](/api/packages/react#i18nconfig) · [`I18nGroupProps`](/api/packages/react#i18ngroupprops) · [`I18nLinkProps`](/api/packages/react#i18nlinkprops) · [`I18nProviderProps`](/api/packages/react#i18nproviderprops) · [`I18nRoutingStrategy`](/api/packages/react#i18nroutingstrategy) · [`I18nSwitcherProps`](/api/packages/react#i18nswitcherprops) · [`I18nTComponent`](/api/packages/react#i18ntcomponent) · [`I18nTProps`](/api/packages/react#i18ntprops) · [`RouteTarget`](/api/packages/react#routetarget) · [`UseI18nOptions`](/api/packages/react#usei18noptions) · [`UseI18nReturn`](/api/packages/react#usei18nreturn)
- From [`@i18n-micro/runtime`](/api/packages/runtime): [`createI18n`](/api/packages/runtime#createi18n) · [`PreactI18n`](/api/packages/runtime#i18n) (as `I18n`) · [`PreactI18nOptions`](/api/packages/runtime#i18noptions) (as `I18nOptions`)
- From [`@i18n-micro/types`](/api/packages/types): [`CleanTranslation`](/api/packages/types#cleantranslation) · [`Getter`](/api/packages/types#getter) · [`Locale`](/api/packages/types#locale) · [`LocaleCode`](/api/packages/types#localecode) · [`ModuleOptions`](/api/packages/types#moduleoptions) · [`Params`](/api/packages/types#params) · [`PluralFunc`](/api/packages/types#pluralfunc) · [`TranslationKey`](/api/packages/types#translationkey) · [`Translations`](/api/packages/types#translations)

## `@i18n-micro/preact/router`

Also exports, as `@i18n-micro/preact` does: [`I18nRoutingStrategy`](/api/packages/react#i18nroutingstrategy).

### Functions

#### `createBrowserHistoryAdapter`

Adapter over the History API, for any router built on it (wouter, preact-router...). Links render
as `<a>`; `I18nLink` takes over plain clicks. A server has no address bar: pass the request's URL as
`ssrUrl`, so links and the switcher render for that page. In a browser the address bar wins.

```ts
function createBrowserHistoryAdapter(
  locales: Locale[],
  defaultLocale: string,
  ssrUrl?: string,
): I18nRoutingStrategy
```

**See** [`Locale`](/api/packages/types#locale) · [`I18nRoutingStrategy`](/api/packages/react#i18nroutingstrategy)

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
