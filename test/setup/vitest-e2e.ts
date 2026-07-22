/**
 * Vitest e2e harness — one runner for every browser spec.
 *
 * Replaces `@nuxt/test-utils/playwright`'s `test.use({ nuxt })` fixture model
 * with a thin wrapper around `@nuxt/test-utils/e2e` driven by Vitest's node
 * runner. The real Playwright browser and real Nuxt servers are preserved;
 * only the runner changes. Spec bodies are unchanged — they still receive
 * `{ page, goto, baseURL }` and use web-first `expect` assertions.
 *
 * Usage (top of a spec):
 *
 *   import { test, describe, expect, setupE2E } from './setup/vitest-e2e'
 *   await setupE2E({ shared: 'basic' })
 *   describe('...', () => {
 *     test('...', async ({ page, goto, baseURL }) => { ... })
 *   })
 *
 * Config shapes:
 *   { shared: name }            → connect to the prebuilt shared-host server
 *   { rootDir, nuxtConfig }     → per-file isolated build (config overrides)
 *   { rootDir, dev: true }      → dev-mode server (HMR specs)
 *
 * Conversion from the old Playwright specs is purely mechanical:
 *   - swap the import + `test.use({ nuxt })` block for the two lines above
 *   - `test.describe(`  → `describe(`
 *   - `test.beforeEach(` → `beforeEach(`  (and afterAll/afterEach/beforeAll)
 *   - drop `test.describe.configure(...)` (Vitest is serial within a file)
 *   - test cases `test('...', ...)` stay as-is
 */
import type { APIRequestContext, Page } from 'playwright-core'
import { createPage, setup, url } from '@nuxt/test-utils/e2e'
// Web-first assertions (auto-retrying toHaveText/toHaveURL) — Vitest's expect
// cannot do these on Playwright locators, so we keep Playwright's expect.
// `request` gives specs a browserless APIRequestContext (HTTP-level checks).
import { expect, request as apiRequest } from '@playwright/test'
import { afterAll, afterEach, beforeAll, beforeEach, describe, test as base } from 'vitest'
import { envKey, fixtureDir } from './manifest'
import { readNuxtHostsFile } from './shared-fixtures-core'

export { afterAll, afterEach, beforeAll, beforeEach, describe, expect }

// Omit (not intersect) the native waitUntil so we can widen it with the
// @nuxt/test-utils extras 'hydration' | 'route' instead of narrowing it away.
type GotoOptions = Omit<NonNullable<Parameters<Page['goto']>[1]>, 'waitUntil'> & {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' | 'hydration' | 'route'
}

export interface E2EFixtures {
  page: Page
  goto: (path: string, options?: GotoOptions) => ReturnType<Page['goto']>
  baseURL: string
  request: APIRequestContext
}

type SharedConfig = { shared: string }
// rootDir + the @nuxt/test-utils setup options specs actually pass. Kept as a
// closed shape (no index signature) so `'shared' in config` discriminates.
type BuildConfig = { rootDir: string; nuxtConfig?: Record<string, unknown>; dev?: boolean; setupTimeout?: number }
export type E2EConfig = SharedConfig | BuildConfig

function resolveSharedHost(name: string): string | undefined {
  // Documented escape hatch: force per-file builds even if a stale hosts file
  // remains from an interrupted earlier run.
  if (process.env.SHARED_FIXTURES === '0') return undefined
  // Prefer env (filled by setupFiles from `.nuxt-hosts.json`). `inject` is
  // unavailable during top-level `await setupE2E()` module evaluation.
  return process.env[envKey(name)] ?? readNuxtHostsFile()[name]
}

function resolveSetupOptions(config: E2EConfig): Record<string, unknown> {
  if ('shared' in config) {
    const host = resolveSharedHost(config.shared)
    if (!host && process.env.SHARED_FIXTURES !== '0') {
      console.warn(`[e2e] no shared host for "${config.shared}" — falling back to per-file build`)
    }
    return host
      ? { rootDir: fixtureDir(config.shared), host, browser: true }
      : { rootDir: fixtureDir(config.shared), browser: true } // SHARED_FIXTURES=0 fallback: build per file
  }
  return { ...config, browser: true }
}

/**
 * The e2e `test` with `{ page, goto, baseURL }` fixtures. A fresh page (own
 * context) is created per test and closed afterwards, matching Playwright's
 * per-test isolation — so specs need no explicit cookie clearing between tests.
 */
export const test = base.extend<E2EFixtures>({
  // eslint-disable-next-line no-empty-pattern
  baseURL: async ({}, use) => {
    await use(url('/'))
  },
  page: async ({ baseURL }, use) => {
    // baseURL on the context lets specs use relative `page.goto('/client')`.
    const page = await createPage(undefined, { baseURL })
    await use(page)
    await page.close().catch(() => {})
  },
  goto: async ({ page }, use) => {
    // createPage patches page.goto to understand waitUntil:'hydration'/'route'
    // and to return the Playwright Response (specs assert response.status()).
    // Cast at the boundary: the patched runtime accepts the extra waitUntil
    // values the native Page['goto'] type does not.
    await use((path, options) => page.goto(url(path), options as Parameters<Page['goto']>[1]))
  },
  request: async ({ baseURL }, use) => {
    const ctx = await apiRequest.newContext({ baseURL })
    await use(ctx)
    await ctx.dispose().catch(() => {})
  },
})

/**
 * Register the Nuxt server (build/connect) + browser for this spec file.
 * Call once at the top level of a spec (top-level await), before the suites.
 */
export async function setupE2E(config: E2EConfig): Promise<void> {
  await setup(resolveSetupOptions(config))
}
