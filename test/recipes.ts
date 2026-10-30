import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineRecipes } from 'untestutils'
import { nuxt } from 'untestutils/nuxt'
import { tmpFixture } from './helpers/tmp-fixture.ts'

const fixtures = fileURLToPath(new URL('./fixtures', import.meta.url))
/** Workspace-root module src (fixtures import ../../../src/module). Belt for older untestutils without root-src hash. */
const moduleSrc = fileURLToPath(new URL('../src', import.meta.url))

function app(id: string, dir = id, env?: Record<string, string>) {
  const root = resolve(fixtures, dir)
  return nuxt({
    id,
    root,
    run: 'server',
    env,
    hashInputs: [root, moduleSrc],
  })
}

/**
 * Temp copies behind the `*-tmp` dev recipes. Pass them to `createTranslationWatcherFiles`.
 * Created when vitest loads this module in the main process; forks inherit the paths via env.
 */
export const translationWatcherTmpRoots = {
  watcher: tmpFixture('translation-watcher'),
  source: tmpFixture('translation-watcher-source'),
}

export const recipes = defineRecipes(
  {
    basic: app('basic'),
    named: app('named'),
    undefault: app('undefault'),
    'async-components': app('async-components'),
    'baseurl-prefix': app('baseurl-prefix'),
    content: app('content'),
    'custom-regex': app('custom-regex'),
    'define-i18n-route': app('define-i18n-route'),
    'fallback-locale': app('fallback-locale'),
    hashmode: app('hashmode'),
    hook: app('hook'),
    layer: app('layer'),
    'layout-switch': app('layout-switch'),
    n3: app('n3'),
    'nuxt-seo': app('nuxt-seo'),
    'pages-false': app('pages-false'),
    'pages-false-no-prefix': app('pages-false-no-prefix'),
    redirect: app('redirect'),
    'seo-og-locale-format': app('seo-og-locale-format'),
    seo: app('seo'),
    serverless: app('serverless'),
    'use-i18n-head': app('use-i18n-head'),
    'use-locale-head': app('use-locale-head'),
    'seo-trailing-slash': nuxt({
      id: 'seo-trailing-slash',
      root: resolve(fixtures, 'seo'),
      run: 'server',
      hashInputs: [resolve(fixtures, 'seo'), moduleSrc],
      nuxtConfig: { i18n: { trailingSlash: 'append' } },
    }),

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
    'strategy-prefix-except-default': app('strategy-prefix-except-default', 'strategy', {
      STRATEGY: 'prefix_except_default',
      LOCALE_COOKIE: 'user-locale',
    }),
    // one prefix build run with env overrides: they must reach routing, the server and the client alike
    'strategy-prefix-overrides': app('strategy-prefix-overrides', 'strategy', {
      STRATEGY: 'prefix',
      LOCALE_COOKIE: 'user-locale',
      NUXT_I18N_DEFAULT_LOCALE: 'de',
      NUXT_I18N_DISABLED_LOCALES: 'ru',
    }),
    'strategy-prefix-and-default': app('strategy-prefix-and-default', 'strategy', {
      STRATEGY: 'prefix_and_default',
      LOCALE_COOKIE: 'user-locale',
    }),

    'cookie-default': app('cookie-default', 'cookie'),

    // translation-watcher fixture, production server build — read-only checks for additionalTranslationDirs.
    'translation-watcher-prod': nuxt({
      id: 'translation-watcher-prod',
      root: resolve(fixtures, 'translation-watcher'),
      run: 'server',
      hashInputs: [resolve(fixtures, 'translation-watcher'), moduleSrc],
    }),

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
      hashInputs: [translationWatcherTmpRoots.source, moduleSrc],
    }),
  },
  import.meta.url,
)
