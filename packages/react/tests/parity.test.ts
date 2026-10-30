// Every renderer ran one matrix into its goldens: here they are held against each other.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { T_CASES } from '../../core/tests/characterization/i18n-t-cases'

const golden = (pkg: string, file: string) => readFileSync(join(import.meta.dirname, `../../${pkg}/tests/characterization/__golden__/${file}`), 'utf8')

/** Attribute order is the renderer's own; the mismatch marker exists for Vue's hydration only. */
const normalize = (html: string) =>
  html.replace(/ data-allow-mismatch="text"/g, '').replace(/<(\w+)((?:\s[\w-]+="[^"]*")+)>/g, (_tag, name: string, attrs: string) => {
    return `<${name} ${attrs.trim().split(/\s(?=[\w-]+=")/).sort().join(' ')}>`
  })

/** `- \`label\` → html` of the React family and Solid. */
function flat(pkg: string, file: string): Map<string, string> {
  const lines = golden(pkg, file).trim().split('\n')
  return new Map(lines.map((line) => /^- `(.*?)` → (.*)$/.exec(line)!.slice(1, 3).map(normalize) as [string, string]))
}

/** One side of the Vue golden, where each label heads a `vue →` and a `nuxt →` line. */
function vueSide(side: 'vue' | 'nuxt'): Map<string, string> {
  const entries = new Map<string, string>()
  let label = ''
  for (const line of golden('vue', 'i18n-t.md').trim().split('\n')) {
    const heading = /^- `(.*)`$/.exec(line)
    if (heading) label = heading[1]!
    const value = new RegExp(`^  - ${side} → (.*)$`).exec(line)
    if (value) entries.set(label, normalize(value[1]!))
  }
  return entries
}

const react = flat('react', 'i18n-t.md')

describe('one matrix, one output', () => {
  test.each([
    ['preact', flat('preact', 'i18n-t.md')],
    ['solid', flat('solid', 'i18n-t.md')],
    ['vue', vueSide('vue')],
    ['nuxt', vueSide('nuxt')],
  ])('i18n-t: %s matches react on every case', (_name, other) => {
    const labels = T_CASES.map(([label]) => label)
    expect(labels.map((label) => [label, other.get(label)])).toEqual(labels.map((label) => [label, react.get(label)]))
  })

  test.each(['i18n-link.md', 'i18n-group.md', 'router.md', 'i18n-switcher.md'])('%s: preact and solid match react', (file) => {
    const text = (pkg: string) => normalize(golden(pkg, file))
    expect(text('preact')).toBe(text('react'))
    expect(text('solid')).toBe(text('react'))
  })
})
