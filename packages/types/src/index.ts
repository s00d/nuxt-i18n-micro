/** BCP-47 locale code string (e.g. `'en'`, `'de-DE'`, `'zh-Hans'`). */
export type LocaleCode = string

/**
 * Key registry for typed translation keys.
 * Users (via `@i18n-micro/types-generator`) extend this interface through
 * TypeScript module augmentation to get autocompletion for `$t()` calls.
 */
export interface DefineLocaleMessage {
  // Module augmentation point - will be extended by @i18n-micro/types-generator
  readonly __augmentation?: never
}

/**
 * Resolved translation key type.
 * - When `DefineLocaleMessage` is empty (generator not connected) — resolves to `string`.
 * - When `DefineLocaleMessage` has keys — resolves to a union of those keys **and** `string`,
 *   providing autocompletion while still allowing dynamic keys.
 */
export type TranslationKey = keyof DefineLocaleMessage extends never ? string : keyof DefineLocaleMessage | string

/**
 * Helper for creating typed prefixes.
 * Allows safe usage of dynamic keys.
 *
 * @example
 * ```typescript
 * // Assuming keys: 'errors.404', 'errors.500', 'btn.save'
 * function getErrorText(code: string) {
 *   return t(`errors.${code}` as ScopedKey<'errors'>)
 * }
 * ```
 */
export type ScopedKey<Scope extends string> = Extract<TranslationKey, `${Scope}.${string}`>

/**
 * Locale configuration object.
 *
 * Supports arbitrary custom properties via the index signature `[key: string]: unknown`.
 * To get full TypeScript support for your custom properties, use module augmentation:
 *
 * ```typescript
 * // app/i18n.d.ts (or any .d.ts file included in your tsconfig)
 * declare module '@i18n-micro/types' {
 *   interface Locale {
 *     flag?: string
 *     currency?: string
 *   }
 * }
 * ```
 *
 * Then access them with full typing:
 * ```typescript
 * const locales = $getLocales()
 * locales[0].flag     // string | undefined  (typed!)
 * locales[0].currency // string | undefined  (typed!)
 * ```
 */
export interface Locale {
  /** BCP-47 locale code (e.g. `'en'`, `'de-DE'`, `'zh-Hans'`). Used in URLs and as file/key identifier. */
  code: LocaleCode
  /** When `true`, this locale is excluded from route generation and language switching. */
  disabled?: boolean
  /** ISO 639-1 / BCP-47 tag for `<html lang>` and `hreflang` SEO attributes (e.g. `'en-US'`). */
  iso?: string
  /** Text direction. Reflected in `<html dir>` when the locale is active. */
  dir?: 'ltr' | 'rtl' | 'auto'
  /** Human-readable name shown in language switchers (e.g. `'English'`, `'Deutsch'`). */
  displayName?: string
  /**
   * Per-locale base URL for SEO meta tags.
   * Useful for multi-domain setups where each locale lives on its own domain
   * (e.g. `'https://en.example.com'`).
   */
  baseUrl?: string
  /**
   * When `true`, this locale is treated as the "base default" for the domain
   * specified in `baseUrl`. Affects canonical URL generation in multi-domain setups.
   */
  baseDefault?: boolean
  /**
   * Locale code to fall back to when a translation key is missing in this locale.
   * Overrides the global `fallbackLocale` for this specific locale.
   */
  fallbackLocale?: string
  /** Allows arbitrary extra properties for user-defined locale metadata. */
  [key: string]: unknown
}

/**
 * Per-page i18n configuration declared via `defineI18nRoute()` in page components.
 */
export interface DefineI18nRouteConfig {
  /**
   * Restrict which locales this page is available in.
   * - `string[]` — list of allowed locale codes.
   * - `Record<LocaleCode, Translations>` — allowed locales with inline translation overrides.
   */
  locales?: string[] | Record<LocaleCode, Translations>
  /** Per-locale custom route paths (e.g. `{ en: '/about', de: '/ueber-uns' }`). */
  localeRoutes?: Record<LocaleCode, string>
  /**
   * Disable SEO meta tag generation for this page.
   * - `true` — disable all meta tags.
   * - `string[]` — disable only for the listed locale codes.
   */
  disableMeta?: boolean | string[]
}

/** Locale-specific route params for `$switchLocalePath` and `<i18n-link>`. */
export type I18nRouteParams = Record<LocaleCode, Record<string, string>> | null

/** Interpolation parameters passed to the `t()` function. */
export type Params = Record<string, string | number | boolean>

/** Getter function signature used by pluralization to resolve nested keys. */
export type Getter = (key: TranslationKey, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown

/**
 * Custom pluralization function.
 * Called when `tc()` / `$tc()` is used. Receives the key, count, params, locale,
 * and a getter to fetch the singular/plural forms from translations.
 */
export type PluralFunc = (key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string | null

/**
 * Global per-route locale configuration.
 * - `Record<string, string>` — custom paths per locale for the route.
 * - `false` — exclude the route from localization entirely.
 * - `true` — include with default behavior.
 */
export type GlobalLocaleRoutes = Record<string, Record<LocaleCode, string> | false | boolean> | null | undefined

/** URL routing strategy for locale handling. */
export type Strategies = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'

/**
 * Callback invoked when a translation key is missing.
 * Useful for logging, reporting, or providing dynamic fallbacks.
 */
export type MissingHandler = (locale: string, key: TranslationKey, routeName: string, instance?: unknown, type?: string) => void

export interface ModuleOptions {
  /**
   * List of supported locales.
   * Each entry defines a locale code plus optional metadata (ISO, direction, display name, etc.).
   * @default []
   */
  locales?: Locale[]

  /**
   * Generate SEO meta tags (`hreflang`, `canonical`, `og:url`, `og:locale`) automatically.
   * @default true
   */
  meta?: boolean

  /**
   * URL routing strategy for locale prefixes.
   * - `'no_prefix'` — no locale in URL; locale stored in cookie.
   * - `'prefix_except_default'` — prefix all locales except the default.
   * - `'prefix'` — always prefix, including the default locale.
   * - `'prefix_and_default'` — like `prefix`, but the default locale is also accessible without prefix.
   * @default 'prefix_except_default'
   */
  strategy?: Strategies

  /**
   * Base URL for SEO meta tags (canonical, og:url, hreflang).
   * - `undefined` — dynamically resolved from the current request URL
   *   (`useRequestURL().origin` on server, `window.location.origin` on client).
   *   Best for multi-domain deployments.
   * - A concrete URL string (e.g. `'https://example.com'`) — used as-is.
   * @default undefined
   */
  metaBaseUrl?: string

  /**
   * Trust the `X-Forwarded-Host` header when resolving the base URL for meta tags.
   * Enable when the app runs behind a reverse proxy (nginx, Cloudflare, AWS ALB, etc.)
   * that sets this header to the real client-facing hostname.
   * @default true
   */
  metaTrustForwardedHost?: boolean

  /**
   * Trust the `X-Forwarded-Proto` header when resolving the protocol for meta tags.
   * Enable when the app runs behind a TLS-terminating proxy so that
   * canonical URLs use `https://` even though the app itself listens on HTTP.
   * @default true
   */
  metaTrustForwardedProto?: boolean

  /**
   * Register the `defineI18nRoute()` macro plugin, enabling per-page `defineI18nRoute()` calls.
   * @default true
   */
  define?: boolean

  /**
   * Enable automatic locale-based redirects.
   * When `true`, visitors are redirected to their preferred locale (detected from cookie,
   * `Accept-Language` header, or the default) on the first visit.
   * @default true
   */
  redirects?: boolean

  /**
   * Register the core i18n plugin that provides `$t()`, `$tc()`, `$getLocale()`,
   * `$switchLocale()`, and other runtime helpers.
   * @default true
   */
  plugin?: boolean

  /**
   * Register the i18n hooks plugin that provides `i18n:register` and `i18n:beforeLocaleSwitch`
   * / `i18n:afterLocaleSwitch` app-level hooks.
   * @default true
   */
  hooks?: boolean

  /**
   * Register built-in i18n components (`<i18n-link>`, `<i18n-switcher>`, `<i18n-t>`, `<i18n-group>`).
   * Set to `false` to disable automatic component registration (e.g. if you don't use them
   * and want to reduce the module footprint).
   * @default true
   */
  components?: boolean

  /**
   * The locale to use when no locale can be determined from URL or user preferences.
   * Also used as the fallback locale for missing translations when `fallbackLocale` is not set.
   * @default 'en'
   */
  defaultLocale?: string

  /**
   * Base URL path segment for the translations API route (used in SSR/SSG data fetching).
   * Can also be set via `NUXT_I18N_APP_BASE_URL` environment variable.
   * @default '_locales'
   */
  apiBaseUrl?: string

  /**
   * Override the host used for client-side translation fetch requests.
   * Useful when the client reaches the server via a different hostname than the one Nuxt sees.
   * Can also be set via `NUXT_I18N_APP_BASE_CLIENT_HOST` environment variable.
   * @default undefined
   */
  apiBaseClientHost?: string

  /**
   * Override the host used for server-side translation fetch requests.
   * Useful in container/microservice setups where the server reaches itself via an internal hostname.
   * Can also be set via `NUXT_I18N_APP_BASE_SERVER_HOST` environment variable.
   * @default undefined
   */
  apiBaseServerHost?: string

  /**
   * Path to the directory containing translation JSON files, relative to the project root.
   * @default 'locales'
   */
  translationDir?: string

  /**
   * Automatically detect the user's preferred language from the `Accept-Language` HTTP header.
   * Used in combination with `autoDetectPath` to decide when detection occurs.
   * @default true
   */
  autoDetectLanguage?: boolean

  /**
   * URL path on which automatic language detection and redirect occur.
   * - `'/'` — detect only on the root path.
   * - `'*'` — detect and redirect on every path (including locale-prefixed ones).
   * @default '/'
   */
  autoDetectPath?: string

  /**
   * Disable the file watcher that auto-creates missing translation files in development mode.
   * @default false
   */
  disableWatcher?: boolean

  /**
   * Generate TypeScript type declarations for `useI18n`, `$t`, and related helpers
   * based on the translation keys in your default locale files.
   * @default true
   */
  types?: boolean

  /**
   * Map route names to other route names to share the same translation files.
   * For example, `{ 'about-us': 'about' }` means the `about-us` page will use
   * translations from the `about` page instead of its own.
   * @default {}
   */
  routesLocaleLinks?: { [key: string]: string }

  /**
   * Custom pluralization function or a path to a file exporting one.
   * When a string path is provided, the file is imported at build time.
   * The function receives `(key, count, params, locale, getter)` and should return
   * the correct plural form as a string, or `null` to fall back to the built-in logic.
   * @default built-in pluralization (singular/plural by count)
   */
  plural?: string | PluralFunc

  /**
   * Disable per-page translation files.
   * When `true`, only global translations (`{locale}.json`) are loaded;
   * page-specific files (`pages/{page}/{locale}.json`) are not generated or loaded.
   * @default false
   */
  disablePageLocales?: boolean

  /**
   * Global fallback locale code.
   * When a translation key is missing in the active locale, the module looks it up
   * in this locale before returning the key itself.
   * @default undefined (no fallback; returns the raw key)
   */
  fallbackLocale?: string

  /**
   * Cookie name for persisting the user's locale preference across sessions.
   * Set to `null` to disable cookie-based persistence.
   * Automatically set to `'user-locale'` for the `no_prefix` strategy if not provided.
   * @default null
   */
  localeCookie?: string | null

  /**
   * Enable verbose debug logging for locale detection, route generation, and translation loading.
   * @default false
   */
  debug?: boolean

  /**
   * Global route-level locale configuration.
   * Allows restricting or customizing locale routes for specific pages without
   * modifying their components.
   * - `false` — exclude the route from localization.
   * - `Record<LocaleCode, string>` — custom per-locale paths.
   * @default {}
   */
  globalLocaleRoutes?: GlobalLocaleRoutes

  /**
   * Custom regular expression (or its string source) for matching locale codes in URL segments.
   * All locale codes defined in `locales` must match this pattern, or a warning is emitted.
   * @default undefined (uses built-in pattern based on locale codes)
   */
  customRegexMatcher?: string | RegExp

  /**
   * For `no_prefix` strategy: enable redirect from a locale-prefixed URL
   * (e.g. `/en/about`) to the unprefixed version (`/about`).
   * @default false
   */
  noPrefixRedirect?: boolean

  /**
   * List of query parameter names preserved in canonical and `og:url` meta tags.
   * Parameters not in this list are stripped from the canonical URL.
   * @default ['page', 'sort', 'filter', 'search', 'q', 'query', 'tag']
   */
  canonicalQueryWhitelist?: string[]

  /**
   * URL patterns (strings or RegExp) to exclude from i18n processing entirely.
   * Matching routes won't get locale prefixes, redirects, or translation loading.
   * Internal Nuxt paths (`/__nuxt_error`, etc.) are always excluded automatically.
   * @default undefined
   */
  excludePatterns?: (string | RegExp)[]

  /**
   * Prefix prepended to localized route names (e.g. `'localized-index'`).
   * Used internally to distinguish original routes from generated locale variants.
   * @default 'localized-'
   */
  localizedRouteNamePrefix?: string

  /**
   * Per-route locale restrictions, extracted from `defineI18nRoute()` calls.
   * Maps a route path (e.g. `'/about'`) to an array of allowed locale codes.
   * Routes not listed have no restrictions (all locales allowed).
   */
  routeLocales?: Record<string, string[]>

  /**
   * Per-route meta tag disabling, extracted from `defineI18nRoute()` calls.
   * Maps a route path to `true` (disable all meta) or an array of locale codes
   * for which meta should be disabled.
   */
  routeDisableMeta?: Record<string, boolean | string[]>

  /**
   * Show console warnings when a translation key is missing.
   * @default true
   */
  missingWarn?: boolean

  /**
   * Enable Hot Module Replacement for translation files in development.
   * When `true`, changes to JSON translation files trigger an automatic reload
   * without a full page refresh.
   * @default true
   */
  hmr?: boolean

  /**
   * Maximum number of entries in the in-memory translation cache.
   * `0` means no limit.
   * @default 0
   */
  cacheMaxSize?: number

  /**
   * Time-to-live (in seconds) for cached translation entries.
   * `0` means entries never expire.
   * @default 0
   */
  cacheTtl?: number

  /**
   * Bucket for experimental/unstable options.
   * Contents may change or be removed without notice between minor versions.
   */
  experimental?: Record<string, unknown>
}

/**
 * Extended module options injected into the Nuxt runtime config.
 * Includes resolved values and build-time metadata.
 */
export interface ModuleOptionsExtend extends ModuleOptions {
  /** Unix timestamp (ms) of the last build. Used for cache-busting translation requests. */
  dateBuild: number
  /** Whether the Nuxt app uses hash-based routing (`router.options.hashMode`). */
  hashMode: boolean
  /** Whether the current build is a static site generation (SSG / `nuxi generate`). */
  isSSG: boolean
  /** Resolved translations API base URL (after env variable / config merging). */
  apiBaseUrl: string
  /** Resolved flag: whether per-page translations are disabled. */
  disablePageLocales: boolean
  /** Resolved flag: whether locale-based redirects are enabled. */
  redirects?: boolean
}

/**
 * Private (server-only) module options passed to Nitro plugins and server middleware.
 * Extends `ModuleOptions` with resolved root paths and directory info.
 */
export interface ModulePrivateOptionsExtend extends ModuleOptions {
  /** Absolute path to the Nuxt project root directory. */
  rootDir: string
  /** Resolved debug flag. */
  debug: boolean
  /** Resolved path to the translations directory. */
  translationDir: string
  /** Resolved fallback locale code. */
  fallbackLocale: string
  /** Resolved translations API base URL. */
  apiBaseUrl: string
  /** Resolved client-side host override. */
  apiBaseClientHost?: string
  /** Resolved server-side host override. */
  apiBaseServerHost?: string
  /** Resolved custom regex matcher (RegExp is serialized to its `.source` string). */
  customRegexMatcher?: string | RegExp
  /** Resolved route-to-route translation sharing map. */
  routesLocaleLinks?: { [key: string]: string }
}

/** Object shape for a translation value that contains singular/plural forms. */
export interface PluralTranslations {
  /** Singular form of the translation (count === 1). */
  singular: string
  /** Plural form of the translation (count !== 1). */
  plural: string
}

/** A translation value without the `unknown` escape hatch. */
export type CleanTranslation = string | number | boolean | Translations | PluralTranslations | null

/** A single translation value — can be a primitive, nested object, plural pair, or `unknown`. */
export type Translation = CleanTranslation | unknown

/** A flat or nested dictionary of translation key-value pairs. */
export interface Translations {
  [key: string]: Translation
}

const init = () => {}

export { init }
