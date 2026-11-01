/**
 * Which plugins the module registers for its option matrix, in order. The module's real `setup` on a real Nuxt, with no
 * build: a registration decides what an app has at runtime, and only the journeys would see a wrong one.
 */
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { afterAll, expect, test } from 'vitest'

const OPTIONS = ['plugin', 'meta', 'define', 'hooks', 'vueDevtools', 'redirects'] as const
const root = fileURLToPath(new URL('../..', import.meta.url))
const base = join(root, 'node_modules/.cache')
mkdirSync(base, { recursive: true })
const cwd = mkdtempSync(join(base, 'i18n-plugin-options-'))
afterAll(() => rmSync(cwd, { recursive: true, force: true }))

async function registered(off: readonly string[], dev: boolean) {
  const i18n = { locales: [{ code: 'en' }, { code: 'de' }], defaultLocale: 'en', strategy: 'prefix', ...Object.fromEntries(off.map((name) => [name, false])) }
  const nuxt = await loadNuxt({ cwd, dev, ready: true, overrides: { modules: [join(root, 'src/module.ts')], i18n, telemetry: false, devtools: { enabled: false } } as never })
  const plugins = (nuxt.options.plugins as { src: string; order?: number; mode?: string }[])
    .filter(({ src }) => /src\/runtime\/plugins\/|i18n\.hmr/.test(src))
    .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(({ src, order, mode }) => `${basename(src).replace(/\.\w+$/, '')}@${order}${mode && mode !== 'all' ? `/${mode}` : ''}`)
  await nuxt.close()
  return plugins.join(' ')
}

test('off, alone and in pairs → the plugins an app gets', { timeout: 120_000 }, async () => {
  const sets: string[][] = [[], ...OPTIONS.map((name) => [name])]
  for (const [index, first] of OPTIONS.entries()) for (const second of OPTIONS.slice(index + 1)) sets.push([first, second])
  const lines: string[] = []
  for (const off of sets) lines.push(`off=[${off}] → ${await registered(off, false)}`)
  lines.push(`dev off=[] → ${await registered([], true)}`)
  await expect(lines.join('\n') + '\n').toMatchFileSnapshot('__golden__/plugin-options.md')
})
