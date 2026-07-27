import { describe, expect, it } from 'vitest'
import { parseSnapshot } from '../src/commands/docs-data'
import { coveredByDynamicRoute, isDynamicTemplate } from '../src/commands/docs-audit'
import { formatSize } from '../../docs/.vitepress/data/loaders'

/**
 * The documentation reads these artifacts directly, so a parsing mistake here shows up as
 * a wrong reference page rather than as a failure.
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

  it('folds members under the export they belong to', () => {
    const [root] = parsed.entryPoints
    const baseI18n = root!.exports.find((item) => item.name === 'BaseI18n')!
    expect(baseI18n.kind).toBe('class')
    expect(baseI18n.members.map((member) => member.name).sort()).toEqual(['has', 't'])
    // The class itself is one export, not one per member.
    expect(root!.exports.map((item) => item.name)).toEqual(['BaseI18n', 'createI18n'])
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

describe('formatSize', () => {
  it('switches to MB once KB stops being readable', () => {
    expect(formatSize(1024)).toBe('1.0 KB')
    expect(formatSize(300_801)).toBe('293.8 KB')
    expect(formatSize(15_960_520)).toBe('15.2 MB')
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
