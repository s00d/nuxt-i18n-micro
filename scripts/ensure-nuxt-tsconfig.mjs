#!/usr/bin/env node
/**
 * Root `tsconfig.json` extends `./.nuxt/tsconfig.json` so the IDE / typecheck:root
 * see Nuxt + nitro augmentations. Package builds (CI / `build:packages`) run *before*
 * `dev:prepare`, so Vite/oxc can walk up to that root config and fail with
 * TSCONFIG_ERROR when `.nuxt/tsconfig.json` is missing.
 *
 * Write a minimal stub only when the file is absent. `dev:prepare` / `nuxi prepare`
 * replace it with the real generated config.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(root, '.nuxt/tsconfig.json')

if (existsSync(target)) {
  process.exit(0)
}

mkdirSync(dirname(target), { recursive: true })
writeFileSync(
  target,
  `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        jsx: 'preserve',
      },
      include: [],
    },
    null,
    2,
  )}\n`,
)
console.log(`[ensure-nuxt-tsconfig] wrote stub ${target}`)
