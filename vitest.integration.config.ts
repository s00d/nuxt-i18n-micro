import os from 'node:os'
import { defineConfig } from 'vitest/config'
import { INTEGRATION_TESTS } from './test/setup/heavy-tests'

const parallelism = typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length

/**
 * Integration suites: each spawns a real Nuxt build (`nuxi build` / `nuxi generate`
 * / @nuxt/test-utils `setup()`) and often a server on top.
 *
 * Files run in parallel — every suite builds into its own `NUXT_TEST_BUILD_DIR`
 * and takes an OS-assigned port, so concurrent files cannot clobber each other.
 * Servers are stopped via their ChildProcess handle (process group), never by
 * killing whoever owns a port.
 */
export default defineConfig({
  test: {
    name: 'integration',
    include: [...INTEGRATION_TESTS],
    exclude: ['test/fixtures/**'],
    testTimeout: 300_000, // 5 min per suite
    hookTimeout: 300_000,
    teardownTimeout: 60_000,
    pool: 'forks',
    fileParallelism: true,
    // One worker per core: each file's cost is a Nuxt build, itself multi-process.
    maxWorkers: Math.max(2, parallelism),
    // Fresh worker per file so build/server memory is released between suites.
    isolate: true,
    // Separate from package/unit projects (default maxWorkers) and from e2e
    // (different maxWorkers formula). Vitest 4 requires unique groupOrder then.
    sequence: { groupOrder: 1 },
  },
})
