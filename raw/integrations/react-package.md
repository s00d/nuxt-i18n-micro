# React and Preact

`@i18n-micro/react` and `@i18n-micro/preact` wrap the framework-agnostic [runtime](./runtime-package) in a provider, a `useI18n()` hook and four components. Use them in a React or Preact app that is not built with Nuxt. Both packages have the same API; the [Preact](#preact) block lists the few differences, and the shared model is in [Frameworks](./).

## Install

<code-group>

```bash [pnpm]
pnpm add @i18n-micro/react
```

```bash [npm]
npm install @i18n-micro/react
```

```bash [yarn]
yarn add @i18n-micro/react
```

</code-group>

Peer dependencies: `react` `^18.0.0 || ^19.0.0`; `react-dom` (optional, for rendering); `react-router-dom` `^6.0.0 || ^7.0.0` (optional, only for `@i18n-micro/react/router`). Tested on React 19.3 and 18.3, React Router 7.18 and 6.30.

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

<warning>

Create the instance once, at module level or in a `useState` initializer, never in a component body.

</warning>

`<I18nProvider>` takes `i18n`, `locales`, `defaultLocale` and `routingStrategy`:

- An omitted prop keeps the value of an outer provider, the instance included.
- With no instance at all, it builds one from the `createI18n` options next to them, so the props stay plain data: `<I18nProvider locale="de" messages={messages}>`.
- A new `locale` prop builds a new instance with the `messages` of that render. Such an instance lives in the component: if something above it suspends during mount, React throws it away, with whatever was added to it.

All `createI18n` options, including `routeMessages`, are in [the instance](./#the-instance).

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

`useI18n()` returns:

<table>
<thead>
  <tr>
    <th>
      Group
    </th>
    
    <th>
      Members
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Translate
    </td>
    
    <td>
      <code>
        t
      </code>
      
      , <code>
        ts
      </code>
      
      , <code>
        tc
      </code>
      
      , <code>
        tn
      </code>
      
      , <code>
        td
      </code>
      
      , <code>
        tdr
      </code>
      
      , <code>
        has
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Locale and route
    </td>
    
    <td>
      <code>
        locale
      </code>
      
      , <code>
        fallbackLocale
      </code>
      
      , <code>
        currentRoute
      </code>
      
      , <code>
        setLocale
      </code>
      
      , <code>
        setRoute
      </code>
      
      , <code>
        getRoute
      </code>
      
      , <code>
        getLocales
      </code>
      
      , <code>
        defaultLocale()
      </code>
      
      , <code>
        getLocaleName
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Routing
    </td>
    
    <td>
      <code>
        switchLocale
      </code>
      
      , <code>
        localePath
      </code>
      
      , <code>
        localeRoute
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Dictionaries
    </td>
    
    <td>
      <code>
        addTranslations
      </code>
      
      , <code>
        addRouteTranslations
      </code>
      
      , <code>
        clearCache
      </code>
    </td>
  </tr>
</tbody>
</table>

- The component re-renders when the locale, the route or a readable dictionary changes, and when the provider gets a new `locales` or `routingStrategy` object. A dictionary of a locale that is neither active nor fallback renders nothing.
- `t` and the other translation methods change only with the store, so they are safe in `memo` and effect deps.

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

<table>
<thead>
  <tr>
    <th>
      Export
    </th>
    
    <th>
      Entry
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        createI18n
      </code>
      
      , <code>
        ReactI18n
      </code>
      
      , <code>
        I18nProvider
      </code>
      
      , <code>
        useI18n
      </code>
      
      , <code>
        useT
      </code>
      
      , <code>
        useLocaleSwitch
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/react
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        I18nT
      </code>
      
      , <code>
        I18nLink
      </code>
      
      , <code>
        I18nSwitcher
      </code>
      
      , <code>
        I18nGroup
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/react
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        I18nContext
      </code>
      
      , <code>
        I18nConfigContext
      </code>
      
      , <code>
        useI18nContext
      </code>
      
      , <code>
        useI18nLocales
      </code>
      
      , <code>
        useI18nDefaultLocale
      </code>
      
      , <code>
        useI18nRouter
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/react
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        defaultPlural
      </code>
      
      , <code>
        FormatService
      </code>
      
      , <code>
        interpolate
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/react
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Types: <code>
        I18nRoutingStrategy
      </code>
      
      , <code>
        ReactI18nOptions
      </code>
      
      , <code>
        I18nProviderProps
      </code>
      
      , <code>
        UseI18nReturn
      </code>
      
      , component props, <code>
        TranslationKey
      </code>
      
      , <code>
        Locale
      </code>
      
      , <code>
        Translations
      </code>
      
      , <code>
        PluralFunc
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/react
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createReactRouterAdapter
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/react/router
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createI18n
      </code>
      
      , <code>
        ReactI18n
      </code>
      
      , <code>
        I18nT
      </code>
      
       (takes <code>
        i18n
      </code>
      
      )
    </td>
    
    <td>
      <code>
        @i18n-micro/react/server
      </code>
    </td>
  </tr>
</tbody>
</table>

Full signatures: [React reference](/api/packages/react).

## Preact

`@i18n-micro/preact` is built from the same source, on Preact itself, without `preact/compat`: the same instance, provider, hooks and components. Differences:

<table>
<thead>
  <tr>
    <th>
      
    </th>
    
    <th>
      React
    </th>
    
    <th>
      Preact
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Peer dependency
    </td>
    
    <td>
      <code>
        react
      </code>
      
       (+ optional <code>
        react-router-dom
      </code>
      
      )
    </td>
    
    <td>
      <code>
        preact
      </code>
      
       <code>
        ^10.0.0 || ^11.0.0
      </code>
      
      , tested on 10.29 and 11.1
    </td>
  </tr>
  
  <tr>
    <td>
      Instance class
    </td>
    
    <td>
      <code>
        ReactI18n
      </code>
    </td>
    
    <td>
      <code>
        PreactI18n
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Router adapter
    </td>
    
    <td>
      <code>
        createReactRouterAdapter
      </code>
      
       from <code>
        /router
      </code>
    </td>
    
    <td>
      <code>
        createBrowserHistoryAdapter(locales, defaultLocale, ssrUrl?)
      </code>
      
       from <code>
        /router
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Re-render
    </td>
    
    <td>
      <code>
        useSyncExternalStore
      </code>
    </td>
    
    <td>
      a layout-effect subscription that re-checks the store
    </td>
  </tr>
  
  <tr>
    <td>
      Server Components
    </td>
    
    <td>
      <code>
        /server
      </code>
      
      , <code>
        /client
      </code>
    </td>
    
    <td>
      none
    </td>
  </tr>
</tbody>
</table>

`createBrowserHistoryAdapter` works with any History API router (wouter, preact-router): `push` and `replace` call `history.pushState` / `replaceState` and dispatch `popstate`, and `<I18nLink>` renders a plain `<a>` that navigates through `push`. A server has no address bar: pass the request's URL as `ssrUrl`, or links and the switcher render as on `/`. In a browser the address bar wins.

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

<card-group>
<card icon="i-lucide-book-open" title="Frameworks" to="./">

Instance options, router adapter, component props

</card>

<card icon="i-lucide-book-open" title="Runtime" to="./runtime-package">

The instance these packages build on

</card>

<card icon="i-lucide-book-open" title="Types generator" to="./types-generator">

Autocomplete for keys

</card>
</card-group>
