import { envKey, fixtureDir } from './manifest'

/**
 * Options for `test.use({ nuxt: ... })` pointing a spec at the shared,
 * prebuilt fixture server started by global-setup. When the shared server
 * is unavailable (e.g. SHARED_FIXTURES=0), falls back to the classic
 * per-worker build so specs still work standalone.
 */
export function useSharedFixture(name: string): { rootDir: string; host?: string } {
  const host = process.env[envKey(name)]
  return host ? { rootDir: fixtureDir(name), host } : { rootDir: fixtureDir(name) }
}
