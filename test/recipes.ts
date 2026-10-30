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
  const root = resolve(fixtures, dir)
  return nuxt({
    id,
    root,
    run: 'server',
    env,
    nuxtConfig,
    hashInputs: [root, moduleSrc],
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
    content: app('content'),
    'custom-regex': app('custom-regex'),
    layer: app('layer'),
    n3: app('n3'),
    'nuxt-seo': app('nuxt-seo'),
    'pages-false': app('pages-false'),
    'pages-false-no-prefix': app('pages-false-no-prefix', 'pages-false', { STRATEGY: 'no_prefix' }),
    redirect: app('redirect'),
    seo: app('seo'),
    serverless: app('serverless'),
    'use-i18n-head': app('use-i18n-head'),
    'seo-trailing-slash': app('seo-trailing-slash', 'seo', undefined, { i18n: { trailingSlash: 'append' } }),

    // LOCALE_COOKIE on all four: the force-locale plugin (header x-test-force-locale) writes `user-locale`,
    // and the journeys assert the module leaves it alone. no_prefix also detects from Accept-Language.
    'strategy-no-prefix': app('strategy-no-prefix', 'strategy', {
      STRATEGY: 'no_prefix',
      LOCALE_COOKIE: 'user-locale',
      AUTO_DETECT_LANGUAGE: '1',
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
    }),
    // global URL shapes: each would break every other journey's URLs, so each is its own build
    'strategy-hashmode': app('strategy-hashmode', 'strategy', { STRATEGY: 'prefix_except_default' }, { router: { options: { hashMode: true } } }),
    'strategy-baseurl': app('strategy-baseurl', 'strategy', { STRATEGY: 'prefix' }, { app: { baseURL: '/examples' } }),

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
