import { fileURLToPath } from 'node:url'

/**
 * Manifest of "shared" fixtures: fixtures whose specs do NOT override
 * nuxtConfig and therefore can all run against a single prebuilt server.
 *
 * fixture name -> spec files (relative to test dir) that use it.
 *
 * Specs that pass a custom `nuxtConfig` (strategy, locale-state, cookie, ...)
 * or run in dev mode (translation-watcher*) are NOT listed here — they keep
 * their own per-worker builds.
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
}

/** Specs that override nuxtConfig — one isolated build per worker. */
export const ISOLATED_SPECS = [
  'canonical-query-whitelist.spec.ts',
  'cookie-replace.spec.ts',
  'cookie.spec.ts',
  'locale-state-prefix-and-default.spec.ts',
  'locale-state-prefix-except-default.spec.ts',
  'locale-state-prefix.spec.ts',
  'locale-state.spec.ts',
  'no-prefix.spec.ts',
  'no-ssr.spec.ts',
  'prefix-and-default.spec.ts',
  'prefix-except-default.spec.ts',
  'prefix.spec.ts',
  'redirect-prerender.spec.ts',
]

/** Dev-mode specs that mutate fixture files — always serial. */
export const DEV_SPECS = ['translation-watcher.spec.ts', 'translation-watcher-source.spec.ts']

export const SHARED_SPECS = Object.values(SHARED_FIXTURES).flat()

export function fixtureDir(name: string): string {
  return fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url))
}

export function envKey(name: string): string {
  return `NUXT_TEST_URL_${name.toUpperCase().replace(/-/g, '_')}`
}
