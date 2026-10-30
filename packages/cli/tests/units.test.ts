import { chmodSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { decrypt, encrypt, isEncrypted } from '../src/backup'
import { alignToReference } from '../src/commands/sync'
import { parseCsv, stringifyCsv } from '../src/csv'
import { readJsonObject, walkFiles, writeFilesAtomic } from '../src/fs'
import { addEntry, glossaryContext, removeEntries } from '../src/glossary'
import { flatten, flattenStrings, getPath, setPath, sortKeys, unflatten } from '../src/json'
import { compilePo, parsePo } from '../src/po'
import { collectKeys, pageNameOf } from '../src/source'
import { KeyRegistry, convertSource, extractOnlyMatcher, toSlug } from '../src/text-to-i18n'
import { createZip, readZip } from '../src/zip'

const tempDir = () => mkdtempSync(join(tmpdir(), 'cli-unit-'))

describe('json', () => {
  it('flattens with arrays and empty objects as leaves', () => {
    expect(flatten({ a: { b: 'x', c: [1], d: {} }, e: 1 })).toEqual({ 'a.b': 'x', 'a.c': [1], 'a.d': {}, e: 1 })
    expect(flattenStrings({ a: { b: 'x' }, c: 2 })).toEqual({ 'a.b': 'x' })
  })

  it('reads own keys only and refuses __proto__ on write', () => {
    expect(getPath({}, 'constructor')).toBeUndefined()
    const tree = {}
    setPath(tree, '__proto__.polluted', 'x')
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(tree).toEqual({})
  })

  it('replaces a scalar on the way', () => {
    const tree = { a: 'x' }
    setPath(tree, 'a.b', 'y')
    expect(tree).toEqual({ a: { b: 'y' } })
  })

  it('unflatten inverts flatten', () => {
    const tree = { a: { b: 'x', c: { d: 1 } }, e: [1, 2] }
    expect(unflatten(flatten(tree))).toEqual(tree)
  })

  it('sorts keys deeply, deterministically', () => {
    expect(JSON.stringify(sortKeys({ b: 1, a: { d: 1, c: 2 } }))).toBe('{"a":{"c":2,"d":1},"b":1}')
  })
})

describe('po', () => {
  it('round-trips escapes', () => {
    const entries = { 'a.b': 'He said "hi"\nnext\ttab \\ done', plain: 'x' }
    expect(parsePo(compilePo(entries))).toEqual(entries)
  })

  it('reads multi-line strings, msgctxt, plurals and comments', () => {
    const po = `# comment
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\\n"

msgctxt "ctx"
msgid "key"
msgstr ""
"part one "
"part two"

msgid "apples"
msgid_plural "apples"
msgstr[0] "Apfel"
msgstr[1] "Äpfel"
`
    expect(parsePo(po)).toEqual({ 'ctx.key': 'part one part two', apples: 'Apfel' })
  })
})

describe('csv', () => {
  it('round-trips quotes, commas and newlines', () => {
    const rows = [
      ['File', 'Key', 'Translation'],
      ['a.json', 'k', 'say "hi", friend\nbye'],
      ['b', 'c', ''],
    ]
    expect(parseCsv(stringifyCsv(rows))).toEqual(rows)
  })

  it('accepts CRLF and skips blank lines', () => {
    expect(parseCsv('a,b\r\n\r\nc,d\r\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })
})

describe('zip', () => {
  it('round-trips names and contents', () => {
    const entries = [
      { name: 'en.json', data: Buffer.from('{"a":"å"}') },
      { name: 'pages/index/de.json', data: Buffer.alloc(10_000, 'x') },
      { name: 'empty.json', data: Buffer.alloc(0) },
    ]
    expect(readZip(createZip(entries))).toEqual(entries)
  })

  it('is deterministic', () => {
    const entries = [{ name: 'a', data: Buffer.from('x') }]
    expect(createZip(entries).equals(createZip(entries))).toBe(true)
  })

  it('reads a stored entry written by another tool', () => {
    const zip = createZip([{ name: 'a.txt', data: Buffer.from('hello') }])
    // Rewrite method to stored with raw bytes: an archive this writer would not produce.
    const name = Buffer.from('a.txt')
    const data = Buffer.from('hello')
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(5, 26)
    const central = Buffer.from(zip.subarray(30 + name.length + deflateRawSync(data, { level: 9 }).length))
    central.writeUInt16LE(0, 10)
    central.writeUInt32LE(5, 20)
    central.writeUInt32LE(5, 24)
    const directory = Buffer.concat([local, name, data, central])
    const end = directory.length - 22
    directory.writeUInt32LE(30 + name.length + data.length, end + 16)
    expect(readZip(directory)[0]?.data.toString()).toBe('hello')
  })

  it.each(['../evil.json', '/etc/passwd', 'a/../../b', 'C:/x', '..\\x'])('refuses the unsafe name %s', (name) => {
    expect(() => readZip(createZip([{ name, data: Buffer.from('x') }]))).toThrow('unsafe path')
  })

  it('rejects garbage', () => {
    expect(() => readZip(Buffer.alloc(100))).toThrow('Invalid zip')
    expect(() => readZip(Buffer.alloc(3))).toThrow('Invalid zip')
  })
})

describe('backup encryption', () => {
  it('round-trips and detects tampering and a wrong password', () => {
    const data = Buffer.from('secret')
    const sealed = encrypt(data, 'pw')
    expect(isEncrypted(sealed)).toBe(true)
    expect(isEncrypted(data)).toBe(false)
    expect(sealed.includes(data)).toBe(false)
    expect(decrypt(sealed, 'pw')).toEqual(data)
    expect(() => decrypt(sealed, 'other')).toThrow('Wrong password')
    sealed[sealed.length - 1]! ^= 1
    expect(() => decrypt(sealed, 'pw')).toThrow('Wrong password')
  })
})

describe('safe writes', () => {
  it('leaves nothing behind and changes nothing when one file cannot be written', () => {
    const dir = tempDir()
    const good = join(dir, 'good.json')
    writeFileSync(good, 'old')
    writeFileSync(join(dir, 'blocker'), '')
    expect(() =>
      writeFilesAtomic([
        [good, 'new'],
        [join(dir, 'blocker/sub/x.json'), 'y'],
      ]),
    ).toThrow()
    expect(readdirSync(dir).sort()).toEqual(['blocker', 'good.json'])
    expect(readFileSync(good, 'utf8')).toBe('old')
    rmSync(dir, { recursive: true })
  })

  it('a read-only directory fails before touching the target', () => {
    if (process.getuid?.() === 0) return
    const dir = tempDir()
    const file = join(dir, 'a.json')
    writeFileSync(file, 'old')
    chmodSync(dir, 0o500)
    expect(() => writeFilesAtomic([[file, 'new']])).toThrow()
    chmodSync(dir, 0o700)
    expect(readFileSync(file, 'utf8')).toBe('old')
    rmSync(dir, { recursive: true })
  })

  it('invalid JSON stops the read instead of reading as empty', () => {
    const dir = tempDir()
    const file = join(dir, 'a.json')
    writeFileSync(file, '{ broken')
    expect(() => readJsonObject(file)).toThrow('Invalid JSON')
    writeFileSync(file, '[1]')
    expect(() => readJsonObject(file)).toThrow('Expected a JSON object')
    writeFileSync(file, '')
    expect(readJsonObject(file)).toEqual({})
    rmSync(dir, { recursive: true })
  })

  it('walkFiles tolerates a missing directory and skips node_modules', () => {
    const dir = tempDir()
    expect(walkFiles(join(dir, 'nope'))).toEqual([])
    rmSync(dir, { recursive: true })
    expect(walkFiles(join(import.meta.dirname, '..'), (path) => path.endsWith('rollup.config.js')).filter((p) => p.includes('node_modules'))).toEqual(
      [],
    )
  })
})

describe('page names match Nuxt route names', () => {
  it.each([
    ['index.vue', 'index'],
    ['about.vue', 'about'],
    ['dir1/index.vue', 'dir1'],
    ['dir1/[slug].vue', 'dir1-slug'],
    ['dir1/subdir/[slug]-[id]-[key].vue', 'dir1-subdir-slug-id-key'],
    ['dir1/subdir/[hash]/[subhash].vue', 'dir1-subdir-hash-subhash'],
    ['[[lang]]/about.vue', 'lang-about'],
    ['docs/[...slug].vue', 'docs-slug'],
    ['(group)/pricing.vue', 'pricing'],
    ['admin.client.vue', 'admin'],
  ])('%s -> %s', (file, name) => {
    expect(pageNameOf(file)).toBe(name)
  })
})

describe('key collection', () => {
  const keys = (content: string, file = 'x.vue') => [...collectKeys(content, file).keys].sort()

  it('reads templates, directives, scripts and keypath', () => {
    const sfc = `<template>
  <div :title="$t('a.title')" @click="go($t('a.click'))"><img src="/x.png"><i18n-t keypath="a.path" /><li v-for="x in $t('a.list')">{{ $ts('a.ts') }}</li></div>
</template>
<script setup lang="ts">
const value: string = $t('a.script')
</script>`
    expect(keys(sfc)).toEqual(['a.click', 'a.list', 'a.path', 'a.script', 'a.title', 'a.ts'])
  })

  it('ignores comments, strings and foreign t()', () => {
    expect(keys(`// $t('no.comment')\nconst s = "$t('no.string')"\nt('no.foreign')`, 'a.ts')).toEqual([])
  })

  it('reads t() when the file uses useI18n, and member calls on i18n objects', () => {
    expect(keys(`const { t } = useI18n()\nt('yes.plain')`, 'a.ts')).toEqual(['yes.plain'])
    expect(keys(`nuxt.$i18n.t('yes.member')\ncounter.t('no.member')`, 'a.ts')).toEqual(['yes.member'])
  })

  it('takes both branches of a ternary and reports dynamic keys with their prefix', () => {
    const usage = collectKeys('$t(ok ? `a.yes` : "a.no"); $t(`b.${x}`); $t(name)', 'a.ts')
    expect([...usage.keys].sort()).toEqual(['a.no', 'a.yes'])
    expect(usage.dynamic.map(({ expression, prefix }) => [expression, prefix])).toEqual([
      ['`b.${x}`', 'b.'],
      ['name', ''],
    ])
  })

  it('survives broken code', () => {
    expect(keys('const = = =', 'a.ts')).toEqual([])
    expect(keys('<template><div></template>')).toEqual([])
  })
})

describe('text conversion', () => {
  const convert = (content: string, file: string, extractOnly = false) => {
    const registry = new KeyRegistry({ 'known.key': 'Known text' })
    return { out: convertSource(content, file, registry, extractOnly), created: [...registry.created.keys()] }
  }

  it('leaves non-text attributes and interpolation alone', () => {
    const { out, created } = convert(
      `<template><a href="/x" class="btn" title="Open it">{{ name }} left</a><img src="/a.png" alt="Logo"><code>raw code</code></template>`,
      '/app/pages/a.vue',
    )
    expect(out).toContain('href="/x" class="btn"')
    expect(out).toContain('src="/a.png"')
    expect(out).toContain(`:title="$t('pages.a.open-it')"`)
    expect(out).toContain(`:alt="$t('pages.a.logo')"`)
    expect(out).toContain('{{ name }} left')
    expect(out).toContain('<code>raw code</code>')
    expect(created).toHaveLength(2)
  })

  it('reuses a known text', () => {
    const { out, created } = convert('<template><p>Known text</p></template>', '/app/pages/a.vue')
    expect(out).toContain(`{{ $t('known.key') }}`)
    expect(created).toEqual([])
  })

  it('never emits a mustache string in code', () => {
    const { out } = convert(`export const label = 'Save your work'`, '/app/components/x.ts')
    expect(out).toBe(`export const label = $t('components.x.save-your-work')`)
  })

  it('skips technical strings, imports, object keys and framework calls', () => {
    const source = `import x from 'Some Module Name'
emit('Close It Now')
useFetch('/api/items')
const route = { name: 'home-page', 'Key Name': 1 }
const url = 'https://example.com/a b'
$t('Existing Key')`
    expect(convert(source, '/app/components/x.ts').created).toEqual([])
  })

  it('extract-only files keep their code but give up their text', () => {
    const { out, created } = convert(`const m = 'Saved successfully'`, '/app/plugins/n.ts', true)
    expect(out).toBe(`const m = 'Saved successfully'`)
    expect(created).toEqual(['plugins.n.saved-successfully'])
  })

  it('JSX text', () => {
    expect(convert('export const A = () => <b>Hello there</b>', '/app/components/a.tsx').out).toContain(`<b>{ $t('components.a.hello-there') }</b>`)
  })

  it('makes keys unique', () => {
    const registry = new KeyRegistry({})
    expect(registry.keyFor('Save', '/p/pages/a.vue', 'Save')).toBe('pages.a.save')
    expect(registry.keyFor('Save!', '/p/pages/a.vue', 'Save!')).toBe('pages.a.save_1')
  })

  it('honours overrides and skips', () => {
    const registry = new KeyRegistry({}, { keyOverrides: { 'pages.a.one': 'custom.one' }, skippedKeys: ['pages.a.two'] })
    expect(registry.keyFor('One', '/p/pages/a.vue', '')).toBe('custom.one')
    expect(registry.keyFor('Two', '/p/pages/a.vue', '')).toBeNull()
  })

  it('slugs Latin and Cyrillic', () => {
    expect(toSlug('Hello, World')).toBe('hello-world')
    expect(toSlug('Привет мир')).toBe('privet-mir')
    expect(toSlug('50% & more')).toBe('50-percent-and-more')
  })

  it('matches extract-only globs with negation', () => {
    const match = extractOnlyMatcher('/p', { dirs: ['plugins'], patterns: ['**/schemas/**/*.ts', '!**/keep.ts'] })
    expect(match('/p/app/schemas/a/b.ts')).toBe(true)
    expect(match('/p/plugins/x.ts')).toBe(true)
    expect(match('/p/app/schemas/keep.ts')).toBe(false)
    expect(match('/p/components/x.ts')).toBe(false)
    expect(match('/p/components/my.plugin.ts')).toBe(true)
  })
})

describe('sync', () => {
  it('keeps numbers, booleans and arrays; drops extras; fills gaps', () => {
    expect(
      alignToReference(
        { n: 1, b: true, l: ['a'], s: 'x', o: { i: 'y' }, m: 'z' },
        { n: 2, b: false, l: ['b'], o: 'scalar', extra: 'gone', m: 'kept' },
      ),
    ).toEqual({
      n: 2,
      b: false,
      l: ['b'],
      s: '',
      o: { i: '' },
      m: 'kept',
    })
  })
})

describe('glossary', () => {
  it('adds, replaces, removes and filters by language pair', () => {
    const glossary = { entries: [{ source: 'Save', target: 'Sichern', to: 'de' }] }
    addEntry(glossary, { source: 'Save', target: 'Speichern', to: 'DE' })
    addEntry(glossary, { source: 'Save', target: 'Sauver', to: 'fr' })
    expect(glossary.entries).toHaveLength(2)
    expect(glossaryContext(glossary, 'en', 'de')).toBe('Save => Speichern')
    expect(glossaryContext(glossary, 'en', 'es')).toBeUndefined()
    expect(removeEntries(glossary, { source: 'Save', to: 'fr' })).toBe(1)
    expect(removeEntries(glossary, { source: 'Save' })).toBe(1)
    expect(glossary.entries).toEqual([])
  })
})
