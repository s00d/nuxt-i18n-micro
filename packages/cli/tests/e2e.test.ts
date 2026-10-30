import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import pkg from '../package.json'
import { commands } from '../src/spec'
import { type MockServer, createProject, json, removeProject, runCli, snapshotFiles, startMock } from './harness'

/** Each command from the built bin against a real project copy: what a user runs, nothing mocked but the vendor. */
const read = (dir: string, file: string): string => readFileSync(join(dir, file), 'utf8')
const readJson = (dir: string, file: string): Record<string, any> => JSON.parse(read(dir, file))
const write = (dir: string, file: string, content: string): void => {
  mkdirSync(dirname(join(dir, file)), { recursive: true })
  writeFileSync(join(dir, file), content)
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

const fresh = (): string => {
  dir = createProject()
  return dir
}

describe('entry points', () => {
  it('--version prints the package version', async () => {
    const result = await runCli(['--version'], { cwd: fresh() })
    expect(result.stdout.trim()).toBe(pkg.version)
    expect(result.code).toBe(0)
  })

  it('both bin names point at the built file', () => {
    expect(pkg.bin).toEqual({ 'i18n-micro': './dist/cli.mjs', 'i18n-micro-cli': './dist/cli.mjs' })
    expect(read(join(import.meta.dirname, '..'), 'dist/cli.mjs').startsWith('#!/usr/bin/env node')).toBe(true)
  })

  it.each(Object.keys(commands))('%s --help describes its flags', async (name) => {
    const result = await runCli([name, '--help'], { cwd: fresh() })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain(commands[name]!.description)
    for (const arg of Object.keys(commands[name]!.args)) {
      if (commands[name]!.args[arg]!.type !== 'positional') expect(result.stdout.toLowerCase()).toContain(arg.toLowerCase())
    }
  })

  it('fails outside a Nuxt project', async () => {
    dir = createProject()
    const empty = join(dir, '..', '..', '..')
    const result = await runCli(['stats', '--cwd', join(empty, 'src')], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('No Nuxt project found')
  })

  it('rejects a bad numeric flag and a bad enum', async () => {
    fresh()
    const numeric = await runCli(['format', '--indent', 'wide'], { cwd: dir })
    expect(numeric.code).toBe(1)
    expect(numeric.stderr).toContain('--indent must be a positive integer')
    const choice = await runCli(['search', 'x', '--scope', 'moon'], { cwd: dir })
    expect(choice.stderr).toContain('Accepted: global, pages, all')
  })

  it('a broken locale file stops the command and survives untouched', async () => {
    fresh()
    write(dir, 'locales/de.json', '{ "broken": ')
    const result = await runCli(['sync'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Invalid JSON')
    expect(read(dir, 'locales/de.json')).toBe('{ "broken": ')
  })

  it('--logLevel silent mutes progress', async () => {
    const result = await runCli(['sync', '--logLevel', 'silent'], { cwd: fresh() })
    expect(result.stdout).toBe('')
  })

  it('--cwd works from another directory', async () => {
    fresh()
    const result = await runCli(['validate', '--cwd', dir], { cwd: join(dir, '..') })
    expect(result.stderr).toContain('Missing keys (de)')
  })
})

describe('project resolution', () => {
  it('honours translationDir from nuxt.config in every command', async () => {
    fresh()
    write(dir, 'nuxt.config.ts', read(dir, 'nuxt.config.ts').replace(`translationDir: 'locales'`, `translationDir: 'lang'`))
    renameSync(join(dir, 'locales'), join(dir, 'lang'))
    await runCli(['sync'], { cwd: dir })
    expect(existsSync(join(dir, 'locales'))).toBe(false)
    expect(readJson(dir, 'lang/de.json').greeting).toEqual({ hello: '' })
  })

  it('--translationDir overrides it', async () => {
    fresh()
    write(dir, 'other/en.json', '{"x":"y"}\n')
    await runCli(['sync', '--translationDir', 'other'], { cwd: dir })
    expect(readJson(dir, 'other/de.json')).toEqual({ x: '' })
  })

  it('skips disabled locales and dedupes layer locales', async () => {
    fresh()
    write(
      dir,
      'nuxt.config.ts',
      read(dir, 'nuxt.config.ts').replace(`{ code: 'ru', iso: 'ru-RU' }`, `{ code: 'ru', iso: 'ru-RU', disabled: true }, { code: 'en' }`),
    )
    const { stdout } = await runCli(['info', '--json'], { cwd: dir })
    expect(JSON.parse(stdout).project.locales).toEqual([{ code: 'en' }, { code: 'de' }])
  })

  it('reads string locales', async () => {
    fresh()
    write(dir, 'nuxt.config.ts', `export default { i18n: { locales: ['en', 'de'], defaultLocale: 'en' } }\n`)
    const { stdout } = await runCli(['info', '--json'], { cwd: dir })
    expect(JSON.parse(stdout).project.totalLocales).toBe(2)
  })

  it('explains a project without the module', async () => {
    fresh()
    write(dir, 'nuxt.config.ts', 'export default {}\n')
    const result = await runCli(['stats'], { cwd: dir })
    expect(result.stderr).toContain('nuxt-i18n-micro is not enabled')
  })

  it('a layer key is read, but never copied into the app file', async () => {
    fresh()
    write(dir, 'nuxt.config.ts', read(dir, 'nuxt.config.ts').replace('modules:', `extends: ['./base'],\n  modules:`))
    write(dir, 'base/nuxt.config.ts', 'export default {}\n')
    write(dir, 'base/locales/en.json', '{"layer":{"only":"From layer"}}\n')
    write(dir, 'base/locales/de.json', '{"layer":{"only":"Aus Schicht"}}\n')
    await runCli(['extract'], { cwd: dir })
    const stats = JSON.parse((await runCli(['search', 'From layer', '--json'], { cwd: dir })).stdout)
    expect(stats.matches[0].key).toBe('layer.only')
    expect(readJson(dir, 'locales/en.json').layer).toBeUndefined()
    expect(readJson(dir, 'locales/de.json').layer).toBeUndefined()
  })

  it('disablePageLocales sends page keys to the global file', async () => {
    fresh()
    write(dir, 'nuxt.config.ts', read(dir, 'nuxt.config.ts').replace(`defaultLocale: 'en',`, `defaultLocale: 'en',\n    disablePageLocales: true,`))
    await runCli(['extract'], { cwd: dir })
    expect(existsSync(join(dir, 'locales/pages/blog-slug'))).toBe(false)
    expect(readJson(dir, 'locales/en.json').post).toEqual({ heading: '' })
  })

  it('definePageMeta name decides the page scope', async () => {
    fresh()
    write(dir, 'pages/renamed.vue', `<template>{{ $t('x.y') }}</template>\n<script setup>definePageMeta({ name: 'custom-route' })</script>\n`)
    await runCli(['extract'], { cwd: dir })
    expect(readJson(dir, 'locales/pages/custom-route/en.json')).toEqual({ x: { y: '' } })
  })
})

describe('extract / clean', () => {
  it('extract does not shadow a global value with an empty page value', async () => {
    fresh()
    await runCli(['extract'], { cwd: dir })
    expect(readJson(dir, 'locales/pages/index/en.json').common).toBeUndefined()
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Save')
  })

  it('clean --dryRun writes nothing and lists the keys', async () => {
    fresh()
    const before = snapshotFiles(dir)
    const result = await runCli(['clean', '--dryRun'], { cwd: dir })
    expect(result.stdout).toContain('en common.unused')
    expect(snapshotFiles(dir)).toEqual(before)
  })

  it('clean keeps keys used on pages, under dynamic prefixes and through links', async () => {
    fresh()
    write(
      dir,
      'locales/en.json',
      JSON.stringify({ common: { save: 'Save', cancel: 'C' }, dynamic: { a: 'A' }, linked: '@:common.cancel', drop: 'x' }),
    )
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ common: { save: 'Save', cancel: 'C' }, dynamic: { a: 'A' } })
  })

  it('clean --include narrows what may go, --exclude protects', async () => {
    fresh()
    await runCli(['clean', '--include', '^limits'], { cwd: dir })
    const cleaned = readJson(dir, 'locales/en.json')
    expect(cleaned.limits).toBeUndefined()
    expect(cleaned.common.unused).toBe('Unused value')
  })

  it('clean refuses a project without sources', async () => {
    fresh()
    for (const name of ['pages', 'components', 'layouts', 'plugins', 'composables']) renameSync(join(dir, name), join(dir, `_${name}`))
    const result = await runCli(['clean'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('refusing')
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Save')
  })
})

describe('validate / sync / format', () => {
  it('validate fails on page differences too, and passes after sync', async () => {
    fresh()
    const before = await runCli(['validate'], { cwd: dir })
    expect(before.code).toBe(1)
    expect(before.stderr).toContain('page index')
    await runCli(['sync'], { cwd: dir })
    const after = await runCli(['validate'], { cwd: dir })
    expect(after.code).toBe(0)
  })

  it('format honours --indent and --no-sortKeys', async () => {
    fresh()
    await runCli(['format', '--indent', '4', '--no-sortKeys'], { cwd: dir })
    const text = read(dir, 'locales/en.json')
    expect(text).toContain('\n    "common"')
    expect(Object.keys(JSON.parse(text))[0]).toBe('common')
    await runCli(['format'], { cwd: dir })
    expect(Object.keys(readJson(dir, 'locales/en.json'))[0]).toBe('common')
    expect(read(dir, 'locales/en.json')).toContain('\n  "common"')
  })
})

describe('translate', () => {
  const translated = (request: { text: string }) => (JSON.parse(request.text).q as string[]).map((text) => `DE ${text}`)

  it('fills only missing keys of every locale and page, keeps placeholders', async () => {
    fresh()
    handler = (request, response) => json(response, { translatedText: translated(request) })
    const result = await runCli(['translate', '--service', 'libretranslate', '--options', `baseUrl:${mock.url}`], { cwd: dir })
    expect(result.code).toBe(0)
    const de = readJson(dir, 'locales/de.json')
    expect(de.home.title).toBe('Willkommen {name}')
    expect(de.home.tagline).toBe('DE Fast i18n')
    expect(de.plural.apples).toBe('DE no apples | DE one apple | DE {count} apples')
    expect(de.linked).toBe('DE See @:common.save')
    expect(de.common.cancel).toBe('DE Cancel')
    expect(readJson(dir, 'locales/pages/about/de.json').about.more).toBe('DE Read more')
  })

  it('--replace retranslates everything', async () => {
    fresh()
    handler = (request, response) => json(response, { translatedText: translated(request) })
    await runCli(['translate', '--service', 'libretranslate', '--replace', '--options', `baseUrl:${mock.url}`], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').common.save).toBe('DE Save')
  })

  it('a failed run keeps finished work, leaves whole files and exits 1', async () => {
    fresh()
    let calls = 0
    handler = (request, response) => {
      calls += 1
      if (calls === 1) return json(response, { translatedText: translated(request) })
      return json(response, { error: 'boom' }, 400)
    }
    const result = await runCli(['translate', '--service', 'libretranslate', '--options', `baseUrl:${mock.url},retries:0`], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('boom')
    expect(readJson(dir, 'locales/de.json').home.tagline).toBe('DE Fast i18n')
    expect(readdirSync(join(dir, 'locales')).filter((name) => name.endsWith('.tmp'))).toEqual([])
    expect(readJson(dir, 'locales/ru.json').common.save).toBe('Сохранить')
  })

  it('the token never reaches the output, even on failure', async () => {
    fresh()
    handler = (_request, response) => json(response, { error: { message: 'denied' } }, 403)
    const secret = 'super-secret-token'
    const result = await runCli(['translate', '--service', 'google', '--token', secret, '--options', `baseUrl:${mock.url},retries:0`, '--debug'], {
      cwd: dir,
    })
    expect(result.code).toBe(1)
    expect(result.stdout + result.stderr).not.toContain(secret)
    expect(result.stderr).toContain('denied')
  })

  it('takes the token from the environment', async () => {
    fresh()
    handler = (request, response) =>
      json(response, { data: { translations: new URL(request.url, mock.url).searchParams.get('key') === 'env-key' ? [] : [] } })
    await runCli(['translate', '--service', 'google', '--options', `baseUrl:${mock.url},retries:0`], {
      cwd: dir,
      env: { I18N_TRANSLATE_TOKEN: 'env-key' },
    })
    expect(mock.requests[0]?.url).toContain('key=env-key')
  })

  it('no service and closed stdin is a clear error', async () => {
    const result = await runCli(['translate'], { cwd: fresh() })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Translation service is required')
  })

  it('names a removed service', async () => {
    const result = await runCli(['translate', '--service', 'ibm', '--token', 'x'], { cwd: fresh() })
    expect(result.stderr).toContain('removed')
  })

  it('--glossaryFile reaches the ai prompt', async () => {
    fresh()
    handler = (request, response) => {
      const count = (JSON.parse(JSON.parse(request.text).messages[1].content) as string[]).length
      json(response, { choices: [{ message: { content: JSON.stringify({ translations: Array.from({ length: count }, () => 'x') }) } }] })
    }
    await runCli(['translate', '--service', 'ai', '--glossaryFile', '.i18n-glossary.json', '--options', `baseUrl:${mock.url},model:m`], { cwd: dir })
    const system = JSON.parse(mock.requests[0]!.text).messages[0].content as string
    expect(system).toContain('Save => Sichern')
  })
})

describe('sync-remote', () => {
  const remote = (config: Record<string, unknown> = {}) =>
    write(dir, '.i18n-remote.json', JSON.stringify({ type: 'custom', url: mock.url, auth: { username: 'u', password: 'p' }, ...config }))

  it('merges a pull: local-only keys survive, new locales become files', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, { de: { remote: { only: 'Neu' } }, fr: { a: 'b' } })
    const result = await runCli(['sync-remote'], { cwd: dir })
    expect(result.code).toBe(0)
    const de = readJson(dir, 'locales/de.json')
    expect(de.remote.only).toBe('Neu')
    expect(de.common.save).toBe('Speichern')
    expect(readJson(dir, 'locales/fr.json')).toEqual({ a: 'b' })
  })

  it('a conflict stops without writing; --force takes the remote value and keeps the rest', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, { de: { common: { save: 'Remote' } } })
    const conflict = await runCli(['sync-remote'], { cwd: dir })
    expect(conflict.code).toBe(1)
    expect(conflict.stderr).toContain('Conflict de common.save')
    expect(readJson(dir, 'locales/de.json').common.save).toBe('Speichern')

    await runCli(['sync-remote', '--force'], { cwd: dir })
    const de = readJson(dir, 'locales/de.json')
    expect(de.common.save).toBe('Remote')
    expect(de.common.extra).toBe('Nur auf Deutsch')
  })

  it('--dryRun neither writes nor pushes', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, { de: { common: { save: 'Remote' } } })
    const before = snapshotFiles(dir)
    const result = await runCli(['sync-remote', '--push', '--dryRun'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(mock.requests.map((request) => request.method)).toEqual(['GET'])
    expect(snapshotFiles(dir)).toEqual(before)
  })

  it('reads the token from the environment and refuses to run without one', async () => {
    fresh()
    remote({ type: 'tolgee', projectId: '1', auth: undefined })
    const missing = await runCli(['sync-remote'], { cwd: dir })
    expect(missing.stderr).toContain('needs a token')
    handler = (_request, response) => json(response, { _embedded: { languages: [] } })
    await runCli(['sync-remote'], { cwd: dir, env: { I18N_REMOTE_TOKEN: 'tk' } })
  })
})

describe('backup / restore', () => {
  it('round-trips, excludes earlier backups, restores over changes', async () => {
    fresh()
    await runCli(['backup', '--comment', 'first'], { cwd: dir })
    await runCli(['backup', '--comment', 'second'], { cwd: dir })
    const archives = readdirSync(join(dir, 'locales/backups')).sort()
    expect(archives).toHaveLength(2)
    write(dir, 'locales/en.json', '{"damaged":true}\n')

    const listing = await runCli(['restore'], { cwd: dir })
    expect(listing.stdout).toContain(archives[0]!)

    const refused = await runCli(['restore', '--backup', archives[1]!], { cwd: dir, stdin: 'n\n' })
    expect(refused.stdout).toContain('Restore cancelled')
    expect(readJson(dir, 'locales/en.json')).toEqual({ damaged: true })

    const restored = await runCli(['restore', '--backup', archives[1]!, '--force'], { cwd: dir })
    expect(restored.code).toBe(0)
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Save')
    const zip = readFileSync(join(dir, 'locales/backups', archives[1]!))
    expect(zip.includes(Buffer.from('backups/'))).toBe(false)
  })

  it('an archive made with --password restores only with it', async () => {
    fresh()
    await runCli(['backup', '--password', 'pw', '--backupDir', 'safe'], { cwd: dir })
    const [archive] = readdirSync(join(dir, 'safe'))
    expect(readFileSync(join(dir, 'safe', archive!)).includes(Buffer.from('en.json'))).toBe(false)
    write(dir, 'locales/en.json', '{}')

    const withoutPassword = await runCli(['restore', '--backup', archive!, '--backupDir', 'safe', '--force'], { cwd: dir })
    expect(withoutPassword.stderr).toContain('encrypted')
    const wrong = await runCli(['restore', '--backup', archive!, '--backupDir', 'safe', '--force', '--password', 'no'], { cwd: dir })
    expect(wrong.stderr).toContain('Wrong password')
    const right = await runCli(['restore', '--backup', archive!, '--backupDir', 'safe', '--force', '--password', 'pw'], { cwd: dir })
    expect(right.code).toBe(0)
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Save')
  })
})

describe('import / export', () => {
  it('PO round trip keeps text, numbers stay in the JSON', async () => {
    fresh()
    await runCli(['export'], { cwd: dir })
    const po = read(dir, 'pots/en.po')
    expect(po).toContain('msgid "home.title"')
    expect(read(dir, 'pots/pages/index/en.po')).toContain('msgid "hero.cta"')
    write(dir, 'pots/en.po', po.replace('msgstr "Save"', 'msgstr "Store"'))
    await runCli(['import'], { cwd: dir })
    const en = readJson(dir, 'locales/en.json')
    expect(en.common.save).toBe('Store')
    expect(en.limits.max).toBe(10)
  })

  it('CSV round trip', async () => {
    fresh()
    await runCli(['export-csv'], { cwd: dir })
    write(dir, 'csv_exports/de.csv', read(dir, 'csv_exports/de.csv').replace('Speichern', '"Sichern, jetzt"'))
    await runCli(['import-csv'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').common.save).toBe('Sichern, jetzt')
  })

  it('paths are relative to --cwd, not the shell', async () => {
    fresh()
    await runCli(['export-csv', '--cwd', dir, '--csvDir', 'out'], { cwd: join(dir, '..') })
    expect(existsSync(join(dir, 'out/en.csv'))).toBe(true)
  })
})

describe('stats', () => {
  it('--html writes an escaped report', async () => {
    fresh()
    write(
      dir,
      'locales/en.json',
      JSON.stringify({ a: 'same <script>alert(1)</script>', b: 'same <script>alert(1)</script>', c: { '<img src=x>': 'y' } }),
    )
    const result = await runCli(['stats', '--html', 'report/i18n.html'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(read(dir, 'report/i18n.html')).not.toContain('<script>alert')
    expect(read(dir, 'report/i18n.html')).not.toContain('<img src=x>')
  })

  it('--baseRef compares with git history; a bad ref fails', async () => {
    fresh()
    const git = (...args: string[]) => execFileSync('git', ['-c', 'user.email=t@e.x', '-c', 'user.name=t', ...args], { cwd: dir, stdio: 'ignore' })
    git('init', '-q')
    git('add', '.')
    git('commit', '-qm', 'base')
    write(dir, 'locales/de.json', JSON.stringify({ ...readJson(dir, 'locales/de.json'), greeting: { hello: 'Hallo' } }))

    const { stdout } = await runCli(['stats', '--baseRef', 'HEAD', '--json'], { cwd: dir })
    const delta = JSON.parse(stdout).diff.locales.find((locale: { code: string }) => locale.code === 'de').completionDelta
    expect(delta).toBeGreaterThan(0)

    const bad = await runCli(['stats', '--baseRef', 'no-such-ref'], { cwd: dir })
    expect(bad.code).toBe(1)
    expect(bad.stderr).toContain('Unknown git ref')
  })
})

describe('lint', () => {
  it('reads .i18n-lintrc.json: custom rules, disabled rules', async () => {
    fresh()
    write(
      dir,
      '.i18n-lintrc.json',
      JSON.stringify({ enabledRules: ['no-todo'], customRegexRules: [{ name: 'no-todo', pattern: 'Save', flags: 'g', replacement: 'Keep' }] }),
    )
    const { stdout, code } = await runCli(['lint', '--json'], { cwd: dir })
    expect(code).toBe(1)
    const report = JSON.parse(stdout)
    expect(report.rulesChecked).toEqual(['no-todo'])
    expect(report.issueCount).toBeGreaterThan(1)

    const fixed = await runCli(['lint', '--fix'], { cwd: dir })
    expect(fixed.code).toBe(0)
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Keep')
    expect(existsSync(join(dir, 'locales/en.json.bak'))).toBe(true)
  })

  it('--fix fails when issues remain', async () => {
    const result = await runCli(['lint', '--rules', 'no-empty-translation', '--fix'], { cwd: fresh() })
    expect(result.code).toBe(1)
  })
})

describe('text-to-i18n', () => {
  it('--interactive edits and skips keys from stdin', async () => {
    fresh()
    write(dir, 'pages/one.vue', '<template><p>First text</p><p>Second text</p></template>\n')
    const result = await runCli(['text-to-i18n', '--path', 'pages/one.vue', '--interactive'], { cwd: dir, stdin: '2\ncustom.first\n3\n' })
    expect(result.code).toBe(0)
    expect(read(dir, 'pages/one.vue')).toContain(`{{ $t('custom.first') }}`)
    expect(read(dir, 'pages/one.vue')).toContain('<p>Second text</p>')
    expect(readJson(dir, 'locales/en.json').custom.first).toBe('First text')
  })

  it('--translationFile and --context', async () => {
    fresh()
    write(dir, 'pages/two.vue', '<template><p>Some text</p></template>\n')
    await runCli(['text-to-i18n', '--path', 'pages/two.vue', '--translationFile', 'locales/extra.json', '--context', 'ui'], { cwd: dir })
    expect(readJson(dir, 'locales/extra.json').pages.two.ui['some-text']).toBe('Some text')
  })

  it('an unparsable file warns and the others proceed', async () => {
    fresh()
    write(dir, 'components/bad.ts', 'const = = "Broken Text"\n')
    write(dir, 'components/good.ts', `export const a = 'Good text here'\n`)
    const result = await runCli(['text-to-i18n', '--path', 'components'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(read(dir, 'components/good.ts')).toContain('$t(')
  })

  it('a missing --path fails', async () => {
    const result = await runCli(['text-to-i18n', '--path', 'nope'], { cwd: fresh() })
    expect(result.stderr).toContain('Path does not exist')
  })
})

describe('rename', () => {
  it('moves the key in locales, links, $t, $ts and keypath', async () => {
    fresh()
    write(dir, 'pages/r.vue', `<template><i18n-t keypath="common.save" />{{ $ts('common.save') }}</template>\n`)
    const result = await runCli(['rename', '--from', 'common.save', '--to', 'actions.save'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(readJson(dir, 'locales/en.json').actions.save).toBe('Save')
    expect(readJson(dir, 'locales/en.json').linked).toBe('See @:actions.save')
    expect(read(dir, 'pages/r.vue')).toBe(`<template><i18n-t keypath="actions.save" />{{ $ts('actions.save') }}</template>\n`)
    expect(read(dir, 'pages/index.vue')).toContain(`$t('actions.save')`)
  })

  it('refuses an existing target', async () => {
    const result = await runCli(['rename', '--from', 'common.save', '--to', 'common.cancel'], { cwd: fresh() })
    expect(result.stderr).toContain('Target key already exists')
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Save')
  })
})

describe('init', () => {
  /** A stand-in `npx` on PATH: scaffolding must be exercised without reaching the network. */
  const fakeNpx = (root: string, withAppDir: boolean): string => {
    const bin = join(root, 'fake-bin')
    mkdirSync(bin)
    const appFile = withAppDir ? 'app/app.vue' : 'app.vue'
    writeFileSync(
      join(bin, 'npx'),
      `#!/bin/sh
echo "$@" > "$PWD/npx-args.txt"
mkdir -p "$PWD/$3/app"
${withAppDir ? '' : 'rmdir "$PWD/$3/app"'}
echo '{"name":"x","dependencies":{"nuxt":"latest"}}' > "$PWD/$3/package.json"
echo '<template/>' > "$PWD/$3/${appFile}"
`,
    )
    chmodSync(join(bin, 'npx'), 0o755)
    return bin
  }

  it.each([
    [true, 'app/pages/index.vue'],
    [false, 'pages/index.vue'],
  ])('scaffolds a project (app dir: %s)', async (withAppDir, indexPage) => {
    fresh()
    const bin = fakeNpx(dir, withAppDir)
    const result = await runCli(['init', '--name', 'shop'], { cwd: dir, env: { PATH: `${bin}:${process.env.PATH}` } })
    expect(result.code).toBe(0)
    expect(read(dir, 'npx-args.txt').trim()).toBe('nuxi@latest init shop --no-install --gitInit=false --packageManager=npm')
    expect(readJson(dir, 'shop/package.json').dependencies['nuxt-i18n-micro']).toBe('latest')
    expect(read(dir, `shop/${indexPage}`)).toContain(`$t('welcome')`)
    expect(existsSync(join(dir, `shop/${withAppDir ? 'app/' : ''}app.vue`))).toBe(false)
    expect(read(dir, 'shop/nuxt.config.ts')).toContain(`translationDir: 'locales'`)
    expect(readJson(dir, 'shop/locales/de.json').welcome).toBe('Willkommen bei Nuxt')
  })

  it('takes the name from stdin and refuses shell metacharacters', async () => {
    fresh()
    const result = await runCli(['init'], { cwd: dir, stdin: 'x; touch pwned\n' })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Invalid project name')
    expect(existsSync(join(dir, 'pwned'))).toBe(false)
  })

  it('refuses an existing directory and removes a half-made project', async () => {
    fresh()
    expect((await runCli(['init', '--name', 'pages'], { cwd: dir })).stderr).toContain('already exists')

    const bin = join(dir, 'fail-bin')
    mkdirSync(bin)
    writeFileSync(join(bin, 'npx'), '#!/bin/sh\nmkdir "$PWD/$3"\nexit 3\n')
    chmodSync(join(bin, 'npx'), 0o755)
    const failed = await runCli(['init', '--name', 'broken'], { cwd: dir, env: { PATH: `${bin}:${process.env.PATH}` } })
    expect(failed.code).toBe(1)
    expect(existsSync(join(dir, 'broken'))).toBe(false)
  })
})

describe('review findings', () => {
  it('clean: app.vue, middleware and stores count; a computed key needs --force', async () => {
    fresh()
    write(dir, 'locales/en.json', JSON.stringify({ a: { app: 'x', mw: 'y', store: 'z', cast: 'c', alias: 'd', gone: 'e' }, b: { concat: 'f' } }))
    write(dir, 'app.vue', `<template>{{ $t('a.app') }}</template>\n`)
    write(dir, 'middleware/auth.ts', `export default () => useNuxtApp().$t('a.mw')\n`)
    write(dir, 'stores/user.ts', `export const s = (i: any) => i.$t(<string>'a.store')\n`)
    write(
      dir,
      'composables/c.ts',
      `const { t: tr } = useI18n()\nconst x = <string>tr('a.alias')\nconst y = useI18n().t('a.cast')\nconst z = $t('b.' + id)\n`,
    )
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ a: { app: 'x', mw: 'y', store: 'z', cast: 'c', alias: 'd' }, b: { concat: 'f' } })

    write(dir, 'pages/x.vue', '<template>{{ $t(name) }}</template>\n')
    const refused = await runCli(['clean'], { cwd: dir })
    expect(refused.code).toBe(1)
    expect(refused.stderr).toContain('computed at runtime')
    expect((await runCli(['clean', '--force'], { cwd: dir })).code).toBe(0)
  })

  it('clean: pug templates and files with syntax errors still count', async () => {
    fresh()
    write(dir, 'locales/en.json', JSON.stringify({ p: 'x', q: 'y' }))
    write(dir, 'pages/pug.vue', `<template lang="pug">\np {{ $t('p') }}\n</template>\n`)
    write(dir, 'components/bad.ts', `const = $t('q')\n`)
    await runCli(['clean'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ p: 'x', q: 'y' })
  })

  it('an unknown flag fails instead of being ignored', async () => {
    fresh()
    const result = await runCli(['clean', '--dryrun'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Unknown flag --dryrun')
    expect(readJson(dir, 'locales/en.json').common.unused).toBe('Unused value')
  })

  it('remote and CSV paths cannot leave the project', async () => {
    fresh()
    write(dir, '.i18n-remote.json', JSON.stringify({ type: 'custom', url: mock.url, auth: { username: 'u', password: 'p' } }))
    handler = (_request, response) => json(response, { '../../pwned': { a: 'b' } })
    await runCli(['sync-remote'], { cwd: dir })
    expect(existsSync(join(dir, '..', 'pwned.json'))).toBe(false)

    write(dir, 'csv_exports/de.csv', 'File,Key,Translation\npages/../../../evil/de.json,a,b\n')
    const result = await runCli(['import-csv'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Unsafe page scope')
  })

  it('import ignores empty translations and reads plural entries', async () => {
    fresh()
    write(
      dir,
      'pots/de.po',
      'msgid "common.save"\nmsgstr ""\n\nmsgid "one"\nmsgid_plural "many"\nmsgstr[0] "ein"\nmsgstr[1] "viele"\n\nmsgid "next"\nmsgstr "weiter"\n',
    )
    await runCli(['import'], { cwd: dir })
    const de = readJson(dir, 'locales/de.json')
    expect(de.common.save).toBe('Speichern')
    expect(de.one).toBe('ein')
    expect(de.next).toBe('weiter')
  })

  it('extract does not turn a value into an object; rename refuses a clash', async () => {
    fresh()
    write(dir, 'components/Sub.vue', `<template>{{ $t('common.save.sub') }}</template>\n`)
    const result = await runCli(['extract'], { cwd: dir })
    expect(result.stderr).toContain('common.save already holds a value')
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Save')

    const clash = await runCli(['rename', '--from', 'linked', '--to', 'common'], { cwd: dir })
    expect(clash.code).toBe(1)
    expect((await runCli(['rename', '--from', 'linked', '--to', 'spaced.x'], { cwd: dir })).code).toBe(1)
  })

  it('flat dotted keys are updated in place', async () => {
    fresh()
    write(dir, 'locales/en.json', JSON.stringify({ 'a.b': 'Old value' }))
    await runCli(['replace-values', '--search', 'Old', '--replace', 'New'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ 'a.b': 'New value' })
  })

  it('a type conflict with the remote is a conflict', async () => {
    fresh()
    write(dir, '.i18n-remote.json', JSON.stringify({ type: 'custom', url: mock.url, auth: { username: 'u', password: 'p' } }))
    handler = (_request, response) => json(response, { de: { common: { save: { nested: 'x' } } } })
    const result = await runCli(['sync-remote'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(readJson(dir, 'locales/de.json').common.save).toBe('Speichern')
  })

  it('an empty numeric flag fails instead of hanging', async () => {
    const result = await runCli(['split', '--maxKeys'], { cwd: fresh(), timeoutMs: 10_000 })
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('--maxKeys must be a positive integer')
  })

  it('restore repairs a broken locale; a corrupted archive is refused', async () => {
    fresh()
    await runCli(['backup'], { cwd: dir })
    const [archive] = readdirSync(join(dir, 'locales/backups'))
    write(dir, 'locales/en.json', '{ broken')
    expect((await runCli(['restore', '--backup', archive!, '--force'], { cwd: dir })).code).toBe(0)
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Save')

    const path = join(dir, 'locales/backups', archive!)
    const zip = readFileSync(path)
    zip[60] = zip[60]! ^ 0xff
    writeFileSync(path, zip)
    const corrupted = await runCli(['restore', '--backup', archive!, '--force'], { cwd: dir })
    expect(corrupted.code).toBe(1)
  })

  it('backup refuses an empty password', async () => {
    fresh()
    const result = await runCli(['backup', '--password='], { cwd: dir })
    expect(result.stderr).toContain('--password cannot be empty')
  })

  it('text-to-i18n: known text is still rewritten, tagged templates and composables stay', async () => {
    fresh()
    write(dir, 'pages/k.vue', '<template><p>Fast i18n</p></template>\n')
    write(dir, 'composables/useT.ts', `export const a = 'Plain words here'\n`)
    write(dir, 'components/q.ts', 'export const q = gql`query Foo bar`\n')
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(read(dir, 'pages/k.vue')).toContain(`$t('home.tagline')`)
    expect(read(dir, 'composables/useT.ts')).toContain('Plain words here')
    expect(read(dir, 'components/q.ts')).toContain('gql`query Foo bar`')
  })

  it('text-to-i18n --interactive: a skip covers repeats, closed stdin changes nothing', async () => {
    fresh()
    write(dir, 'pages/one.vue', '<template><p>Hello there</p><b>Hello there</b></template>\n')
    const before = read(dir, 'locales/en.json')
    const closed = await runCli(['text-to-i18n', '--path', 'pages/one.vue', '--interactive'], { cwd: dir })
    expect(closed.code).toBe(1)
    expect(read(dir, 'locales/en.json')).toBe(before)

    await runCli(['text-to-i18n', '--path', 'pages/one.vue', '--interactive'], { cwd: dir, stdin: '3\n' })
    expect(read(dir, 'pages/one.vue')).toBe('<template><p>Hello there</p><b>Hello there</b></template>\n')
    expect(read(dir, 'locales/en.json')).toBe(before)
  })

  it('source files stay untouched when the translation file cannot be written', async () => {
    fresh()
    write(dir, 'pages/one.vue', '<template><p>Some words</p></template>\n')
    write(dir, 'blocker', '')
    const result = await runCli(['text-to-i18n', '--path', 'pages/one.vue', '--translationFile', 'blocker/x.json'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(read(dir, 'pages/one.vue')).toContain('<p>Some words</p>')
  })

  it('translate skips empty source strings', async () => {
    fresh()
    write(dir, 'locales/en.json', JSON.stringify({ empty: '', full: 'Hello' }))
    handler = (request, response) => json(response, { translatedText: JSON.parse(request.text).q.map(() => 'x') })
    await runCli(['translate', '--service', 'libretranslate', '--options', `baseUrl:${mock.url}`], { cwd: dir })
    expect(mock.requests.flatMap((request) => JSON.parse(request.text).q)).not.toContain('')
  })

  it('stats: pages.* global keys are not clobbered, extra keys do not inflate completion', async () => {
    fresh()
    write(dir, 'locales/en.json', JSON.stringify({ pages: { a: 'x' } }))
    write(dir, 'locales/de.json', JSON.stringify({ pages: { a: 'y' }, extra: 'z', more: 'w' }))
    const report = JSON.parse((await runCli(['stats', '--json'], { cwd: dir })).stdout)
    expect(report.locales.find((locale: { code: string }) => locale.code === 'de').global.completion).toBe(100)
  })

  it('a custom remote without credentials sends no Authorization header', async () => {
    fresh()
    write(dir, '.i18n-remote.json', JSON.stringify({ type: 'custom', url: mock.url }))
    handler = (_request, response) => json(response, {})
    await runCli(['sync-remote'], { cwd: dir })
    expect(mock.requests[0]?.headers.authorization).toBeUndefined()
  })
})

describe('remaining commands', () => {
  it('estimate --replace counts more than the default', async () => {
    fresh()
    const missing = JSON.parse((await runCli(['estimate', '--json'], { cwd: dir })).stdout)
    const all = JSON.parse((await runCli(['estimate', '--json', '--replace', '--inputCostPer1kTokens', '2'], { cwd: dir })).stdout)
    expect(all.summary.totalMissingKeys).toBeGreaterThan(missing.summary.totalMissingKeys)
    expect(all.summary.totalEstimatedCost).toBeGreaterThan(missing.summary.totalEstimatedCost)
  })

  it('split --maxKeys splits oversized groups', async () => {
    fresh()
    await runCli(['split', '--maxKeys', '1', '--outputDir', 'parts'], { cwd: dir })
    expect(readdirSync(join(dir, 'parts/en'))).toContain('common.2.json')
  })

  it('pseudo fails for an unconfigured locale and keeps placeholders', async () => {
    fresh()
    expect((await runCli(['pseudo', '--targetLocale', 'xx'], { cwd: dir })).stderr).toContain('not found')
    await runCli(['pseudo', '--targetLocale', 'de', '--replace'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').home.title).toBe('[WWeellccoommee {name}]')
  })

  it('replace-values rejects a bad regex', async () => {
    const result = await runCli(['replace-values', '--search', '(', '--replace', 'x', '--useRegex'], { cwd: fresh() })
    expect(result.stderr).toContain('Invalid regular expression')
  })

  it('search --limit, --scope, --onlyUnused', async () => {
    fresh()
    const limited = JSON.parse((await runCli(['search', 'e', '--json', '--limit', '1'], { cwd: dir })).stdout)
    expect(limited.matches).toHaveLength(1)
    const pages = JSON.parse((await runCli(['search', 'Read more', '--json', '--scope', 'global'], { cwd: dir })).stdout)
    expect(pages.matches).toEqual([])
    const unused = JSON.parse((await runCli(['search', 'Unused', '--json', '--onlyUnused'], { cwd: dir })).stdout)
    expect(unused.matches[0].isUsed).toBe(false)
  })

  it('info text mode shows no user or host data', async () => {
    const { stdout } = await runCli(['info', '--debug'], { cwd: fresh() })
    expect(stdout).toContain('Default locale')
    expect(stdout.toLowerCase()).not.toContain('hostname')
  })

  it('check-duplicates names the keys', async () => {
    const { stdout } = await runCli(['check-duplicates'], { cwd: fresh() })
    expect(stdout).toContain('Duplicate value "Save" in en')
    expect(stdout).toContain('global - common.save')
    expect(stdout).toContain('pages/index - footer')
  })

  it('diff --json names the locale and its own file', async () => {
    const entries = JSON.parse((await runCli(['diff', '--json'], { cwd: fresh() })).stdout)
    expect(entries[0]).toMatchObject({ locale: 'de', file: 'de.json' })
  })

  it('glossary needs its arguments', async () => {
    const result = await runCli(['glossary', '--action', 'add'], { cwd: fresh() })
    expect(result.stderr).toContain('--source and --target are required')
    expect((await runCli(['glossary', '--action', 'burn'], { cwd: dir })).stderr).toContain('Accepted: list, add, remove')
  })

  it('optimize never changes a file', async () => {
    fresh()
    const before = snapshotFiles(dir)
    await runCli(['optimize', '--minSize', '1'], { cwd: dir })
    expect(snapshotFiles(dir)).toEqual(before)
  })
})
