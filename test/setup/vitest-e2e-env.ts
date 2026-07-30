/**
 * Runs in each Vitest worker before spec modules are imported.
 * Top-level `await setupE2E({ shared })` needs host URLs in process.env;
 * `inject('nuxtHosts')` is not available during module evaluation.
 */
import { applyNuxtHostsToEnv, readNuxtHostsFile } from './shared-fixtures-core'

if (process.env.SHARED_FIXTURES !== '0') {
  const hosts = readNuxtHostsFile()
  if (Object.keys(hosts).length > 0) {
    applyNuxtHostsToEnv(hosts)
  }
}
