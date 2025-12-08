import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { generateTypes } from '../src/core/generator'
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('generateTypes', () => {
  let testDir: string
  let localesDir: string

  beforeEach(() => {
    testDir = join(tmpdir(), `i18n-types-test-${Date.now()}`)
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
    writeFileSync(enFile, JSON.stringify({
      greeting: 'Hello',
      welcome: 'Welcome',
    }))

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    expect(existsSync(outputFile)).toBe(true)
    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('\'greeting\': string;')
    expect(content).toContain('\'welcome\': string;')
    expect(content).toContain('declare module \'@i18n-micro/types\'')
    expect(content).toContain('export interface DefineLocaleMessage')
  })

  test('should generate types from nested JSON file', async () => {
    const enFile = join(localesDir, 'en.json')
    writeFileSync(enFile, JSON.stringify({
      header: {
        title: 'Title',
        subtitle: 'Subtitle',
      },
      footer: {
        copyright: 'Copyright',
      },
    }))

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('\'header.title\': string;')
    expect(content).toContain('\'header.subtitle\': string;')
    expect(content).toContain('\'footer.copyright\': string;')
  })

  test('should merge keys from multiple locale files', async () => {
    writeFileSync(join(localesDir, 'en.json'), JSON.stringify({
      greeting: 'Hello',
      welcome: 'Welcome',
    }))
    writeFileSync(join(localesDir, 'fr.json'), JSON.stringify({
      greeting: 'Bonjour',
      goodbye: 'Au revoir',
    }))

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('\'greeting\': string;')
    expect(content).toContain('\'welcome\': string;')
    expect(content).toContain('\'goodbye\': string;')
  })

  test('should handle pages directory', async () => {
    const pagesDir = join(localesDir, 'pages')
    const homeDir = join(pagesDir, 'home')
    mkdirSync(homeDir, { recursive: true })

    writeFileSync(join(localesDir, 'en.json'), JSON.stringify({
      global: 'Global',
    }))
    writeFileSync(join(homeDir, 'en.json'), JSON.stringify({
      title: 'Home',
      description: 'Home page',
    }))

    const outputFile = join(testDir, 'i18n-types.d.ts')
    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    const content = readFileSync(outputFile, 'utf-8')
    expect(content).toContain('\'global\': string;')
    expect(content).toContain('\'title\': string;')
    expect(content).toContain('\'description\': string;')
  })

  test('should handle invalid JSON gracefully', async () => {
    const enFile = join(localesDir, 'en.json')
    writeFileSync(enFile, 'invalid json')

    const outputFile = join(testDir, 'i18n-types.d.ts')

    // Suppress expected warning for invalid JSON
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

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

    writeFileSync(join(localesDir, 'en.json'), JSON.stringify({
      greeting: 'Hello',
    }))

    await generateTypes({
      srcDir: testDir,
      translationDir: 'locales',
      outputFile,
    })

    expect(existsSync(outputFile)).toBe(true)
  })
})
