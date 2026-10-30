import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { collectTranslationPaths } from '@i18n-micro/core'
import { createServer } from 'vite'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { getTypesString, I18nTypesPlugin } from '../src'

const kit = vi.hoisted(() => ({ templates: [] as Array<{ filename: string; getContents: () => string }> }))
vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (definition: unknown) => definition,
  addTypeTemplate: (template: { filename: string; getContents: () => string }) => kit.templates.push(template),
}))

let root: string
const write = (file: string, data: unknown) => {
  const full = join(root, file)
  mkdirSync(join(full, '..'), { recursive: true })
  writeFileSync(full, typeof data === 'string' ? data : JSON.stringify(data))
}
const keysOf = (dts: string) => [...dts.matchAll(/^ {4}"(.+)": /gm)].map((match) => match[1])

beforeEach(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), 'i18n-types-')))
  kit.templates.length = 0
})
afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  vi.restoreAllMocks()
})

test('the generated keys are the paths core reads', () => {
  const dictionary = { a: { b: 'x', c: { d: 1 } }, list: ['y'], 'flat.key': 'z', nil: null, empty: {} }
  write('locales/en.json', dictionary)
  const paths = new Set<string>()
  collectTranslationPaths(dictionary, paths)
  expect(keysOf(getTypesString({ srcDir: root, translationDir: 'locales' }))).toEqual([...paths].sort())
})

test('value types follow the JSON, across locales', () => {
  write('locales/en.json', { n: 1, mixed: 'x' })
  write('locales/de.json', { mixed: 2 })
  const dts = getTypesString({ srcDir: root, translationDir: 'locales' })
  expect(dts).toContain('"n": number;')
  expect(dts).toContain('"mixed": number | string;')
})

test('several folders', () => {
  write('a/en.json', { one: 'x' })
  write('b/en.json', { two: 'x' })
  expect(keysOf(getTypesString({ srcDir: root, translationDir: ['a', join(root, 'b')] }))).toEqual(['one', 'two'])
})

describe('Vite plugin', () => {
  test('two instances each regenerate and neither leaks a watcher', async () => {
    write('locales/en.json', { one: 'x' })
    const plugin = (outputFile: string) => I18nTypesPlugin({ srcDir: root, translationDir: 'locales', outputFile })
    const server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      server: { middlewareMode: true, watch: { usePolling: true, interval: 20 } },
      plugins: [plugin('a.d.ts'), plugin('b.d.ts')],
    })
    await server.pluginContainer.buildStart({})
    expect(keysOf(readFileSync(join(root, 'a.d.ts'), 'utf8'))).toEqual(['one'])

    // written until seen: a write before the watcher's first scan is no change to it
    await vi.waitFor(
      () => {
        write('locales/en.json', { two: 'x' })
        expect(keysOf(readFileSync(join(root, 'a.d.ts'), 'utf8'))).toEqual(['two'])
        expect(keysOf(readFileSync(join(root, 'b.d.ts'), 'utf8'))).toEqual(['two'])
      },
      { timeout: 8000, interval: 500 },
    )
    await server.close()
  }, 15_000)

  test('a broken generation warns and does not stop the build', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const plugin = I18nTypesPlugin({ srcDir: join(root, 'en.json', 'x'), translationDir: 'locales', outputFile: join(root, 'x\0y') })
    ;(plugin.buildStart as () => void)()
    expect(warn).toHaveBeenCalledWith('[i18n-types] Failed to generate types:', expect.anything())
    expect(existsSync(join(root, 'i18n-micro.d.ts'))).toBe(false)
  })
})

describe('Nuxt module', () => {
  const nuxtWith = (options: Record<string, unknown>, modules: unknown[] = []) => ({
    options: { rootDir: root, srcDir: root, modules, typescript: {}, _layers: [{ config: { rootDir: root } }], ...options },
    hook: vi.fn(),
    callHook: vi.fn(),
  })
  const run = async (nuxt: ReturnType<typeof nuxtWith>, own: Record<string, unknown> = {}) => {
    const { default: module } = await import('../src/nuxt')
    ;(module as unknown as { setup(options: unknown, nuxt: unknown): void }).setup(own, nuxt)
    return keysOf(kit.templates[0]!.getContents())
  }

  test('reads i18n.translationDir', async () => {
    write('lang/en.json', { key: 'x' })
    expect(await run(nuxtWith({ i18n: { translationDir: 'lang' } }))).toEqual(['key'])
  })

  test('reads options passed inline to the module', async () => {
    write('lang/en.json', { key: 'x' })
    expect(await run(nuxtWith({}, [['nuxt-i18n-micro', { translationDir: 'lang' }]]))).toEqual(['key'])
  })

  test('its own option wins, the default is `locales`', async () => {
    write('own/en.json', { own: 'x' })
    write('locales/en.json', { fallback: 'x' })
    expect(await run(nuxtWith({ i18n: { translationDir: 'lang' } }), { translationDir: 'own' })).toEqual(['own'])
    kit.templates.length = 0
    expect(await run(nuxtWith({}))).toEqual(['fallback'])
  })

  test('layers and additional dirs count', async () => {
    write('layer/locales/en.json', { fromLayer: 'x' })
    write('locales/en.json', { fromApp: 'x' })
    write('extra/en.json', { fromExtra: 'x' })
    const layers = [{ config: { rootDir: root } }, { config: { rootDir: join(root, 'layer') } }]
    expect(await run(nuxtWith({ _layers: layers, i18n: { additionalTranslationDirs: ['extra'] } }))).toEqual(['fromApp', 'fromExtra', 'fromLayer'])
  })

  test('a change under a translation folder regenerates, any other file does not', async () => {
    write('lang/en.json', { key: 'x' })
    const nuxt = nuxtWith({ i18n: { translationDir: 'lang' } })
    await run(nuxt)
    const watch = nuxt.hook.mock.calls[0]![1] as (event: string, path: string) => Promise<void>
    await watch('change', join(root, 'pages/a.vue'))
    await watch('change', join(root, 'other/en.json'))
    expect(nuxt.callHook).not.toHaveBeenCalled()
    await watch('change', join(root, 'lang/en.json'))
    expect(nuxt.callHook).toHaveBeenCalledWith('builder:generateApp')
  })
})
