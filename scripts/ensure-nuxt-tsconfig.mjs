#!/usr/bin/env node
/**
 * Vite 8 / rolldown hard-fails when any parent tsconfig `extends` a missing file.
 * Root `tsconfig.json` extends `.nuxt/tsconfig.json`, which only exists after
 * `dev:prepare`. Package builds (esp. @i18n-micro/devtools-ui) must run before
 * prepare, so create a minimal stub when the real file is absent.
 *
 * `dev:prepare` / `nuxi prepare` overwrite this with the full Nuxt config.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, '.nuxt', 'tsconfig.json')

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
        jsx: 'preserve',
        paths: {},
      },
      include: [],
    },
    null,
    2,
  )}\n`,
)
console.log('[ensure-nuxt-tsconfig] wrote stub', target)
