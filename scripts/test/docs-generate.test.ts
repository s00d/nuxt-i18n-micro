import { describe, expect, it } from 'vitest'
import { parseSnapshot } from '../src/commands/docs-generate'
import { code, summarise, table } from '../src/utils/markdown'
import { coveredByDynamicRoute, isDynamicTemplate } from '../src/commands/docs-audit'

/**
 * The reference pages are rendered from these artifacts, so a parsing mistake here shows
 * up as a wrong page rather than as a failure.
 */
describe('parseSnapshot', () => {
  const snapshot = [
    '# . (src/index.ts)',
    'class BaseI18n',
    'member BaseI18n.t: (key: string) => string',
    'member BaseI18n.has: (key: string) => boolean',
    'function createI18n: (options: Options) => BaseI18n',
    '',
    '# ./helpers (src/helpers.ts)',
    'function getByPath: (obj: object, path: string) => unknown',
    '',
  ].join('\n')

  const parsed = parseSnapshot('@i18n-micro/core', snapshot)
  const root = parsed.entryPoints[0]!

  it('folds members under the export they belong to', () => {
    const baseI18n = root.exports.find((item) => item.name === 'BaseI18n')!
    expect(baseI18n.kind).toBe('class')
    expect(baseI18n.members.map((member) => member.name).sort()).toEqual(['has', 't'])
    // The class itself is one export, not one per member.
    expect(root.exports.map((item) => item.name)).toEqual(['BaseI18n', 'createI18n'])
  })

  it('turns each subpath into the specifier a consumer writes', () => {
    expect(parsed.entryPoints.map((entry) => entry.specifier)).toEqual(['@i18n-micro/core', '@i18n-micro/core/helpers'])
  })

  it('counts exports, not members', () => {
    expect(parsed.exportCount).toBe(3)
  })

  it('derives the route slug from the package name', () => {
    expect(parsed.slug).toBe('core')
  })
})

describe('dynamic routes', () => {
  it('recognises a template', () => {
    expect(isDynamicTemplate('api/packages/[pkg].md')).toBe(true)
    expect(isDynamicTemplate('api/packages.md')).toBe(false)
    expect(isDynamicTemplate('guide/[a]-[b].md')).toBe(true)
  })

  it('resolves a link to a page the template renders', () => {
    const templates = ['api/packages/[pkg].md']
    expect(coveredByDynamicRoute('api/packages/core.md', templates)).toBe(true)
    // A different directory is not covered by it.
    expect(coveredByDynamicRoute('api/methods.md', templates)).toBe(false)
    expect(coveredByDynamicRoute('api/packages/core.md', [])).toBe(false)
  })
})


describe('deprecation reporting', () => {
  it('reports the @deprecated reason rather than the symbol summary', async () => {
    const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs')
    const { tmpdir } = await import('node:os')
    const { join } = await import('node:path')
    const { readModuleOptions } = await import('../src/utils/module-options')

    const dir = mkdtempSync(join(tmpdir(), 'deprecated-'))
    try {
      const file = join(dir, 'index.ts')
      writeFileSync(
        file,
        `export interface ModuleOptions {
           /**
            * What it does.
            * @deprecated use \`meta\` instead
            */
           legacy?: boolean
         }`,
      )
      const [option] = readModuleOptions('ModuleOptions', file)
      expect(option?.deprecated).toBe('use `meta` instead')
      expect(option?.description).toBe('What it does.')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('markdown rendering', () => {
  it('renders a present but falsy default rather than an em dash', () => {
    // `false` and `0` are real defaults; a truthiness test reported them as absent.
    expect(code('false')).toBe('`false`')
    expect(code('0')).toBe('`0`')
    expect(code(null)).toBe('—')
    expect(code('')).toBe('—')
  })

  it('widens the fence for a value containing backticks', () => {
    // A template-literal type closes a single-backtick span on its own delimiter.
    expect(code('Extract<Key, `${Scope}.${string}`>')).toBe('``Extract<Key, `${Scope}.${string}`>``')
  })

  it('escapes a pipe so a union type cannot break the table', () => {
    expect(code('string | null')).toBe('`string \\| null`')
  })

  it('does not truncate a summary at an abbreviation', () => {
    expect(summarise('For `no_prefix` (e.g. `/en/x`) enable it. Second sentence.')).toBe('For `no_prefix` (e.g. `/en/x`) enable it.')
    expect(summarise('One sentence only')).toBe('One sentence only')
  })

  it('renders nothing for a table with no rows', () => {
    expect(table(['A'], [])).toBe('')
  })
})
