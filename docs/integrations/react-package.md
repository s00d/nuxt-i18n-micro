---
title: 'React and Preact'
description: 'Translations, locale switching and router integration for React and Preact apps with @i18n-micro/react and @i18n-micro/preact.'
outline: 'deep'
---

# React and Preact

`@i18n-micro/react` and `@i18n-micro/preact` wrap the framework-agnostic [runtime](./runtime-package) in a provider, a `useI18n()` hook and four components. Use them in a client-rendered React or Preact app that is not built with Nuxt. Both packages have the same API; the [Preact](#preact) block lists the few differences, and the shared model is in [Frameworks](./).

## Install

::: code-group

```bash [pnpm]
pnpm add @i18n-micro/react
```

```bash [npm]
npm install @i18n-micro/react
```

```bash [yarn]
yarn add @i18n-micro/react
```

:::

Peer dependencies: `react` `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`; `react-router-dom` `^6.30.6 || ^7.0.0` (optional, only for `@i18n-micro/react/router`).

## Setup

```tsx
// src/main.tsx
import { createRoot } from 'react-dom/client'
import { createI18n, I18nProvider } from '@i18n-micro/react'
import App from './App'
import en from './locales/en.json'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
]

const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en } })

createRoot(document.getElementById('root')!).render(
  <I18nProvider i18n={i18n} locales={locales} defaultLocale="en">
    <App />
  </I18nProvider>,
)
```

Create the instance once, at module level or in a `useState` initializer, never in a component body. `<I18nProvider>` takes `i18n` (required), `locales`, `defaultLocale` and `routingStrategy`; an omitted prop keeps the value of an outer provider. All `createI18n` options, including `routeMessages`, are in [the instance](./#create-i18n-options).

## Translate

```tsx
import { useI18n } from '@i18n-micro/react'

export function Greeting() {
  const { t, tc, tn } = useI18n()
  return (
    <>
      <h1>{t('greeting', { name: 'Ada' })}</h1> {/* Hello, Ada! */}
      <p>{tc('apples', 3)}</p> {/* 3 apples */}
      <p>{tn(1234.5)}</p>
    </>
  )
}
```

`useI18n()` returns `t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has`, `locale`, `fallbackLocale`, `currentRoute`, `setLocale`, `setRoute`, `getRoute`, `getLocales`, `defaultLocale()`, `getLocaleName`, `switchLocale`, `localePath`, `localeRoute`, `addTranslations`, `addRouteTranslations` and `clearCache`. The component re-renders when the locale, the route or any dictionary changes.

Load more dictionaries at any time:

```tsx
const { addTranslations, addRouteTranslations, setRoute } = useI18n()

useEffect(() => {
  import('./locales/de.json').then((m) => addTranslations('de', m.default))
  addRouteTranslations('en', 'about', { title: 'About us' })
  setRoute('about') // t('title') now reads the 'about' dictionary first
}, [])
```

The instance itself also has `loadFromUrl(url, { locale, routeName })` for JSON over `fetch`.

## Switch locale

```tsx
const { setLocale, switchLocale } = useI18n()

setLocale('de') // only the locale
switchLocale('de') // the locale, then the adapter's push to the localized current path
```

Switching does not load anything; add the locale's dictionary first.

`<I18nGroup>` passes a prefixed `t` to a render-prop child. `<I18nT>` and `t()` inside it are not prefixed:

```tsx
<I18nGroup prefix="profile">{({ t }) => <h2>{t('title')}</h2> /* profile.title */}</I18nGroup>
```

## Routing

The React Router adapter lives in a subpath so the main entry never imports `react-router-dom`. It needs `useLocation()` and `useNavigate()`, so create it inside a component under the router:

```tsx
// src/App.tsx
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { I18nLink, I18nProvider, I18nSwitcher } from '@i18n-micro/react'
import { createReactRouterAdapter } from '@i18n-micro/react/router'
import { i18n, locales } from './i18n'
import { About, Home } from './pages'

function Localized() {
  const routingStrategy = createReactRouterAdapter(locales, 'en', useLocation(), useNavigate())
  return (
    <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={routingStrategy}>
      <I18nLink to="/about">About</I18nLink>
      <I18nSwitcher />
      <Routes>
        <Route path="/:locale?" element={<Home />} />
        <Route path="/:locale?/about" element={<About />} />
      </Routes>
    </I18nProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Localized />
    </BrowserRouter>
  )
}
```

The adapter prefixes every locale except the default (`/about`, `/de/about`) and renders `<I18nLink>` as React Router's `<Link>`. Set the locale from the URL yourself (for example from `useParams().locale` in an effect). For any other router write an adapter with `getCurrentPath`, `push` and `replace` (all required) — see [Router adapter](./#router-adapter).

## SSR

`renderToString` works: `useI18n()` has a server snapshot. Create one instance per request and add its dictionaries before you render, so requests in different locales do not share state.

## API

| Export | Entry |
| --- | --- |
| `createI18n`, `ReactI18n`, `I18nProvider`, `useI18n` | `@i18n-micro/react` |
| `I18nT`, `I18nLink`, `I18nSwitcher`, `I18nGroup` | `@i18n-micro/react` |
| `I18nContext`, `I18nLocalesContext`, `I18nDefaultLocaleContext`, `I18nRouterContext`, `useI18nContext`, `useI18nLocales`, `useI18nDefaultLocale`, `useI18nRouter` | `@i18n-micro/react` |
| `defaultPlural`, `FormatService`, `interpolate` | `@i18n-micro/react` |
| Types: `I18nRoutingStrategy`, `ReactI18nOptions`, `I18nProviderProps`, `UseI18nReturn`, component props, `TranslationKey`, `Locale`, `Translations`, `PluralFunc` | `@i18n-micro/react` |
| `createReactRouterAdapter` | `@i18n-micro/react/router` |

Full signatures: [React reference](/api/packages/react).

## Preact

`@i18n-micro/preact` has the same instance, provider, hook and components. Differences:

| | React | Preact |
| --- | --- | --- |
| Peer dependency | `react` (+ optional `react-router-dom`) | `preact` `^10.27.2 \|\| ^11.0.0-0` |
| Instance class | `ReactI18n` | `PreactI18n` |
| Router adapter | `createReactRouterAdapter` from `/router` | `createBrowserHistoryAdapter(locales, defaultLocale)` from the main entry; `createPreactRouterAdapter` is the same function |
| Re-render | `useSyncExternalStore` | `useState` + `useEffect` subscription |

`createBrowserHistoryAdapter` works with any History API router (wouter, preact-router): `push` and `replace` call `history.pushState` / `replaceState` and dispatch `popstate`, and `<I18nLink>` renders a plain `<a>` that navigates through `push`.

```tsx
// src/main.tsx
import { render } from 'preact'
import { createBrowserHistoryAdapter, createI18n, I18nProvider } from '@i18n-micro/preact'
import { App } from './App'
import en from './locales/en.json'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
]
const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en } })

render(
  <I18nProvider i18n={i18n} locales={locales} defaultLocale="en" routingStrategy={createBrowserHistoryAdapter(locales, 'en')}>
    <App />
  </I18nProvider>,
  document.getElementById('app')!,
)
```

Full signatures: [Preact reference](/api/packages/preact).

## Related

- [Frameworks](./) — instance options, router adapter, component props
- [Runtime](./runtime-package) — the instance these packages build on
- [Types generator](./types-generator) — autocomplete for keys
