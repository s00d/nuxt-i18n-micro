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

  test('a broken locale file warns and is skipped: the other files still produce types', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    writeFileSync(join(localesDir, 'en.json'), 'invalid json')
    writeFileSync(join(localesDir, 'de.json'), JSON.stringify({ real: 'key' }))
    const outputFile = join(testDir, 'i18n-types.d.ts')

    await generateTypes({ srcDir: testDir, translationDir: 'locales', outputFile })

    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('"real": string;')
    assertValidDts(content)
    expect(warnSpy.mock.calls.some((c) => String(c[0]).includes('Failed to parse') && String(c[0]).includes('en.json'))).toBe(true)
    warnSpy.mockRestore()
  })

  test('parses JSON files that start with a UTF-8 BOM', async () => {
    writeFileSync(join(localesDir, 'en.json'), `\uFEFF${JSON.stringify({ bomKey: 'ok' })}`)
    const content = await getTypesString({ srcDir: testDir, translationDir: 'locales' })
    expect(content).toContain('"bomKey": string;')
    assertValidDts(content)
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
