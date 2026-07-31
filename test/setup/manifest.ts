import { fileURLToPath } from 'node:url'

/**
 * Variants: one fixture source directory built several times with different
 * build-time env, so specs that only differ by module config still get a
 * prebuilt, cached server instead of building inside the test.
 *
 * The fixture's `nuxt.config.ts` reads these env vars. Each variant gets its own
 * build directory and its own entry in `SHARED_FIXTURES`.
 */
export interface FixtureVariant {
  /** Fixture source directory under test/fixtures. */
  dir: string
  /** Build-time env consumed by the fixture's nuxt.config.ts. */
  env: Record<string, string>
}

export const FIXTURE_VARIANTS: Record<string, FixtureVariant> = {
  'strategy-no-prefix': { dir: 'strategy', env: { STRATEGY: 'no_prefix' } },
  'strategy-prefix': { dir: 'strategy', env: { STRATEGY: 'prefix', LOCALE_COOKIE: 'user-locale' } },
  'strategy-prefix-except-default': { dir: 'strategy', env: { STRATEGY: 'prefix_except_default' } },
  'strategy-prefix-and-default': { dir: 'strategy', env: { STRATEGY: 'prefix_and_default' } },
  'locale-state-no-prefix': { dir: 'locale-state', env: { STRATEGY: 'no_prefix' } },
  'locale-state-prefix': { dir: 'locale-state', env: { STRATEGY: 'prefix' } },
  'locale-state-prefix-except-default': { dir: 'locale-state', env: { STRATEGY: 'prefix_except_default' } },
  'locale-state-prefix-and-default': { dir: 'locale-state', env: { STRATEGY: 'prefix_and_default' } },
  'cookie-default': { dir: 'cookie', env: {} },
  'cookie-custom-name': { dir: 'cookie', env: { LOCALE_COOKIE: 'user-change-cookie' } },
  'cookie-auto-detect-root': { dir: 'cookie', env: { AUTO_DETECT_PATH: '/' } },
  'basic-no-ssr': { dir: 'basic', env: { NUXT_TEST_NO_SSR: '1' } },
}

/**
 * Manifest of "shared" fixtures: built once and served for the whole run.
 *
 * fixture (or variant) name -> spec files (relative to test dir) that use it.
 *
 * Only dev-mode specs (translation-watcher*) stay outside: they need a dev
 * server and mutate fixture files.
 */
export const SHARED_FIXTURES: Record<string, string[]> = {
  basic: ['basic.spec.ts', 'locale-server-middleware.spec.ts', 'locale-slug.spec.ts', 'reactivity.spec.ts', 'server.spec.ts'],
  named: ['cookie-redirect.spec.ts', 'named-params.spec.ts'],
  undefault: ['locale-slug-undefault.spec.ts', 'undefault.spec.ts'],
  'async-components': ['async-components.spec.ts'],
  'auto-detect-no-prefix': ['auto-detect-no-prefix.spec.ts'],
  'baseurl-prefix': ['baseurl-prefix-redirect.spec.ts'],
  content: ['content.spec.ts'],
  'custom-regex': ['custom-regex.spec.ts'],
  'define-i18n-route': ['define-i18n-route.spec.ts'],
  'fallback-locale': ['fallback-locale.spec.ts'],
  hashmode: ['hashmode.spec.ts'],
  hook: ['hook.spec.ts'],
  layer: ['layer.spec.ts'],
  'layout-switch': ['layout-switch.spec.ts'],
  n3: ['n3.spec.ts'],
  'nuxt-seo': ['nuxt-seo.spec.ts'],
  'pages-false': ['pages-false.spec.ts'],
  'pages-false-no-prefix': ['pages-false-no-prefix.spec.ts'],
  'redirect-security': ['redirect-security.spec.ts'],
  redirect: ['redirect.spec.ts'],
  'seo-auto': ['seo-auto.spec.ts'],
  'seo-og-locale-format': ['seo-og-locale-format.spec.ts'],
  seo: ['seo.spec.ts'],
  serverless: ['serverless.spec.ts'],
  'transition-merge': ['transition-merge.spec.ts'],
  'use-i18n-head': ['use-i18n-head.spec.ts'],
  'use-locale-head': ['use-locale-head.spec.ts'],
  'canonical-whitelist': ['canonical-query-whitelist.spec.ts'],
  // variants (see FIXTURE_VARIANTS)
  'strategy-no-prefix': ['no-prefix.spec.ts'],
  'strategy-prefix': ['prefix.spec.ts', 'redirect-prerender.spec.ts'],
  'strategy-prefix-except-default': ['prefix-except-default.spec.ts'],
  'strategy-prefix-and-default': ['prefix-and-default.spec.ts'],
  'locale-state-no-prefix': ['locale-state.spec.ts'],
  'locale-state-prefix': ['locale-state-prefix.spec.ts'],
  'locale-state-prefix-except-default': ['locale-state-prefix-except-default.spec.ts'],
  'locale-state-prefix-and-default': ['locale-state-prefix-and-default.spec.ts'],
  'cookie-default': ['cookie.spec.ts'],
  'cookie-custom-name': ['cookie-replace.spec.ts'],
  'cookie-auto-detect-root': ['auto-detect-path.spec.ts'],
  'basic-no-ssr': ['no-ssr.spec.ts'],
}

/** No spec builds its own app any more — everything shared except dev-mode HMR. */
export const ISOLATED_SPECS: string[] = []

/** Dev-mode specs that mutate fixture files — always serial. */
export const DEV_SPECS = ['translation-watcher.spec.ts', 'translation-watcher-source.spec.ts']

export const SHARED_SPECS = Object.values(SHARED_FIXTURES).flat()

/** Source directory for a fixture or a variant of one. */
export function fixtureDir(name: string): string {
  return fileURLToPath(new URL(`../fixtures/${FIXTURE_VARIANTS[name]?.dir ?? name}`, import.meta.url))
}

/** Build-time env for a variant (empty for a plain fixture). */
export function fixtureEnv(name: string): Record<string, string> {
  return FIXTURE_VARIANTS[name]?.env ?? {}
}

export function envKey(name: string): string {
  return `NUXT_TEST_URL_${name.toUpperCase().replace(/-/g, '_')}`
}
