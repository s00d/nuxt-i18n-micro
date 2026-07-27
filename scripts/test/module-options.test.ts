import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { readModuleOptions } from '../src/utils/module-options'

const temporary: string[] = []
afterAll(() => {
  for (const dir of temporary) rmSync(dir, { recursive: true, force: true })
})

/** Parse a throwaway declaration file, so the assertions do not chase the real types. */
function parse(source: string) {
  const dir = mkdtempSync(join(tmpdir(), 'options-'))
  temporary.push(dir)
  const file = join(dir, 'index.ts')
  writeFileSync(file, source)
  return readModuleOptions('ModuleOptions', file)
}

describe('readModuleOptions', () => {
  it('reads the type, default and description from the declaration', () => {
    const [option] = parse(`
      export interface ModuleOptions {
        /**
         * Generate SEO meta tags automatically.
         * @default true
         */
        meta?: boolean
      }
    `)
    expect(option).toEqual({ path: 'meta', type: 'boolean', default: 'true', description: 'Generate SEO meta tags automatically.', optional: true, deprecated: null })
  })

  it('descends one level into an inline object type', () => {
    const options = parse(`
      export interface ModuleOptions {
        /** Payload settings. */
        translationPayloads?: {
          /** @default 'premerged' */
          mode?: 'premerged' | 'source'
        }
      }
    `)
    expect(options.map((option) => option.path)).toEqual(['translationPayloads', 'translationPayloads.mode'])
    expect(options[1]!.default).toBe("'premerged'")
  })

  it('records a deprecation, and gives an empty tag a reason anyway', () => {
    // An empty `@deprecated` still marks the option; an empty string would read as absent.
    const options = parse(`
      export interface ModuleOptions {
        /** @deprecated use \`meta\` */
        legacyMeta?: boolean
        /** @deprecated */
        older?: boolean
      }
    `)
    expect(options[0]!.deprecated).toBe('use `meta`')
    expect(options[1]!.deprecated).toBe('deprecated')
  })

  it('marks a required option as such', () => {
    expect(parse('export interface ModuleOptions { locales: string[] }')[0]!.optional).toBe(false)
  })

  it('is not confused by prose that looks like a member', () => {
    // The reason this reads the AST: `?:` appears inside the doc text.
    const options = parse(`
      export interface ModuleOptions {
        /** Written as \`ghost?: string\` in older versions. */
        real?: string
      }
    `)
    expect(options.map((option) => option.path)).toEqual(['real'])
  })

  it('returns nothing when the interface is absent', () => {
    expect(parse('export interface Other { a?: string }')).toEqual([])
  })
})
