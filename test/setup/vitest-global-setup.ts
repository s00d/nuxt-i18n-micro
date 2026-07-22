/**
 * Vitest globalSetup for the e2e project.
 *
 * Prebuilds shared fixtures once and starts one production server per fixture
 * (see shared-fixtures-core), then hands the `{ fixture -> baseURL }` map to
 * worker forks via Vitest `provide`/`inject` and a hosts JSON file consumed by
 * `vitest-e2e-env.ts` setupFiles before spec modules load.
 */
import type { TestProject } from 'vitest/node'
import { SHARED_FIXTURES } from './manifest'
import { buildAndServe, stopServers } from './shared-fixtures-core'

declare module 'vitest' {
  interface ProvidedContext {
    nuxtHosts: Record<string, string>
  }
}

export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  // Always prebuild every shared fixture: Vitest puts internal paths on argv so
  // requestedFixtures() would return [] on a full run and skip all servers.
  const hosts = await buildAndServe(Object.keys(SHARED_FIXTURES))
  project.provide('nuxtHosts', hosts)
  return async () => {
    await stopServers()
  }
}
