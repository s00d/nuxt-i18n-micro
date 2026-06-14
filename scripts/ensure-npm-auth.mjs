#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

try {
  const username = execFileSync('pnpm', ['whoami'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

  if (!username) {
    throw new Error('Empty npm username')
  }

  console.log(`npm registry auth ok (${username})`)
} catch (error) {
  const stderr = error?.stderr?.toString?.().trim()
  const stdout = error?.stdout?.toString?.().trim()
  const details = stderr || stdout || error?.message || 'unknown error'

  console.error('Release aborted: npm registry authentication required.')
  console.error('Run `pnpm login` (or `npm login`) and retry.')
  if (details) {
    console.error(details)
  }
  process.exit(1)
}
