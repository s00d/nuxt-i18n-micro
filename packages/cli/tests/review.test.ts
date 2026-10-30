import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { type MockServer, cliBin, createProject, json, removeProject, runCli, startMock } from './harness'

/** The findings of the PR review, each reproduced from the built bin first. */
const read = (dir: string, file: string): string => readFileSync(join(dir, file), 'utf8')
const readJson = (dir: string, file: string): Record<string, any> => JSON.parse(read(dir, file))
const write = (dir: string, file: string, content: unknown): void => {
  mkdirSync(dirname(join(dir, file)), { recursive: true })
  writeFileSync(join(dir, file), typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`)
}

let dir: string
let mock: MockServer
let handler: Parameters<typeof startMock>[0] = (_req, res) => json(res, {})
const outside: string[] = []

beforeAll(async () => {
  mock = await startMock((request, response) => handler(request, response))
})
afterAll(() => mock.close())
afterEach(() => {
  if (dir) removeProject(dir)
  for (const path of outside.splice(0)) removeProject(path)
  mock.requests.length = 0
  handler = (_req, res) => json(res, {})
})

const project = (files: Record<string, unknown>, i18n = `{ locales: ['en', 'de'], defaultLocale: 'en' }`, top = ''): string => {
  dir = createProject()
  for (const name of ['pages', 'components', 'layouts', 'plugins', 'composables', 'locales', 'pots', 'csv_exports']) removeProject(join(dir, name))
  write(dir, 'nuxt.config.ts', `export default { ${top} modules: ['nuxt-i18n-micro'], i18n: ${i18n} }\n`)
  for (const [file, content] of Object.entries(files)) write(dir, file, content)
  return dir
}

const LAYERED = `extends: ['./base'],`
const BASE = { 'base/nuxt.config.ts': 'export default {}\n' }
const remote = (): void => write(dir, '.i18n-remote.json', { url: mock.url })
const git = (...args: string[]): void => {
  execFileSync('git', ['-c', 'user.email=t@e.x', '-c', 'user.name=t', ...args], { cwd: dir, stdio: 'ignore' })
}
const commitAll = (): void => {
  git('init', '-q')
  git('add', '.')
  git('commit', '-qm', 'base')
}
const stats = async (ref = 'HEAD'): Promise<Record<string, any>> => {
  const result = await runCli(['stats', '--baseRef', ref, '--json'], { cwd: dir })
  expect(result.code).toBe(0)
  return JSON.parse(result.stdout).diff.locales.find((entry: { code: string }) => entry.code === 'en')
}

describe('rename', () => {
  it('stops on one key written twice with two values', async () => {
    project({ 'locales/en.json': { 'a.b': 'flat', a: { b: 'nested' } }, 'locales/de.json': {} })
    const before = read(dir, 'locales/en.json')
    const result = await runCli(['rename', '--from', 'a.b', '--to', 'c.d'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('a.b')
    expect(read(dir, 'locales/en.json')).toBe(before)
  })

  it('the same text twice costs nothing and moves', async () => {
    project({ 'locales/en.json': { 'a.b': 'same', a: { b: 'same' } }, 'locales/de.json': {} })
    expect((await runCli(['rename', '--from', 'a.b', '--to', 'c.d'], { cwd: dir })).code).toBe(0)
    expect(read(dir, 'locales/en.json')).toContain('same')
  })
})

describe('sync', () => {
  it('--force does not remove a key when no source was scanned', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': { a: 'x', extra: 'y' } })
    const before = read(dir, 'locales/de.json')
    const result = await runCli(['sync', '--force', '--ignore', 'nuxt.config.ts'], { cwd: dir })
    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('No source files')
    expect(read(dir, 'locales/de.json')).toBe(before)
  })
})

describe('sync-remote', () => {
  const FILES = { 'locales/en.json': { a: 'x' }, 'locales/de.json': { a: 'y', blank: '' } }
  const push = ['sync-remote', '--no-pull', '--push']
  const puts = (): number => mock.requests.filter((request) => request.method === 'PUT').length

  it('a push stops on text only the remote holds', async () => {
    project(FILES)
    remote()
    handler = (request, response) => json(response, request.method === 'GET' ? { en: { a: 'x', only: 'theirs' }, de: { blank: 'Text' }, fr: { b: 'c' } } : {})
    const result = await runCli(push, { cwd: dir })
    expect(result.code).toBe(1)
    expect(puts()).toBe(0)
    for (const label of ['en only', 'de blank', 'fr b']) expect(result.stdout).toContain(label)
  })

  it('--force pushes anyway', async () => {
    project(FILES)
    remote()
    handler = (request, response) => json(response, request.method === 'GET' ? { en: { only: 'theirs' } } : {})
    expect((await runCli([...push, '--force'], { cwd: dir })).code).toBe(0)
    expect(puts()).toBe(1)
  })

  it('an endpoint with nothing yet takes the first push', async () => {
    project(FILES)
    remote()
    handler = (request, response) => (request.method === 'GET' ? json(response, { error: 'none' }, 404) : json(response, {}))
    expect((await runCli(push, { cwd: dir })).code).toBe(0)
    expect(puts()).toBe(1)
  })

  it('a push sends the project own keys, not those of a layer', async () => {
    project({ ...BASE, 'base/locales/en.json': { layer: 'L' }, 'locales/en.json': { a: 'x' }, 'locales/de.json': {} }, undefined, LAYERED)
    remote()
    await runCli(push, { cwd: dir })
    const body = JSON.parse(mock.requests.find((request) => request.method === 'PUT')!.text)
    expect(body.en).toEqual({ a: 'x' })
  })

  it('a pull stops on a key it cannot store, and says so', async () => {
    project(FILES)
    remote()
    handler = (_request, response) => response.end('{"de":{"__proto__":{"x":"y"},"n.__proto__":"z","__proto__x":"ok"}}')
    const before = read(dir, 'locales/de.json')
    const result = await runCli(['sync-remote'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stdout).not.toContain('Pulled')
    expect(result.stdout).toContain('__proto__')
    expect(read(dir, 'locales/de.json')).toBe(before)
  })

  it('counts page scopes of every locale', async () => {
    project({ ...FILES, 'locales/pages/only/de.json': { p: 'q' } })
    remote()
    expect((await runCli(['sync-remote'], { cwd: dir })).stderr).toContain('Global files only: 1 page scopes')
  })

  it('a blocked path is not something --force resolves, and the hint says so', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': { a: 'x' } })
    remote()
    handler = (_request, response) => json(response, { de: { 'a.b': 'y' } })
    const result = await runCli(['sync-remote', '--force'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('a blocked path')
  })
})

describe('page scopes named like Object members', () => {
  it('a page called constructor is a page', async () => {
    project({ 'locales/en.json': {}, 'locales/de.json': {}, 'csv_exports/de.csv': 'File,Key,Translation\npages/constructor/de.json,k,Hallo\n' })
    const result = await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(readJson(dir, 'locales/pages/constructor/de.json')).toEqual({ k: 'Hallo' })
  })

  it('a scope called __proto__ stops an import', async () => {
    project({ 'locales/en.json': {}, 'locales/de.json': {}, 'csv_exports/de.csv': 'File,Key,Translation\npages/__proto__/de.json,k,Hallo\n' })
    const result = await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Unsafe page scope')
  })

  it('a page folder called __proto__ stops a read', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'locales/pages/__proto__/en.json': { k: 'v' } })
    const result = await runCli(['check'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Unsafe page scope')
  })
})

describe('lint', () => {
  const rules = (rule: Record<string, string>): string => JSON.stringify({ customRegexRules: [rule] })

  it('--fix counts what is still wrong after the fixes', async () => {
    project({ 'locales/en.json': { a: 'foo' }, 'locales/de.json': {}, '.i18n-lintrc.json': rules({ name: 'r', pattern: 'foo', replacement: 'foo!' }) })
    const result = await runCli(['lint', '--fix'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stdout).not.toContain('No issues remain')
  })

  it('--fix of a rule that holds is a pass', async () => {
    project({ 'locales/en.json': { a: 'foo' }, 'locales/de.json': {}, '.i18n-lintrc.json': rules({ name: 'r', pattern: 'foo', replacement: 'bar' }) })
    expect((await runCli(['lint', '--fix'], { cwd: dir })).code).toBe(0)
    expect(readJson(dir, 'locales/en.json').a).toBe('bar')
  })

  it('a sticky rule applies its fix', async () => {
    project({
      'locales/en.json': { a: 'bad' },
      'locales/de.json': {},
      '.i18n-lintrc.json': rules({ name: 'r', pattern: '^bad', flags: 'y', replacement: 'good' }),
    })
    await runCli(['lint', '--fix'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json').a).toBe('good')
  })
})

describe('export and import', () => {
  it('a catalog of a page that went away does not bring it back', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'locales/pages/old/en.json': { p: 'q' }, 'locales/pages/old/de.json': { p: 'r' } })
    await runCli(['export'], { cwd: dir })
    removeProject(join(dir, 'locales/pages'))
    expect((await runCli(['export'], { cwd: dir })).code).toBe(0)
    const result = await runCli(['import'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('pages/old/de.po')
    expect(existsSync(join(dir, 'locales/pages/old/de.json'))).toBe(false)
  })

  it('every digest of the manifest is the digest of its file', async () => {
    project({ 'locales/en.json': { a: 'x', spaced: 'y ' }, 'locales/de.json': {} })
    await runCli(['export', '--format', 'csv'], { cwd: dir })
    const manifest = readJson(dir, 'csv_exports/.i18n-export.json')
    for (const name of ['en.csv', 'de.csv']) {
      expect(manifest[name]).toBe(createHash('sha256').update(read(dir, `csv_exports/${name}`)).digest('hex'))
    }
  })

  it.each(['pots/backup/de.po', 'pots/pages/de.po'])('a catalog at %s is not read as the global one', async (file) => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': { a: 'y' }, [file]: 'msgid "a"\nmsgstr "stale"\n' })
    const result = await runCli(['import'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain(file.slice('pots/'.length))
    expect(readJson(dir, 'locales/de.json').a).toBe('y')
  })

  it.each([
    ['a quote inside a cell', 'de.json,a,ab"c,d\n'],
    ['text after a closing quote', 'de.json,a,"ab"c\n'],
    ['a quote that never closes', 'de.json,a,"abc\nde.json,b,d\n'],
  ])('%s stops an import', async (_name, row) => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': { a: 'y' }, 'csv_exports/de.csv': `File,Key,Translation\n${row}` })
    const result = await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('de.csv')
    expect(readJson(dir, 'locales/de.json').a).toBe('y')
  })

  it('a broken CSV does not stop export --force', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'csv_exports/de.csv': 'File,Key,Translation\nde.json,a,"abc\n' })
    expect((await runCli(['export', '--format', 'csv'], { cwd: dir })).code).toBe(1)
    expect((await runCli(['export', '--format', 'csv', '--force'], { cwd: dir })).code).toBe(0)
  })

  it('with disablePageLocales a page entry stops, the runtime would never read it', async () => {
    project(
      { 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'pots/pages/about/de.po': 'msgid "k"\nmsgstr "v"\n' },
      `{ locales: ['en', 'de'], defaultLocale: 'en', disablePageLocales: true }`,
    )
    const result = await runCli(['import'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(existsSync(join(dir, 'locales/pages/about/de.json'))).toBe(false)
  })
})

describe('translate', () => {
  const libre = (text: unknown): void => {
    handler = (_request, response) => json(response, { translatedText: text })
  }
  const translate = (service: string, options: string, extra: string[] = []) =>
    runCli(['translate', '--service', service, '--options', options, ...extra], { cwd: dir, env: { OPENAI_API_KEY: '' } })
  const chat = (content: unknown): void => {
    handler = (_request, response) => json(response, { choices: [{ message: { content: JSON.stringify(content) } }] })
  }
  const SOURCE = { 'locales/en.json': { a: 'Hi {n}' }, 'locales/de.json': {} }

  it('a placeholder that came back twice is rejected', async () => {
    project(SOURCE)
    libre(['<v0/> <v0/>'])
    const result = await translate('libretranslate', `baseUrl:${mock.url},retries:0`)
    expect(result.code).toBe(1)
    expect(readJson(dir, 'locales/de.json').a).toBeUndefined()
  })

  it('a placeholder used twice in the source survives twice', async () => {
    project({ 'locales/en.json': { a: '{n} of {n}' }, 'locales/de.json': {} })
    libre(['<v1/> von <v0/>'])
    expect((await translate('libretranslate', `baseUrl:${mock.url},retries:0`)).code).toBe(0)
    expect(readJson(dir, 'locales/de.json').a).toBe('{n} von {n}')
  })

  it('a named provider with a baseUrl needs no key', async () => {
    project(SOURCE)
    chat({ translations: ['Hallo <v0/>'] })
    const result = await translate('ai', `provider:ollama,model:m,baseUrl:${mock.url},retries:0`)
    expect(result.code).toBe(0)
    expect(readJson(dir, 'locales/de.json').a).toBe('Hallo {n}')
  })

  it('an unknown provider without a baseUrl is named as that', async () => {
    project(SOURCE)
    const result = await translate('ai', 'provider:ollama,model:m')
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Unknown AI provider')
  })

  it.each([[null], [{ a: 1 }], [7]])('a model answering %j writes nothing', async (item) => {
    project(SOURCE)
    chat({ translations: [item] })
    const result = await translate('ai', `baseUrl:${mock.url},model:m,retries:0`)
    expect(result.code).toBe(1)
    expect(readJson(dir, 'locales/de.json').a).toBeUndefined()
  })

  it('an element a service left out is reported, not skipped', async () => {
    project(SOURCE)
    handler = (_request, response) => json(response, { translations: [{}] })
    const result = await translate('deepl', `baseUrl:${mock.url},retries:0`, ['--token', 'fake'])
    expect(result.code).toBe(1)
    expect(result.stdout).toContain('Not written')
  })

  it.each([
    ['azure', 'zh-HK', (request: { url: string }) => new URL(request.url, mock.url).searchParams.get('to'), 'zh-Hant'],
    ['azure', 'zh-Hant-TW', (request: { url: string }) => new URL(request.url, mock.url).searchParams.get('to'), 'zh-Hant'],
    ['deepl', 'zh-HK', (request: { text: string }) => JSON.parse(request.text).target_lang, 'ZH-HANT'],
  ])('%s gets Traditional script for %s', async (service, code, seen, expected) => {
    project({ 'locales/en.json': { a: 'x' } }, `{ locales: ['en', '${code}'], defaultLocale: 'en' }`)
    handler = (_request, response) => json(response, service === 'azure' ? [{ translations: [{ text: 'y' }] }] : { translations: [{ text: 'y' }] })
    await translate(service, `baseUrl:${mock.url},retries:0`, ['--token', 'fake'])
    expect(seen(mock.requests[0] as never)).toBe(expected)
  })

  it.each(['constructor', 'toString'])('--service %s is not a service', async (service) => {
    project(SOURCE)
    const result = await translate(service, '', ['--token', 'fake'])
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Unsupported translation service')
  })

  it('a glossary entry with nothing on one side stays out of the prompt', async () => {
    project({
      ...SOURCE,
      '.i18n-glossary.json': {
        entries: [
          { source: '', target: 'leer' },
          { source: 'Blank', target: '  ' },
          { source: 'Keep', target: 'Bewahren' },
        ],
      },
    })
    chat({ translations: ['Hallo <v0/>'] })
    await translate('ai', `baseUrl:${mock.url},model:m,retries:0`)
    const prompt = mock.requests[0]!.text
    expect(prompt).toContain('Keep => Bewahren')
    expect(prompt).not.toContain('leer')
    expect(prompt).not.toContain('Blank')
  })

  it('a POST is not repeated after a 500: it may have been billed', async () => {
    project(SOURCE)
    handler = (_request, response) => json(response, { error: 'boom' }, 500)
    await translate('libretranslate', `baseUrl:${mock.url},retries:2,retryDelayMs:1`)
    expect(mock.requests).toHaveLength(1)
  })

  it('a POST is repeated after a 503: it was not processed', async () => {
    project(SOURCE)
    handler = (_request, response) => json(response, { error: 'busy' }, 503)
    await translate('libretranslate', `baseUrl:${mock.url},retries:2,retryDelayMs:1`)
    expect(mock.requests).toHaveLength(3)
  })

  it('a Retry-After of a day fails at once', async () => {
    project(SOURCE)
    handler = (_request, response) => {
      response.setHeader('retry-after', '86400')
      json(response, { error: 'later' }, 429)
    }
    const result = await runCli(['translate', '--service', 'libretranslate', '--options', `baseUrl:${mock.url},retries:2`], { cwd: dir, timeoutMs: 8000 })
    expect(result.code).toBe(2)
    expect(mock.requests).toHaveLength(1)
  })

  it('a failed request names its reason', async () => {
    project(SOURCE)
    const result = await translate('libretranslate', 'baseUrl:http://127.0.0.1:59999,retries:0')
    expect(result.stderr).toContain('ECONNREFUSED')
  })
})

describe('check', () => {
  const placeholders = async (): Promise<Record<string, string>> => {
    const { findings } = JSON.parse((await runCli(['check', '--only', 'placeholders', '--json'], { cwd: dir })).stdout)
    return Object.fromEntries(findings.map((finding: { key: string; detail: string }) => [finding.key, finding.detail]))
  }

  it('reads placeholders the way the runtime does, and counts them', async () => {
    project({
      'locales/en.json': { a: 'Hi {first-name}', b: '{n} of {n}', c: '{n} item | {n} items', d: '{ not one }', e: '{имя}' },
      'locales/de.json': { a: 'Hallo', b: '{n}', c: '{n} a | {n} b | {n} c', d: 'nichts', e: 'kein' },
    })
    expect(await placeholders()).toEqual({ a: 'lost {first-name}', b: 'lost {n}', e: 'lost {имя}' })
  })

  it('a language with one plural form keeps one form', async () => {
    project({ 'locales/en.json': { c: 'one | many' }, 'locales/ja.json': { c: 'x' }, 'locales/de.json': { c: 'x' } }, `{ locales: ['en', 'ja', 'de'], defaultLocale: 'en' }`)
    const { findings } = JSON.parse((await runCli(['check', '--only', 'placeholders', '--json'], { cwd: dir })).stdout)
    expect(findings.map((finding: { locale: string }) => finding.locale)).toEqual(['de'])
  })

  it('--only duplicates: a layer is not this file, and the hint fits', async () => {
    project(
      { ...BASE, 'base/locales/en.json': { l1: 'same', l2: 'same' }, 'locales/en.json': { a: 'x', b: 'y', c: 'y' }, 'locales/de.json': {} },
      undefined,
      LAYERED,
    )
    const result = await runCli(['check', '--only', 'duplicates'], { cwd: dir })
    expect(result.stdout).not.toContain('l1')
    expect(result.stdout).toContain('b [en.json]')
    expect(result.stderr).not.toContain('i18n-micro translate')
    expect(result.stderr).not.toContain('i18n-micro sync')
  })

  it('the hint names what failed', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {} })
    const result = await runCli(['check', '--only', 'missing'], { cwd: dir })
    expect(result.stderr).toContain('i18n-micro translate')
    expect(result.stderr).not.toContain('i18n-micro sync')
  })
})

describe('text-to-i18n', () => {
  it('reports text of a script block, with the line of the file', async () => {
    project({
      'locales/en.json': {},
      'locales/de.json': {},
      'pages/a.vue': `<template><p>{{ title }}</p></template>\n\n<script setup lang="ts">\nconst title: string = 'Hello there world'\n</script>\n`,
      'pages/b.vue': `<script>\nexport default { data: () => ({ title: 'Plain script words' }) }\n</script>\n`,
    })
    const { stdout } = await runCli(['text-to-i18n'], { cwd: dir })
    expect(stdout).toContain('pages/a.vue:4 Hello there world')
    expect(stdout).toContain('pages/b.vue:2 Plain script words')
  })

  it('an upper-case extension is a Vue file', async () => {
    project({ 'locales/en.json': {}, 'locales/de.json': {}, 'pages/B.VUE': '<template><p>Hello there</p></template>\n' })
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(read(dir, 'pages/B.VUE')).toContain('$t(')
  })

  it('mixed text at the template root stays whole', async () => {
    const source = '<template>Hello <b>world</b></template>\n'
    project({ 'locales/en.json': {}, 'locales/de.json': {}, 'pages/a.vue': source })
    const { stdout } = await runCli(['text-to-i18n'], { cwd: dir })
    expect(read(dir, 'pages/a.vue')).toBe(source)
    expect(stdout).toContain('Mixed text')
    expect(stdout).toContain('Hello world')
  })

  it('plain text at the template root is converted', async () => {
    project({ 'locales/en.json': {}, 'locales/de.json': {}, 'pages/a.vue': '<template>Hello there</template>\n' })
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(read(dir, 'pages/a.vue')).toContain('$t(')
  })

  it.each(['__proto__', 'a..b', '.a', 'x.__proto__'])('--interactive refuses the key %s', async (key) => {
    project({ 'locales/en.json': {}, 'locales/de.json': {}, 'pages/a.vue': '<template><p>Hello there</p></template>\n' })
    const result = await runCli(['text-to-i18n', '--interactive'], { cwd: dir, stdin: `2\n${key}\n` })
    expect(result.stderr).toContain('not a valid key')
    expect(read(dir, 'pages/a.vue')).not.toContain(`'${key}'`)
    expect(read(dir, 'locales/en.json')).toContain('Hello there')
  })
})

describe('extract', () => {
  const LAYER_REF = `<template>{{ $t('layer.key', {}, 'From the layer') }}</template>\n`

  it('a key of a layer stays out of this app', async () => {
    project({ ...BASE, 'base/components/L.vue': LAYER_REF, 'locales/en.json': {}, 'locales/de.json': {} }, undefined, LAYERED)
    const result = await runCli(['extract'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({})
    expect(result.stdout).toContain('layer.key')
  })

  it('a key that could not be written is warned about once', async () => {
    project({ 'locales/en.json': { a: 'text' }, 'locales/de.json': {}, 'components/A.vue': `<template>{{ $t('a.b', {}, 'Default') }}</template>\n` })
    const result = await runCli(['extract'], { cwd: dir })
    expect(result.stderr).toContain('Skipping a.b')
    expect(result.stdout).not.toContain('Need a text')
  })
})

describe('search', () => {
  it('--onlyUnused says when unused cannot be proven', async () => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'pages/a.vue': '<template>{{ $t(name) }}</template>\n' })
    const text = await runCli(['search', '--onlyUnused'], { cwd: dir })
    expect(text.stderr).toContain('computed at runtime')
    const { doubts } = JSON.parse((await runCli(['search', '--onlyUnused', '--json'], { cwd: dir })).stdout)
    expect(doubts.join()).toContain('computed at runtime')
  })

  it.each(['constructor', 'toString'])('a key called %s in one locale', async (key) => {
    project({ 'locales/en.json': { [key]: 'value' }, 'locales/de.json': { other: 'y' } })
    const result = await runCli(['search', 'value', '--json'], { cwd: dir })
    expect(result.code).toBe(0)
    const [match] = JSON.parse(result.stdout).matches
    expect(match.translations.de).toBeNull()
    expect(match.missingLocales).toEqual(['de'])
  })

  it('--onlyUnused keeps an override next to a layer key, as clean removes it', async () => {
    project(
      { ...BASE, 'base/locales/en.json': { k: 'layer' }, 'locales/en.json': { used: 'x' }, 'locales/de.json': { k: 'override' }, 'pages/a.vue': `<template>{{ $t('used') }}</template>\n` },
      undefined,
      LAYERED,
    )
    const { matches } = JSON.parse((await runCli(['search', '--onlyUnused', '--json'], { cwd: dir })).stdout)
    expect(matches.map((match: { key: string }) => match.key)).toEqual(['k'])
  })
})

describe('stats', () => {
  it('a key named like an Object member is not translated by being there', async () => {
    project({ 'locales/en.json': { toString: 'x', constructor: 'y' }, 'locales/de.json': {} })
    const { locales } = JSON.parse((await runCli(['stats', '--json'], { cwd: dir })).stdout)
    expect(locales[1].translatedKeys).toBe(0)
  })

  it('--baseRef reads a locale file over a megabyte', async () => {
    const big = Object.fromEntries(Array.from({ length: 60_000 }, (_, index) => [`key${index}`, 'x'.repeat(20)]))
    project({ 'locales/en.json': big, 'locales/de.json': {} })
    commitAll()
    expect((await stats()).totalKeysDelta).toBe(0)
  })

  it('--baseRef stops on a file that does not parse at the ref', async () => {
    project({ 'locales/en.json': '{ broken', 'locales/de.json': {} })
    commitAll()
    write(dir, 'locales/en.json', { a: 'x' })
    const result = await runCli(['stats', '--baseRef', 'HEAD'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('en.json')
  })

  it('--baseRef leaves pages out under disablePageLocales', async () => {
    project(
      { 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'locales/pages/p/en.json': { b: 'y' } },
      `{ locales: ['en', 'de'], defaultLocale: 'en', disablePageLocales: true }`,
    )
    commitAll()
    expect((await stats()).totalKeysDelta).toBe(0)
  })
})

describe('pseudo', () => {
  it('leaves tags, attributes and entities alone', async () => {
    project({ 'locales/en.json': { a: 'Go <a href="x">here</a>&nbsp;{n}' }, 'locales/de.json': {} })
    await runCli(['pseudo', '--targetLocale', 'de'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').a).toBe('[GGoo <a href="x">hheerree</a>&nbsp;{n}]')
  })

  it.each([[5], [true], [['x']], [null]])('keeps a value of %j without --replace', async (value) => {
    project({ 'locales/en.json': { a: 'x' }, 'locales/de.json': { a: value } })
    const result = await runCli(['pseudo', '--targetLocale', 'de'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').a).toEqual(value)
    expect(result.stdout).toContain('Updated keys: 0, skipped keys: 1')
  })
})

describe('reading a project', () => {
  it('a primary directory listed in additionalTranslationDirs keeps its pages', async () => {
    project(
      { 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'locales/pages/about/en.json': { p: 'Seite' } },
      `{ locales: ['en', 'de'], defaultLocale: 'en', additionalTranslationDirs: ['locales'] }`,
    )
    const { totalMatches } = JSON.parse((await runCli(['search', 'Seite', '--json'], { cwd: dir })).stdout)
    expect(totalMatches).toBe(1)
  })

  it('--translationDir of an additional directory reads its pages', async () => {
    project(
      { 'locales/en.json': { a: 'x' }, 'locales/de.json': {}, 'extra/en.json': {}, 'extra/pages/about/en.json': { p: 'Seite' } },
      `{ locales: ['en', 'de'], defaultLocale: 'en', additionalTranslationDirs: ['extra'] }`,
    )
    const { totalMatches } = JSON.parse((await runCli(['search', 'Seite', '--json', '--translationDir', 'extra'], { cwd: dir })).stdout)
    expect(totalMatches).toBe(1)
  })

  it('a key spelled \\u005f_proto__ stops a read like the plain one', async () => {
    project({ 'locales/en.json': '{ "\\u005f_proto__": { "a": "x" } }\n', 'locales/de.json': {} })
    const result = await runCli(['check'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('__proto__')
  })

  it('a glob in imports.dirs outside the root still counts as source', async () => {
    project(
      {
        'locales/en.json': { used: 'x', shared: { key: 'y' }, dead: 'z' },
        'locales/de.json': {},
        'pages/a.vue': `<template>{{ $t('used') }}</template>\n`,
      },
      undefined,
      `imports: { dirs: ['../outside-glob/composables/*'] },`,
    )
    outside.push(join(dir, '../outside-glob'))
    write(dir, '../outside-glob/composables/useX.ts', `export const useX = () => $t('shared.key')\n`)
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ used: 'x', shared: { key: 'y' } })
  })
})

describe('the command line', () => {
  it.each(['constructor', 'toString', '__proto__'])('%s is not a command', async (name) => {
    project({ 'locales/en.json': {}, 'locales/de.json': {} })
    for (const args of [[name], [name, '--help']]) {
      const result = await runCli(args, { cwd: dir })
      expect(result.stderr).not.toContain('was removed')
      expect(result.stderr).not.toContain('TypeError')
      expect(result.code).toBe(args.length === 1 ? 2 : 0)
    }
  })

  it('format --check gives a hint that holds for its flags', async () => {
    project({ 'locales/en.json': { b: 'x', a: 'y' }, 'locales/de.json': {} })
    const result = await runCli(['format', '--check', '--indent', '4', '--no-sortKeys'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('i18n-micro format --indent 4 --no-sortKeys')
  })

  it('a second run in one process starts from a clean exit code', () => {
    const entry = join(dirname(cliBin), 'index.mjs')
    const script = `const { runCli } = await import(${JSON.stringify(entry)}); await runCli(['backup']); await runCli(['--version'])`
    expect(spawnSync(process.execPath, ['--input-type=module', '-e', script]).status).toBe(0)
  })

  it('a shell with DEFAULT_LOCALE does not reach the tests', async () => {
    project({ 'locales/en.json': {}, 'locales/de.json': {} })
    process.env.DEFAULT_LOCALE = 'de'
    try {
      expect(JSON.parse((await runCli(['info', '--json'], { cwd: dir })).stdout).defaultLocale).toBe('en')
    } finally {
      delete process.env.DEFAULT_LOCALE
    }
  })
})
