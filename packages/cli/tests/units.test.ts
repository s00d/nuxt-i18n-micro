import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { parseCsv, stringifyCsv } from '../src/csv'
import { globToRegExp, readJsonObject, stringifyLike, walkFiles, writeFilesAtomic } from '../src/fs'
import { glossaryContext } from '../src/glossary'
import { deletePath, flatten, flattenStrings, getPath, groupBy, pathConflict, setPath, sortKeys } from '../src/json'
import { addSecret, log } from '../src/log'
import { compilePo, parsePo } from '../src/po'
import { pageNameOf, scanFile } from '../src/source'
import { KeyRegistry, convertSource, toSlug } from '../src/text-to-i18n'

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

  it('deletes one path and the parents it empties', () => {
    const tree = { a: { b: { c: 'x' } }, 'd.e': 'y', d: { f: 'z' }, keep: 'k' }
    expect(deletePath(tree, 'a.b.c')).toBe(true)
    expect(deletePath(tree, 'd.e')).toBe(true)
    expect(deletePath(tree, 'no.such')).toBe(false)
    expect(tree).toEqual({ d: { f: 'z' }, keep: 'k' })
  })

  it('knows what a write would destroy', () => {
    const tree = { a: 'text', n: { x: 'y' }, e: {}, 'd.o': 'flat', 'a.b': 'dotted child' }
    expect(pathConflict(tree, 'a.c')).toBe('a')
    expect(pathConflict(tree, 'n')).toBe('n')
    expect(pathConflict(tree, 'a')).toBeNull()
    expect(pathConflict(tree, 'a.b')).toBeNull()
    expect(pathConflict(tree, 'e')).toBeNull()
    expect(pathConflict(tree, 'n.y')).toBeNull()
    expect(pathConflict(tree, 'free')).toBeNull()
  })

  it('groups in order', () => {
    expect([...groupBy([1, 2, 3], (n) => n % 2)]).toEqual([
      [1, [1, 3]],
      [0, [2]],
    ])
  })

  it('sorts keys deeply, deterministically', () => {
    expect(JSON.stringify(sortKeys({ b: 1, a: { d: 1, c: 2 } }))).toBe('{"a":{"c":2,"d":1},"b":1}')
  })
})

describe('po', () => {
  it('round-trips escapes and carries the source as a comment', () => {
    const entries = { 'a.b': 'He said "hi"\nnext\ttab \\ done', plain: 'x' }
    const messages = Object.entries(entries).map(([key, value]) => ({ key, value, source: 'Two\nlines' }))
    const po = compilePo(messages)
    expect(po).toContain('#. Two\n#. lines\nmsgid "plain"')
    expect(parsePo(po)).toEqual({ messages: entries, fuzzy: [] })
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

#, fuzzy
msgid "guess"
msgstr "vielleicht"

msgid "blank"
msgid_plural "blanks"
msgstr[0] ""
msgstr[1] ""

msgid "last"
msgstr "x"
`
    expect(parsePo(po)).toEqual({ messages: { 'ctx.key': 'part one part two', apples: 'Apfel|Äpfel', blank: '', last: 'x' }, fuzzy: ['guess'] })
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

  it('a failed rename puts back what earlier ones replaced', () => {
    const dir = tempDir()
    const first = join(dir, 'first.json')
    const second = join(dir, 'second.json')
    const fresh = join(dir, 'fresh.json')
    writeFileSync(first, 'old first')
    mkdirSync(second)
    writeFileSync(join(second, 'inside'), '')
    expect(() =>
      writeFilesAtomic([
        [first, 'new first'],
        [fresh, 'new file'],
        [second, 'a file over a directory'],
      ]),
    ).toThrow()
    expect(readFileSync(first, 'utf8')).toBe('old first')
    expect(readdirSync(dir).sort()).toEqual(['first.json', 'second.json'])
    rmSync(dir, { recursive: true })
  })

  it('keeps the mode of the file it replaces', () => {
    const dir = tempDir()
    const file = join(dir, 'a.json')
    writeFileSync(file, 'old')
    chmodSync(file, 0o640)
    writeFilesAtomic([[file, 'new']])
    expect(statSync(file).mode & 0o777).toBe(0o640)
    rmSync(dir, { recursive: true })
  })

  it('writes through a dangling symlink to where it points', () => {
    const dir = tempDir()
    symlinkSync(join(dir, 'target.json'), join(dir, 'link.json'))
    writeFilesAtomic([[join(dir, 'link.json'), 'x']])
    expect(readFileSync(join(dir, 'target.json'), 'utf8')).toBe('x')
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

  it('walkFiles follows symlinks and survives a loop', () => {
    const dir = tempDir()
    mkdirSync(join(dir, 'real'))
    writeFileSync(join(dir, 'real/a.ts'), '')
    symlinkSync(join(dir, 'real'), join(dir, 'link'))
    symlinkSync(dir, join(dir, 'real/up'))
    symlinkSync(join(dir, 'gone'), join(dir, 'dangling'))
    expect(walkFiles(dir).map((file) => file.slice(dir.length))).toEqual(['/link/a.ts'])
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

describe('formatting', () => {
  it('stringifyLike follows the file', () => {
    expect(stringifyLike('{\n    "a": 1\n}\n', { b: 2 })).toBe('{\n    "b": 2\n}\n')
    expect(stringifyLike('{\n\t"a": 1\n}', { b: 2 })).toBe('{\n\t"b": 2\n}')
    expect(stringifyLike(undefined, { b: 2 })).toBe('{\n  "b": 2\n}\n')
    expect(stringifyLike('{}', { b: 2 })).toBe('{\n  "b": 2\n}')
  })

  it('reads a BOM', () => {
    const dir = tempDir()
    writeFileSync(join(dir, 'a.json'), '\uFEFF{"a":1}')
    expect(readJsonObject(join(dir, 'a.json'))).toEqual({ a: 1 })
    rmSync(dir, { recursive: true })
  })

  it('globs', () => {
    expect(globToRegExp('tests/**').test('tests/a/b.ts')).toBe(true)
    expect(globToRegExp('*.spec.ts').test('src/a.spec.ts')).toBe(true)
    expect(globToRegExp('gen').test('a/gen/b.ts')).toBe(true)
    expect(globToRegExp('src/*.ts').test('src/a/b.ts')).toBe(false)
  })
})

describe('secrets', () => {
  it('redacts the value and its URL-encoded form, in every channel', () => {
    const out: string[] = []
    const spy = (...args: unknown[]) => void out.push(String(args[0]))
    const logSpy = vi.spyOn(console, 'log').mockImplementation(spy)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(spy)
    addSecret('s3cret/key')
    addSecret('k')
    addSecret(undefined)
    for (const channel of [log.info, log.success, log.warn, log.error]) channel('a s3cret/key b s3cret%2Fkey k')
    log.json({ token: 's3cret/key' })
    logSpy.mockRestore()
    errorSpy.mockRestore()
    expect(out.join('\n')).not.toContain('s3cret')
    expect(out[0]).toBe('a *** b *** k')
  })
})

describe('paths with dots', () => {
  it('finds literal dotted keys at any level', () => {
    expect(getPath({ 'a.b': 'x' }, 'a.b')).toBe('x')
    expect(getPath({ a: { 'b.c': 'x' } }, 'a.b.c')).toBe('x')
    const tree = { 'a.b': 'x' }
    setPath(tree, 'a.b', 'y')
    expect(tree).toEqual({ 'a.b': 'y' })
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

describe('scanner', () => {
  const keys = (content: string, file = 'x.vue') => [...new Set(scanFile(content, file).refs.map((ref) => ref.key))].sort()

  it('reads templates, directives, scripts and keypath', () => {
    const sfc = `<template>
  <div :title="$t('a.title')" @click="go($t('a.click'))"><img src="/x.png"><i18n-t keypath="a.path" /><li v-for="x in $t('a.list')">{{ $ts('a.ts') }}</li></div>
</template>
<script setup lang="ts">
const value: string = $t('a.script')
</script>`
    expect(keys(sfc)).toEqual(['a.click', 'a.list', 'a.path', 'a.script', 'a.title', 'a.ts'])
  })

  it('gives the exact place of each key', () => {
    const sfc = `<script setup>\nconst a = $t('in.script')\n</script>\n<template><i18n-t keypath="in.attr" :title="$t('in.bind')" />{{ $t('in.text') }}<i18n-t :keypath="'in.path'" /></template>\n`
    for (const ref of scanFile(sfc, 'x.vue').refs) expect(sfc.slice(ref.start, ref.end)).toBe(ref.key)
    expect(scanFile(sfc, 'x.vue').refs).toHaveLength(5)
  })

  it.each([
    ['CRLF', `<template>\r\n  <p>{{ $t('a.b') }}</p>\r\n</template>\r\n<script setup>\r\nconst x = $t('c.d')\r\n</script>\r\n`, 2],
    [
      'script first, two scripts',
      `<script>\nexport default { data: () => ({ a: this.$t('o.a') }) }\n</script>\n<script setup>\nconst x = $t('o.b')\n</script>\n<template>{{ $t('o.c') }}</template>`,
      3,
    ],
    [
      'unicode before the key',
      `<template><p title="日本語🎌">{{ $t('u.a') }}</p></template>\n<script setup>\nconst s = '🎌'; $t('u.b')\n</script>`,
      2,
    ],
    [
      'v-bind object, v-if, slot props',
      `<template><C v-bind="{ title: $t('v.a') }" v-if="$t('v.b')" #item="{ x }"><p :a="[$t('v.c')]">{{ x ? $t('v.d') : $t('v.e') }}</p></C></template>`,
      5,
    ],
    ['statements in a handler', `<template><b @click="a = 1; go($t('h.a'))" /></template>`, 1],
    ['multi-line interpolation', `<template>{{\n  $t(\n    'm.a'\n  )\n}}</template>`, 1],
    ['tsx script', `<script setup lang="tsx">\nconst A = () => <b>{$t('t.a')}</b>\n</script>`, 1],
  ])('positions hold: %s', (_name, sfc, count) => {
    const { refs, unproven } = scanFile(sfc, 'x.vue')
    expect(unproven).toEqual([])
    expect(refs).toHaveLength(count)
    for (const ref of refs) expect(sfc.slice(ref.start, ref.end)).toBe(ref.key)
  })

  it('a key behind an entity is found; its position is checked before any rewrite', () => {
    const { refs } = scanFile(`<template><b :x="a &amp;&amp; $t('e.a')" /></template>`, 'x.vue')
    expect(refs.map((ref) => ref.key)).toEqual(['e.a'])
  })

  it('Options API, member chains, optional calls', () => {
    const code = `export default { computed: { a() { return this.$t('o.a') } }, setup() { useNuxtApp().$ts('o.b'); nuxt?.$i18n?.t?.('o.c') } }`
    expect(keys(code, 'a.js')).toEqual(['o.a', 'o.b', 'o.c'])
  })

  it('a stray .html: a bare call is no doubt, a $t one is', () => {
    expect(scanFile('<script>function a(e){return t(e)}</script>', 'a.html').dynamic).toEqual([])
    expect(scanFile('{{ $t(name) }}', 'a.html').dynamic).toHaveLength(1)
  })

  it('ignores comments, strings and foreign t()', () => {
    expect(keys(`// $t('no.comment')\nconst s = "$t('no.string')"\nt('no.foreign')`, 'a.ts')).toEqual([])
  })

  it('reads t() when the file uses useI18n, and member calls on i18n objects', () => {
    expect(keys(`const { t } = useI18n()\nt('yes.plain')`, 'a.ts')).toEqual(['yes.plain'])
    expect(keys(`nuxt.$i18n.t('yes.member')\ncounter.t('no.member')`, 'a.ts')).toEqual(['yes.member'])
    expect(keys(`const i = useI18n()\ni.t('yes.object')`, 'a.ts')).toEqual(['yes.object'])
  })

  it('follows every alias', () => {
    const code = `const { t: a, $t: b, $ts: c = fallback } = useI18n()
const { $_t } = useNuxtApp()
const bound = $_t(route)
const copy = b
const taken = useI18n().tc
a('k.a'); b('k.b'); c('k.c'); bound('k.d'); copy('k.e'); taken('k.f'); $_t(route)('k.g')`
    expect(keys(code, 'a.ts')).toEqual(['k.a', 'k.b', 'k.c', 'k.d', 'k.e', 'k.f', 'k.g'])
  })

  it('$has is a guard, $tn and $td are not keys', () => {
    const { refs } = scanFile(`$has('g'); $tn(1000); $td(date)`, 'a.ts')
    expect(refs.map(({ key, guard }) => [key, guard])).toEqual([['g', true]])
  })

  it('takes both sides of a branch and reports dynamic keys with their prefix', () => {
    const usage = scanFile('$t(ok ? `a.yes` : "a.no"); $t(x || "a.or"); $t(`b.${x}`); $t("c." + y); $t(name)', 'a.ts')
    expect(usage.refs.map((ref) => ref.key).sort()).toEqual(['a.no', 'a.or', 'a.yes'])
    expect(usage.dynamic.map(({ expression, prefix }) => [expression, prefix])).toEqual([
      ['x', ''],
      ['`b.${x}`', 'b.'],
      ['"c." + y', 'c.'],
      ['name', ''],
    ])
  })

  it('a function used as a value hides its keys; a name in a declaration or a type does not', () => {
    expect(scanFile('list.map($t)', 'a.ts').dynamic).toHaveLength(1)
    expect(scanFile('const a = { t: $t }', 'a.ts').dynamic).toHaveLength(1)
    expect(scanFile('const { $t } = useNuxtApp(); $t("k")', 'a.ts').dynamic).toEqual([])
    expect(scanFile('type T = typeof $t; function f($t: unknown) {}; x.$t; ({ $t: 1 })', 'a.ts').dynamic).toEqual([])
  })

  it('collects strings that look like keys, and prefixes', () => {
    const { literals, prefixes } = scanFile(`const a = 'menu.home'; const b = 'errors.' + code; const c = \`x.\${y}\`; const d = 'two words'`, 'a.ts')
    expect([...literals.keys()]).toEqual(['menu.home'])
    expect([...prefixes].sort()).toEqual(['errors.', 'x.'])
  })

  it('<i18n-group> prefixes what its slot calls', () => {
    const sfc = `<template><i18n-group prefix="ns"><template #default="{ t: tt }">{{ tt('a') }}</template></i18n-group></template>`
    const { refs, dynamic } = scanFile(sfc, 'x.vue')
    expect(refs.map(({ key, keyPrefix }) => [key, keyPrefix])).toEqual([['ns.a', 'ns.']])
    expect(dynamic[0]).toMatchObject({ prefix: 'ns', group: true })
  })

  it('reports what it cannot read, and still finds what it can', () => {
    const broken = scanFile(`const = $t('q')`, 'a.ts')
    expect(broken.unproven).toHaveLength(1)
    expect(broken.refs.map((ref) => ref.key)).toEqual(['q'])
    expect(scanFile("<template><div>{{ $t('x' }}</div></template>", 'x.vue').unproven).not.toEqual([])
    expect(scanFile('<template lang="pug">\np {{ $t(\'p.k\') }} {{ $t(name) }}\n</template>', 'x.vue').dynamic).toHaveLength(1)
  })

  it('reads plain JavaScript with JSX', () => {
    expect(keys(`export const A = () => <b>{$t('j.k')}</b>`, 'a.js')).toEqual(['j.k'])
  })
})

describe('text conversion', () => {
  const convert = (content: string, file: string) => {
    const registry = new KeyRegistry({ 'known.key': 'Known text' })
    const conversion = convertSource(content, file, registry)
    return { out: conversion.content, code: conversion.code, mixed: conversion.mixed, created: [...registry.created.keys()] }
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

  it('never rewrites code, only reports it', () => {
    const source = `export const label = 'Save your work'`
    const { out, created, code } = convert(source, '/app/components/x.ts')
    expect(out).toBe(source)
    expect(created).toEqual([])
    expect(code).toEqual([{ file: '/app/components/x.ts', line: 1, text: 'Save your work' }])
  })

  it('does not report technical strings, imports, object keys, framework calls or keys', () => {
    const source = `import x from 'Some Module Name'
emit('Close It Now')
useFetch('/api/items')
const route = { name: 'home-page', 'Key Name': 1 }
const url = 'https://example.com/a b'
$t('Existing Key')`
    expect(convert(source, '/app/components/x.ts').code).toEqual([])
  })

  it('reports JSX text', () => {
    expect(convert('export const A = () => <b>Hello there</b>', '/app/components/a.tsx').code[0]?.text).toBe('Hello there')
  })

  it('makes keys unique', () => {
    const registry = new KeyRegistry({})
    expect(registry.keyFor('Save', '/p/pages/a.vue', 1)).toBe('pages.a.save')
    expect(registry.keyFor('Save!', '/p/pages/a.vue', 1)).toBe('pages.a.save_1')
  })

  it('honours overrides and skips', () => {
    const registry = new KeyRegistry({}, {}, { keyOverrides: { 'pages.a.one': 'custom.one' }, skippedKeys: ['pages.a.two'] })
    expect(registry.keyFor('One', '/p/pages/a.vue', 1)).toBe('custom.one')
    expect(registry.keyFor('Two', '/p/pages/a.vue', 1)).toBeNull()
  })

  it('refuses a key that would replace a value', () => {
    const registry = new KeyRegistry({}, { pages: 'text' })
    expect(registry.keyFor('One', '/p/pages/a.vue', 3)).toBeNull()
    expect(registry.keyFor('One', '/p/pages/a.vue', 4)).toBeNull()
    expect(registry.blocked).toEqual([{ file: '/p/pages/a.vue', line: 3, text: 'One' }])
  })

  it('slugs Latin and Cyrillic', () => {
    expect(toSlug('Hello, World')).toBe('hello-world')
    expect(toSlug('Привет мир')).toBe('privet-mir')
    expect(toSlug('50% & more')).toBe('50-percent-and-more')
  })
})

describe('glossary', () => {
  it('filters by language pair', () => {
    const glossary = {
      entries: [
        { source: 'Save', target: 'Speichern', to: 'DE' },
        { source: 'Save', target: 'Sauver', to: 'fr' },
      ],
    }
    expect(glossaryContext(glossary, 'en', 'de')).toBe('Save => Speichern')
    expect(glossaryContext(glossary, 'en', 'es')).toBeUndefined()
  })
})
