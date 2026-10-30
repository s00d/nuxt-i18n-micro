import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineRecipes } from 'untestutils'
import { nuxt } from 'untestutils/nuxt'
import { tmpFixture } from './helpers/tmp-fixture.ts'

const fixtures = fileURLToPath(new URL('./fixtures', import.meta.url))
/** Workspace-root module src (fixtures import ../../../src/module). Belt for older untestutils without root-src hash. */
const moduleSrc = fileURLToPath(new URL('../src', import.meta.url))

/**
 * One production build of `test/fixtures/<dir>`. `env` reaches nuxt.config at build time and the server at start;
 * `nuxtConfig` is a defu override (arrays concatenate, so never pass `locales` here).
 */
function app(id: string, dir = id, env?: Record<string, string>, nuxtConfig?: Record<string, unknown>) {
  return nuxt({
    id,
    root: resolve(fixtures, dir),
    run: 'server',
    env,
    nuxtConfig,
    // the whole fixture dir: `basic/layer` builds on its parent
    hashInputs: [resolve(fixtures, dir.split('/')[0]!), moduleSrc],
  })
}

/**
 * Temp copies behind the `*-tmp` dev recipes. Pass them to `createTranslationWatcherFiles`.
 * Created when vitest loads this module in the main process; forks inherit the paths via env.
 */
export const translationWatcherTmpRoots = {
  watcher: tmpFixture('translation-watcher'),
  source: tmpFixture('translation-watcher', 'source'),
}

export const recipes = defineRecipes(
  {
    basic: app('basic'),
    // basic under prefix: the default locale gets a prefix too
    'basic-prefix': app('basic-prefix', 'basic', undefined, { i18n: { strategy: 'prefix' } }),
    // basic variants: BASIC_VARIANT in basic/nuxt.config.ts; basic/layer extends basic
    'basic-layer': app('basic-layer', 'basic/layer'),
    'basic-n3': app('basic-n3', 'basic', { BASIC_VARIANT: 'n3' }),
    'basic-pages-false': app('basic-pages-false', 'basic', { BASIC_VARIANT: 'pages-false' }),
    'basic-pages-false-no-prefix': app('basic-pages-false-no-prefix', 'basic', { BASIC_VARIANT: 'pages-false', STRATEGY: 'no_prefix' }),
    'basic-no-plugin': app('basic-no-plugin', 'basic', { BASIC_VARIANT: 'no-plugin' }),
    'basic-serverless': app('basic-serverless', 'basic', { BASIC_VARIANT: 'serverless' }),
    // @nuxt/content and @nuxtjs/seo in one app
    integrations: app('integrations'),
    seo: app('seo'),
    // useI18nHead scenarios: pec en/fr with prerendered, ISR and SPA route rules
    'seo-use-i18n-head': app('seo-use-i18n-head', 'seo', { SEO_VARIANT: 'use-i18n-head' }),
    'seo-trailing-slash': app('seo-trailing-slash', 'seo', undefined, { i18n: { trailingSlash: 'append' } }),

    // LOCALE_COOKIE on all four: the force-locale plugin (header x-test-force-locale) writes `user-locale`,
    // and the journeys assert the module leaves it alone. no_prefix also detects from Accept-Language.
    'strategy-no-prefix': app('strategy-no-prefix', 'strategy', {
      STRATEGY: 'no_prefix',
      LOCALE_COOKIE: 'user-locale',
      AUTO_DETECT_LANGUAGE: '1',
      EXCLUDE_PATTERNS: '/administrator',
    }),
    'strategy-prefix': app('strategy-prefix', 'strategy', {
      STRATEGY: 'prefix',
      LOCALE_COOKIE: 'user-locale',
    }),
    // pec also detects from Accept-Language (autoDetectPath '/'): the layout-switch journey
    'strategy-prefix-except-default': app('strategy-prefix-except-default', 'strategy', {
      STRATEGY: 'prefix_except_default',
      LOCALE_COOKIE: 'user-locale',
      AUTO_DETECT_LANGUAGE: '1',
    }),
    // one prefix build with runtime overrides, one per input: the default locale from env, the disabled
    // locales from runtimeConfig. They must reach routing, the server and the client alike.
    'strategy-prefix-overrides': app(
      'strategy-prefix-overrides',
      'strategy',
      { STRATEGY: 'prefix', LOCALE_COOKIE: 'user-locale', NUXT_I18N_DEFAULT_LOCALE: 'de' },
      { runtimeConfig: { public: { i18nRuntime: { disabledLocales: ['ru'] } } } },
    ),
    'strategy-prefix-and-default': app('strategy-prefix-and-default', 'strategy', {
      STRATEGY: 'prefix_and_default',
      LOCALE_COOKIE: 'user-locale',
      AUTO_DETECT_LANGUAGE: '1',
    }),
    // detection on every path ('*') with a whole-segment exclude: a deep link would be rewritten, so not on pec
    'strategy-redirect': app('strategy-redirect', 'strategy', {
      STRATEGY: 'prefix_except_default',
      LOCALE_COOKIE: 'user-locale',
      AUTO_DETECT_LANGUAGE: '1',
      AUTO_DETECT_PATH: '*',
      EXCLUDE_PATTERNS: '/admin',
    }),
    // locale codes en-us / de-de / ru-ru behind customRegexMatcher
    'strategy-region-codes': app('strategy-region-codes', 'strategy', { STRATEGY: 'prefix_except_default', REGION_CODES: '1' }),
    // global URL shapes: each would break every other journey's URLs, so each is its own build
    'strategy-hashmode': app('strategy-hashmode', 'strategy', { STRATEGY: 'prefix_except_default' }, { router: { options: { hashMode: true } } }),
    'strategy-baseurl': app('strategy-baseurl', 'strategy', { STRATEGY: 'prefix' }, { app: { baseURL: '/examples' } }),
    // disablePageLocales: every page loads the index chunk, the one serverTranslationPreload detects without the route
    'strategy-no-prefix-preload': app(
      'strategy-no-prefix-preload',
      'strategy',
      { STRATEGY: 'no_prefix', LOCALE_COOKIE: 'user-locale' },
      { i18n: { serverTranslationPreload: true, disablePageLocales: true } },
    ),
    'strategy-hash-prefix': app(
      'strategy-hash-prefix',
      'strategy',
      { STRATEGY: 'prefix', AUTO_DETECT_LANGUAGE: '1' },
      { router: { options: { hashMode: true } } },
    ),
    'strategy-spa-prefix': app('strategy-spa-prefix', 'strategy', { STRATEGY: 'prefix', LOCALE_COOKIE: 'user-locale' }, { ssr: false }),
    'strategy-disabled-locale': app('strategy-disabled-locale', 'strategy', { STRATEGY: 'prefix', DISABLED_LOCALE: 'es' }),

    // one build, two domains (en on example.com, de on example.de, ru on both); journeys send a Host
    'strategy-domains-pec': app('strategy-domains-pec', 'strategy', {
      STRATEGY: 'prefix_except_default',
      LOCALE_COOKIE: 'user-locale',
      AUTO_DETECT_LANGUAGE: '1',
      DOMAINS: '/',
    }),
    'strategy-domains-prefix': app('strategy-domains-prefix', 'strategy', { STRATEGY: 'prefix', LOCALE_COOKIE: 'user-locale', DOMAINS: '/' }),
    'strategy-domains-pad': app('strategy-domains-pad', 'strategy', {
      STRATEGY: 'prefix_and_default',
      LOCALE_COOKIE: 'user-locale',
      DOMAINS: '/',
    }),
    'strategy-domains-no-prefix': app('strategy-domains-no-prefix', 'strategy', {
      STRATEGY: 'no_prefix',
      LOCALE_COOKIE: 'user-locale',
      AUTO_DETECT_LANGUAGE: '1',
      DOMAINS: '/',
    }),
    'strategy-domains-trust': app(
      'strategy-domains-trust',
      'strategy',
      { STRATEGY: 'prefix_except_default', DOMAINS: '/' },
      { i18n: { trustForwardedHost: true } },
    ),
    // runtime overrides under domains: de is switched off at runtime, ru is the default of an unknown host
    'strategy-domains-overrides': app(
      'strategy-domains-overrides',
      'strategy',
      { STRATEGY: 'prefix', DOMAINS: '/', NUXT_I18N_DEFAULT_LOCALE: 'ru' },
      { runtimeConfig: { public: { i18nRuntime: { disabledLocales: ['de'] } } } },
    ),
    'strategy-domains-hash': app(
      'strategy-domains-hash',
      'strategy',
      { STRATEGY: 'prefix_except_default', DOMAINS: '/' },
      { router: { options: { hashMode: true } } },
    ),
    'strategy-domains-spa': app('strategy-domains-spa', 'strategy', { STRATEGY: 'prefix_except_default', DOMAINS: '/' }, { ssr: false }),
    'strategy-domains-baseurl': app('strategy-domains-baseurl', 'strategy', { STRATEGY: 'prefix_except_default', DOMAINS: '/shop' }, { app: { baseURL: '/shop' } }),

    // translation-watcher fixture, production server build — read-only checks for additionalTranslationDirs.
    'translation-watcher-prod': app('translation-watcher-prod', 'translation-watcher'),

    // Dev servers for the HMR journeys run from a temp copy, so they never write into the repo tree
    // (the prod recipe hashes and builds the pristine dir). Roots: translationWatcherTmpRoots.
    'translation-watcher-tmp': nuxt({
      id: 'translation-watcher-tmp',
      root: translationWatcherTmpRoots.watcher,
      run: 'dev',
      hashInputs: [translationWatcherTmpRoots.watcher, moduleSrc],
    }),
    'translation-watcher-source-tmp': nuxt({
      id: 'translation-watcher-source-tmp',
      root: translationWatcherTmpRoots.source,
      run: 'dev',
      env: { TRANSLATION_PAYLOADS: 'source' },
      hashInputs: [translationWatcherTmpRoots.source, moduleSrc],
    }),
  },
  import.meta.url,
)
