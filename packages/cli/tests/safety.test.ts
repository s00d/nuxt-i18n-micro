import { chmodSync, lstatSync, mkdirSync, readFileSync, readlinkSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createProject, json, removeProject, runCli, startMock } from './harness'

/**
 * Every command that writes locale files, on a project built to trip them: aliases, keys that
 * live outside the usual folders, dotted next to nested keys, a parent with a child, shared
 * folders, symlinks. The one rule: a value nobody asked to remove is still there afterwards.
 */
const read = (dir: string, file: string): string => readFileSync(join(dir, file), 'utf8')
const readJson = (dir: string, file: string): Record<string, any> => JSON.parse(read(dir, file))
const write = (dir: string, file: string, content: unknown): void => {
  mkdirSync(dirname(join(dir, file)), { recursive: true })
  writeFileSync(join(dir, file), typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`)
}

const USED = {
  plain: 'Plain',
  alias: { dollar: 'via $t alias', bare: 'via t alias', member: 'via member', chained: 'via chain' },
  route: { bound: '$_t bound', aliased: '$_t alias' },
  feature: { used: 'features folder' },
  lib: { used: 'lib folder' },
  shared: { used: 'shared folder' },
  server: { used: 'server folder' },
  view: { used: 'dir.pages' },
  guard: { used: '$has' },
  keypath: { attr: 'attr', bound: 'bound' },
  group: { inner: 'i18n-group' },
  through: { variable: 'held by a variable', prop: 'held by a prop', table: 'held by a table', data: 'held by a data file' },
  computed: { a: 'prefix', b: 'prefix' },
  tail: { parent: 'parent' },
  ternary: { yes: 'y', no: 'n' },
  either: { left: 'l', right: 'r' },
}

const SOURCES: Record<string, string> = {
  'views/index.vue': `<script setup>
const { $t: tr, t: bare } = useI18n()
const i18n = useI18n()
const route = useRoute()
const { $_t } = useNuxtApp()
const bound = $_t(route)
const a = tr('alias.dollar')
const b = bare('alias.bare')
const c = i18n.t('alias.member')
const d = useI18n().t('alias.chained')
const e = $_t(route)('route.bound')
const f = bound('route.aliased')
const held = 'through.variable'
const g = tr(held === 'x' ? 'ternary.yes' : 'ternary.no')
const h = tr(one ? 'either.left' : two ? 'either.right' : 'ternary.no')
</script>
<template>
  <main>
    {{ $t('view.used') }}
    <p v-if="$has('guard.used')">{{ $t('plain') }}</p>
    <i18n-t keypath="keypath.attr" />
    <i18n-t :keypath="'keypath.bound'" />
    <i18n-group prefix="group" #default="{ t }">{{ t('inner') }}</i18n-group>
    <Child label="through.prop" />
    {{ $t(\`computed.\${kind}\`) }}
    {{ $t('tail.parent.child') }}
  </main>
</template>
`,
  'features/cart/useCart.ts': `export const cart = () => useNuxtApp().$t('feature.used')\n`,
  'lib/format.ts': `export const x = (i18n: any) => i18n.$t('lib.used')\n`,
  'shared/labels.ts': `export const labels = { a: $t('shared.used'), b: 'through.table' }\n`,
  'server/api/hello.ts': `export default defineEventHandler(async (event) => {\n  const t = await useTranslationServerMiddleware(event)\n  return t('server.used')\n})\n`,
  'data/menu.yaml': 'items:\n  - label: through.data\n',
}

const buildProject = (): string => {
  const dir = createProject()
  for (const name of ['pages', 'components', 'layouts', 'plugins', 'composables', 'locales', 'pots', 'csv_exports']) removeProject(join(dir, name))
  write(
    dir,
    'nuxt.config.ts',
    `export default { modules: ['nuxt-i18n-micro'], dir: { pages: 'views' }, i18n: { locales: ['en', 'de'], defaultLocale: 'en' } }\n`,
  )
  for (const [file, content] of Object.entries(SOURCES)) write(dir, file, content)
  const quirks = { 'tail.parent': 'dotted over nested', tail2: 'x', dead: 'Nobody reads this' }
  const en = { ...USED, tail: { parent: 'Parent text' }, ...quirks }
  write(dir, 'locales/en.json', { ...en, 'tail.parent.child': 'a dotted child under a text' })
  write(dir, 'locales/de.json', { ...en, 'tail.parent.child': 'ein Kind' })
  return dir
}

const leavesOf = (tree: Record<string, any>, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([key, value]) => (typeof value === 'object' ? leavesOf(value, `${prefix}${key}.`) : [`${prefix}${key}`]))

let dir: string
afterEach(() => removeProject(dir))

describe('clean', () => {
  it('removes the one dead key and every other key survives, in every locale', async () => {
    dir = buildProject()
    const before = leavesOf(readJson(dir, 'locales/en.json'))
    const result = await runCli(['clean'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Removed 4')
    for (const code of ['en', 'de'])
      expect(leavesOf(readJson(dir, `locales/${code}.json`))).toEqual(before.filter((key) => !['dead', 'tail2'].includes(key)))
  })

  it('keeps a parent next to its dotted child', async () => {
    dir = createProject()
    removeProject(join(dir, 'locales'))
    write(dir, 'locales/en.json', { a: 'parent', 'a.b': 'child', dead: 'y' })
    write(dir, 'pages/index.vue', `<template>{{ $t('a') }}{{ $t('a.b') }}</template>\n`)
    for (const file of ['pages/about.vue', 'pages/blog/[slug].vue', 'components/SiteHeader.vue', 'layouts/default.vue', 'composables/useGreeting.ts'])
      write(dir, file, '')
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ a: 'parent', 'a.b': 'child' })
  })

  it('edits one path: dotted keys and neighbours stay as written', async () => {
    dir = buildProject()
    write(dir, 'locales/de.json', '{\n    "plain": "x",\n    "tail.parent": "dotted",\n    "dead": "y"\n}\n')
    await runCli(['clean', '--force'], { cwd: dir })
    expect(read(dir, 'locales/de.json')).toBe('{\n    "plain": "x",\n    "tail.parent": "dotted"\n}\n')
  })

  it.each([
    ['a computed key', 'components/A.vue', `<template>{{ $t(name) }}</template>\n`, 'computed at runtime'],
    [
      '$t handed around as a value',
      'components/A.vue',
      `<script setup>\nconst { $t } = useNuxtApp()\nconst all = list.map($t)\n</script>\n`,
      'passed as a value',
    ],
    ['a shorthand property', 'lib/a.ts', `const { t } = useI18n()\nexport const api = { t }\n`, 'passed as a value'],
    ['a template literal without a prefix', 'lib/a.ts', 'export const x = $t(`${a}.title`)\n', 'computed at runtime'],
    ['a script that does not parse', 'lib/broken.ts', `const = $t('nope'\n`, 'Could not read'],
    ['a template that does not parse', 'components/B.vue', `<template><div>{{ $t('x' }}</div></template>\n`, 'Could not read'],
    ['a computed key in Pug', 'components/P.vue', `<template lang="pug">\np {{ $t(name) }}\n</template>\n`, 'computed at runtime'],
  ])('%s stops it: nothing removed, exit 1, --force overrides', async (_name, file, content, reason) => {
    dir = buildProject()
    write(dir, file, content)
    const before = read(dir, 'locales/en.json')
    const result = await runCli(['clean'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain(reason)
    expect(result.stderr).toContain('nothing was removed')
    expect(read(dir, 'locales/en.json')).toBe(before)

    expect((await runCli(['clean', '--force'], { cwd: dir })).code).toBe(0)
    expect(readJson(dir, 'locales/en.json').dead).toBeUndefined()
    expect(readJson(dir, 'locales/en.json').plain).toBe('Plain')
  })

  it('a broken fixture or a computed key in a test is no reason to stop; its keys still count', async () => {
    dir = buildProject()
    write(dir, 'tests/fixtures/broken.ts', 'const = \n')
    write(dir, 'tests/a.spec.ts', `$t(name)\n$t('tail2')\n`)
    expect((await runCli(['clean'], { cwd: dir })).code).toBe(0)
    expect(readJson(dir, 'locales/en.json').dead).toBeUndefined()
    expect(readJson(dir, 'locales/en.json').tail2).toBe('x')
  })

  it('even under --force, a string or a data file that names a key protects it', async () => {
    dir = buildProject()
    write(dir, 'components/A.vue', `<template>{{ $t(name) }}</template>\n`)
    await runCli(['clean', '--force'], { cwd: dir })
    const en = readJson(dir, 'locales/en.json')
    expect(en.through).toEqual(USED.through)
    expect(en.alias).toEqual(USED.alias)
  })

  it('a project where nothing uses a key is a scan in the wrong place', async () => {
    dir = createProject()
    removeProject(join(dir, 'locales'))
    for (const name of ['pages', 'components', 'layouts', 'plugins', 'composables']) removeProject(join(dir, name))
    write(dir, 'locales/en.json', { a: 'x' })
    write(dir, 'app.vue', '<template><NuxtPage /></template>\n')
    const result = await runCli(['clean'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('No source file uses any key')
    expect(readJson(dir, 'locales/en.json')).toEqual({ a: 'x' })
  })

  it('no source files at all is a failure, --force or not', async () => {
    dir = createProject()
    removeProject(join(dir, 'locales'))
    for (const name of ['pages', 'components', 'layouts', 'plugins', 'composables']) removeProject(join(dir, name))
    removeProject(join(dir, 'nuxt.config.ts'))
    write(dir, 'nuxt.config.json', '{}')
    write(dir, 'nuxt.config.ts', `export default { modules: ['nuxt-i18n-micro'], i18n: { locales: ['en'], defaultLocale: 'en' } }\n`)
    write(dir, 'locales/en.json', { a: 'x' })
    const result = await runCli(['clean', '--force', '--ignore', '*.ts'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('refusing')
    expect(readJson(dir, 'locales/en.json')).toEqual({ a: 'x' })
  })

  it('a key of a layer stays; the layer folder is scanned too', async () => {
    dir = buildProject()
    write(dir, 'nuxt.config.ts', read(dir, 'nuxt.config.ts').replace('modules:', `extends: ['./base'], modules:`))
    write(dir, 'base/nuxt.config.ts', 'export default {}\n')
    write(dir, 'base/locales/en.json', { inherited: 'from the layer' })
    write(dir, 'locales/en.json', { ...readJson(dir, 'locales/en.json'), inherited: 'override', onlyLayerPage: 'x' })
    write(dir, 'base/pages/l.vue', `<template>{{ $t('onlyLayerPage') }}</template>\n`)
    await runCli(['clean'], { cwd: dir })
    const en = readJson(dir, 'locales/en.json')
    expect(en.inherited).toBe('override')
    expect(en.onlyLayerPage).toBe('x')
    expect(read(dir, 'base/locales/en.json')).toContain('from the layer')
  })

  it('an <i18n-group> prefix protects its keys, even ones the code spells out elsewhere', async () => {
    dir = buildProject()
    write(dir, 'locales/en.json', { ...readJson(dir, 'locales/en.json'), group: { inner: 'x', viaChild: 'passed down' } })
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json').group).toEqual({ inner: 'x', viaChild: 'passed down' })
  })

  it('a page folder named dist is scanned; build output at the root is not', async () => {
    dir = buildProject()
    write(dir, 'views/dist/index.vue', `<template>{{ $t('dead') }}</template>\n`)
    write(dir, 'dist/bundle.js', `$t('tail2')\n`)
    await runCli(['clean'], { cwd: dir })
    const en = readJson(dir, 'locales/en.json')
    expect(en.dead).toBe('Nobody reads this')
    expect(en.tail2).toBeUndefined()
  })

  it('a key named in Markdown content stays', async () => {
    dir = buildProject()
    write(dir, 'content/post.md', `Use the label \`dead\` here.\n`)
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json').dead).toBe('Nobody reads this')
  })

  it('sources behind a symlink and behind an alias count', async () => {
    dir = buildProject()
    write(dir, '../outside-source/Linked.vue', `<template>{{ $t('dead') }}</template>\n`)
    symlinkSync(join(dir, '../outside-source'), join(dir, 'linked'))
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json').dead).toBe('Nobody reads this')
    removeProject(join(dir, '../outside-source'))
  })

  it('an alias that leaves the root is scanned', async () => {
    dir = buildProject()
    const outside = join(dir, '../outside-alias')
    write(dir, '../outside-alias/Button.ts', `export const x = $t('dead')\n`)
    write(dir, 'nuxt.config.ts', read(dir, 'nuxt.config.ts').replace('modules:', `alias: { '#ui': ${JSON.stringify(outside)} }, modules:`))
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json').dead).toBe('Nobody reads this')
    removeProject(outside)
  })

  it('a locale file that lives outside the project may feed another app: it stops', async () => {
    dir = buildProject()
    const shared = join(dir, '../shared-locales')
    write(dir, '../shared-locales/de.json', { dead: 'used by the other app', plain: 'x' })
    removeProject(join(dir, 'locales/de.json'))
    symlinkSync(join(shared, 'de.json'), join(dir, 'locales/de.json'))
    const result = await runCli(['clean'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('outside the project')
    expect(readJson(shared, 'de.json').dead).toBe('used by the other app')
    removeProject(shared)
  })
})

describe('sync', () => {
  it.each([
    [{ 'nav.home': 'Home' }, { nav: { home: 'Startseite' } }],
    [{ nav: { home: 'Home' } }, { 'nav.home': 'Startseite' }],
  ])('dotted and nested are one key: %j', async (en, de) => {
    dir = buildProject()
    write(dir, 'locales/en.json', en)
    write(dir, 'locales/de.json', de)
    await runCli(['sync'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json')).toEqual(de)
  })

  it('removes an extra next to a parent with a child, and nothing else', async () => {
    dir = buildProject()
    write(dir, 'locales/en.json', { a: 'x', 'a.b': 'y' })
    write(dir, 'locales/de.json', { a: 'X', 'a.b': 'Y', gone: 'z' })
    await runCli(['sync'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json')).toEqual({ a: 'X', 'a.b': 'Y' })
  })

  it('writes through a symlink: the shared file changes, the link stays a link', async () => {
    dir = buildProject()
    const shared = join(dir, 'locales-shared/de.json')
    write(dir, 'locales/en.json', { a: 'x' })
    write(dir, 'locales-shared/de.json', { a: 'y', extra: 'z' })
    removeProject(join(dir, 'locales/de.json'))
    symlinkSync(shared, join(dir, 'locales/de.json'))
    await runCli(['sync'], { cwd: dir })
    expect(lstatSync(join(dir, 'locales/de.json')).isSymbolicLink()).toBe(true)
    expect(readlinkSync(join(dir, 'locales/de.json'))).toBe(shared)
    expect(readJson(dir, 'locales-shared/de.json')).toEqual({ a: 'y' })
  })

  it('reads a symlinked page folder', async () => {
    dir = buildProject()
    write(dir, 'locales/en.json', { a: 'x' })
    write(dir, 'locales/de.json', { a: 'y' })
    write(dir, 'page-locales/home/en.json', { p: 'q' })
    symlinkSync(join(dir, 'page-locales'), join(dir, 'locales/pages'))
    const report = JSON.parse((await runCli(['check', '--only', 'missing', '--json'], { cwd: dir })).stdout)
    expect(report.findings).toMatchObject([{ file: 'pages/home/de.json', key: 'p' }])
  })
})

describe('saving', () => {
  it('keeps indentation, a tab, a missing final newline and the file mode', async () => {
    dir = buildProject()
    write(dir, 'locales/en.json', '{\n\t"a": "x"\n}')
    write(dir, 'locales/de.json', '{\n    "a": "y",\n    "gone": "z"\n}')
    chmodSync(join(dir, 'locales/de.json'), 0o600)
    await runCli(['sync'], { cwd: dir })
    expect(read(dir, 'locales/de.json')).toBe('{\n    "a": "y"\n}')
    expect(statSync(join(dir, 'locales/de.json')).mode & 0o777).toBe(0o600)
    expect(read(dir, 'locales/en.json')).toBe('{\n\t"a": "x"\n}')
  })

  it('a page file nothing touched keeps its bytes, even oddly formatted', async () => {
    dir = buildProject()
    write(dir, 'locales/en.json', { a: 'x' })
    write(dir, 'locales/de.json', { a: 'y', gone: 'z' })
    write(dir, 'locales/pages/home/de.json', '{"a":"caf\\u00e9"}')
    write(dir, 'locales/pages/home/en.json', { a: 'cafe' })
    await runCli(['sync'], { cwd: dir })
    expect(read(dir, 'locales/pages/home/de.json')).toBe('{"a":"caf\\u00e9"}')
  })

  it('a layered file keeps its own key order on a save', async () => {
    dir = buildProject()
    write(dir, 'nuxt.config.ts', read(dir, 'nuxt.config.ts').replace('modules:', `extends: ['./base'], modules:`))
    write(dir, 'base/nuxt.config.ts', 'export default {}\n')
    write(dir, 'base/locales/de.json', { a: 'layer' })
    write(dir, 'locales/en.json', { z: 'x', a: 'y' })
    write(dir, 'locales/de.json', { z: 'x', a: 'over', gone: 'q' })
    await runCli(['sync'], { cwd: dir })
    expect(Object.keys(readJson(dir, 'locales/de.json'))).toEqual(['z', 'a'])
  })
})

describe('writes from outside', () => {
  it('translate, pseudo and import do not replace a text with an object, or a subtree with a text', async () => {
    dir = buildProject()
    write(dir, 'locales/en.json', { 'a.b': 'child', n: 'flat' })
    write(dir, 'locales/de.json', { a: 'text', n: { x: 'subtree' } })
    const mock = await startMock((_request, response) => json(response, { translatedText: ['X', 'Y'] }))
    await runCli(['translate', '--service', 'libretranslate', '--options', `baseUrl:${mock.url},retries:0`], { cwd: dir })
    await mock.close()
    expect(readJson(dir, 'locales/de.json')).toEqual({ a: 'text', n: { x: 'subtree' } })

    await runCli(['pseudo', '--targetLocale', 'de', '--replace'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json')).toEqual({ a: 'text', n: { x: 'subtree' } })
  })

  it('rename on a project with dotted keys and aliases leaves everything else as written', async () => {
    dir = buildProject()
    const before = readJson(dir, 'locales/en.json')
    await runCli(['rename', '--from', 'alias.dollar', '--to', 'alias.renamed'], { cwd: dir })
    const { alias, ...rest } = readJson(dir, 'locales/en.json')
    const { alias: oldAlias, ...oldRest } = before
    expect(rest).toEqual(oldRest)
    expect(alias).toEqual({ ...Object.fromEntries(Object.entries(oldAlias).filter(([key]) => key !== 'dollar')), renamed: 'via $t alias' })
    expect(read(dir, 'views/index.vue')).toContain(`tr('alias.renamed')`)
    expect(read(dir, 'views/index.vue')).toContain(`bare('alias.bare')`)
  })

  it('rename keeps a flat dotted key flat', async () => {
    dir = buildProject()
    write(dir, 'locales/en.json', { 'a.b': 'x', 'c.d': 'y', a: 'keep' })
    await runCli(['rename', '--from', 'a.b', '--to', 'e.f'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ 'c.d': 'y', a: 'keep', 'e.f': 'x' })
  })
})
