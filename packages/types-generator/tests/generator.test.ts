import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { formatKeyProperty, generateTypes, getTypesString } from '../src/core/generator'

const require = createRequire(import.meta.url)
const ts = require('typescript') as typeof import('typescript')

function assertValidDts(content: string) {
  const stripped = content.replace('// @ts-nocheck\n', '')
  const sf = ts.createSourceFile('i18n-micro.d.ts', stripped, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const errors = (sf.parseDiagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
  expect(errors).toEqual([])
}

describe('generateTypes', () => {
  let testDir: string
  let localesDir: string

  beforeEach(() => {
    testDir = join(tmpdir(), `i18n-types-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    localesDir = join(testDir, 'locales')
    mkdirSync(localesDir, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  test('should generate types from simple JSON file', async () => {
    const enFile = join(localesDir, 'en.json')
    writeFileSync(
      enFile,
      JSON.stringify({
        greeting: 'Hello',
        welcome: 'Welcome',
      }),
    )

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    expect(existsSync(outputFile)).toBe(true)
    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('"greeting": string;')
    expect(content).toContain('"welcome": string;')
    expect(content).toContain("declare module '@i18n-micro/types'")
    expect(content).toContain('export interface DefineLocaleMessage')
    assertValidDts(content)
  })

  test('escapes quotes in keys so the .d.ts stays valid TypeScript', async () => {
    writeFileSync(
      join(localesDir, 'en.json'),
      JSON.stringify({
        "user's name": 'Name',
        'say "hi"': 'Hi',
      }),
    )

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('"user\'s name": string;')
    expect(content).toContain('"say \\"hi\\"": string;')
    expect(content).not.toMatch(/'user's name'/)
    assertValidDts(content)
  })

  test('kitchen-sink keys and value shapes produce valid .d.ts', async () => {
    // Raw JSON so __proto__ is a real own property (object literals treat it specially).
    writeFileSync(
      join(localesDir, 'en.json'),
      `{
        "welcome": "Welcome",
        "items": "one|{count} items",
        "list": ["a", "b"],
        "count": 42,
        "enabled": true,
        "empty": null,
        "blank": "",
        "emptyObj": {},
        "user's name": "x",
        "say \\"hi\\"": "x",
        "path\\\\to\\\\file": "x",
        "line1\\nline2": "x",
        "with\\ttab": "x",
        "👋 hello": "x",
        "ключ": "значение",
        "404": "Not found",
        "2fa.code": "x",
        " ": "space",
        "": "empty-key",
        "$t": "x",
        "@home": "x",
        "#hash": "x",
        "a\`b": "x",
        "a\${b}": "x",
        "<b>html</b>": "x",
        "constructor": "x",
        "__proto__": "x",
        "toString": "x",
        "with/slash": "x",
        "with:colon": "x",
        "with|pipe": "x",
        "u2028\\u2028x": "x",
        "u2029\\u2029x": "x",
        "nullbyte\\u0000x": "x",
        "header": { "title": "T", "nested": { "deep": "D" } },
        "nestedSpecial": { "child's": "x", "say \\"nested\\"": "x" },
        "a.b": "flat",
        "a": { "b": "nested", "c": "extra" },
        "🏳️‍🌈": "flag",
        "مرحبا": "hi"
      }`,
    )
    mkdirSync(join(localesDir, 'pages', 'about'), { recursive: true })
    writeFileSync(join(localesDir, 'pages', 'about', 'en.json'), JSON.stringify({ 'about.hero': 'Hero', "page's title": 'About' }))
    writeFileSync(join(localesDir, 'de.json'), JSON.stringify({ onlyDe: 'x', "deutsch's": 'x' }))

    const content = await getTypesString({ srcDir: testDir, translationDir: 'locales' })
    assertValidDts(content)

    expect(content).toContain('"__proto__": string;')
    expect(content).toContain('"user\'s name": string;')
    expect(content).toContain('"header.nested.deep": string;')
    expect(content).toContain('"about.hero": string;')
    expect(content).toContain('"onlyDe": string;')
    expect(content).toContain('"a.b": string;')
    expect(content).toContain('"a.c": string;')
    expect(content).toContain('"list": string;')
    expect(content).toContain('"count": string;')
    expect(content).toContain('"nullbyte\\u0000x": string;')
    // U+2028 / U+2029 escaped for safer JS embedding
    expect(content).toMatch(/"u2028\\u2028x": string;/)
    expect(content).toMatch(/"u2029\\u2029x": string;/)
    expect(content).not.toContain('"0": string;')
  })

  test('skips non-object JSON roots instead of emitting index keys', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    writeFileSync(join(localesDir, 'string.json'), '"hello"')
    writeFileSync(join(localesDir, 'array.json'), '["a","b"]')
    writeFileSync(join(localesDir, 'number.json'), '42')
    writeFileSync(join(localesDir, 'null.json'), 'null')
    writeFileSync(join(localesDir, 'ok.json'), JSON.stringify({ real: 'key' }))

    const content = await getTypesString({ srcDir: testDir, translationDir: 'locales' })
    expect(content).toContain('"real": string;')
    expect(content).not.toContain('"0": string;')
    expect(content).not.toContain('"1": string;')
    expect(warnSpy.mock.calls.some((c) => String(c[0]).includes('root value must be a plain JSON object'))).toBe(true)
    assertValidDts(content)
    warnSpy.mockRestore()
  })

  test('parses JSON files that start with a UTF-8 BOM', async () => {
    writeFileSync(join(localesDir, 'en.json'), `\uFEFF${JSON.stringify({ bomKey: 'ok' })}`)
    const content = await getTypesString({ srcDir: testDir, translationDir: 'locales' })
    expect(content).toContain('"bomKey": string;')
    assertValidDts(content)
  })

  test('should generate types from nested JSON file', async () => {
    const enFile = join(localesDir, 'en.json')
    writeFileSync(
      enFile,
      JSON.stringify({
        header: {
          title: 'Title',
          subtitle: 'Subtitle',
        },
        footer: {
          copyright: 'Copyright',
        },
      }),
    )

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('"header.title": string;')
    expect(content).toContain('"header.subtitle": string;')
    expect(content).toContain('"footer.copyright": string;')
  })

  test('should merge keys from multiple locale files', async () => {
    writeFileSync(
      join(localesDir, 'en.json'),
      JSON.stringify({
        greeting: 'Hello',
        welcome: 'Welcome',
      }),
    )
    writeFileSync(
      join(localesDir, 'fr.json'),
      JSON.stringify({
        greeting: 'Bonjour',
        goodbye: 'Au revoir',
      }),
    )

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('"greeting": string;')
    expect(content).toContain('"welcome": string;')
    expect(content).toContain('"goodbye": string;')
  })

  test('should handle pages directory', async () => {
    const pagesDir = join(localesDir, 'pages')
    const homeDir = join(pagesDir, 'home')
    mkdirSync(homeDir, { recursive: true })

    writeFileSync(
      join(localesDir, 'en.json'),
      JSON.stringify({
        global: 'Global',
      }),
    )
    writeFileSync(
      join(homeDir, 'en.json'),
      JSON.stringify({
        title: 'Home',
        description: 'Home page',
      }),
    )

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('"global": string;')
    expect(content).toContain('"title": string;')
    expect(content).toContain('"description": string;')
  })

  test('should handle invalid JSON gracefully', async () => {
    const enFile = join(localesDir, 'en.json')
    writeFileSync(enFile, 'invalid json')

    const outputFile = join(testDir, 'i18n-types.d.ts')

    // Suppress expected warning for invalid JSON
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Should not throw
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    // File should still be created (with empty interface)
    expect(existsSync(outputFile)).toBe(true)

    // Restore console.warn
    warnSpy.mockRestore()
  })

  test('should create output directory if it does not exist', async () => {
    const outputDir = join(testDir, 'generated', 'types')
    const outputFile = join(outputDir, 'i18n-types.d.ts')

    writeFileSync(
      join(localesDir, 'en.json'),
      JSON.stringify({
        greeting: 'Hello',
      }),
    )

    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    expect(existsSync(outputFile)).toBe(true)
  })
})

describe('formatKeyProperty', () => {
  test('escapes line/paragraph separators', () => {
    expect(formatKeyProperty('a\u2028b')).toBe('"a\\u2028b"')
    expect(formatKeyProperty('a\u2029b')).toBe('"a\\u2029b"')
  })
})
