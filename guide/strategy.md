---
url: 'https://s00d.github.io/nuxt-i18n-micro/guide/strategy.md'
description: URL prefix strategies for locale routing.
---

# 🗂️ Routing Strategies in Nuxt I18n Micro

## 📖 Overview

Nuxt I18n Micro controls how locale prefixes appear in URLs through the `strategy` option. Under the hood, two packages implement this:

* **`@i18n-micro/route-strategy`** — build-time route generation (extends Nuxt pages with localized routes)
* **`@i18n-micro/path-strategy`** — runtime path resolution, redirects, SEO attributes, and link generation

The Nuxt module selects the correct strategy class at build time and aliases it via `#i18n-strategy`, so only the chosen implementation is bundled.

## 🚦 Available Strategies

**Type** `Strategies` · **Default** `'prefix_except_default'`

URL routing strategy for locale prefixes.

* `'no_prefix'` — no locale in URL; locale stored in cookie.
* `'prefix_except_default'` — prefix all locales except the default.
* `'prefix'` — always prefix, including the default locale.
* `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix.

### Strategy Comparison

```mermaid
flowchart LR
    subgraph no_prefix["no_prefix"]
        N1["/about"] --> N2["Any locale"]
        N3["/contact"] --> N2
    end

    subgraph prefix_except_default["prefix_except_default"]
        P1["/about"] --> P2["Default (en)"]
        P3["/fr/about"] --> P4["French"]
        P5["/de/about"] --> P6["German"]
    end

    subgraph prefix["prefix"]
        X1["/en/about"] --> X2["English"]
        X3["/fr/about"] --> X4["French"]
        X5["/de/about"] --> X6["German"]
    end

    subgraph prefix_and_default["prefix_and_default"]
        A1["/about"] --> A2["Default (en)"]
        A3["/en/about"] --> A2
        A5["/fr/about"] --> A6["French"]
    end
```

### 🛑 `no_prefix`

URLs have no locale segment. Locale is determined by cookies, `useI18nLocale()` state, or browser detection.

* **Routes**: `/about`, `/contact` — same URL pattern for all locales (no `/en/`, `/fr/` prefix)
* **Locale persistence**: Via `localeCookie` (automatically set to `'user-locale'` if not specified)
* **Custom paths**: Supported via [`globalLocaleRoutes`](/guide/configuration#globallocaleroutes) and [`defineI18nRoute`](/guide/custom-locale-routes) — localized slugs are generated without adding a locale prefix to URLs (e.g. `/about` vs `/ueber-uns`). Nested routes, aliases, and per-locale restrictions are simpler than in `prefix_except_default`.

::: tip Automatic `localeCookie`
When using `no_prefix`, `localeCookie` is automatically set to `'user-locale'` if not specified. This is required because the URL contains no locale information.
:::

```typescript
i18n: {
  strategy: 'no_prefix'
  // localeCookie is automatically set to 'user-locale'
}
```

### 🚧 `prefix_except_default`

All routes have a locale prefix **except** the default locale.

* **Default locale**: `/about`, `/contact`
* **Other locales**: `/fr/about`, `/de/contact`
* **Default locale with prefix returns 404**: `/en/about` → 404 (when `en` is default)

```typescript
i18n: {
  strategy: 'prefix_except_default' // This is the default
}
```

### 🌍 `prefix`

Every route has a locale prefix, including the default locale.

* **All locales**: `/en/about`, `/fr/about`, `/de/about`
* **Root `/`**: Redirects to `/{locale}/` based on user preference

```typescript
i18n: {
  strategy: 'prefix'
}
```

### 🔄 `prefix_and_default`

Default locale is available both with and without prefix. Non-default locales always have a prefix.

* **Default locale**: both `/about` and `/en/about` are valid
* **Other locales**: `/fr/about`, `/de/about`
* **No redirect from `/`**: Both `/` and `/en/` serve the default locale

```typescript
i18n: {
  strategy: 'prefix_and_default'
}
```

## 🔀 Redirect Architecture (v3)

In v3, redirect logic is split into two layers for optimal performance:

### How It Works

```mermaid
flowchart TB
    A["Request"] --> B{Server or Client?}

    B -->|Server SSR| C["Nitro Middleware<br/>i18n.global.ts"]
    C --> D["Sets event.context.i18n.locale"]
    D --> E["Redirect Plugin<br/>06.redirect.ts server only"]
    E --> F{Needs redirect?}
    F -->|Yes| G["302 sendRedirect<br/>(no page render)"]
    F -->|No| H["Continue to render"]

    B -->|Client SPA| I["Route Middleware<br/>i18n-redirect.global.ts"]
    I --> J["Target route locale + getPreferredLocale()"]
    J --> K{Needs redirect?}
    K -->|Yes| L["navigateTo with query and hash"]
    K -->|No| M["Stay on page"]
```

### Server-Side (No Flash)

1. **Nitro middleware** (`i18n.global.ts`) runs first — detects locale from URL, cookie, or `Accept-Language` header and sets `event.context.i18n.locale`
2. **Redirect plugin** (`06.redirect.ts`, server-only) checks if the current path needs a redirect using `i18nStrategy.getClientRedirect()` and issues a 302 **before** any page rendering occurs
3. This prevents the "error flash" where users briefly see a wrong page before redirect

### Client-Side (SPA Navigation)

1. Global route middleware (`i18n-redirect.global.ts`) runs on each client navigation when `redirects` is enabled
2. Derives the preferred locale from the **target route** first, then falls back to `useI18nLocale().getPreferredLocale()`
3. Uses `i18nStrategy.getClientRedirect()` to decide whether a redirect is needed
4. Preserves `query` and `hash` when redirecting

### Locale Priority Order

On the server, the redirect plugin determines the preferred locale in this order:

1. **`useState('i18n-locale')`** — highest priority (set programmatically via `useI18nLocale().setLocale()`)
2. **Cookie** — if `localeCookie` is configured
3. **`Accept-Language` header** — if `autoDetectLanguage: true`
4. **`defaultLocale`** — final fallback

On the client, the route middleware prefers the locale from the target route, then uses the same state/cookie fallback chain.

### Redirect Behavior Per Strategy

| Strategy                | `GET /` behavior                              | Cookie required? |
| ----------------------- | --------------------------------------------- | ---------------- |
| `no_prefix`             | No redirect (locale from cookie/state)        | Auto-set         |
| `prefix`                | 302 → `/{locale}/`                            | Recommended      |
| `prefix_except_default` | 302 → `/{locale}/` if locale ≠ default        | Recommended      |
| `prefix_and_default`    | No redirect (both `/` and `/{locale}/` valid) | Optional         |

### Disabling Redirects

```typescript
i18n: {
  redirects: false // Disables automatic locale redirects
}
```

When `redirects: false`, automatic locale redirects are disabled:

* **Server**: the redirect plugin (`06.redirect.ts`, server-only) remains registered but skips redirect logic. It still performs **404 checks** for invalid locale prefixes (e.g. `/xx/about` where `xx` is not a valid locale) and **cookie synchronization** from URL prefix (e.g. visiting `/fr/about` syncs the cookie to `fr`)
* **Client**: the `i18n-redirect` global route middleware is **not registered** — no SPA auto-redirects

## 🍪 Cookie-Based Locale Persistence

::: warning Required for prefix strategies with redirects
When using `prefix` or `prefix_except_default` with `redirects: true` (the default), you **must** set `localeCookie` for redirects to work correctly. Without a cookie, the redirect plugin cannot remember the user's locale preference across page reloads.

```typescript
i18n: {
  strategy: 'prefix_except_default',
  localeCookie: 'user-locale' // Required for redirects to work properly
}
```

:::

**How `localeCookie` works in v3:**

* Managed internally by `useI18nLocale()` — **do not set it manually** via `useCookie()`
* When a user visits a prefixed URL (e.g., `/fr/about`), the cookie is automatically synced to `fr`
* On next visit to `/`, the cookie value is used to redirect to `/{locale}/`
* If the cookie contains an invalid locale (not in `locales` list), it falls back to `defaultLocale`

| Strategy                | `localeCookie` default | Notes                                |
| ----------------------- | ---------------------- | ------------------------------------ |
| `no_prefix`             | Auto: `'user-locale'`  | Required; set automatically          |
| `prefix`                | `null` (disabled)      | Set to `'user-locale'` for redirects |
| `prefix_except_default` | `null` (disabled)      | Set to `'user-locale'` for redirects |
| `prefix_and_default`    | `null` (disabled)      | Optional                             |

## 🔍 `autoDetectLanguage` and `autoDetectPath`

### `autoDetectLanguage`

**Type** `boolean` · **Default** `true`

Automatically detect the user's preferred language from the `Accept-Language` HTTP header.
Used in combination with `autoDetectPath` to decide when detection occurs.

The check runs in the server middleware and is a fallback: a cookie or existing state wins.

```typescript
i18n: {
  autoDetectLanguage: true
}
```

### `autoDetectPath`

**Type** `string` · **Default** `'/'`

Where cookie / Accept-Language preference redirects may run (when `redirects` is enabled).

* `'/'` — only `/` (deep links in the default locale stay reachable; default)

* `'no_prefix'` — only paths without a locale prefix

* `'*'` — every path, including rewriting an explicit locale prefix
  (e.g. `/fr/about` → `/de/about` when the cookie prefers `de`)

* any other string — exact path match (e.g. `'/welcome'`)

Prefixed strategy cleanup (e.g. `/en` → `/` under `prefix_except_default`) is not gated.

```typescript
i18n: {
  autoDetectPath: '/' // Default: only root
  // autoDetectPath: '*' // All paths — redirects even /fr/about to /de/about
}
```

::: warning `autoDetectPath: '*'`
With `autoDetectPath: '*'`, even URLs with an explicit locale prefix (e.g., `/fr/about`) will be redirected if the user's preferred locale differs. This can be useful for domain-based setups but may confuse users who share URLs.
:::

With the default `autoDetectPath: '/'` and a locale cookie:

| request | cookie | result |
| --- | --- | --- |
| `/` | `de` | 302 → `/de` |
| `/about` | `de` | 200, default locale (no rewrite) |

```typescript
i18n: {
  localeCookie: 'user-locale',
  strategy: 'prefix_except_default',
  // Default — remember language on entry, keep deep links stable
  autoDetectPath: '/',
  // Or redirect on every unprefixed path (but not /de/… → /fr/…):
  // autoDetectPath: 'no_prefix',
}
```

## ⚠️ Known Issues and Best Practices

### 1. Hydration Mismatch in `no_prefix` Strategy

When using `no_prefix`, the locale is determined dynamically. If server and client disagree on the locale, you'll see a hydration mismatch.

**Solution**: Use `useI18nLocale().setLocale()` in a server plugin (with `order: -10`) to set the locale before i18n initialization:

```ts
// plugins/i18n-loader.server.ts
export default defineNuxtPlugin({
  name: 'i18n-custom-loader',
  enforce: 'pre',
  order: -10,
  setup() {
    const { setLocale } = useI18nLocale()
    setLocale('ja') // Your detection logic here
  },
})
```

See [Custom Language Detection](/guide/custom-auto-detect) for detailed examples.

### 2. Use Named Routes with `localeRoute`

Path-based routing can cause issues with route resolution:

```typescript
// May cause issues
$localeRoute('/page')

// Preferred approach
$localeRoute({ name: 'page' })
```

### 3. Using `pages: false` with i18n

When using Nuxt with `pages: false`:

```typescript
export default defineNuxtConfig({
  pages: false,
  i18n: {
    strategy: 'no_prefix', // Recommended
    disablePageLocales: true, // Required
    localeCookie: 'user-locale', // Required for persistence
  },
})
```

**Limitations with `pages: false`:**

* No automatic redirects
* No URL-based locale detection
* Client-side locale switching requires page reload or manual translation loading

### 4. Invalid Cookie Handling

If a cookie contains an invalid locale (not in the `locales` list), the module gracefully falls back to `defaultLocale`. No errors are thrown.

## 📝 Best Practices Summary

| Recommendation            | Details                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------- |
| **Set `localeCookie`**    | Always set for prefix strategies with `redirects: true`                             |
| **Use `useI18nLocale()`** | The centralized way to manage locale state (replaces manual `useState`/`useCookie`) |
| **Use named routes**      | `$localeRoute({ name: 'page' })` over `$localeRoute('/page')`                       |
| **Programmatic locale**   | Use `useI18nLocale().setLocale()` in a server plugin with `order: -10`              |
| **Avoid manual cookies**  | Don't use `useCookie('user-locale')` directly — `useI18nLocale()` manages this      |
