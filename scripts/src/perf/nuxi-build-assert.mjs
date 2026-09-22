#!/usr/bin/env node
/**
 * Fixture build wrapper: `nuxi build` then assert Nitro server entry exists.
 * Invoked as the perf target build command (cwd = fixture root).
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const entry = join(process.cwd(), '.output/server/index.mjs')
const result = spawnSync('nuxi', ['build'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})
if (result.status !== 0) process.exit(result.status ?? 1)
if (!existsSync(entry)) {
  console.error(`[perf] missing Nitro server entry after build: ${entry}`)
  process.exit(1)
}
