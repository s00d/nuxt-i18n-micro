import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const serverDir = fileURLToPath(new URL('../../src/runtime/server', import.meta.url))

// `#imports` is the Vue app's: under `future.compatibilityVersion: 5` Nitro has none, and the build fails
// ("useRuntimeConfig" is not exported by "virtual:#imports"). Nitro's own helpers come from `nitropack/runtime`.
test('server runtime imports nothing from #imports', () => {
  const files = readdirSync(serverDir, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.ts'))
  const offenders = files.filter((file) => /from ['"]#imports['"]/.test(readFileSync(join(serverDir, file), 'utf8')))
  expect(offenders).toEqual([])
})
