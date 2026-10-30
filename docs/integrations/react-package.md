---
title: 'React and Preact'
description: 'Translations, locale switching and router integration for React and Preact apps with @i18n-micro/react and @i18n-micro/preact.'
outline: 'deep'
---

# React and Preact

`@i18n-micro/react` and `@i18n-micro/preact` wrap the framework-agnostic [runtime](./runtime-package) in a provider, a `useI18n()` hook and four components. Use them in a React or Preact app that is not built with Nuxt. Both packages have the same API; the [Preact](#preact) block lists the few differences, and the shared model is in [Frameworks](./).

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

Peer dependencies: `react` `^18.0.0 || ^19.0.0`; `react-dom` (optional, for rendering); `react-router-dom` `^6.30.6 || ^7.0.0` (optional, only for `@i18n-micro/react/router`). Tested on React 19.3 and 18.3, React Router 7.18 and 6.30.

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

Create the instance once, at module level or in a `useState` initializer, never in a component body. `<I18nProvider>` takes `i18n`, `locales`, `defaultLocale` and `routingStrategy`; an omitted prop keeps the value of an outer provider, the instance included. With no instance at all it builds an instance from the `createI18n` options next to them, so the props stay plain data: `<I18nProvider locale="de" messages={messages}>`. A new `locale` prop builds a new instance with the `messages` of that render. Such an instance lives in the component: if something above it suspends during mount, React throws it away, with whatever was added to it. All `createI18n` options, including `routeMessages`, are in [the instance](./#create-i18n-options).

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

`useI18n()` returns `t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has`, `locale`, `fallbackLocale`, `currentRoute`, `setLocale`, `setRoute`, `getRoute`, `getLocales`, `defaultLocale()`, `getLocaleName`, `switchLocale`, `localePath`, `localeRoute`, `addTranslations`, `addRouteTranslations` and `clearCache`. The component re-renders when the locale, the route or a readable dictionary changes, and when the provider gets a new `locales` or `routingStrategy` object; a dictionary of a locale that is neither active nor fallback renders nothing. `t` and the other translation methods change only with the store, so they are safe in `memo` and effect deps.

`useT` is one string as a value. The component renders only when that string changes, whatever happens to the provider's other props; `<I18nT>` does not depend on them either:

```tsx
const title = useT('page.title')
```

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

Switching does not load anything; add the locale's dictionary first. A store write is synchronous for React, even inside `startTransition`, so a component that suspends on a missing dictionary would show its fallback. `useLocaleSwitch` loads first and keeps the old UI until the dictionary is in:

```tsx
const [switchTo, pending] = useLocaleSwitch((locale) => i18n.loadFromUrl(`/locales/${locale}.json`, { locale }))

<button disabled={pending} onClick={() => switchTo('de')}>Deutsch</button>
```

The last call wins. A failed load rejects and leaves the locale as it was.

`<I18nGroup>` passes a prefixed `t` to a render-prop child. `<I18nT>` and `t()` inside it are not prefixed:

```tsx
<I18nGroup prefix="profile">{({ t }) => <h2>{t('title')}</h2> /* profile.title */}</I18nGroup>
```

## Routing

The React Router adapter lives in a subpath so the main entry never imports `react-router-dom`. It needs `useLocation()` and `useNavigate()`, so create it inside a component under the router:

```tsx
// src/App.tsx
import { useMemo } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { I18nLink, I18nProvider, I18nSwitcher } from '@i18n-micro/react'
import { createReactRouterAdapter } from '@i18n-micro/react/router'
import { i18n, locales } from './i18n'
import { About, Home } from './pages'

function Localized() {
  const location = useLocation()
  const navigate = useNavigate()
  // memoized: a new object on every render re-renders every `useI18n()` consumer
  const routingStrategy = useMemo(() => createReactRouterAdapter(locales, 'en', location, navigate), [location, navigate])
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

`renderToString` works: `useI18n()` has a server snapshot. Create one instance per request and add its dictionaries before you render, so requests in different locales do not share state, or pass plain data to the provider.

### Hydration

Numbers, plurals and text hydrate as they are. A date depends on the time zone and a relative date on the clock: set `timeZone` on the server and in the browser, and for `tdr` hand the browser the server's time with `now`. `<I18nT>` with `date` or `relativeDate` sets `suppressHydrationWarning`, so a difference does not fail hydration, but the server's text stays until the text changes. That reaches one level only: `children` that wrap the translation in an element still fail on a difference, so give those the same `timeZone`.

### Server Components

The package marks its client code with `'use client'`. `@i18n-micro/react/server` has `createI18n` and an `I18nT` without hooks that takes the instance as a prop, so the text stays out of the client bundle. Under the `react-server` condition, as in the Next.js app router, the main entry resolves to it too, but TypeScript does not know that by default: import from `/server`. `@i18n-micro/react/client` always gives the client entry.

```tsx
// app/[locale]/layout.tsx: a server component
import { cache } from 'react'
import { createI18n, I18nT } from '@i18n-micro/react/server'
import { I18nProvider } from '@i18n-micro/react/client'
import { loadMessages } from './messages'

const getI18n = cache(async (locale: string) => createI18n({ locale, messages: await loadMessages(locale) }))

export default async function Layout({ params, children }) {
  const { locale } = await params
  const i18n = await getI18n(locale)
  return (
    <I18nProvider locale={locale} messages={{ [locale]: i18n.resolveTranslations() }}>
      <h1>
        <I18nT i18n={i18n} keypath="title" />
      </h1>
      {children}
    </I18nProvider>
  )
}
```

Rendered through `react-server-dom-webpack`; a Next.js app itself has not been run against this.

## API

| Export | Entry |
| --- | --- |
| `createI18n`, `ReactI18n`, `I18nProvider`, `useI18n`, `useT`, `useLocaleSwitch` | `@i18n-micro/react` |
| `I18nT`, `I18nLink`, `I18nSwitcher`, `I18nGroup` | `@i18n-micro/react` |
| `I18nContext`, `I18nConfigContext`, `useI18nContext`, `useI18nLocales`, `useI18nDefaultLocale`, `useI18nRouter` | `@i18n-micro/react` |
| `defaultPlural`, `FormatService`, `interpolate` | `@i18n-micro/react` |
| Types: `I18nRoutingStrategy`, `ReactI18nOptions`, `I18nProviderProps`, `UseI18nReturn`, component props, `TranslationKey`, `Locale`, `Translations`, `PluralFunc` | `@i18n-micro/react` |
| `createReactRouterAdapter` | `@i18n-micro/react/router` |
| `createI18n`, `ReactI18n`, `I18nT` (takes `i18n`) | `@i18n-micro/react/server` |

Full signatures: [React reference](/api/packages/react).

## Preact

`@i18n-micro/preact` is built from the same source, on Preact itself, without `preact/compat`: the same instance, provider, hooks and components. Differences:

| | React | Preact |
| --- | --- | --- |
| Peer dependency | `react` (+ optional `react-router-dom`) | `preact` `^10.27.2 \|\| ^11.0.0`, tested on 10.29 and 11.1 |
| Instance class | `ReactI18n` | `PreactI18n` |
| Router adapter | `createReactRouterAdapter` from `/router` | `createBrowserHistoryAdapter(locales, defaultLocale)` from `/router` |
| Re-render | `useSyncExternalStore` | a layout-effect subscription that re-checks the store |
| Server Components | `/server`, `/client` | none |

`createBrowserHistoryAdapter` works with any History API router (wouter, preact-router): `push` and `replace` call `history.pushState` / `replaceState` and dispatch `popstate`, and `<I18nLink>` renders a plain `<a>` that navigates through `push`.

```tsx
// src/main.tsx
import { render } from 'preact'
import { createI18n, I18nProvider } from '@i18n-micro/preact'
import { createBrowserHistoryAdapter } from '@i18n-micro/preact/router'
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
