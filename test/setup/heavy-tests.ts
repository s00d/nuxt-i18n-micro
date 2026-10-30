/**
 * Single source of truth for which suites in `test/` are "integration": they
 * spawn a real Nuxt build (`nuxi build` / `nuxi generate` / @nuxt/test-utils
 * `setup()`) and cost tens of seconds each.
 *
 * `vitest.integration.config.ts` includes exactly this list;
 * `vitest.unit.config.ts` excludes it, which leaves the genuinely fast unit
 * tests (a few dozen scenario tests, well under a second) for a quick local feedback loop.
 *
 * Keep both configs importing this array so the two sets can never drift apart.
 */
export const INTEGRATION_TESTS = [
  // one file per i18n strategy: nuxi generate of test/fixtures/strategy
  'test/strategies-*.test.ts',
  // nuxi generate / build of one fixture (+ a static or SSR server)
  'test/use-i18n-head-generate.test.ts',
  'test/async-components-production.test.ts',
  'test/generate-issue-218.test.ts',
  // @nuxt/test-utils setup() → builds the fixture app
  'test/serverless-cache.test.ts',
  'test/**/*.e2e.test.ts',
] as const
