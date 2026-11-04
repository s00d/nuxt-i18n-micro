import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { afterAll, describe, expect, it } from 'vitest'

const moduleEntry = fileURLToPath(new URL('../src/module.ts', import.meta.url))
// inside the repo: Nuxt is resolved from the app's directory
const rootDir = mkdtempSync(fileURLToPath(new URL('./.additional-dirs-', import.meta.url)))
const vendor = join(rootDir, 'vendor-locales')
mkdirSync(join(rootDir, 'locales'), { recursive: true })
mkdirSync(vendor, { recursive: true })
writeFileSync(join(rootDir, 'locales', 'en.json'), JSON.stringify({ hello: 'Hello' }))
writeFileSync(join(vendor, 'en.json'), JSON.stringify({ fromVendor: 'Vendor' }))

/** A module listed after i18n that adds its own folder, as a module author would. */
const vendorModule = (_options: unknown, nuxt: Nuxt) => {
  const i18n = ((nuxt.options as { i18n?: { additionalTranslationDirs?: string[] } }).i18n ??= {})
  ;(i18n.additionalTranslationDirs ??= []).push(vendor)
}

/** The generated templates of an app, without building it. */
async function templates(modules: never[]): Promise<{ strategy: string; config: string }> {
  const nuxt = await loadNuxt({
    cwd: rootDir,
    ready: true,
    overrides: { modules, pages: false, i18n: { locales: [{ code: 'en' }] } as never },
  })
  try {
    const read = async (name: string) =>
      String(await nuxt.options.build.templates.find((entry) => entry.filename === name)!.getContents!({ nuxt, app: {} as never, options: {} }))
    return { strategy: await read('i18n.strategy.mjs'), config: await read('i18n.config.mjs') }
  } finally {
    await nuxt.close()
  }
}

const dateBuild = (source: string) => /"dateBuild":"([^"]*)"/.exec(source)?.[1]

describe('additionalTranslationDirs from a module listed after i18n', () => {
  afterAll(() => rmSync(rootDir, { recursive: true, force: true }))

  it('reaches the servers and the payload fingerprint, wherever the module is listed', async () => {
    const alone = await templates([moduleEntry as never])
    const after = await templates([moduleEntry as never, vendorModule as never])
    const before = await templates([vendorModule as never, moduleEntry as never])
    expect(alone.config).not.toContain(vendor)
    expect(after.config).toContain(JSON.stringify(vendor).slice(1, -1))
    // the folder's files are in the `?v=`: an edit there moves it, as an edit of `locales/` does
    expect(dateBuild(after.strategy)).not.toBe(dateBuild(alone.strategy))
    expect(dateBuild(after.strategy)).toBe(dateBuild(before.strategy))
    // a fingerprint, not a timestamp, whatever adds the folder
    expect(dateBuild(alone.strategy)).toMatch(/^[0-9a-f]{16}$/)
    expect(dateBuild(after.strategy)).toMatch(/^[0-9a-f]{16}$/)
  })
})
