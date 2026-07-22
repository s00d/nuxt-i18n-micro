/**
 * Builds one Nuxt fixture in a child process, mirroring what
 * @nuxt/test-utils does per spec (loadNuxt + buildNuxt with a redirected
 * buildDir / nitro output dir), so specs can share the result via `host`.
 *
 * Usage: node build-fixture-worker.mjs <rootDir> <buildDir>
 */
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [, , rootDir, buildDir] = process.argv

if (!rootDir || !buildDir) {
  console.error('usage: node build-fixture-worker.mjs <rootDir> <buildDir>')
  process.exit(1)
}

// Resolve @nuxt/kit from the fixture itself so fixtures pinned to a
// different Nuxt major (e.g. test/fixtures/n3 on Nuxt 3) build with their
// own toolchain — same resolution order as @nuxt/test-utils' loadKit.
function resolveKit(dir) {
  const require = createRequire(join(dir, 'package.json'))
  try {
    return require.resolve('@nuxt/kit')
  } catch {
    const nuxtPkg = require.resolve('nuxt/package.json')
    return createRequire(nuxtPkg).resolve('@nuxt/kit')
  }
}

const kit = await import(pathToFileURL(resolveKit(rootDir)).href)

const nuxt = await kit.loadNuxt({
  cwd: rootDir,
  dev: false,
  overrides: {
    buildDir,
    nitro: { output: { dir: resolve(buildDir, 'output') } },
  },
})

try {
  await kit.buildNuxt(nuxt)
} finally {
  await nuxt.close().catch(() => {})
}
