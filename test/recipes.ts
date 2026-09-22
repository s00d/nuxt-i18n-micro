import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineRecipes } from 'untestutils'
import { nuxt } from 'untestutils/nuxt'

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

export const recipes = defineRecipes(
  {
    basic: app('basic'),
    'basic-no-ssr': app('basic-no-ssr', 'basic', { NUXT_TEST_NO_SSR: '1' }),
    named: app('named'),
    undefault: app('undefault'),
    'async-components': app('async-components'),
    'auto-detect-no-prefix': app('auto-detect-no-prefix'),
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
    'redirect-security': app('redirect-security'),
    redirect: app('redirect'),
    'seo-auto': app('seo-auto'),
    'seo-og-locale-format': app('seo-og-locale-format'),
    seo: app('seo'),
    serverless: app('serverless'),
    'transition-merge': app('transition-merge'),
    'use-i18n-head': app('use-i18n-head'),
    'use-locale-head': app('use-locale-head'),
    'canonical-whitelist': app('canonical-whitelist'),
    'seo-trailing-slash': nuxt({
      id: 'seo-trailing-slash',
      root: resolve(fixtures, 'seo'),
      run: 'server',
      hashInputs: [resolve(fixtures, 'seo'), moduleSrc],
      nuxtConfig: { i18n: { trailingSlash: 'append' } },
    }),

    'strategy-no-prefix': app('strategy-no-prefix', 'strategy', { STRATEGY: 'no_prefix' }),
    'strategy-prefix': app('strategy-prefix', 'strategy', {
      STRATEGY: 'prefix',
      LOCALE_COOKIE: 'user-locale',
    }),
    'strategy-prefix-except-default': app('strategy-prefix-except-default', 'strategy', {
      STRATEGY: 'prefix_except_default',
    }),
    'strategy-prefix-and-default': app('strategy-prefix-and-default', 'strategy', {
      STRATEGY: 'prefix_and_default',
    }),

    'locale-state-no-prefix': app('locale-state-no-prefix', 'locale-state', {
      STRATEGY: 'no_prefix',
    }),
    'locale-state-prefix': app('locale-state-prefix', 'locale-state', { STRATEGY: 'prefix' }),
    'locale-state-prefix-except-default': app('locale-state-prefix-except-default', 'locale-state', {
      STRATEGY: 'prefix_except_default',
    }),
    'locale-state-prefix-and-default': app('locale-state-prefix-and-default', 'locale-state', {
      STRATEGY: 'prefix_and_default',
    }),

    'cookie-default': app('cookie-default', 'cookie'),
    'cookie-custom-name': app('cookie-custom-name', 'cookie', {
      LOCALE_COOKIE: 'user-change-cookie',
    }),
    'cookie-auto-detect-root': app('cookie-auto-detect-root', 'cookie', { AUTO_DETECT_PATH: '/' }),

    // HMR-only: asserts live locale file reload. Not the default e2e path — see untestutils Drivers docs.
    'translation-watcher': nuxt({
      id: 'translation-watcher',
      root: resolve(fixtures, 'translation-watcher'),
      run: 'dev',
      hashInputs: [resolve(fixtures, 'translation-watcher'), moduleSrc],
    }),
    'translation-watcher-source': nuxt({
      id: 'translation-watcher-source',
      root: resolve(fixtures, 'translation-watcher-source'),
      run: 'dev',
      hashInputs: [resolve(fixtures, 'translation-watcher-source'), moduleSrc],
    }),
  },
  import.meta.url,
)
