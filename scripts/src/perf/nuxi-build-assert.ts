#!/usr/bin/env node
/**
 * Fixture build wrapper: `nuxi build` then assert Nitro server entry exists.
 * Invoked as the perf target build command (cwd = fixture root) via `node --import tsx`.
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { repairNosticsFormatters } from './repair-nostics-formatters'

const cwd = process.cwd()
const entry = join(cwd, '.output/server/index.mjs')
const nuxiBin = join(cwd, 'node_modules', '.bin', process.platform === 'win32' ? 'nuxi.cmd' : 'nuxi')
if (!existsSync(nuxiBin)) {
  console.error(`[perf] missing fixture-local nuxi at ${nuxiBin} (cwd alone does not put .bin on PATH)`)
  process.exit(1)
}

const result = spawnSync(nuxiBin, ['build'], {
  cwd,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})
if (result.status !== 0) process.exit(result.status ?? 1)
if (!existsSync(entry)) {
  console.error(`[perf] missing Nitro server entry after build: ${entry}`)
  process.exit(1)
}
repairNosticsFormatters(cwd)
