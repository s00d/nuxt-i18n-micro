import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import pkg from '../package.json'
import { COMMAND_GROUPS, LINT_RULES, REMOVED_COMMANDS, commands } from '../src/spec'
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

const config = (i18n: string, top = ''): string => `export default { ${top} modules: ['nuxt-i18n-micro'], i18n: ${i18n} }\n`

/** A small project of its own, for what the shared fixture does not have. */
const project = (files: Record<string, unknown>, i18n = `{ locales: ['en', 'de'], defaultLocale: 'en' }`, top = ''): string => {
  fresh()
  for (const name of ['pages', 'components', 'layouts', 'plugins', 'composables', 'locales', 'pots', 'csv_exports']) {
    removeProject(join(dir, name))
  }
  write(dir, 'nuxt.config.ts', config(i18n, top))
  for (const [file, content] of Object.entries(files))
    write(dir, file, typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`)
  return dir
}

const check = async (only?: string) => {
  const result = await runCli(['check', '--json', ...(only ? ['--only', only] : [])], { cwd: dir })
  return {
    ...result,
    report: JSON.parse(result.stdout) as {
      ok: boolean
      summary: Record<string, number>
      findings: Array<Record<string, string>>
      unusedSkipped?: string[]
    },
  }
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

  it.each(Object.keys(commands))('%s --help describes its flags, --debug included', async (name) => {
    const result = await runCli([name, '--help'], { cwd: fresh() })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain(commands[name]!.description)
    for (const arg of Object.keys(commands[name]!.args)) {
      if (commands[name]!.args[arg]!.type !== 'positional') expect(result.stdout.toLowerCase()).toContain(arg.toLowerCase())
    }
    expect(result.stdout).toContain('--debug')
  })

  it('every command belongs to a group', () => {
    for (const command of Object.values(commands)) expect(COMMAND_GROUPS).toContain(command.group)
  })

  it.each(Object.entries(REMOVED_COMMANDS))('%s explains what replaced it', async (name, replacement) => {
    const result = await runCli([name], { cwd: fresh() })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain(replacement)
  })

  it('exit 2 outside a Nuxt project', async () => {
    dir = createProject()
    const result = await runCli(['stats', '--cwd', join(dir, '..', '..', '..', 'src')], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('No Nuxt project found')
    expect(result.stderr).not.toContain('init')
  })

  it('exit 2 on a bad numeric flag, a bad enum, an unknown flag', async () => {
    fresh()
    const numeric = await runCli(['format', '--indent', 'wide'], { cwd: dir })
    expect(numeric.code).toBe(2)
    expect(numeric.stderr).toContain('--indent must be a positive integer')
    const choice = await runCli(['search', 'x', '--scope', 'moon'], { cwd: dir })
    expect(choice.code).toBe(2)
    expect(choice.stderr).toContain('Accepted: global, pages, all')
    const flag = await runCli(['clean', '--dryrun'], { cwd: dir })
    expect(flag.code).toBe(2)
    expect(flag.stderr).toContain('Unknown flag --dryrun')
    expect(readJson(dir, 'locales/en.json').common.unused).toBe('Unused value')
    const empty = await runCli(['format', '--indent'], { cwd: dir, timeoutMs: 10_000 })
    expect(empty.code).toBe(2)
  })

  it('a broken locale file stops the command and survives untouched', async () => {
    fresh()
    write(dir, 'locales/de.json', '{ "broken": ')
    const result = await runCli(['sync'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Invalid JSON')
    expect(read(dir, 'locales/de.json')).toBe('{ "broken": ')
  })

  it('--logLevel silent mutes progress; verbose is gone', async () => {
    const result = await runCli(['sync', '--logLevel', 'silent'], { cwd: fresh() })
    expect(result.stdout).toBe('')
    expect((await runCli(['sync', '--logLevel', 'verbose'], { cwd: dir })).code).toBe(2)
  })

  it('--debug prints a stack trace', async () => {
    fresh()
    write(dir, 'locales/de.json', '{ "broken": ')
    expect((await runCli(['sync', '--debug'], { cwd: dir })).stderr).toContain('    at ')
  })

  it('--cwd works from another directory', async () => {
    fresh()
    const result = await runCli(['check', '--cwd', dir], { cwd: join(dir, '..') })
    expect(result.stdout).toContain('missing')
  })
})

describe('project resolution', () => {
  it('honours translationDir from nuxt.config in every command', async () => {
    fresh()
    write(dir, 'nuxt.config.ts', read(dir, 'nuxt.config.ts').replace(`translationDir: 'locales'`, `translationDir: 'lang'`))
    renameSync(join(dir, 'locales'), join(dir, 'lang'))
    await runCli(['sync'], { cwd: dir })
    expect(existsSync(join(dir, 'locales'))).toBe(false)
    expect(readJson(dir, 'lang/de.json').common.extra).toBeUndefined()
  })

  it('--translationDir overrides it', async () => {
    fresh()
    write(dir, 'other/en.json', '{"x":"y"}\n')
    write(dir, 'other/de.json', '{"x":"z","gone":"g"}\n')
    await runCli(['sync', '--translationDir', 'other'], { cwd: dir })
    expect(readJson(dir, 'other/de.json')).toEqual({ x: 'z' })
  })

  it('skips disabled locales and dedupes layer locales', async () => {
    fresh()
    write(
      dir,
      'nuxt.config.ts',
      read(dir, 'nuxt.config.ts').replace(`{ code: 'ru', iso: 'ru-RU' }`, `{ code: 'ru', iso: 'ru-RU', disabled: true }, { code: 'en' }`),
    )
    const { stdout } = await runCli(['info', '--json'], { cwd: dir })
    expect(JSON.parse(stdout).locales).toEqual(['en', 'de'])
  })

  it('reads string locales', async () => {
    fresh()
    write(dir, 'nuxt.config.ts', `export default { i18n: { locales: ['en', 'de'], defaultLocale: 'en' } }\n`)
    const { stdout } = await runCli(['info', '--json'], { cwd: dir })
    expect(JSON.parse(stdout).locales).toHaveLength(2)
  })

  it('reads options given inline in modules', async () => {
    project({}, '{}')
    write(
      dir,
      'nuxt.config.ts',
      `export default { modules: [['nuxt-i18n-micro', { locales: ['en', 'fr'], defaultLocale: 'fr', translationDir: 'lang' }]] }\n`,
    )
    const info = JSON.parse((await runCli(['info', '--json'], { cwd: dir })).stdout)
    expect(info).toMatchObject({ defaultLocale: 'fr', locales: ['en', 'fr'] })
    expect(info.translationDir).toMatch(/lang$/)
  })

  it('without defaultLocale the default is en, as in the module, not the first locale', async () => {
    project(
      { 'locales/en.json': { a: 'A' }, 'locales/de.json': { a: 'A', b: 'B' }, 'pages/i.vue': `<template>{{ $t('a') }}</template>` },
      `{ locales: ['de', 'en'] }`,
    )
    expect(JSON.parse((await runCli(['info', '--json'], { cwd: dir })).stdout).defaultLocale).toBe('en')
    await runCli(['sync'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json')).toEqual({ a: 'A' })
    expect(readJson(dir, 'locales/en.json')).toEqual({ a: 'A' })
  })

  it('DEFAULT_LOCALE wins, as in the module; a default outside the locales is refused', async () => {
    project({}, `{ locales: ['de', 'en'], defaultLocale: 'en' }`)
    const env = await runCli(['info', '--json'], { cwd: dir, env: { DEFAULT_LOCALE: 'de' } })
    expect(JSON.parse(env.stdout).defaultLocale).toBe('de')
    write(dir, 'nuxt.config.ts', config(`{ locales: ['de', 'fr'] }`))
    const refused = await runCli(['info'], { cwd: dir })
    expect(refused.code).toBe(2)
    expect(refused.stderr).toContain('The default locale "en"')
  })

  it('finds nuxt.config.mts', async () => {
    project({})
    renameSync(join(dir, 'nuxt.config.ts'), join(dir, 'nuxt.config.mts'))
    expect((await runCli(['info'], { cwd: dir })).code).toBe(0)
  })

  it('a BOM does not stop anything', async () => {
    project({ 'locales/en.json': `﻿{"a":"x"}\n`, 'locales/de.json': `﻿{"a":"y"}\n`, 'pages/index.vue': `<template>{{ $t('a') }}</template>\n` })
    expect((await runCli(['check'], { cwd: dir })).code).toBe(0)
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
    await runCli(['sync'], { cwd: dir })
    const found = JSON.parse((await runCli(['search', 'From layer', '--json'], { cwd: dir })).stdout)
    expect(found.matches[0].key).toBe('layer.only')
    expect(readJson(dir, 'locales/en.json').layer).toBeUndefined()
    expect(readJson(dir, 'locales/de.json').layer).toBeUndefined()
  })

  it('additionalTranslationDirs: root files count, pages/ does not, and the path is relative to each layer', async () => {
    project(
      {
        'locales/en.json': { own: 'x' },
        'locales/de.json': { own: 'y' },
        'shared/en.json': { extra: 'E' },
        'shared/de.json': { extra: 'D' },
        'shared/pages/x/en.json': { ghost: 'never read' },
        'base/nuxt.config.ts': 'export default {}\n',
        'base/shared/en.json': { fromLayer: 'L' },
        'base/shared/de.json': { fromLayer: 'L' },
      },
      `{ locales: ['en', 'de'], defaultLocale: 'en', additionalTranslationDirs: ['shared'] }`,
      `extends: ['./base'],`,
    )
    const { report } = await check('missing')
    expect(report.summary.missing).toBe(0)
    const found = JSON.parse((await runCli(['search', 'L', '--json', '--caseSensitive'], { cwd: dir })).stdout)
    expect(found.matches.map((match: { key: string }) => match.key)).toContain('fromLayer')
    expect(found.matches.map((match: { key: string }) => match.key)).not.toContain('ghost')
  })
})

describe('info', () => {
  it('shows the configuration and nothing about the machine', async () => {
    const { stdout } = await runCli(['info'], { cwd: fresh() })
    expect(stdout).toContain('Default locale')
    expect(stdout).not.toMatch(/Memory|CPUs|hostname/i)
    const parsed = JSON.parse((await runCli(['info', '--json'], { cwd: dir })).stdout)
    expect(parsed.defaultLocale).toBe('en')
    expect(parsed.system).toBeUndefined()
  })
})

describe('extract', () => {
  it('writes no empty string: a key without text stays absent and is listed', async () => {
    project({
      'locales/en.json': { a: 'A' },
      'locales/de.json': {},
      'pages/index.vue': `<template>{{ $t('b.c') }}</template>\n`,
    })
    const before = snapshotFiles(dir)
    const result = await runCli(['extract'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('b.c (pages/index.vue:1)')
    expect(snapshotFiles(dir)).toEqual(before)
    expect((await check('undefined')).report.findings).toMatchObject([{ type: 'undefined', key: 'b.c' }])
  })

  it('a default text in the call goes to the default locale, on the page that uses it', async () => {
    project({
      'pages/index.vue': `<template>{{ $t('hero', {}, 'Welcome') }}</template>\n`,
      'components/A.vue': `<template>{{ $t('shared.ok', null, 'OK') }}</template>\n`,
    })
    await runCli(['extract'], { cwd: dir })
    expect(readJson(dir, 'locales/pages/index/en.json')).toEqual({ hero: 'Welcome' })
    expect(readJson(dir, 'locales/en.json')).toEqual({ shared: { ok: 'OK' } })
    expect(existsSync(join(dir, 'locales/de.json'))).toBe(false)
  })

  it('$has only asks: the key is not extracted', async () => {
    project({ 'pages/index.vue': `<template><p v-if="$has('promo.banner')">x</p></template>\n` })
    const result = await runCli(['extract'], { cwd: dir })
    expect(result.stdout).not.toContain('promo.banner')
    expect((await check('undefined')).report.ok).toBe(true)
  })

  it('tests and fixtures do not add keys, but do count as usage', async () => {
    project({
      'locales/en.json': { used: 'x', a: 'y' },
      'locales/de.json': { used: 'x', a: 'y' },
      'tests/a.spec.ts': `$t('only.in.test')\n$t('used')\n`,
      'pages/i.vue': `<template>{{ $t('a') }}</template>`,
    })
    expect((await runCli(['extract'], { cwd: dir })).stdout).not.toContain('only.in.test')
    expect((await check('unused')).report.ok).toBe(true)
  })

  it('--ignore skips sources', async () => {
    project({ 'gen/a.ts': `$t('generated.key')\n`, 'pages/i.vue': `<template>{{ $t('a') }}</template>` })
    expect((await runCli(['extract', '--ignore', 'gen/**'], { cwd: dir })).stdout).not.toContain('generated.key')
  })

  it('a page key that blocks is reported, nothing is destroyed', async () => {
    fresh()
    write(dir, 'components/Sub.vue', `<template>{{ $t('common.save.sub', {}, 'Sub') }}</template>\n`)
    const result = await runCli(['extract'], { cwd: dir })
    expect(result.stderr).toContain('common.save already holds a value')
    expect(readJson(dir, 'locales/en.json').common.save).toBe('Save')
  })

  it('definePageMeta name and dir.pages decide the page', async () => {
    project(
      {
        'views/renamed.vue': `<template>{{ $t('x.y', {}, 'T') }}</template>\n<script setup>definePageMeta({ name: 'custom-route' })</script>\n`,
        'views/plain.vue': `<template>{{ $t('p', {}, 'P') }}</template>\n`,
      },
      undefined,
      `dir: { pages: 'views' },`,
    )
    await runCli(['extract'], { cwd: dir })
    expect(readJson(dir, 'locales/pages/custom-route/en.json')).toEqual({ x: { y: 'T' } })
    expect(readJson(dir, 'locales/pages/plain/en.json')).toEqual({ p: 'P' })
  })

  it('disablePageLocales sends page keys to the global file', async () => {
    project({ 'pages/a.vue': `<template>{{ $t('x', {}, 'T') }}</template>\n` }, `{ locales: ['en'], defaultLocale: 'en', disablePageLocales: true }`)
    await runCli(['extract'], { cwd: dir })
    expect(existsSync(join(dir, 'locales/pages/a'))).toBe(false)
    expect(readJson(dir, 'locales/en.json')).toEqual({ x: 'T' })
  })
})

describe('check', () => {
  const clean = {
    'locales/en.json': { greet: 'Hi {name}', items: 'one|{count} many', used: 'x' },
    'locales/de.json': { greet: 'Hallo {name}', items: 'ein|{count} viele', used: 'y' },
    'pages/index.vue': `<template>{{ $t('greet') }}{{ $t('items') }}{{ $t('used') }}</template>\n`,
  }

  it('exit 0 on a clean project', async () => {
    project(clean)
    const result = await runCli(['check'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('All checks passed')
    const { code, report } = await check()
    expect(code).toBe(0)
    expect(report).toMatchObject({ ok: true, findings: [] })
  })

  it('exit 1 and one finding per kind, with a file for each', async () => {
    project({
      'locales/en.json': { greet: 'Hi {name}', plural: 'one|many', gone: 'G', blank: 'B', dead: 'D', hollow: '' },
      'locales/de.json': { greet: 'Hallo', plural: 'alle', blank: '', dead: 'D', hollow: 'H', stray: 'S' },
      'pages/index.vue': `<template>{{ $t('greet') }}{{ $t('plural') }}{{ $t('gone') }}{{ $t('blank') }}{{ $t('nowhere') }}{{ $t('hollow') }}</template>\n`,
    })
    const { code, report } = await check()
    expect(code).toBe(1)
    const pick = (type: string) => report.findings.filter((finding) => finding.type === type)
    expect(pick('missing')).toMatchObject([{ locale: 'de', file: 'de.json', key: 'gone', detail: 'G' }])
    expect(pick('empty').map((finding) => [finding.locale, finding.key])).toEqual([
      ['en', 'hollow'],
      ['de', 'blank'],
    ])
    expect(pick('extra')).toMatchObject([{ locale: 'de', key: 'stray' }])
    expect(pick('placeholders').map((finding) => [finding.key, finding.detail])).toEqual([
      ['greet', 'lost {name}'],
      ['plural', 'lost the plural forms'],
    ])
    expect(pick('undefined')).toMatchObject([{ key: 'nowhere' }])
    expect(pick('unused').map((finding) => finding.key)).toEqual(['dead', 'dead', 'stray'])
    expect(report.summary).toMatchObject({ missing: 1, empty: 2, extra: 1, placeholders: 2, undefined: 1, unused: 3 })
  })

  it('an added placeholder is drift too', async () => {
    project({ ...clean, 'locales/de.json': { greet: 'Hallo {name} {who}', items: 'ein|{count} viele', used: 'y' } })
    expect((await check('placeholders')).report.findings[0]!.detail).toBe('added {who}')
  })

  it('--only narrows, an unknown check is exit 2', async () => {
    project({ ...clean, 'locales/de.json': { greet: 'Hallo', items: 'ein|{count} viele', used: 'y' } })
    expect((await check('missing')).code).toBe(0)
    expect((await check('placeholders')).code).toBe(1)
    const bad = await runCli(['check', '--only', 'nope'], { cwd: dir })
    expect(bad.code).toBe(2)
    expect(bad.stderr).toContain('Accepted: missing')
  })

  it('--duplicates is opt-in', async () => {
    project({ ...clean, 'locales/en.json': { greet: 'Hi {name}', items: 'one|{count} many', used: 'Hi {name}' } })
    expect((await check()).report.summary.duplicates).toBeUndefined()
    const { stdout, code } = await runCli(['check', '--duplicates'], { cwd: dir })
    expect(code).toBe(1)
    expect(stdout).toContain('duplicates (2)')
  })

  it('"a.b" and a: { b } are the same key', async () => {
    project({
      ...clean,
      'locales/en.json': { 'nav.home': 'Home' },
      'locales/de.json': { nav: { home: 'Start' } },
      'pages/index.vue': `<template>{{ $t('nav.home') }}</template>`,
    })
    expect((await check()).report.ok).toBe(true)
  })

  it('a global value answers a page key, and the other way round', async () => {
    project({
      'locales/en.json': { a: 'x' },
      'locales/de.json': {},
      'locales/pages/index/en.json': { b: 'y' },
      'locales/pages/index/de.json': { a: 'x2' },
      'locales/pages/about/de.json': {},
      'pages/index.vue': `<template>{{ $t('a') }}{{ $t('b') }}</template>`,
    })
    const { report } = await check('missing,extra')
    expect(report.findings.map((finding) => [finding.type, finding.file, finding.key])).toEqual([
      ['missing', 'de.json', 'a'],
      ['missing', 'pages/index/de.json', 'b'],
    ])
  })

  it('page checks: a page named global is a page', async () => {
    project({
      'locales/en.json': { a: 'x' },
      'locales/de.json': { a: 'y' },
      'locales/pages/global/en.json': { p: 'q' },
      'pages/global.vue': `<template>{{ $t('a') }}{{ $t('p') }}</template>`,
    })
    expect((await check('missing')).report.findings).toMatchObject([{ file: 'pages/global/de.json', key: 'p' }])
  })

  it('unused is skipped, with the reason, while keys are computed at runtime', async () => {
    project({ ...clean, 'pages/index.vue': `<template>{{ $t(name) }}</template>\n` })
    const { report } = await check()
    expect(report.summary.unused).toBe(0)
    expect(report.unusedSkipped?.[0]).toContain('computed at runtime')
  })
})

describe('sync', () => {
  it('removes extra keys in every scope, adds nothing, and check then shows what is missing', async () => {
    project({
      'locales/en.json': { a: 'A', b: 'B' },
      'locales/de.json': { a: 'x', extra: 'z' },
      'locales/pages/orphan/de.json': { z: 'y' },
      'pages/i.vue': `<template>{{ $t('a') }}{{ $t('b') }}</template>`,
    })
    const result = await runCli(['sync', '--force'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(readJson(dir, 'locales/de.json')).toEqual({ a: 'x' })
    expect(readJson(dir, 'locales/pages/orphan/de.json')).toEqual({})
    const { report } = await check('missing,extra')
    expect(report.findings).toMatchObject([{ type: 'missing', key: 'b' }])
  })

  it('--dryRun lists and writes nothing', async () => {
    fresh()
    const before = snapshotFiles(dir)
    const result = await runCli(['sync', '--dryRun'], { cwd: dir })
    expect(result.stdout).toContain('de.json common.extra')
    expect(snapshotFiles(dir)).toEqual(before)
  })

  it('keeps numbers, booleans and arrays', async () => {
    fresh()
    await runCli(['sync'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').limits).toEqual({ max: 20, enabled: false, list: ['x'] })
  })

  it('keeps an extra key the code uses, and says so', async () => {
    project({
      'locales/en.json': { a: 'x' },
      'locales/de.json': { a: 'y', used: 'z' },
      'pages/i.vue': `<template>{{ $t('a') }}{{ $t('used') }}</template>`,
    })
    const result = await runCli(['sync'], { cwd: dir })
    expect(result.stderr).toContain('Keeping used')
    expect(readJson(dir, 'locales/de.json').used).toBe('z')
  })
})

describe('format', () => {
  it('honours --indent and --no-sortKeys', async () => {
    fresh()
    await runCli(['format', '--indent', '4', '--no-sortKeys'], { cwd: dir })
    const text = read(dir, 'locales/en.json')
    expect(text).toContain('\n    "common"')
    expect(Object.keys(JSON.parse(text))[0]).toBe('common')
    await runCli(['format'], { cwd: dir })
    expect(Object.keys(readJson(dir, 'locales/en.json'))[0]).toBe('common')
    expect(read(dir, 'locales/en.json')).toContain('\n  "common"')
  })

  it('--check exits 1, lists the files and writes nothing; exit 0 once formatted', async () => {
    project({ 'locales/en.json': '{"b":"x","a":"y"}\n' })
    const failing = await runCli(['format', '--check'], { cwd: dir })
    expect(failing.code).toBe(1)
    expect(failing.stdout).toContain('locales/en.json')
    expect(read(dir, 'locales/en.json')).toBe('{"b":"x","a":"y"}\n')
    await runCli(['format'], { cwd: dir })
    expect(Object.keys(readJson(dir, 'locales/en.json'))).toEqual(['a', 'b'])
    expect((await runCli(['format', '--check'], { cwd: dir })).code).toBe(0)
  })
})

describe('translate', () => {
  const translated = (request: { text: string }) => (JSON.parse(request.text).q as string[]).map((text) => `DE ${text}`)
  const libre = (...extra: string[]) => ['translate', '--service', 'libretranslate', '--options', `baseUrl:${mock.url},retries:0`, ...extra]

  it('fills only missing keys of every locale and page, keeps placeholders', async () => {
    fresh()
    handler = (request, response) => json(response, { translatedText: translated(request) })
    const result = await runCli(libre(), { cwd: dir })
    expect(result.code).toBe(0)
    const de = readJson(dir, 'locales/de.json')
    expect(de.home.title).toBe('Willkommen {name}')
    expect(de.home.tagline).toBe('DE Fast i18n')
    expect(de.plural.apples).toBe('DE no apples | DE one apple | DE {count} apples')
    expect(de.common.cancel).toBe('DE Cancel')
    expect(readJson(dir, 'locales/pages/about/de.json').about.more).toBe('DE Read more')
  })

  it('--replace retranslates everything', async () => {
    fresh()
    handler = (request, response) => json(response, { translatedText: translated(request) })
    await runCli(libre('--replace'), { cwd: dir })
    expect(readJson(dir, 'locales/de.json').common.save).toBe('DE Save')
  })

  it('--dryRun counts per locale without a service, a token or a request', async () => {
    fresh()
    const before = snapshotFiles(dir)
    const result = await runCli(['translate', '--dryRun'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toMatch(/de:\s+\d+ keys, \d+ characters/)
    expect(result.stdout).toMatch(/ru:\s+\d+ keys/)
    expect(mock.requests).toEqual([])
    expect(snapshotFiles(dir)).toEqual(before)
  })

  it('--locale fills only those; a locale that is not a target is exit 2', async () => {
    fresh()
    handler = (request, response) => json(response, { translatedText: translated(request) })
    const before = read(dir, 'locales/ru.json')
    await runCli(libre('--locale', 'de'), { cwd: dir })
    expect(read(dir, 'locales/ru.json')).toBe(before)
    expect(readJson(dir, 'locales/de.json').home.tagline).toBe('DE Fast i18n')
    expect((await runCli(libre('--locale', 'en'), { cwd: dir })).code).toBe(2)
    expect((await runCli(libre('--locale', 'xx'), { cwd: dir })).code).toBe(2)
  })

  it('every finished batch is on disk: a failure in the same scope costs only its own request', async () => {
    const strings = Object.fromEntries(Array.from({ length: 4 }, (_item, index) => [`k${index}`, `Text ${index}`]))
    project({ 'locales/en.json': strings, 'locales/de.json': {} })
    let calls = 0
    handler = (request, response) => {
      calls += 1
      return calls < 3 ? json(response, { translatedText: translated(request) }) : json(response, { error: 'quota exceeded' }, 400)
    }
    const result = await runCli(libre('--chunkSize', '1'), { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('quota exceeded')
    expect(readJson(dir, 'locales/de.json')).toEqual({ k0: 'DE Text 0', k1: 'DE Text 1' })
    expect(readdirSync(join(dir, 'locales')).filter((name) => name.endsWith('.tmp'))).toEqual([])
  })

  it('a plural split across batches is written whole or not at all', async () => {
    project({ 'locales/en.json': { p: 'one | two' }, 'locales/de.json': {} })
    let calls = 0
    handler = (request, response) => {
      calls += 1
      return calls === 1 ? json(response, { translatedText: translated(request) }) : json(response, { error: 'boom' }, 400)
    }
    await runCli(libre('--chunkSize', '1'), { cwd: dir })
    expect(readJson(dir, 'locales/de.json')).toEqual({})
  })

  it('exit 1 when a key is rejected, with the rest written', async () => {
    project({ 'locales/en.json': { a: 'Hi {name}', b: 'Bye' }, 'locales/de.json': {} })
    handler = (_request, response) => json(response, { translatedText: ['Hallo', 'Tschüss'] })
    const result = await runCli(libre(), { cwd: dir })
    expect(result.code).toBe(1)
    expect(result.stdout).toContain('a (a placeholder was lost, or the answer held no text)')
    expect(readJson(dir, 'locales/de.json')).toEqual({ b: 'Tschüss' })
  })

  it('a translation that would destroy a value is rejected', async () => {
    project({ 'locales/en.json': { 'a.b': 'x' }, 'locales/de.json': { a: 'kept' } })
    handler = (_request, response) => json(response, { translatedText: ['y'] })
    expect((await runCli(libre(), { cwd: dir })).code).toBe(1)
    expect(readJson(dir, 'locales/de.json')).toEqual({ a: 'kept' })
  })

  it('reads the token from .env', async () => {
    fresh()
    write(dir, '.env', 'I18N_TRANSLATE_TOKEN=from-dotenv\n')
    handler = (_request, response) => json(response, { data: { translations: [] } })
    await runCli(['translate', '--service', 'google', '--options', `baseUrl:${mock.url},retries:0`], { cwd: dir })
    expect(mock.requests[0]?.url).toContain('key=from-dotenv')
  })

  it('takes the token from the environment', async () => {
    fresh()
    handler = (_request, response) => json(response, { data: { translations: [] } })
    await runCli(['translate', '--service', 'google', '--options', `baseUrl:${mock.url},retries:0`], {
      cwd: dir,
      env: { I18N_TRANSLATE_TOKEN: 'env-key' },
    })
    expect(mock.requests[0]?.url).toContain('key=env-key')
  })

  it('no service and closed stdin is a clear error', async () => {
    const result = await runCli(['translate'], { cwd: fresh() })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Translation service is required')
  })

  it.each(['ibm', 'baidu', 'papago', 'tencent', 'systran', 'mymemory'])('names the removed service %s', async (service) => {
    const result = await runCli(['translate', '--service', service, '--token', 'x'], { cwd: fresh() })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('removed')
  })

  const aiAnswer: Parameters<typeof startMock>[0] = (request, response) => {
    const count = (JSON.parse(JSON.parse(request.text).messages[1].content) as string[]).length
    json(response, { choices: [{ message: { content: JSON.stringify({ translations: Array.from({ length: count }, () => 'x') }) } }] })
  }

  it('.i18n-glossary.json reaches the ai prompt without a flag', async () => {
    fresh()
    handler = aiAnswer
    await runCli(['translate', '--service', 'ai', '--options', `baseUrl:${mock.url},model:m`], { cwd: dir })
    expect(JSON.parse(mock.requests[0]!.text).messages[0].content as string).toContain('Save => Sichern')
  })

  it('--glossaryFile picks another file, and must exist', async () => {
    fresh()
    write(dir, 'terms.json', JSON.stringify({ entries: [{ source: 'Cart', target: 'Warenkorb' }] }))
    handler = aiAnswer
    await runCli(['translate', '--service', 'ai', '--glossaryFile', 'terms.json', '--options', `baseUrl:${mock.url},model:m`], { cwd: dir })
    expect(JSON.parse(mock.requests[0]!.text).messages[0].content as string).toContain('Cart => Warenkorb')
    const missing = await runCli(['translate', '--service', 'ai', '--glossaryFile', 'nope.json', '--options', `baseUrl:${mock.url},model:m`], {
      cwd: dir,
    })
    expect(missing.code).toBe(2)
  })

  it('translate skips empty source strings', async () => {
    project({ 'locales/en.json': { empty: '', full: 'Hello' }, 'locales/de.json': {} })
    handler = (request, response) => json(response, { translatedText: JSON.parse(request.text).q.map(() => 'x') })
    await runCli(libre(), { cwd: dir })
    expect(mock.requests.flatMap((request) => JSON.parse(request.text).q)).toEqual(['Hello'])
  })
})

describe('secrets never reach the output', () => {
  const secret = 'FAKE-SECRET-123'
  const flows: Array<[string, string[], Parameters<typeof startMock>[0]]> = [
    [
      'http error',
      ['--options', 'baseUrl:<mock>,retries:0'],
      (_request, response) => json(response, { error: { message: `denied ${secret}` } }, 403),
    ],
    ['malformed baseUrl', ['--options', 'baseUrl:not-a-url,retries:0'], (_request, response) => json(response, {})],
    ['refused connection', ['--options', 'baseUrl:http://127.0.0.1:9,retries:0'], (_request, response) => json(response, {})],
    ['not JSON', ['--options', 'baseUrl:<mock>,retries:0'], (_request, response) => response.end(`<html>${secret}</html>`)],
    [
      'a body that echoes the key',
      ['--options', 'baseUrl:<mock>,retries:0'],
      (_request, response) => json(response, { data: { translations: [{ translatedText: secret }] } }),
    ],
  ]

  it.each(flows)('google: %s', async (_name, args, respond) => {
    fresh()
    handler = respond
    const flags = args.map((arg) => arg.replace('<mock>', mock.url))
    for (const extra of [[], ['--debug']]) {
      const result = await runCli(['translate', '--service', 'google', '--token', secret, ...flags, ...extra], { cwd: dir })
      expect(result.stdout + result.stderr).not.toContain(secret)
    }
    const viaEnv = await runCli(['translate', '--service', 'google', ...flags], { cwd: dir, env: { I18N_TRANSLATE_TOKEN: secret } })
    expect(viaEnv.stdout + viaEnv.stderr).not.toContain(secret)
  })

  it('sync-remote: a token and a password', async () => {
    fresh()
    write(dir, '.i18n-remote.json', JSON.stringify({ url: mock.url, auth: { username: 'u', password: secret } }))
    handler = (_request, response) => json(response, { error: `bad ${secret}` }, 401)
    const basic = await runCli(['sync-remote', '--debug'], { cwd: dir })
    expect(basic.code).toBe(2)
    expect(basic.stdout + basic.stderr).not.toContain(secret)

    write(dir, '.i18n-remote.json', JSON.stringify({ url: 'not a url' }))
    const bearer = await runCli(['sync-remote', '--debug'], { cwd: dir, env: { I18N_REMOTE_TOKEN: secret } })
    expect(bearer.stdout + bearer.stderr).not.toContain(secret)
  })
})

describe('sync-remote', () => {
  const remote = (extra: Record<string, unknown> = {}) =>
    write(dir, '.i18n-remote.json', JSON.stringify({ url: mock.url, auth: { username: 'u', password: 'p' }, ...extra }))

  it('merges a pull: local-only keys survive, and a locale nobody configured makes no file', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, { de: { remote: { only: 'Neu' } }, fr: { a: 'b' } })
    const result = await runCli(['sync-remote'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stderr).toContain('Skipping remote locale fr')
    const de = readJson(dir, 'locales/de.json')
    expect(de.remote.only).toBe('Neu')
    expect(de.common.save).toBe('Speichern')
    expect(existsSync(join(dir, 'locales/fr.json'))).toBe(false)
  })

  it('says that pages stay out, and sends basic auth', async () => {
    fresh()
    remote()
    const result = await runCli(['sync-remote'], { cwd: dir })
    expect(result.stderr).toContain('page scopes are not exchanged')
    expect(mock.requests[0]!.headers.authorization).toBe(`Basic ${Buffer.from('u:p').toString('base64')}`)
    expect(mock.requests[0]!.url).toBe('/translations')
  })

  it('a conflict is exit 1 and writes nothing; --force takes the remote value and keeps the rest', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, { de: { common: { save: 'Remote' }, fresh: 'Neu' } })
    const before = snapshotFiles(dir)
    const conflict = await runCli(['sync-remote'], { cwd: dir })
    expect(conflict.code).toBe(1)
    expect(conflict.stdout).toContain('de common.save')
    expect(snapshotFiles(dir)).toEqual(before)

    await runCli(['sync-remote', '--force'], { cwd: dir })
    const de = readJson(dir, 'locales/de.json')
    expect(de.common.save).toBe('Remote')
    expect(de.common.extra).toBe('Nur auf Deutsch')
  })

  it('--force never turns a text into an object, or the other way round', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, { de: { common: { save: { nested: 'x' } }, limits: 'flat' } })
    const result = await runCli(['sync-remote', '--force'], { cwd: dir })
    expect(result.code).toBe(1)
    expect(readJson(dir, 'locales/de.json').common.save).toBe('Speichern')
    expect(readJson(dir, 'locales/de.json').limits.max).toBe(20)
  })

  it('--dryRun lists keys, neither writes nor pushes', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, { de: { remote: 'Neu' } })
    const before = snapshotFiles(dir)
    const result = await runCli(['sync-remote', '--push', '--dryRun'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('de remote')
    expect(mock.requests.map((request) => request.method)).toEqual(['GET'])
    expect(snapshotFiles(dir)).toEqual(before)
  })

  it('a push leaves blanks out: they could clear what a translator wrote', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, {})
    await runCli(['sync-remote', '--no-pull', '--push'], { cwd: dir })
    expect(mock.requests.map((request) => request.method)).toEqual(['GET', 'PUT'])
    const sent = JSON.parse(mock.requests[1]!.text)
    expect(sent.de.common).toEqual({ save: 'Speichern', extra: 'Nur auf Deutsch' })
  })

  it('a blank remote value clears nothing', async () => {
    fresh()
    remote()
    handler = (_request, response) => json(response, { de: { common: { save: '' } } })
    await runCli(['sync-remote', '--force'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').common.save).toBe('Speichern')
  })

  it('without credentials there is no Authorization header; I18N_REMOTE_TOKEN is a bearer', async () => {
    fresh()
    write(dir, '.i18n-remote.json', JSON.stringify({ type: 'custom', url: mock.url }))
    await runCli(['sync-remote'], { cwd: dir })
    expect(mock.requests[0]?.headers.authorization).toBeUndefined()
    await runCli(['sync-remote'], { cwd: dir, env: { I18N_REMOTE_TOKEN: 'tk' } })
    expect(mock.requests[1]?.headers.authorization).toBe('Bearer tk')
  })

  it.each(['crowdin', 'tolgee', 'weblate', 'lokalise', 'github', 'gitlab'])('%s is gone, with the way forward', async (type) => {
    fresh()
    write(dir, '.i18n-remote.json', JSON.stringify({ type, url: mock.url }))
    const result = await runCli(['sync-remote'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('was removed')
    expect(result.stderr).toContain('its own CLI')
  })

  it('an unusual answer and a missing file are clear errors', async () => {
    fresh()
    expect((await runCli(['sync-remote'], { cwd: dir })).stderr).toContain('.i18n-remote.json')
    remote()
    handler = (_request, response) => json(response, ['not', 'an', 'object'])
    expect((await runCli(['sync-remote'], { cwd: dir })).code).toBe(2)
  })
})

describe('import / export', () => {
  it('PO round trip keeps text, numbers stay in the JSON; the source is a comment', async () => {
    fresh()
    await runCli(['export', '--force'], { cwd: dir })
    const po = read(dir, 'pots/en.po')
    expect(po).toContain('msgid "home.title"')
    expect(read(dir, 'pots/pages/index/en.po')).toContain('msgid "hero.cta"')
    expect(read(dir, 'pots/de.po')).toContain('#. Fast i18n\nmsgid "home.tagline"\nmsgstr ""')
    write(dir, 'pots/en.po', po.replace('msgstr "Save"', 'msgstr "Store"'))
    await runCli(['import'], { cwd: dir })
    const en = readJson(dir, 'locales/en.json')
    expect(en.common.save).toBe('Store')
    expect(en.limits.max).toBe(10)
  })

  it('CSV has a Source column and an untranslated row; the round trip works', async () => {
    fresh()
    await runCli(['export', '--format', 'csv', '--force'], { cwd: dir })
    const csv = read(dir, 'csv_exports/de.csv')
    expect(csv.split('\n')[0]).toBe('File,Key,Source,Translation')
    expect(csv).toContain('de.json,home.tagline,Fast i18n,\n')
    expect(csv).toContain('de.json,common.save,Save,Speichern\n')
    write(dir, 'csv_exports/de.csv', csv.replace('Speichern', '"Sichern, jetzt"'))
    await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').common.save).toBe('Sichern, jetzt')
    expect(readJson(dir, 'locales/de.json').home.tagline).toBeUndefined()
  })

  it('reads a CSV with a BOM and without the Source column', async () => {
    fresh()
    await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').csv.greeting).toBe('Hallo, CSV')
    write(dir, 'csv_exports/de.csv', '﻿File,Key,Translation\nde.json,bom,ja\n')
    await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').bom).toBe('ja')
  })

  it('a CSV without the columns is refused', async () => {
    fresh()
    write(dir, 'csv_exports/de.csv', 'a,b\n1,2\n')
    const result = await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Malformed header')
  })

  it('--dir, relative to --cwd; --dryRun writes nothing', async () => {
    fresh()
    await runCli(['export', '--format', 'csv', '--cwd', dir, '--dir', 'out'], { cwd: join(dir, '..') })
    expect(existsSync(join(dir, 'out/en.csv'))).toBe(true)
    const before = read(dir, 'locales/de.json')
    const result = await runCli(['import', '--dryRun'], { cwd: dir })
    expect(result.stdout).toContain('would import 2')
    expect(read(dir, 'locales/de.json')).toBe(before)
  })

  it('a CSV path cannot leave the project', async () => {
    fresh()
    write(dir, 'csv_exports/de.csv', 'File,Key,Translation\npages/../../../evil/de.json,a,b\n')
    const result = await runCli(['import', '--format', 'csv'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Unsafe page scope')
  })

  it('a key below a text, or a text over a subtree, is refused: exit 1, nothing destroyed', async () => {
    project({ 'locales/en.json': {}, 'locales/de.json': { a: 'keep', n: { x: 'keep too' }, b: 'old' } })
    write(dir, 'pots/de.po', 'msgid "a.b"\nmsgstr "neu"\n\nmsgid "n"\nmsgstr "flat"\n\nmsgid "b"\nmsgstr "new"\n')
    const po = await runCli(['import'], { cwd: dir })
    expect(po.code).toBe(1)
    expect(po.stdout).toContain('a already holds a value')
    expect(readJson(dir, 'locales/de.json')).toEqual({ a: 'keep', n: { x: 'keep too' }, b: 'new' })

    write(dir, 'csv_exports/de.csv', 'File,Key,Translation\nde.json,a.b,neu\n')
    expect((await runCli(['import', '--format', 'csv'], { cwd: dir })).code).toBe(1)
    expect(readJson(dir, 'locales/de.json').a).toBe('keep')
  })

  it('PO: empty entries are ignored, plural forms join, fuzzy entries are skipped with a warning', async () => {
    fresh()
    write(
      dir,
      'pots/de.po',
      'msgid "common.save"\nmsgstr ""\n\nmsgid "one"\nmsgid_plural "many"\nmsgstr[0] "ein"\nmsgstr[1] "viele"\n\n#, fuzzy\nmsgid "guess"\nmsgstr "vielleicht"\n\nmsgid "next"\nmsgstr "weiter"\n',
    )
    const result = await runCli(['import'], { cwd: dir })
    expect(result.stderr).toContain('fuzzy entries')
    const de = readJson(dir, 'locales/de.json')
    expect(de.common.save).toBe('Speichern')
    expect(de.one).toBe('ein|viele')
    expect(de.guess).toBeUndefined()
    expect(de.next).toBe('weiter')
  })

  it('no input files is exit 2', async () => {
    project({})
    expect((await runCli(['import'], { cwd: dir })).code).toBe(2)
    expect((await runCli(['import', '--format', 'csv'], { cwd: dir })).code).toBe(2)
  })
})

describe('stats', () => {
  it('counts completion; extra keys do not inflate it', async () => {
    project({ 'locales/en.json': { a: 'x', b: 'y' }, 'locales/de.json': { a: 'y', extra: 'z', more: 'w' } })
    const report = JSON.parse((await runCli(['stats', '--json'], { cwd: dir })).stdout)
    expect(report.locales.find((locale: { code: string }) => locale.code === 'de')).toEqual({
      code: 'de',
      totalKeys: 2,
      translatedKeys: 1,
      completion: 50,
    })
    expect((await runCli(['stats'], { cwd: dir })).stdout).toContain('de: 1/2 (50.00%)')
  })

  it('--full is gone', async () => {
    expect((await runCli(['stats', '--full'], { cwd: fresh() })).code).toBe(2)
  })

  it('--html writes a report', async () => {
    fresh()
    const result = await runCli(['stats', '--html', 'report/i18n.html'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(read(dir, 'report/i18n.html')).toContain('<td>en</td>')
  })

  it('--baseRef compares with git history; layers do not count as a change; a bad ref fails', async () => {
    fresh()
    write(dir, 'nuxt.config.ts', read(dir, 'nuxt.config.ts').replace('modules:', `extends: ['./base'],\n  modules:`))
    write(dir, 'base/nuxt.config.ts', 'export default {}\n')
    write(dir, 'base/locales/en.json', '{"layer":{"a":"x","b":"y"}}\n')
    const git = (...args: string[]) => execFileSync('git', ['-c', 'user.email=t@e.x', '-c', 'user.name=t', ...args], { cwd: dir, stdio: 'ignore' })
    git('init', '-q')
    git('add', '.')
    git('commit', '-qm', 'base')

    const unchanged = JSON.parse((await runCli(['stats', '--baseRef', 'HEAD', '--json'], { cwd: dir })).stdout)
    expect(unchanged.diff.locales.map((locale: { totalKeysDelta: number }) => locale.totalKeysDelta)).toEqual([0, 0, 0])

    write(dir, 'locales/de.json', JSON.stringify({ ...readJson(dir, 'locales/de.json'), greeting: { hello: 'Hallo' } }))
    const { stdout } = await runCli(['stats', '--baseRef', 'HEAD', '--json'], { cwd: dir })
    const delta = JSON.parse(stdout).diff.locales.find((locale: { code: string }) => locale.code === 'de').completionDelta
    expect(delta).toBeGreaterThan(0)

    const bad = await runCli(['stats', '--baseRef', 'no-such-ref'], { cwd: dir })
    expect(bad.code).toBe(2)
    expect(bad.stderr).toContain('Unknown git ref')
  })
})

describe('lint', () => {
  it('ordinary UI text passes the default rules', async () => {
    project({
      'locales/en.json': {
        save: 'Save',
        greet: 'Hello {name}',
        price: 'Price: 5 €',
        rich: 'Read <b>this</b>',
        brand: 'iPhone is here',
        many: 'one item|{count} items',
      },
    })
    const result = await runCli(['lint'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain(`Active rules: ${LINT_RULES.map((rule) => rule.name).join(', ')}`)
  })

  it('--fix touches spaces only, atomically, with no .bak left', async () => {
    project({ 'locales/en.json': { a: 'Trailing ', b: 'Two  spaces', c: 'Save', 'd.e': 'Dotted ' } })
    const result = await runCli(['lint', '--fix'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(readJson(dir, 'locales/en.json')).toEqual({ a: 'Trailing', b: 'Two spaces', c: 'Save', 'd.e': 'Dotted' })
    expect(readdirSync(join(dir, 'locales'))).toEqual(['en.json'])
  })

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
  })

  it('--fix fails when issues remain', async () => {
    project({ 'locales/en.json': { a: '' } })
    expect((await runCli(['lint', '--rules', 'no-empty-translation', '--fix'], { cwd: dir })).code).toBe(1)
  })

  it('an unknown rule is exit 2; a layer is not linted', async () => {
    fresh()
    const result = await runCli(['lint', '--rules', 'no-html-tags'], { cwd: dir })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Unknown lint rules: no-html-tags')

    project(
      { 'locales/en.json': { a: 'x' }, 'base/nuxt.config.ts': 'export default {}\n', 'base/locales/en.json': { b: 'layer ' } },
      undefined,
      `extends: ['./base'],`,
    )
    expect((await runCli(['lint'], { cwd: dir })).code).toBe(0)
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

  it('code is reported, never rewritten', async () => {
    project({
      'components/data.ts': `export function f(s: string) {\n  switch (s) { case 'Pending': return 1 }\n  throw new Error('Something went wrong')\n}\n`,
      'pages/x.tsx': `export default () => <div>Hello there</div>\n`,
      'pages/i.vue': `<script setup>\nconst title = 'Script title'\n</script>\n<template><p>{{ title }}</p></template>\n`,
    })
    const before = { data: read(dir, 'components/data.ts'), tsx: read(dir, 'pages/x.tsx'), vue: read(dir, 'pages/i.vue') }
    const result = await runCli(['text-to-i18n'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('components/data.ts:3 Something went wrong')
    expect(result.stdout).toContain('pages/x.tsx:1 Hello there')
    expect({ data: read(dir, 'components/data.ts'), tsx: read(dir, 'pages/x.tsx'), vue: read(dir, 'pages/i.vue') }).toEqual(before)
  })

  it('decodes entities and collapses whitespace in values', async () => {
    project({ 'pages/a.vue': '<template><p>Tom &amp; Jerry\n   &copy; 2024</p><input placeholder="Q &amp; A"></template>\n' })
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(Object.values(readJson(dir, 'locales/en.json').pages.a)).toEqual(['Tom & Jerry © 2024', 'Q & A'])
  })

  it('mixed content stays whole and is reported', async () => {
    project({ 'pages/a.vue': '<template><p>Hello <b>world</b> today</p><p>{{ n }} left</p><p><b>Bold alone</b></p></template>\n' })
    const result = await runCli(['text-to-i18n'], { cwd: dir })
    expect(result.stdout).toContain('Mixed text')
    expect(read(dir, 'pages/a.vue')).toContain('<p>Hello <b>world</b> today</p>')
    expect(read(dir, 'pages/a.vue')).toContain('{{ n }} left')
    expect(read(dir, 'pages/a.vue')).toContain(`<b>{{ $t('pages.a.bold-alone') }}</b>`)
  })

  it('v-pre and <i18n-t> stay', async () => {
    project({ 'pages/a.vue': '<template><p v-pre>Raw text here</p><i18n-t keypath="k">Slot text</i18n-t></template>\n' })
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(read(dir, 'pages/a.vue')).toContain('<p v-pre>Raw text here</p>')
    expect(read(dir, 'pages/a.vue')).toContain('Slot text</i18n-t>')
  })

  it('a generated key never replaces a value, and the file keeps its indentation', async () => {
    project({ 'locales/en.json': '{\n    "pages": "A text"\n}\n', 'pages/a.vue': '<template><p>New words</p></template>\n' })
    const result = await runCli(['text-to-i18n'], { cwd: dir })
    expect(result.stdout).toContain('would overwrite')
    expect(readJson(dir, 'locales/en.json')).toEqual({ pages: 'A text' })
    expect(read(dir, 'pages/a.vue')).toContain('<p>New words</p>')

    write(dir, 'pages/a.vue', '<template><p>New words</p></template>\n')
    write(dir, 'locales/en.json', '{\n    "kept": "A text"\n}\n')
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(read(dir, 'locales/en.json')).toContain('\n    "kept"')
  })

  it('a missing --path fails', async () => {
    const result = await runCli(['text-to-i18n', '--path', 'nope'], { cwd: fresh() })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Path does not exist')
  })

  it('known text is still rewritten', async () => {
    fresh()
    write(dir, 'pages/k.vue', '<template><p>Fast i18n</p></template>\n')
    await runCli(['text-to-i18n'], { cwd: dir })
    expect(read(dir, 'pages/k.vue')).toContain(`$t('home.tagline')`)
  })

  it('--interactive: a skip covers repeats, closed stdin changes nothing', async () => {
    fresh()
    write(dir, 'pages/one.vue', '<template><p>Hello there</p><b>Hello there</b></template>\n')
    const before = read(dir, 'locales/en.json')
    const closed = await runCli(['text-to-i18n', '--path', 'pages/one.vue', '--interactive'], { cwd: dir })
    expect(closed.code).toBe(2)
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
    expect(result.code).toBe(2)
    expect(read(dir, 'pages/one.vue')).toContain('<p>Some words</p>')
  })
})

describe('rename', () => {
  const sfc = `<script setup>
const { t: tr, $t: tq } = useI18n()
const a = tr('old.key')
const b = tq('old.key')
// t('old.key') in a comment
const msg = "call t('old.key') here"
</script>
<template><p>{{ $t('old.key') }}</p><i18n-t :keypath="'old.key'" /><i18n-t keypath="old.key" /></template>
`

  it('moves the key in locales and through every alias, nothing else', async () => {
    project({ 'locales/en.json': { old: { key: 'X', sib: 'Y' } }, 'locales/de.json': { old: { key: 'Z' } }, 'pages/r.vue': sfc })
    const result = await runCli(['rename', '--from', 'old.key', '--to', 'new.key'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Locales: 2, source files: 1, source replacements: 5')
    expect(readJson(dir, 'locales/en.json')).toEqual({ old: { sib: 'Y' }, new: { key: 'X' } })
    expect(readJson(dir, 'locales/de.json')).toEqual({ new: { key: 'Z' } })
    expect(read(dir, 'pages/r.vue')).toBe(
      sfc
        .replace(`tr('old.key')`, `tr('new.key')`)
        .replace(`tq('old.key')`, `tq('new.key')`)
        .replace(`$t('old.key')`, `$t('new.key')`)
        .replace(`:keypath="'old.key'"`, `:keypath="'new.key'"`)
        .replace(`keypath="old.key"`, `keypath="new.key"`),
    )
  })

  it('a namespace moves whole', async () => {
    project({
      'locales/en.json': { ns: { a: 'A', b: { c: 'C' } }, other: 'O' },
      'pages/r.vue': `<template>{{ $t('ns.a') }}{{ $t('ns.b.c') }}</template>`,
    })
    await runCli(['rename', '--from', 'ns', '--to', 'moved'], { cwd: dir })
    expect(readJson(dir, 'locales/en.json')).toEqual({ other: 'O', moved: { a: 'A', b: { c: 'C' } } })
    expect(read(dir, 'pages/r.vue')).toBe(`<template>{{ $t('moved.a') }}{{ $t('moved.b.c') }}</template>`)
  })

  it('warns about what it cannot rewrite', async () => {
    project({
      'locales/en.json': { ns: { a: 'A' } },
      'pages/r.vue': '<template>{{ $t(`ns.${x}`) }}</template>\n',
      'components/c.ts': `export const name = 'ns.a'\n`,
      'pages/p.vue': `<template lang="pug">\np {{ $t('ns.a') }}\n</template>\n`,
    })
    const result = await runCli(['rename', '--from', 'ns', '--to', 'moved', '--dryRun'], { cwd: dir })
    expect(result.stderr).toContain('Computed key may need the new name')
    expect(result.stderr).toContain('Not rewritten, change by hand')
    expect(result.stderr).toMatch(/plain string|Not rewritten/)
  })

  it('--dryRun changes nothing', async () => {
    fresh()
    const before = snapshotFiles(dir)
    const result = await runCli(['rename', '--from', 'common.save', '--to', 'actions.save', '--dryRun'], { cwd: dir })
    expect(result.code).toBe(0)
    expect(snapshotFiles(dir)).toEqual(before)
  })

  it('refuses an existing target, a text in the way and a subtree in the way', async () => {
    fresh()
    const before = snapshotFiles(dir)
    const taken = await runCli(['rename', '--from', 'common.save', '--to', 'common.cancel'], { cwd: dir })
    expect(taken.code).toBe(2)
    expect(taken.stderr).toContain('Target key already exists')
    expect((await runCli(['rename', '--from', 'spaced', '--to', 'common'], { cwd: dir })).code).toBe(2)
    expect((await runCli(['rename', '--from', 'common.save', '--to', 'spaced.x'], { cwd: dir })).code).toBe(2)
    expect(snapshotFiles(dir)).toEqual(before)
  })

  it('a key nobody has is exit 2', async () => {
    const result = await runCli(['rename', '--from', 'no.such', '--to', 'x'], { cwd: fresh() })
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('Key not found')
  })

  it('a key defined in a layer is said to stay there', async () => {
    project(
      { 'locales/en.json': { a: 'x' }, 'base/nuxt.config.ts': 'export default {}\n', 'base/locales/en.json': { l: 'layer' } },
      undefined,
      `extends: ['./base'],`,
    )
    const result = await runCli(['rename', '--from', 'l', '--to', 'n'], { cwd: dir })
    expect(result.stderr).toContain('also defined in a layer')
    expect(read(dir, 'base/locales/en.json')).toContain('"l"')
  })

  it('rewrites a key inside <i18n-group> when the target stays under its prefix', async () => {
    project({
      'locales/en.json': { ns: { a: 'A' }, b: 'B' },
      'pages/r.vue': `<template><i18n-group prefix="ns" #default="{ t }">{{ t('a') }}</i18n-group></template>`,
    })
    await runCli(['rename', '--from', 'ns.a', '--to', 'ns.z'], { cwd: dir })
    expect(read(dir, 'pages/r.vue')).toContain(`t('z')`)
    const away = await runCli(['rename', '--from', 'ns.z', '--to', 'other.z'], { cwd: dir })
    expect(away.stderr).toContain('Not rewritten')
    expect(read(dir, 'pages/r.vue')).toContain(`t('z')`)
  })
})

describe('pseudo', () => {
  it('fails for an unconfigured locale and keeps placeholders', async () => {
    fresh()
    expect((await runCli(['pseudo', '--targetLocale', 'xx'], { cwd: dir })).stderr).toContain('not found')
    await runCli(['pseudo', '--targetLocale', 'de', '--replace'], { cwd: dir })
    expect(readJson(dir, 'locales/de.json').home.title).toBe('[WWeellccoommee {name}]')
  })
})

describe('search', () => {
  it('--limit, --scope, --onlyUnused', async () => {
    fresh()
    const limited = JSON.parse((await runCli(['search', 'e', '--json', '--limit', '1'], { cwd: dir })).stdout)
    expect(limited.matches).toHaveLength(1)
    expect(limited.totalMatches).toBeGreaterThan(1)
    const pages = JSON.parse((await runCli(['search', 'Read more', '--json', '--scope', 'global'], { cwd: dir })).stdout)
    expect(pages.matches).toEqual([])
    const unused = JSON.parse((await runCli(['search', 'Unused', '--json', '--onlyUnused'], { cwd: dir })).stdout)
    expect(unused.matches[0].isUsed).toBe(false)
  })

  it('agrees with clean on what is unused, and lists usages', async () => {
    project({
      'locales/en.json': { dyn: { foo: 'x' }, dead: 'd', live: 'l' },
      'pages/i.vue': "<template>{{ $t(`dyn.${x}`) }}\n{{ $t('live') }}</template>",
    })
    const unused = JSON.parse((await runCli(['search', '--onlyUnused', '--json'], { cwd: dir })).stdout)
    expect(unused.matches.map((match: { key: string }) => match.key)).toEqual(['dead'])
    expect((await runCli(['clean', '--dryRun'], { cwd: dir })).stdout).toContain('en dead')
    const live = JSON.parse((await runCli(['search', 'live', '--json'], { cwd: dir })).stdout)
    expect(live.matches[0].usages).toEqual(['pages/i.vue:2'])
  })

  it('an empty query is exit 2, text output names the key', async () => {
    fresh()
    expect((await runCli(['search'], { cwd: dir })).code).toBe(2)
    expect((await runCli(['search', 'Unused value'], { cwd: dir })).stdout).toContain('common.unused')
    expect((await runCli(['search', 'nothing-like-this'], { cwd: dir })).stdout).toContain('No matches')
  })
})
