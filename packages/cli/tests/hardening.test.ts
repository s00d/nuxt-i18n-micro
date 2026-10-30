import { chmodSync, existsSync, linkSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { LINT_RULES } from '../src/spec'
import { lintRules } from '../src/lint-rules'
import { type MockServer, createProject, json, removeProject, runCli, snapshotFiles, startMock } from './harness'

/** The cases an independent review reproduced from the built bin. The rule behind them: doubt stops, it does not delete. */
const read = (dir: string, file: string): string => readFileSync(join(dir, file), 'utf8')
const readJson = (dir: string, file: string): Record<string, any> => JSON.parse(read(dir, file))
const write = (dir: string, file: string, content: unknown): void => {
  mkdirSync(dirname(join(dir, file)), { recursive: true })
  writeFileSync(join(dir, file), typeof content === 'string' || Buffer.isBuffer(content) ? content : `${JSON.stringify(content, null, 2)}\n`)
}

let dir: string
let mock: MockServer
let handler: Parameters<typeof startMock>[0] = (_req, res) => json(res, {})

beforeAll(async () => {
  mock = await startMock((request, response) => handler(request, response))
})
afterAll(() => mock.close())
afterEach(() => {
  if (dir) removeProject(dir)
  mock.requests.length = 0
})

const project = (files: Record<string, unknown>, i18n = `{ locales: ['en', 'de'], defaultLocale: 'en' }`, top = ''): string => {
  dir = createProject()
  for (const name of ['pages', 'components', 'layouts', 'plugins', 'composables', 'locales', 'pots', 'csv_exports']) removeProject(join(dir, name))
  write(dir, 'nuxt.config.ts', `export default { ${top} modules: ['nuxt-i18n-micro'], i18n: ${i18n} }\n`)
  for (const [file, content] of Object.entries(files)) write(dir, file, content)
  return dir
}

const LIVE = { 'locales/en.json': { live: { a: 'A', b: 'B' }, used: 'x' }, 'locales/de.json': { live: { a: 'A', b: 'B' }, used: 'x' } }
const USE = `<template>{{ $t('used') }}</template>\n`

/** Exit 1, nothing removed. */
const expectStops = async (args: string[] = ['clean']) => {
  const before = read(dir, 'locales/en.json')
  const result = await runCli(args, { cwd: dir })
  expect(result.code).toBe(1)
  expect(read(dir, 'locales/en.json')).toBe(before)
  return result
}

describe('text-to-i18n writes what compiles and loses nothing', () => {
  it('a parent page and its child: no text is lost', async () => {
    project({ 'pages/user.vue': '<template><h1>Profile</h1></template>\n', 'pages/user/profile.vue': '<template><button>Save</button></template>\n' })
    const result = await runCli(['text-to-i18n'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('would overwrite')
    const en = read(dir, 'locales/en.json')
    expect(en).toContain('Profile')
    const value = readJson(dir, 'locales/en.json').pages.user.profile
    expect(value).toBe('Profile')
    expect(read(dir, 'pages/user/profile.vue')).toContain('<button>Save</button>')
  })

  it('--dryRun warns about the same clash', async () => {
    project({ 'pages/user.vue': '<template><h1>Profile</h1></template>\n', 'pages/user/profile.vue': '<template><button>Save</button></template>\n' })
    expect((await runCli(['text-to-i18n', '--dryRun'], { cwd: dir })).stdout).toContain('would overwrite')
  })

  it('a known key that cannot be written as a literal stays out of the file', async () => {
    project({
      'locales/en.json': { "Don't save": "Don't save" },
      'pages/a.vue': `<template><button title="Don't save">Don't save</button></template>\n`,
    })
    const result = await runCli(['text-to-i18n'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(parseSfc(read(dir, 'pages/a.vue')).errors).toEqual([])
    expect(read(dir, 'pages/a.vue')).toContain(`<button title="Don't save">Don't save</button>`)
    expect(result.stdout).toContain('cannot be written in a template')
    expect(result.stderr).toBe('')
  })

  it('title next to :title stays', async () => {
    project({ 'pages/a.vue': `<template><a title="Home" :title="x">Link</a></template>\n` })
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(parseSfc(read(dir, 'pages/a.vue')).errors).toEqual([])
    expect(read(dir, 'pages/a.vue')).toContain(`title="Home" :title="x"`)
    expect(read(dir, 'pages/a.vue')).toContain(`{{ $t('pages.a.link') }}`)
  })

  it('a file that did not parse is left alone', async () => {
    project({ 'pages/a.vue': `<template><a title="A" title="B">Link text</a></template>\n` })
    const result = await runCli(['text-to-i18n'], { cwd: dir })
    expect(result.stderr).toContain('it does not parse')
    expect(read(dir, 'pages/a.vue')).toContain('Link text</a>')
    expect(existsSync(join(dir, 'locales/en.json'))).toBe(false)
  })

  it('a read-only translation file is a failure, not a replacement', async () => {
    if (process.getuid?.() === 0) return
    project({ 'locales/en.json': { a: 'x' }, 'pages/a.vue': '<template><p>Some words</p></template>\n' })
    chmodSync(join(dir, 'locales/en.json'), 0o444)
    const result = await runCli(['text-to-i18n'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Permission denied')
    expect(read(dir, 'pages/a.vue')).toContain('<p>Some words</p>')
  })
})

describe('clean: a path decides nothing about app code', () => {
  it.each([
    'pages/tests/[id].vue',
    'components/test/A.vue',
    'app/e2e/f.vue',
    'pages/cypress/index.vue',
    'pages/playwright.vue',
    'components/Latest.spec.vue',
  ])('%s with a computed key stops it', async (file) => {
    project({ ...LIVE, 'pages/index.vue': USE, [file]: `<template>{{ $t(k) }}</template>\n` })
    await expectStops()
  })

  it.each(['composables/test/f.ts', 'composables/x.spec.ts'])('%s with a computed key stops it', async (file) => {
    project({ ...LIVE, 'pages/index.vue': USE, [file]: `export const f = (k: string) => $t(k)\n` })
    await expectStops()
  })

  it('app code under such a name is not treated as a test', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'pages/tests/[id].vue': `<template>{{ $t('quiz.title') }}</template>\n` })
    expect((await runCli(['extract'], { cwd: dir })).stdout).toContain('quiz.title')
    expect(JSON.parse((await runCli(['check', '--only', 'undefined', '--json'], { cwd: dir })).stdout).findings).toMatchObject([
      { key: 'quiz.title' },
    ])
  })

  it('a .spec.vue renders: its keys are demanded like any other', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'components/Latest.spec.vue': `<template>{{ $t('spec.key') }}</template>\n` })
    expect((await runCli(['extract'], { cwd: dir })).stdout).toContain('spec.key')
  })

  it('tests at the root: keys count as usage, no key is demanded, no doubt is raised', async () => {
    project({ ...LIVE, 'pages/index.vue': USE, 'tests/a.test.ts': `$t('only.in.test')\n$t(name)\n`, 'e2e/b.ts': 'const = 1\n' })
    const report = JSON.parse((await runCli(['check', '--only', 'undefined', '--json'], { cwd: dir })).stdout)
    expect(report.ok).toBe(true)
    expect((await runCli(['clean', '--dryRun'], { cwd: dir })).stderr).toBe('')
  })
})

describe('clean: the server t and other shapes', () => {
  it('reads the documented server t', async () => {
    project({
      'locales/en.json': { mail: { a: 'A' }, greeting: 'Hi', used: 'x', dead: 'd' },
      'pages/index.vue': USE,
      'server/api/hello.ts': `export default defineEventHandler(async (event) => {\n  const t = await useTranslationServerMiddleware(event)\n  return t('greeting')\n})\n`,
    })
    await runCli(['clean'], { cwd: dir })
    expect(Object.keys(readJson(dir, 'locales/en.json'))).toEqual(['greeting', 'used'])
  })

  it('a computed key through the server t stops it', async () => {
    project({
      ...LIVE,
      'pages/index.vue': USE,
      'server/api/mail.ts': `export default defineEventHandler(async (event) => {\n  const t = await useTranslationServerMiddleware(event)\n  return t(name as string)\n})\n`,
    })
    expect((await expectStops()).stderr).toContain('computed at runtime')
  })

  it('a .then parameter too, whatever its name', async () => {
    project({
      ...LIVE,
      'pages/index.vue': USE,
      'server/api/mail.ts': `export default defineEventHandler((event) => useTranslationServerMiddleware(event).then((tr) => tr(name)))\n`,
    })
    await expectStops()
  })

  it('a t of unknown origin with a computed argument stops it', async () => {
    project({ ...LIVE, 'pages/index.vue': USE, 'composables/a.ts': `const t = useMyI18n()\nexport const f = (k: string) => t(k)\n` })
    await expectStops()
  })

  it.each([
    ['same-name shorthand', 'pages/a.vue', `<template><i18n-t :keypath /></template>\n`],
    ['v-bind', 'pages/a.vue', `<template><i18n-t v-bind="p" /></template>\n`],
    ['TSX expression', 'components/A.tsx', `export const A = () => <i18n-t keypath={pick()} />\n`],
    ['TSX spread', 'components/A.tsx', `export const A = () => <i18n-t {...p} />\n`],
    ['render function', 'components/A.ts', `export const A = () => h(I18nT, { keypath: pick() })\n`],
    ['dynamic group prefix', 'pages/a.vue', `<template><i18n-group :prefix="p" /></template>\n`],
  ])('<i18n-t>: %s stops it', async (_name, file, content) => {
    project({ ...LIVE, 'pages/index.vue': USE, [file]: content })
    await expectStops()
  })

  it('TSX keypath with a literal counts as usage', async () => {
    project({
      'locales/en.json': { used: 'x', tsx: 'y', dead: 'z' },
      'pages/index.vue': USE,
      'components/A.tsx': `export const A = () => <i18n-t keypath="tsx" />\n`,
    })
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ used: 'x', tsx: 'y' })
  })
})

describe('the command line', () => {
  it.each([
    [['clean', '-dryRun']],
    [['clean', 'dryRun']],
    [['-dryRun', 'clean']],
    [['--dryRun', 'clean']],
    [['sync', '-dryRun']],
    [['sync', 'dryRun']],
    [['format', 'x']],
    [['rename', '-from', 'a', '-to', 'b']],
    [['clean', '--exclude', 'x', 'stray']],
    [['clean', '--', 'stray']],
    [['search', 'one', 'two']],
  ])('%j is a usage error and writes nothing', async (args) => {
    project({ ...LIVE, 'pages/index.vue': USE })
    const before = snapshotFiles(dir)
    const result = await runCli(args, { cwd: dir })
    expect(result.code).toBe(2)
    expect(snapshotFiles(dir)).toEqual(before)
  })

  it('a single-dash flag is named as one, even where a positional is allowed', async () => {
    project({ ...LIVE, 'pages/index.vue': USE })
    const result = await runCli(['search', '-onlyUnused'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Long flags take two dashes')
  })

  it('flag values and one positional still pass', async () => {
    project({ ...LIVE, 'pages/index.vue': USE })
    expect((await runCli(['clean', '--exclude', '^live', '--dryRun'], { cwd: dir })).code).toBe(0)
    expect((await runCli(['search', 'A', '--limit', '1'], { cwd: dir })).code).toBe(0)
    expect((await runCli(['search', '--limit', '1', 'A'], { cwd: dir })).code).toBe(0)
    expect((await runCli(['clean', '-h'], { cwd: dir })).code).toBe(0)
  })
})

describe('sync has the brakes of clean', () => {
  const de = { menu: { a: 'x', b: 'y' } }

  it('an empty default locale wipes nothing', async () => {
    project({ 'locales/en.json': {}, 'locales/de.json': de, 'pages/index.vue': USE })
    const before = read(dir, 'locales/de.json')
    const result = await runCli(['sync'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('nothing was removed')
    expect(read(dir, 'locales/de.json')).toBe(before)
  })

  it('a missing default locale wipes nothing', async () => {
    project({ 'locales/de.json': de, 'pages/index.vue': USE })
    expect((await runCli(['sync'], { cwd: dir })).code).toBe(1)
    expect(readJson(dir, 'locales/de.json')).toEqual(de)
  })

  it('a missing page file wipes nothing; --force goes ahead', async () => {
    project({ 'locales/en.json': { used: 'x' }, 'locales/de.json': { used: 'y' }, 'locales/pages/about/de.json': de, 'pages/index.vue': USE })
    expect((await runCli(['sync'], { cwd: dir })).code).toBe(1)
    expect(readJson(dir, 'locales/pages/about/de.json')).toEqual(de)
    expect((await runCli(['sync', '--force'], { cwd: dir })).code).toBe(0)
    expect(readJson(dir, 'locales/pages/about/de.json')).toEqual({})
  })

  it('a computed key stops it', async () => {
    project({
      'locales/en.json': { a: 'x' },
      'locales/de.json': { a: 'y', ...de },
      'pages/index.vue': `<template>{{ $t('a') }}{{ $t(i.key) }}</template>\n`,
    })
    const result = await runCli(['sync'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('computed at runtime')
    expect(readJson(dir, 'locales/de.json').menu).toEqual(de.menu)
  })

  it('a file shared with another app stays', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'pages/index.vue': `<template>{{ $t('a') }}</template>\n` })
    const shared = join(dir, '../shared-sync')
    write(dir, '../shared-sync/de.json', { a: 'y', other: { app: 'z' } })
    symlinkSync(join(shared, 'de.json'), join(dir, 'locales/de.json'))
    const result = await runCli(['sync'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('outside the project')
    expect(readJson(shared, 'de.json').other).toEqual({ app: 'z' })
    removeProject(shared)
  })

  it('DEFAULT_LOCALE from the shell does not silently change the reference', async () => {
    project({ 'locales/en.json': { a: 'x', b: 'y' }, 'locales/de.json': { a: 'z' }, 'pages/index.vue': `<template>{{ $t('a') }}</template>\n` })
    const result = await runCli(['sync'], { cwd: dir, env: { DEFAULT_LOCALE: 'de' } })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('DEFAULT_LOCALE')
    expect(readJson(dir, 'locales/en.json').b).toBe('y')
  })

  it('nothing to remove is no reason to stop', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': { a: 'y' }, 'pages/index.vue': `<template>{{ $t(k) }}</template>\n` })
    expect((await runCli(['sync'], { cwd: dir })).code).toBe(0)
  })

  it('--dryRun still lists, without stopping', async () => {
    project({ 'locales/en.json': {}, 'locales/de.json': de, 'pages/index.vue': USE })
    const result = await runCli(['sync', '--dryRun'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('de.json menu.a')
  })
})

describe('rename', () => {
  it('rewrites the server t, and warns about each plain string, file by file', async () => {
    project({
      'locales/en.json': { old: 'x' },
      'pages/index.vue': `<template>{{ $t('old') }}</template>\n`,
      'server/api/a.ts': `export default defineEventHandler(async (event) => {\n  const t = await useTranslationServerMiddleware(event)\n  return t('old')\n})\n`,
      'utils/k.ts': `export const KEY = 'old'\n`,
      'utils/l.ts': `export const OTHER = 'old'\n`,
    })
    const result = await runCli(['rename', '--from', 'old', '--to', 'fresh'], { cwd: dir })
    expect(read(dir, 'server/api/a.ts')).toContain(`t('fresh')`)
    expect(result.stderr).toContain('utils/k.ts:1')
    expect(result.stderr).toContain('utils/l.ts:1')
    expect(result.stderr).not.toContain('pages/index.vue')
  })

  it('a position that does not hold the key is left alone', async () => {
    const sfc = `<template><b :x="a &amp;&amp; $t('old')" /></template>\n`
    project({ 'locales/en.json': { old: 'x' }, 'pages/i.vue': sfc })
    const result = await runCli(['rename', '--from', 'old', '--to', 'fresh'], { cwd: dir })
    expect(result.stderr).toContain('Not rewritten')
    expect(read(dir, 'pages/i.vue')).toBe(sfc)
  })

  it('sources of a layer or an alias outside the project stay, with a warning', async () => {
    project(
      { 'locales/en.json': { base: { key: 'x' } }, 'pages/a.vue': `<template>{{ $t('base.key') }}</template>\n` },
      undefined,
      `extends: ['../outside-layer'],`,
    )
    const layer = join(dir, '../outside-layer')
    write(dir, '../outside-layer/nuxt.config.ts', 'export default {}\n')
    const original = `<template>{{ $t('base.key') }}</template>\n`
    write(dir, '../outside-layer/components/B.vue', original)
    const result = await runCli(['rename', '--from', 'base.key', '--to', 'mine.key'], { cwd: dir })
    expect(read(layer, 'components/B.vue')).toBe(original)
    expect(result.stderr).toContain('Not rewritten')
    expect(read(dir, 'pages/a.vue')).toContain('mine.key')
    removeProject(layer)
  })

  it.each(["it's", 'x"y', 'a`b', 'a\\b', '__proto__', 'a.__proto__.b', 'a..b', '.a', 'a.'])('--to %s is exit 2 and writes nothing', async (to) => {
    project({ 'locales/en.json': { old: 'x' }, 'pages/i.vue': `<template>{{ $t('old') }}</template>\n` })
    const before = snapshotFiles(dir)
    expect((await runCli(['rename', '--from', 'old', '--to', to], { cwd: dir })).code).toBe(2)
    expect(snapshotFiles(dir)).toEqual(before)
  })
})

describe('text-to-i18n stays inside the project', () => {
  it('a layer and an alias outside it are not rewritten', async () => {
    project(
      { 'pages/a.vue': '<template><p>Own words here</p></template>\n' },
      undefined,
      `extends: ['../outside-tti'], alias: { '#ui': '../outside-ui' },`,
    )
    const layer = join(dir, '../outside-tti')
    const ui = join(dir, '../outside-ui')
    write(dir, '../outside-tti/nuxt.config.ts', 'export default {}\n')
    write(dir, '../outside-tti/components/B.vue', '<template><p>Layer words here</p></template>\n')
    write(dir, '../outside-ui/Button.vue', '<template><p>Alias words here</p></template>\n')
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(read(layer, 'components/B.vue')).toContain('Layer words here')
    expect(read(ui, 'Button.vue')).toContain('Alias words here')
    expect(read(dir, 'pages/a.vue')).toContain('$t(')
    removeProject(layer)
    removeProject(ui)
  })
})

describe('saving', () => {
  it('a read-only locale file or source is exit 2, nothing changes', async () => {
    if (process.getuid?.() === 0) return
    project({ 'locales/en.json': { used: 'x', dead: 'y' }, 'locales/de.json': { used: 'x', dead: 'y' }, 'pages/i.vue': USE })
    chmodSync(join(dir, 'locales/de.json'), 0o444)
    const result = await runCli(['clean'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Permission denied')
    expect(readJson(dir, 'locales/en.json').dead).toBe('y')
    expect(readJson(dir, 'locales/de.json').dead).toBe('y')

    chmodSync(join(dir, 'locales/de.json'), 0o644)
    chmodSync(join(dir, 'pages/i.vue'), 0o444)
    expect((await runCli(['rename', '--from', 'used', '--to', 'fresh'], { cwd: dir })).code).toBe(2)
    expect(read(dir, 'pages/i.vue')).toBe(USE)
    expect(readJson(dir, 'locales/en.json').used).toBe('x')
  })

  it('a hard link stays linked', async () => {
    project({ 'locales/en.json': { used: 'x' }, 'pages/i.vue': USE })
    const shared = join(dir, '../hard-link')
    write(dir, '../hard-link/de.json', { used: 'y', dead: 'z' })
    linkSync(join(shared, 'de.json'), join(dir, 'locales/de.json'))
    await runCli(['sync'], { cwd: dir })
    expect(readJson(shared, 'de.json')).toEqual({ used: 'y' })
    removeProject(shared)
  })

  it('CRLF stays CRLF, in a save and in format', async () => {
    const crlf = '{\r\n  "used": "x",\r\n  "dead": "y"\r\n}\r\n'
    project({ 'locales/en.json': crlf, 'pages/i.vue': USE })
    await runCli(['clean'], { cwd: dir })
    expect(read(dir, 'locales/en.json')).toBe('{\r\n  "used": "x"\r\n}\r\n')
    expect((await runCli(['format', '--check'], { cwd: dir })).code).toBe(0)
  })

  it('bytes that are not UTF-8 stop the command', async () => {
    const latin = Buffer.concat([Buffer.from('<!-- caf'), Buffer.from([0xe9]), Buffer.from(` -->\n<template>{{ $t('old') }}</template>\n`)])
    project({ 'locales/en.json': { old: 'x' }, 'pages/i.vue': latin })
    const source = await runCli(['rename', '--from', 'old', '--to', 'fresh'], { cwd: dir })
    expect(source.code).toBe(2)
    expect(source.stderr).toContain('not valid UTF-8')
    expect(readFileSync(join(dir, 'pages/i.vue')).equals(latin)).toBe(true)
    expect(readJson(dir, 'locales/en.json').old).toBe('x')

    const value = Buffer.concat([Buffer.from('{"old":"caf'), Buffer.from([0xe9]), Buffer.from('"}\n')])
    write(dir, 'pages/i.vue', USE)
    write(dir, 'locales/en.json', value)
    const locale = await runCli(['sync'], { cwd: dir })
    expect(locale.code).toBe(2)
    expect(readFileSync(join(dir, 'locales/en.json')).equals(value)).toBe(true)
  })

  it('a duplicate key or an integer too large stops the command: a save would lose it', async () => {
    project({ 'locales/en.json': '{"a":"one","a":"two"}\n', 'pages/i.vue': USE })
    const duplicate = await runCli(['sync'], { cwd: dir })
    expect(duplicate.code).toBe(2)
    expect(duplicate.stderr).toContain('Duplicate key')
    write(dir, 'locales/en.json', '{"a":12345678901234567890}\n')
    expect((await runCli(['sync'], { cwd: dir })).code).toBe(2)
    expect(read(dir, 'locales/en.json')).toBe('{"a":12345678901234567890}\n')
  })

  it('a leftover temp file of a killed run is cleared by the next save', async () => {
    project({ 'locales/en.json': { used: 'x', dead: 'y' }, 'locales/.en.json.deadbeef.tmp': 'half', 'pages/i.vue': USE })
    await runCli(['clean'], { cwd: dir })
    expect(readdirSync(join(dir, 'locales'))).toEqual(['en.json'])
  })
})

describe('secrets', () => {
  const secret = 'sk-FAKE-review-1234567890'

  it.each(['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'AI_GATEWAY_API_KEY'])('%s is masked', async (name) => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {} })
    handler = (_request, response) => json(response, { error: { message: `Incorrect API key provided: Bearer ${secret}` } }, 401)
    const provider = { OPENAI_API_KEY: 'openai', ANTHROPIC_API_KEY: 'anthropic', AI_GATEWAY_API_KEY: 'gateway' }[name]
    const options = `provider:${provider},model:a/b,baseUrl:${mock.url},retries:0`
    for (const extra of [[], ['--debug']]) {
      const result = await runCli(['translate', '--service', 'ai', '--options', options, ...extra], { cwd: dir, env: { [name]: secret } })
      expect(result.stdout + result.stderr).not.toContain(secret)
      expect(result.stderr).toContain('Incorrect API key')
    }
  })

  it.each(['bad-url?api=SECRETVALUE', 'http://user:SECRETVALUE@127.0.0.1:9/x'])('--debug shows no credential of %s', async (baseUrl) => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {} })
    const result = await runCli(['translate', '--service', 'libretranslate', '--options', `baseUrl:${baseUrl},retries:0`, '--debug'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stdout + result.stderr).not.toContain('SECRETVALUE')
  })

  it('.i18n-remote.json: url credentials under --debug, and a broken file', async () => {
    project({ 'locales/en.json': {}, '.i18n-remote.json': { url: 'http://user:SECRETVALUE@127.0.0.1:9' } })
    const result = await runCli(['sync-remote', '--debug'], { cwd: dir })
    expect(result.stdout + result.stderr).not.toContain('SECRETVALUE')
    write(dir, '.i18n-remote.json', '{ "token": SECRETVALUE }')
    const broken = await runCli(['sync-remote'], { cwd: dir })
    expect(broken.code).toBe(2)
    expect(broken.stdout + broken.stderr).not.toContain('SECRET')
  })
})

describe('smaller things', () => {
  it('a pull that conflicts with itself writes nothing', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': { a: 'y' }, '.i18n-remote.json': { url: mock.url } })
    handler = (_request, response) => json(response, { de: { x: 'one', 'x.y': 'two' } })
    const result = await runCli(['sync-remote'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(readJson(dir, 'locales/de.json')).toEqual({ a: 'y' })
  })

  it('check --only unused is not green by skipping; a plain check goes on', async () => {
    project({ ...LIVE, 'pages/index.vue': `<template>{{ $t(k) }}</template>\n` })
    const only = await runCli(['check', '--only', 'unused'], { cwd: dir })
    expect(only.code).toBe(1)
    expect(only.stdout).not.toContain('All checks passed')
    const json = await runCli(['check', '--only', 'unused', '--json'], { cwd: dir })
    expect(json.code).toBe(1)
    expect(JSON.parse(json.stdout).ok).toBe(false)
    expect((await runCli(['check'], { cwd: dir })).code).toBe(0)
  })

  it('lint --json with no active rule still prints JSON', async () => {
    project({ 'locales/en.json': { a: 'x' }, '.i18n-lintrc.json': { disabledRules: LINT_RULES.map((rule) => rule.name) } })
    const result = await runCli(['lint', '--json'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(JSON.parse(result.stdout).rulesChecked).toEqual([])
  })

  it('a CSV row for another locale is refused', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'csv_exports/de.csv': 'File,Key,Translation\npages/about/en.json,a,b\n' })
    const result = await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(readJson(dir, 'locales/de.json')).toEqual({})
    write(dir, 'csv_exports/de.csv', 'File,Key,Translation\nen.json,a,b\n')
    expect((await runCli(['import', '--format', 'csv'], { cwd: dir })).code).toBe(2)
  })

  it('import refuses __proto__', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'pots/de.po': 'msgid "__proto__.x"\nmsgstr "y"\n' })
    const result = await runCli(['import'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stdout).toContain('__proto__')
  })

  it('with disablePageLocales, locales/pages is not read', async () => {
    project(
      {
        'locales/en.json': { a: 'x' },
        'locales/de.json': { a: 'y' },
        'locales/pages/x/en.json': { p: 'q' },
        'pages/i.vue': `<template>{{ $t('a') }}</template>\n`,
      },
      `{ locales: ['en', 'de'], defaultLocale: 'en', disablePageLocales: true }`,
    )
    expect(JSON.parse((await runCli(['check', '--only', 'missing', '--json'], { cwd: dir })).stdout).ok).toBe(true)
  })

  it('search --onlyUnused leaves out what clean would keep', async () => {
    project(
      {
        'locales/en.json': { own: 'x', used: 'y' },
        'pages/i.vue': USE,
        'base/nuxt.config.ts': 'export default {}\n',
        'base/locales/en.json': { layerKey: 'z' },
      },
      undefined,
      `extends: ['./base'],`,
    )
    const { matches } = JSON.parse((await runCli(['search', '--onlyUnused', '--json'], { cwd: dir })).stdout)
    expect(matches.map((match: { key: string }) => match.key)).toEqual(['own'])
  })

  it('export does not overwrite edited files without --force', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'csv_exports/de.csv': 'hand edited\n' })
    const result = await runCli(['export', '--format', 'csv'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(read(dir, 'csv_exports/de.csv')).toBe('hand edited\n')
    expect((await runCli(['export', '--format', 'csv', '--force'], { cwd: dir })).code).toBe(0)
    expect((await runCli(['export', '--format', 'csv'], { cwd: dir })).code).toBe(0)
  })

  it('a blank answer from a service is rejected, not written over a gap', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {} })
    handler = (_request, response) => json(response, { translatedText: [''] })
    const result = await runCli(['translate', '--service', 'libretranslate', '--options', `baseUrl:${mock.url},retries:0`], { cwd: dir })
    expect(result.code).toBe(1)
    expect(readJson(dir, 'locales/de.json')).toEqual({})
  })

  it('fixable in the spec matches the fixers', () => {
    for (const { name, fixable } of LINT_RULES) expect(Boolean(lintRules[name].fix)).toBe(fixable)
  })
})
