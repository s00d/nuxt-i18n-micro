import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineCommand } from 'citty'
import { walkFiles } from '../utils/fs-walk'
import { readModuleOptions } from '../utils/module-options'
import { repoRoot } from '../utils/workspace'

export interface DocsFinding {
  code: string
  where: string
  message: string
}

export interface DocsAuditReport {
  pages: number
  options: number
  errors: DocsFinding[]
  warnings: DocsFinding[]
}

interface NavItem {
  text?: string
  link?: string
  /** VitePress prefixes every descendant link with this until another `base` overrides it. */
  base?: string
  items?: NavItem[]
}

interface ThemeConfig {
  nav?: NavItem[]
  sidebar?: NavItem[] | Record<string, NavItem[]>
}

/**
 * Every `link` in the nav and sidebar trees, resolved against the `base` its group
 * declares — without that, a sidebar written as `base: '/guide'` + `link: '/seo'` reads
 * as a link to `/seo`, and every entry looks broken.
 */
export function collectLinks(theme: ThemeConfig): string[] {
  const links: string[] = []

  const visit = (items: NavItem[] | undefined, base: string): void => {
    for (const item of items ?? []) {
      const itemBase = typeof item.base === 'string' ? item.base.replace(/\/$/, '') : base
      if (typeof item.link === 'string') {
        const link = item.link.startsWith('/') ? `${itemBase}${item.link}` : item.link
        links.push(link === '' ? '/' : link)
      }
      visit(item.items, itemBase)
    }
  }

  visit(theme.nav, '')
  const sidebar = theme.sidebar
  if (Array.isArray(sidebar)) visit(sidebar, '')
  else for (const group of Object.values(sidebar ?? {})) visit(group, '')

  return links
}

/**
 * The markdown files a VitePress link can resolve to, or an empty list when it points
 * outside the docs.
 *
 * More than one candidate because `cleanUrls` is on: `/news` is served by `news.md` if
 * that exists and by `news/index.md` otherwise, and both are correct authoring choices.
 * A trailing slash names a directory, so only the index form applies.
 */
export function pageCandidatesForLink(link: string): string[] {
  if (/^[a-z]+:/i.test(link)) return []
  const [path = ''] = link.split('#', 1)
  if (!path.startsWith('/')) return []

  const clean = path.replace(/\/+$/, '').slice(1)
  if (clean === '') return ['index.md']
  return path.endsWith('/') ? [`${clean}/index.md`] : [`${clean}.md`, `${clean}/index.md`]
}

/** A VitePress dynamic route template, e.g. `api/packages/[pkg].md`. */
export function isDynamicTemplate(page: string): boolean {
  return /\[[^\]/]+\]\.md$/.test(page)
}

/**
 * Does a dynamic template cover `page`?
 *
 * `api/packages/[pkg].md` renders one page per package, so a link to
 * `api/packages/core.md` resolves even though no such file exists. Only the last segment
 * is matched, which is all the `[param].md` convention can produce.
 */
export function coveredByDynamicRoute(page: string, templates: string[]): boolean {
  const directory = page.includes('/') ? page.slice(0, page.lastIndexOf('/')) : ''
  return templates.some((template) => {
    const templateDir = template.includes('/') ? template.slice(0, template.lastIndexOf('/')) : ''
    return templateDir === directory
  })
}

/** Relative markdown links inside a page body, excluding code fences. */
export function markdownLinks(source: string): string[] {
  const withoutCode = source.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
  return [...withoutCode.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1]!)
}

export const docsAuditCommand = defineCommand({
  meta: {
    name: 'docs-audit',
    description: [
      'Check the documentation against the code it documents.',
      '',
      'Four kinds of drift, none of which any build step notices: an option that exists',
      'but is documented nowhere, a documented option that no longer exists, a link to a',
      'page that was renamed, and a nav or sidebar entry pointing at a file that is gone.',
      'VitePress builds all four happily.',
      '',
      'Examples:',
      '  pnpm -C scripts cli docs-audit',
      '  pnpm -C scripts cli docs-audit --json',
      '  pnpm -C scripts cli docs-audit --warnings-as-errors',
    ].join('\n'),
  },
  args: {
    dir: { type: 'string', default: 'docs', description: 'Documentation directory' },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
    warningsAsErrors: { type: 'boolean', default: false, description: 'Exit non-zero on warnings too' },
  },
  async setup({ args }) {
    const docsDir = join(repoRoot, args.dir)
    if (!existsSync(docsDir)) {
      console.error(`No docs directory at ${docsDir}`)
      process.exit(1)
    }

    const report: DocsAuditReport = { pages: 0, options: 0, errors: [], warnings: [] }
    const add = (level: 'errors' | 'warnings', code: string, where: string, message: string) => {
      report[level].push({ code, where, message })
    }

    const pages = walkFiles(docsDir, { extensions: ['.md'] })
    report.pages = pages.length
    const dynamicTemplates = pages.filter(isDynamicTemplate)

    const bodies = new Map(pages.map((page) => [page, readFileSync(join(docsDir, page), 'utf8')]))
    const corpus = [...bodies.values()].join('\n')

    // --- options ↔ documentation ------------------------------------------------------
    const options = readModuleOptions()
    report.options = options.length

    for (const option of options) {
      const name = option.path.split('.').pop()!
      // Word-boundary match: `meta` must not be satisfied by `metaBaseUrl`.
      if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(corpus)) continue
      add(
        option.deprecated ? 'warnings' : 'errors',
        'undocumented-option',
        'packages/types/src/index.ts',
        `option "${option.path}" appears nowhere in ${args.dir}/`,
      )
    }

    // --- nav and sidebar --------------------------------------------------------------
    const configPath = join(docsDir, '.vitepress/config.mts')
    if (existsSync(configPath)) {
      const module = (await import(pathToFileURL(configPath).href)) as { default?: { themeConfig?: ThemeConfig } }
      const theme = module.default?.themeConfig ?? {}

      const linked = new Set<string>()
      for (const link of collectLinks(theme)) {
        const candidates = pageCandidatesForLink(link)
        if (candidates.length === 0) continue

        const resolved = candidates.find((candidate) => bodies.has(candidate))
        if (resolved) linked.add(resolved)
        else if (!candidates.some((candidate) => coveredByDynamicRoute(candidate, dynamicTemplates))) {
          add('errors', 'dead-nav-link', '.vitepress/config.mts', `"${link}" resolves to none of ${candidates.join(', ')}`)
        }
      }

      for (const page of pages) {
        // A dynamic template is never linked directly; the pages it renders are.
        if (page.startsWith('public/') || page === 'index.md' || isDynamicTemplate(page)) continue
        if (!linked.has(page)) add('warnings', 'unlinked-page', page, 'page is not reachable from the nav or the sidebar')
      }
    }

    // --- links between pages ----------------------------------------------------------
    for (const [page, body] of bodies) {
      const dir = page.includes('/') ? page.slice(0, page.lastIndexOf('/')) : ''
      for (const link of markdownLinks(body)) {
        if (!link.endsWith('.md') && !link.includes('.md#')) continue
        if (/^[a-z]+:/i.test(link)) continue

        const [target = ''] = link.split('#', 1)
        const resolved = target.startsWith('/') ? target.slice(1) : join(dir, target)
        if (!bodies.has(resolved) && !coveredByDynamicRoute(resolved, dynamicTemplates)) {
          add('errors', 'dead-link', page, `links to "${link}", which does not exist`)
        }
      }
    }

    if (args.json) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(`Checked ${report.pages} page(s) against ${report.options} module option(s)\n`)
      for (const finding of report.errors) console.log(`  ✖ ${finding.where} [${finding.code}] ${finding.message}`)
      for (const finding of report.warnings) console.log(`  ⚠ ${finding.where} [${finding.code}] ${finding.message}`)
      console.log(`\nerrors: ${report.errors.length}, warnings: ${report.warnings.length}`)
    }

    if (report.errors.length > 0 || (args.warningsAsErrors && report.warnings.length > 0)) process.exit(1)
  },
})
