/**
 * Vitest globalSetup for the e2e project.
 *
 * Prebuilds shared fixtures once and starts one production server per fixture
 * (see shared-fixtures-core), then hands the `{ fixture -> baseURL }` map to
 * worker forks via a hosts JSON file consumed by `vitest-e2e-env.ts` setupFiles
 * before spec modules load (`inject` is unavailable during top-level await).
 */
import type { TestProject } from 'vitest/node'
import { buildAndServe, stopServers } from './shared-fixtures-core'

declare module 'vitest' {
  interface ProvidedContext {
    nuxtHosts: Record<string, string>
  }
}

export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const hosts = await buildAndServe()
  project.provide('nuxtHosts', hosts)
  return async () => {
    await stopServers()
  }
}
