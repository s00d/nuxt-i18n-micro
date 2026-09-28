#!/usr/bin/env node
/**
 * Fixture build wrapper: `nuxi build` then assert Nitro server entry exists.
 * Invoked as the perf target build command (cwd = fixture root).
 */
import { cpSync, existsSync, lstatSync, mkdirSync, readlinkSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const cwd = process.cwd()
const entry = join(cwd, '.output/server/index.mjs')

const isDirectRun = process.argv[1] !== undefined && process.argv[1] !== null && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isDirectRun) {
  const result = spawnSync('nuxi', ['build'], {
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
  repairNosticsFormatters()
}

/**
 * Nitro sometimes traces `nostics` with only `dist/index.mjs`, while Nuxt entry imports
 * `nostics/formatters/ansi` → SSR 500 on every page. Copy missing formatter files from
 * the resolved package (pnpm store / fixture node_modules).
 *
 * @param {string} [fixtureCwd]
 * @returns {boolean} true when formatters were copied
 */
export function repairNosticsFormatters(fixtureCwd = cwd) {
  const serverNm = join(fixtureCwd, '.output/server/node_modules')
  const link = join(serverNm, 'nostics')
  if (!existsSync(link)) return false

  let pkgRoot = link
  try {
    if (lstatSync(link).isSymbolicLink()) {
      // Absolute targets / Windows junctions need resolve(dirname(link), …), not join(serverNm, …).
      pkgRoot = resolve(dirname(link), readlinkSync(link))
    }
  } catch {
    return false
  }

  const ansiOut = join(pkgRoot, 'dist/formatters/ansi.mjs')
  if (existsSync(ansiOut)) return false

  const requireFromFixture = createRequire(join(fixtureCwd, 'package.json'))
  let srcRoot
  try {
    // nostics is nested under nuxt — resolve via nuxt's dependency tree.
    const nuxtPkg = requireFromFixture.resolve('nuxt/package.json')
    srcRoot = dirname(createRequire(nuxtPkg).resolve('nostics/package.json'))
  } catch {
    console.warn('[perf] nostics formatters missing in Nitro trace; could not resolve nostics to repair')
    return false
  }

  const srcFmt = join(srcRoot, 'dist/formatters')
  const dstFmt = join(pkgRoot, 'dist/formatters')
  if (!existsSync(srcFmt)) {
    console.warn(`[perf] nostics source has no dist/formatters at ${srcFmt}`)
    return false
  }
  mkdirSync(dstFmt, { recursive: true })
  for (const name of readdirSync(srcFmt)) {
    cpSync(join(srcFmt, name), join(dstFmt, name))
  }
  console.log(`[perf] repaired nostics formatters → ${dstFmt}`)
  return true
}
