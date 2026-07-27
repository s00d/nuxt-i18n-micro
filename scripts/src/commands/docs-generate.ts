import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineCommand } from 'citty'
import { parse as parseComponent } from 'vue-docgen-api'
import { indexSnapshot } from '../utils/api-surface'
import { BLOCK_START, MissingBlockError, cell, code, replaceBlock, summarise, table } from '../utils/markdown'
import { type ModuleOption, readModuleOptions } from '../utils/module-options'
import { type DocSymbol, readInterface, readModules } from '../utils/typedoc-model'
import { repoRoot } from '../utils/workspace'

export interface DocsGenerateReport {
  written: string[]
  stale: string[]
}

const formatSize = (bytes: number): string => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`)

/* ------------------------------------------------------------------------ module options */

/** Options are shown in named groups; anything unlisted falls into "Other". */
const OPTION_GROUPS: { title: string; blurb: string; match: (path: string) => boolean }[] = [
  {
    title: 'Locales and routing',
    blurb: 'Which languages exist and how they appear in the URL.',
    match: (path) =>
      [
        'locales',
        'defaultLocale',
        'strategy',
        'globalLocaleRoutes',
        'routeLocales',
        'noPrefixRedirect',
        'customRegexMatcher',
        'excludePatterns',
        'localeCookie',
      ].includes(path),
  },
  {
    title: 'Translations',
    blurb: 'Where translation files live and how keys are resolved.',
    match: (path) =>
      path.startsWith('translationDir') || ['disablePageLocales', 'fallbackLocale', 'plural', 'routesLocaleLinks', 'disableWatcher'].includes(path),
  },
  {
    title: 'Payloads and caching',
    blurb: 'How translations reach the browser. [Performance](/guide/performance) explains what these change at runtime.',
    match: (path) => path.startsWith('translationPayloads') || path.startsWith('api') || path === 'serverTranslationPreload',
  },
  {
    title: 'SEO',
    blurb: 'Meta tags generated for each localized page.',
    match: (path) => path.startsWith('meta') || path === 'canonicalQueryWhitelist',
  },
  {
    title: 'Detection and redirects',
    blurb: 'Choosing a locale for a visitor who has not picked one.',
    match: (path) => path.startsWith('autoDetect') || path === 'redirects',
  },
  {
    title: 'Registration',
    blurb: 'Parts of the module you can switch off.',
    match: (path) => ['define', 'plugin', 'hooks', 'components', 'types', 'debug'].includes(path),
  },
]

function optionRow(option: ModuleOption): string[] {
  const description = option.deprecated ? `**Deprecated** — ${option.deprecated}. ${option.description}` : option.description
  return [code(option.path), code(option.type), code(option.default), cell(description)]
}

function groupedOptions(options: ModuleOption[]): string {
  const claimed = new Set<string>()
  const sections: string[] = []

  for (const group of OPTION_GROUPS) {
    const matched = options.filter((option) => group.match(option.path))
    if (matched.length === 0) continue
    for (const option of matched) claimed.add(option.path)
    sections.push(`## ${group.title}\n\n${group.blurb}\n\n${table(['Option', 'Type', 'Default', 'Description'], matched.map(optionRow))}`)
  }

  const rest = options.filter((option) => !claimed.has(option.path))
  if (rest.length > 0) sections.push(`## Other\n\n${table(['Option', 'Type', 'Default', 'Description'], rest.map(optionRow))}`)

  return sections.join('\n\n')
}

/** The compact index used inside the Configuration guide. */
function optionsIndex(options: ModuleOption[]): string {
  const rows = options.map((option) => [
    `[\`${option.path}\`](/api/module-options)`,
    code(option.type),
    code(option.default),
    summarise(option.description),
  ])
  return table(['Option', 'Type', 'Default', 'Purpose'], rows)
}

/* ------------------------------------------------------------------------------ symbols */

const anchorOf = (name: string): string => name.replace(/^\$/, '').toLowerCase()

/**
 * The index of injected helpers.
 *
 * `documented` are the helpers with a section of their own on the page; the rest are
 * listed without a link rather than pointing at an anchor that does not exist — `$_t`
 * and `$_ts` share one hand-written section under a combined heading.
 */
function methodsIndex(methods: DocSymbol[], documented: Set<string>): string {
  const rows = methods.map((method) => [
    documented.has(method.name) ? `[\`${method.name}\`](#${anchorOf(method.name)})` : `\`${method.name}\``,
    code(method.signature),
    summarise(method.description),
  ])
  return table(['Helper', 'Signature', 'Purpose'], rows)
}

/** Signature, description, parameters and examples of one symbol. */
function symbolBlock(symbol: DocSymbol): string {
  const parts = ['```ts', symbol.signature, '```', '']

  if (symbol.deprecated) parts.push(`**Deprecated** — ${symbol.deprecated}`, '')
  if (symbol.description) parts.push(symbol.description, '')

  if (symbol.params.length > 0) {
    parts.push(
      table(
        ['Parameter', 'Type', 'Description'],
        symbol.params.map((param) => [`${code(param.name)}${param.optional ? ' *(optional)*' : ''}`, code(param.type), cell(param.description)]),
      ),
      '',
    )
  }

  if (symbol.returns) parts.push(`**Returns** — ${cell(symbol.returns)}`, '')

  for (const example of symbol.examples) {
    const body = example
      .replace(/^```\w*\n?/, '')
      .replace(/```$/, '')
      .trim()
    parts.push('```ts', body, '```', '')
  }

  return parts.join('\n').trim()
}

/* --------------------------------------------------------------------------- components */

/** vue-docgen-api describes a type as a tree; the page wants the text a user would write. */
function typeText(type: unknown): string {
  if (!type || typeof type !== 'object') return 'unknown'
  const node = type as { name?: string; elements?: unknown[] }
  if (Array.isArray(node.elements) && node.elements.length > 0) {
    const inner = node.elements.map(typeText)
    return node.name === 'union' ? inner.join(' | ') : `${node.name}<${inner.join(', ')}>`
  }
  return node.name ?? 'unknown'
}

async function componentBlock(file: string): Promise<string> {
  const parsed = await parseComponent(file)
  const parts: string[] = []

  const props = (parsed.props ?? []).map((prop) => [
    code(prop.name) + (prop.required ? ' **\\***' : ''),
    code(typeText(prop.type)),
    code(prop.defaultValue?.value ?? null),
    cell(prop.description ?? ''),
  ])
  if (props.length > 0) {
    parts.push(table(['Prop', 'Type', 'Default', 'Description'], props))
    if ((parsed.props ?? []).some((prop) => prop.required)) parts.push('', '**\\*** required.')
  }

  const slots = (parsed.slots ?? []).map((slot) => [
    code(slot.name),
    (slot.bindings ?? []).map((binding) => `\`${binding.name}\``).join(', ') || '—',
    cell(slot.description ?? ''),
  ])
  if (slots.length > 0) parts.push('', '### Slots', '', table(['Slot', 'Bindings', 'Description'], slots))

  const events = (parsed.events ?? []).map((event) => [code(event.name), cell(event.description ?? '')])
  if (events.length > 0) parts.push('', '### Events', '', table(['Event', 'Description'], events))

  return parts.join('\n')
}

/* ------------------------------------------------------------------------------ packages */

interface ApiExport {
  name: string
  kind: string
  signature: string
  members: { name: string; signature: string }[]
}

export interface ApiPackage {
  name: string
  slug: string
  entryPoints: { specifier: string; exports: ApiExport[] }[]
  exportCount: number
}

export function parseSnapshot(name: string, text: string): ApiPackage {
  const bySubpath = new Map<string, Map<string, ApiExport>>()

  // Members arrive as `Owner.member`; fold them under the export they belong to so a
  // class is one entry with its methods rather than thirty siblings.
  for (const [key, value] of [...indexSnapshot(text)].sort(([a], [b]) => a.localeCompare(b))) {
    const separator = key.indexOf(' ')
    const subpath = key.slice(0, separator)
    const path = key.slice(separator + 1)
    const kindSeparator = value.indexOf(' ')
    const kind = value.slice(0, kindSeparator)
    const signature = value.slice(kindSeparator + 1).trim()

    const entry = bySubpath.get(subpath) ?? new Map<string, ApiExport>()
    bySubpath.set(subpath, entry)

    if (kind !== 'member') {
      entry.set(path, { name: path, kind, signature, members: entry.get(path)?.members ?? [] })
      continue
    }

    const owner = path.slice(0, path.indexOf('.'))
    const existing = entry.get(owner) ?? { name: owner, kind: 'unknown', signature: '', members: [] }
    existing.members.push({ name: path.slice(path.indexOf('.') + 1), signature })
    entry.set(owner, existing)
  }

  const entryPoints = [...bySubpath]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subpath, exports]) => ({
      specifier: `${name}${subpath === '.' ? '' : subpath.slice(1)}`,
      exports: [...exports.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }))

  return { name, slug: name.replace('@i18n-micro/', ''), entryPoints, exportCount: entryPoints.reduce((sum, entry) => sum + entry.exports.length, 0) }
}

function readPackages(): ApiPackage[] {
  const dir = join(repoRoot, 'scripts/api-surface')
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter((file) => file.endsWith('.api.txt'))
    .map((file) => parseSnapshot(`@${file.replace(/\.api\.txt$/, '').replace('__', '/')}`, readFileSync(join(dir, file), 'utf8')))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Where a member list was first documented, keyed by its contents.
 *
 * The packages re-export each other's types, so `ModuleOptions` and `FormatService` carry
 * the same forty-line table on six pages, and a page can repeat one three times under
 * different aliases. Rendering it once and linking to it keeps the reference readable —
 * and keeps the `llms-full.txt` bundle from spending a quarter of its tokens on copies.
 */
interface MemberIndex {
  seen: Map<string, { pkg: ApiPackage; symbol: string }>
}

function memberKey(members: { name: string; signature: string }[]): string {
  return members.map((member) => `${member.name}:${member.signature}`).join('\n')
}

function packagePage(pkg: ApiPackage, index: MemberIndex): string {
  const sections = pkg.entryPoints.map((entry) => {
    const rows = entry.exports.map((item) => [
      code(item.name),
      item.kind,
      item.signature ? code(item.signature) : item.members.length > 0 ? `${item.members.length} members` : '—',
    ])

    const details = entry.exports
      .filter((item) => item.members.length > 0)
      .map((item) => {
        const key = memberKey(item.members)
        const first = index.seen.get(key)

        // Any repeat links back, including the same symbol re-exported from a second
        // entry point of the same package — that was the largest source of duplication.
        if (first) {
          const samePage = first.pkg.slug === pkg.slug
          // No `#symbol` anchors exist on these pages — only entry-point headings — so a
          // same-page repeat says where to look instead of linking somewhere dead.
          const where = samePage ? `\`${first.symbol}\` above` : `[\`${first.symbol}\`](/api/packages/${first.pkg.slug})`
          return `<code>${item.name}</code> — ${item.members.length} members, identical to ${where}.`
        }

        index.seen.set(key, { pkg, symbol: item.name })
        return `<details>\n<summary><code>${item.name}</code> — ${item.members.length} members</summary>\n\n${table(
          ['Member', 'Type'],
          item.members.map((member) => [code(member.name), code(member.signature)]),
        )}\n\n</details>`
      })

    return [
      `## \`${entry.specifier}\``,
      '',
      '```ts',
      `import { /* … */ } from '${entry.specifier}'`,
      '```',
      '',
      table(['Export', 'Kind', 'Signature'], rows),
      '',
      ...details,
    ].join('\n')
  })

  return [
    '---',
    `title: '${pkg.name}'`,
    `description: 'Exported API of ${pkg.name}, generated from the source.'`,
    "outline: 'deep'",
    '---',
    '',
    `# \`${pkg.name}\``,
    '',
    `${pkg.exportCount} exports across ${pkg.entryPoints.length} entry point${pkg.entryPoints.length === 1 ? '' : 's'}.`,
    'Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)',
    'checks against the TypeScript sources.',
    '',
    ...sections,
    '',
    'Back to [all packages](/api/packages) · [Integration guides](/integrations/)',
    '',
  ].join('\n')
}

function packagesIndex(packages: ApiPackage[]): string {
  const rows = packages.map((pkg) => [
    `[\`${pkg.name}\`](/api/packages/${pkg.slug})`,
    pkg.entryPoints.map((entry) => `\`${entry.specifier}\``).join(', '),
    String(pkg.exportCount),
  ])
  return table(['Package', 'Entry points', 'Exports'], rows)
}

/* -------------------------------------------------------------------------------- budget */

function budgetTable(): string {
  const file = join(repoRoot, 'scripts/payload-budget.json')
  if (!existsSync(file)) return '_No payload budget recorded. Run `pnpm run budget:payload:update`._'

  const budget = JSON.parse(readFileSync(file, 'utf8')) as { app: string; routes: string[]; observed?: Record<string, number> }
  const observed = budget.observed ?? {}

  const rows = [
    ['Translation sources on disk', observed.sourceDictionary],
    ['Served as separate payload files', observed.payloadFiles],
    ['Largest inline `__NUXT_DATA__`', observed.maxNuxtData],
    ['Client assets', observed.clientAssets],
  ]
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .map(([label, bytes]) => [label, formatSize(bytes)])

  const ratio = observed.sourceDictionary && observed.maxNuxtData ? Math.round(observed.sourceDictionary / observed.maxNuxtData) : null

  return [
    `Measured on \`${budget.app}\` across ${budget.routes.map((route) => `\`${route}\``).join(', ')}:`,
    '',
    table(['Measurement', 'Size'], rows),
    '',
    ratio ? `The dictionary is **${ratio}×** larger than the payload any single page inlines. That ratio is what the budget enforces.` : '',
  ]
    .join('\n')
    .trim()
}

export const docsGenerateCommand = defineCommand({
  meta: {
    name: 'docs-generate',
    description: [
      'Write the reference documentation from the code, as plain Markdown.',
      '',
      'Markdown rather than a component reading JSON in the browser: the site, the',
      '`llms.txt` bundle and anything else reading the sources all get the same content,',
      'and a table that only exists once a page is mounted is invisible to every consumer',
      'except a browser.',
      '',
      'Sources: vue-docgen-api for the components, TypeDoc for the composables and the',
      'injected helpers, the `ModuleOptions` type for the option reference, and the',
      'artifacts `api-surface` and `payload-budget` already produce.',
      '',
      'Examples:',
      '  pnpm -C scripts cli docs-generate',
      '  pnpm -C scripts cli docs-generate --check',
    ].join('\n'),
  },
  args: {
    check: { type: 'boolean', default: false, description: 'Fail when a file would change instead of writing it' },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
  },
  async setup({ args }) {
    const report: DocsGenerateReport = { written: [], stale: [] }

    const emit = (relative: string, content: string): void => {
      const path = join(repoRoot, relative)
      const next = content.endsWith('\n') ? content : `${content}\n`

      if (args.check) {
        if (!existsSync(path) || readFileSync(path, 'utf8') !== next) report.stale.push(relative)
        return
      }
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, next)
      report.written.push(relative)
    }

    const inBlock = (relative: string, id: string, body: string): void => {
      const path = join(repoRoot, relative)
      if (!existsSync(path)) {
        console.error(`${relative} does not exist; it needs a ${BLOCK_START(id)} region.`)
        process.exit(1)
      }

      try {
        emit(relative, replaceBlock(readFileSync(path, 'utf8'), id, body))
      } catch (error) {
        if (!(error instanceof MissingBlockError)) throw error
        console.error(`${relative} has no "${id}" region. Add ${BLOCK_START(id)} and its closing marker.`)
        process.exit(1)
      }
    }

    // --- module options ---------------------------------------------------------------
    const options = readModuleOptions()
    inBlock('docs/api/module-options.md', 'module-options', groupedOptions(options))
    inBlock('docs/guide/configuration.md', 'options-index', optionsIndex(options))

    // --- runtime helpers and composables ----------------------------------------------
    const methods = await readInterface('src/runtime/plugins/01.plugin.ts', 'PluginsInjections')
    const methodsPage = readFileSync(join(repoRoot, 'docs/api/methods.md'), 'utf8')
    const documented = new Set(methods.filter((method) => methodsPage.includes(BLOCK_START(`method:${method.name}`))).map((method) => method.name))

    inBlock('docs/api/methods.md', 'methods-index', methodsIndex(methods, documented))
    for (const name of documented) {
      inBlock('docs/api/methods.md', `method:${name}`, symbolBlock(methods.find((method) => method.name === name)!))
    }

    const composables = (await readModules('src/runtime/composables')).flatMap((module) => module.symbols)
    for (const symbol of composables.filter((entry) => entry.name.startsWith('use'))) {
      const page = `docs/composables/${symbol.name}.md`
      if (existsSync(join(repoRoot, page))) inBlock(page, `symbol:${symbol.name}`, symbolBlock(symbol))
    }

    // --- components -------------------------------------------------------------------
    const componentsDir = join(repoRoot, 'src/runtime/components')
    if (existsSync(componentsDir)) {
      for (const file of readdirSync(componentsDir).filter((name) => name.endsWith('.vue'))) {
        const tag = file.replace(/\.vue$/, '')
        const page = `docs/components/${tag}.md`
        if (!existsSync(join(repoRoot, page))) continue
        // oxlint-disable-next-line no-await-in-loop -- four files, and each compiles an SFC
        inBlock(page, `component:${tag}`, await componentBlock(join(componentsDir, file)))
      }
    }

    // --- packages ---------------------------------------------------------------------
    const packages = readPackages()
    inBlock('docs/api/packages.md', 'packages-index', packagesIndex(packages))

    const packagesDir = join(repoRoot, 'docs/api/packages')
    // Ordered so the package that owns a type documents it: types first, then core,
    // then the rest — a later page links back rather than repeating the table.
    const ownership = ['types', 'core', 'utils']
    const byOwnership = [...packages].sort((a, b) => {
      const rank = (slug: string) => (ownership.indexOf(slug) === -1 ? ownership.length : ownership.indexOf(slug))
      return rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug)
    })

    const memberIndex: MemberIndex = { seen: new Map() }
    for (const pkg of byOwnership) emit(`docs/api/packages/${pkg.slug}.md`, packagePage(pkg, memberIndex))

    // A package removed from the workspace must lose its page too — and `--check` has to
    // say so, or a stale page passes CI forever.
    if (existsSync(packagesDir)) {
      const expected = new Set(packages.map((pkg) => `${pkg.slug}.md`))
      for (const file of readdirSync(packagesDir)) {
        if (!file.endsWith('.md') || expected.has(file)) continue
        if (args.check) report.stale.push(`docs/api/packages/${file}`)
        else rmSync(join(packagesDir, file))
      }
    }

    // --- payload budget ---------------------------------------------------------------
    inBlock('docs/guide/performance.md', 'payload-budget', budgetTable())

    if (args.json) {
      console.log(JSON.stringify(report, null, 2))
    } else if (args.check) {
      for (const file of report.stale) console.log(`  x ${file} is out of date`)
      console.log(report.stale.length === 0 ? 'All generated documentation is up to date.' : '\nRun `pnpm run docs:generate` and commit the result.')
    } else {
      console.log(`Wrote ${report.written.length} file(s).`)
    }

    if (args.check && report.stale.length > 0) process.exit(1)
  },
})
