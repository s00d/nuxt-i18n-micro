import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Per-test-file isolated build locations for fixtures that support the
 * NUXT_TEST_BUILD_DIR env hook (see e.g. test/fixtures/strategy/nuxt.config.ts).
 * Lets several test files build the same fixture concurrently without
 * clobbering each other's .nuxt/.output. Outside the fixture dir: e2e recipes hash that dir, so a
 * build written into it would change the hash mid-run.
 */
export function isolatedBuild(fixture: string, name: string) {
  const fixtureDir = fileURLToPath(new URL(`../fixtures/${fixture}`, import.meta.url))
  const buildDir = fileURLToPath(new URL(`../.fixture-builds/${fixture}/${name}`, import.meta.url))
  return {
    fixtureDir,
    buildDir,
    outputDir: join(buildDir, 'output'),
    publicDir: join(buildDir, 'output', 'public'),
    serverEntry: join(buildDir, 'output', 'server', 'index.mjs'),
    env: { NUXT_TEST_BUILD_DIR: buildDir },
  }
}
