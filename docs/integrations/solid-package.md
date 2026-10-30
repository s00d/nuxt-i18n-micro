---
title: 'Solid'
description: 'Translations, locale switching and @solidjs/router integration for SolidJS apps with @i18n-micro/solid.'
outline: 'deep'
---

# Solid

`@i18n-micro/solid` gives SolidJS apps a signal-backed i18n instance, a provider, `useI18n()` and four components. Use it in a Solid app that is not built with Nuxt. Reads of `t()` inside JSX or effects track the locale, the route and the dictionaries; the shared model is in [Frameworks](./).

## Install

::: code-group

```bash [pnpm]
pnpm add @i18n-micro/solid
```

```bash [npm]
npm install @i18n-micro/solid
```

```bash [yarn]
yarn add @i18n-micro/solid
```

:::

Peer dependencies: `solid-js` `^1.9.15`; `@solidjs/router` `^0.15.4 || ^1.0.0` (optional, only for `@i18n-micro/solid/router`). Solid 2 is not supported yet.

## Setup

```tsx
// src/index.tsx
import { render } from 'solid-js/web'
import { createI18n, I18nProvider } from '@i18n-micro/solid'
import App from './App'
import en from './locales/en.json'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
]

const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en } })

render(
  () => (
    <I18nProvider i18n={i18n} locales={locales} defaultLocale="en">
      <App />
    </I18nProvider>
  ),
  document.getElementById('root')!,
)
```

`<I18nProvider>` takes `i18n`, `locales`, `defaultLocale` and `routingStrategy`; an omitted prop keeps the outer provider's value, the instance included. `getLocaleName()` and `<I18nSwitcher>` read `locales`; without them they have nothing to list. Options are in [the instance](./#create-i18n-options). The instance is the [runtime](./runtime-package)'s, with one signal over its store.

## Translate

```tsx
import { useI18n } from '@i18n-micro/solid'

export function Greeting() {
  const { t, tc, tn } = useI18n()
  return (
    <>
      <h1>{t('greeting', { name: 'Ada' }) as string}</h1> {/* Hello, Ada! */}
      <p>{tc('apples', 3)}</p> {/* 3 apples */}
      <p>{tn(1234.5)}</p>
    </>
  )
}
```

Call the methods inside JSX or an effect so Solid tracks them, `localePath` and `getLocale` too; a value read once in the component body does not update. On the instance, track with `i18n.locale` and `i18n.currentRoute`: `i18n.getLocale()` stays plain, because writes read it. Reading the locale wakes on the locale alone, so an effect that reads it and loads a dictionary runs once. Do not destructure props or keep `t('key')` results in plain variables.

`useI18n()` returns `t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has`, `locale` (an accessor: `locale()`), `getLocale`, `getLocales`, `defaultLocale()`, `getLocaleName`, `switchLocale`, `localePath`, `localeRoute`, `setRoute`, `getRoute`, `addTranslations`, `addRouteTranslations`, `resolveTranslations`, `setTranslation`, `clearCache` and `instance`.

```ts
const { addTranslations, addRouteTranslations, setRoute } = useI18n()

addTranslations('de', (await import('./locales/de.json')).default)
addRouteTranslations('en', 'about', { title: 'About us' })
setRoute('about') // t('title') now reads the 'about' dictionary first
```

## Switch locale

```ts
const { instance, switchLocale } = useI18n()

instance.locale = 'de' // only the locale
switchLocale('de') // the locale, then the adapter's push to the localized current path
```

Switching does not load anything; add the locale's dictionary first.

`<I18nGroup>` passes a prefixed `t` to a function child. `<I18nT>` and `t()` inside it are not prefixed:

```tsx
<I18nGroup prefix="profile">{({ t }) => <h2>{t('title')}</h2> /* profile.title */}</I18nGroup>
```

## Routing

The `@solidjs/router` adapter lives in a subpath so the main entry never imports the router. Call it under the router, typically in the router's `root`, where `useNavigate` and `useLocation` work:

```tsx
// src/App.tsx
import { Route, Router, useLocation, useNavigate, type RouteSectionProps } from '@solidjs/router'
import { I18nLink, I18nProvider, I18nSwitcher } from '@i18n-micro/solid'
import { createSolidRouterAdapter } from '@i18n-micro/solid/router'
import { i18n, locales } from './i18n'
import { About, Home } from './pages'

function Root(props: RouteSectionProps) {
  const routingStrategy = createSolidRouterAdapter(locales, 'en', useNavigate(), useLocation())
  return (
    <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={routingStrategy}>
      <I18nLink to="/about">About</I18nLink>
      <I18nSwitcher />
      {props.children}
    </I18nProvider>
  )
}

export default function App() {
  return (
    <Router root={Root}>
      <Route path="/:locale?" component={Home} />
      <Route path="/:locale?/about" component={About} />
    </Router>
  )
}
```

The adapter prefixes every locale except the default (`/about`, `/de/about`), and renders `<I18nLink>` as the router's `<A>`. `getCurrentPath` reads the router's reactive location, so active links and the switcher follow it; a custom strategy gets the same by reading a signal there. Note the argument order: `(locales, defaultLocale, navigate, location)`. For other routers write an adapter with `getCurrentPath`, `push` and `replace` (all required) — see [Router adapter](./#router-adapter).

## SSR

For server rendering, build with `vite-plugin-solid`: the package's `solid` export condition hands it the source, so it compiles for the server. The prebuilt `dist` is for the browser only. The instance has no `destroy()`; create one per app, or one per request on the server, and let it be garbage-collected.

## API

| Export | Entry |
| --- | --- |
| `createI18n`, `SolidI18n`, `I18nProvider`, `useI18n` | `@i18n-micro/solid` |
| `I18nT`, `I18nLink`, `I18nSwitcher`, `I18nGroup` | `@i18n-micro/solid` |
| `I18nContext`, `useI18nContext`, `useI18nLocales`, `useI18nDefaultLocale`, `useI18nRouter` | `@i18n-micro/solid` |
| `defaultPlural`, `FormatService`, `interpolate` | `@i18n-micro/solid` |
| Types: `I18nRoutingStrategy`, `SolidI18nOptions`, `I18nProviderProps`, `UseI18nOptions`, `TranslationKey`, `Locale`, `Translations`, `PluralFunc` | `@i18n-micro/solid` |
| `createSolidRouterAdapter` | `@i18n-micro/solid/router` |

Full signatures: [package reference](/api/packages/solid).

## Related

- [Frameworks](./) — instance options, router adapter, component props
- [Types generator](./types-generator) — autocomplete for keys
- [DevTools UI](./devtools-ui-package) — edit translations in the browser
