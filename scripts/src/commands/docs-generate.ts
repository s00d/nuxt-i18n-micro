import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineCommand } from 'citty'
import { indexSnapshot } from '../utils/api-surface'
import { parseComponent } from '../utils/component-docs'
import { BLOCK_END, BLOCK_START, type Field, MissingBlockError, cell, code, fieldGroup, replaceBlock, summarise, table } from '../utils/markdown'
import { listWorkspacePackages } from '../utils/git-baseline'
import { type ModuleOption, readModuleOptions } from '../utils/module-options'
import { type EntryDoc, type ExportDoc, type ExportGroup, GROUP_ORDER, readPackageDocs } from '../utils/package-docs'
import { type DocSymbol, readInterface, readModules } from '../utils/typedoc-model'
import { repoRoot } from '../utils/workspace'

export interface DocsGenerateReport {
  written: string[]
  stale: string[]
}

const formatSize = (bytes: number): string => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`)

/* ------------------------------------------------------------------------ module options */

/**
 * Type, default and description of one option, for the detail section that explains it.
 *
 * The guide keeps the examples and the caveats — the part that cannot be derived — and
 * takes the facts from the type, so a renamed or retyped option cannot be described
 * correctly on the reference page and wrongly two pages away.
 */
/** `code` escapes `|` for a table cell; in a paragraph the backslash would show. */
const inlineCode = (value: string | null): string => code(value).replaceAll('\\|', '|')

function optionFacts(option: ModuleOption, options: ModuleOption[]): string {
  const facts = [`**Type** ${inlineCode(option.type)}`, `**Default** ${inlineCode(option.default)}`]
  if (!option.optional) facts.push('**Required**')

  const lines = [facts.join(' · ')]
  if (option.deprecated) lines.push('', `::warning\n**Deprecated** — ${cell(option.deprecated)}\n::`)
  if (option.description) lines.push('', openListsWithABlankLine(option.description))
  for (const example of option.examples) lines.push('', '```ts', example, '```')

  // A nested option is a key of this one: its fields read under the parent.
  const children = options.filter((entry) => entry.path.startsWith(`${option.path}.`) && !entry.path.slice(option.path.length + 1).includes('.'))
  const fields = children.map((child) => ({
    name: child.path.slice(option.path.length + 1),
    type: child.type,
    required: !child.optional,
    text: fieldText(child.description, child),
  }))
  if (fields.length > 0) lines.push('', fieldGroup(fields, { collapse: false }))

  return lines.join('\n')
}

interface OptionGroup {
  title: string
  options: string[]
}

/**
 * The groups and option headings the page itself declares, below the index: the page's
 * prose decides the grouping, the index only mirrors it.
 */
function optionGroups(page: string): OptionGroup[] {
  const groups: OptionGroup[] = []
  const body = page.slice(page.indexOf(BLOCK_END('module-options')))
  for (const line of body.split('\n')) {
    const group = /^## (.+)$/.exec(line)
    if (group) groups.push({ title: group[1]!, options: [] })
    const option = /^### `([^`]+)`$/.exec(line)
    if (option) groups.at(-1)?.options.push(option[1]!)
  }
  return groups.filter((group) => group.options.length > 0)
}

const headingAnchor = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

/** One line per group: the group, then its options, each a link to its section. */
function optionsIndex(groups: OptionGroup[]): string {
  return groups
    .map(
      (group) =>
        `- [${group.title}](#${headingAnchor(group.title)}) — ${group.options.map((name) => `[\`${name}\`](#${name.toLowerCase()})`).join(' · ')}`,
    )
    .join('\n')
}

/**
 * A Markdown list needs a blank line before its first item, or the renderer folds it into
 * the paragraph above. Only the first: a blank line between items makes the list loose and
 * wraps every item in a paragraph.
 */
function openListsWithABlankLine(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []

  for (const line of lines) {
    const isItem = /^\s*[-*] /.test(line)
    const previous = out.at(-1)
    if (isItem && previous !== undefined && previous.trim() !== '' && !/^\s*[-*] /.test(previous)) out.push('')
    out.push(line)
  }

  return out.join('\n')
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
  return methods
    .map((method) => {
      const name = documented.has(method.name) ? `[\`${method.name}\`](#${anchorOf(method.name)})` : `\`${method.name}\``
      return `- ${name} — ${summarise(method.description)}`
    })
    .join('\n')
}

const isBlockStart = (line: string): boolean => /^\s*(?:[-*] |\d+\. |```)/.test(line)

/**
 * `**Default** x · **Deprecated** — why`, then the description, as one field's text.
 *
 * The field renders its slot with `mdc-unwrap="p"`: two paragraphs run together with no
 * space between them ("Path.Default '/'"). So the facts lead the first paragraph, and
 * plain paragraphs are joined into one; lists and code blocks keep their own lines.
 */
function fieldText(description: string, extra: { default?: string | null; deprecated?: string | null } = {}): string {
  const facts: string[] = []
  if (extra.default !== undefined && extra.default !== null && extra.default !== '') facts.push(`**Default** ${inlineCode(extra.default)}`)
  if (extra.deprecated) facts.push(`**Deprecated** — ${extra.deprecated}`)

  const paragraphs = openListsWithABlankLine(description)
    .split(/\n{2,}/)
    .filter(Boolean)
  const joined: string[] = []
  for (const paragraph of paragraphs) {
    const previous = joined.at(-1)
    if (previous === undefined || isBlockStart(paragraph) || isBlockStart(previous.split('\n').at(-1)!)) joined.push(paragraph)
    else joined[joined.length - 1] = `${previous} ${paragraph}`
  }

  const lead = facts.join(' · ')
  if (joined.length === 0) return lead
  if (!lead) return joined.join('\n\n')
  return isBlockStart(joined[0]!) ? [lead, ...joined].join('\n\n') : [`${lead} · ${joined[0]}`, ...joined.slice(1)].join('\n\n')
}

/** Signature, description, parameters and examples of one symbol. */
function symbolBlock(symbol: DocSymbol): string {
  const parts = ['```ts', symbol.signature, '```', '']

  if (symbol.deprecated) parts.push(`**Deprecated** — ${symbol.deprecated}`, '')
  if (symbol.description) parts.push(symbol.description, '')

  if (symbol.params.length > 0) {
    parts.push(
      fieldGroup(symbol.params.map((param) => ({ name: param.name, type: param.type, required: !param.optional, text: param.description }))),
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

  const props = (parsed.props ?? []).map((prop) => ({
    name: prop.name,
    type: typeText(prop.type),
    required: Boolean(prop.required),
    text: fieldText(prop.description ?? '', { default: prop.defaultValue?.value ?? null }),
  }))
  if (props.length > 0) parts.push(fieldGroup(props, { label: 'props' }))

  const slots = (parsed.slots ?? []).map((slot) => {
    const bindings = (slot.bindings ?? []).map((binding) => `\`${binding.name}\``).join(', ')
    return { name: slot.name, text: [slot.description ?? '', bindings ? `**Bindings** ${bindings}` : ''].filter(Boolean).join('\n\n') }
  })
  if (slots.length > 0) parts.push('', '### Slots', '', fieldGroup(slots, { label: 'slots' }))

  const events = (parsed.events ?? []).map((event) => ({ name: event.name, text: event.description ?? '' }))
  if (events.length > 0) parts.push('', '### Events', '', fieldGroup(events, { label: 'events' }))

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

/* ------------------------------------------------------------------------- package pages */

interface PackageDocs {
  name: string
  slug: string
  description: string
  entries: EntryDoc[]
}

/** Where a declaration is documented: one section on one page, whatever re-exports it. */
interface Home {
  href: string
  name: string
}

const GROUP_TITLES: Record<ExportGroup, string> = {
  component: 'Components',
  composable: 'Composables',
  function: 'Functions',
  class: 'Classes',
  constant: 'Constants',
  type: 'Types',
}

/** React, Preact and Solid readers call a `use*` function a hook. */
const HOOK_PACKAGES = new Set(['react', 'preact', 'solid'])

const MEMBER_LABELS: Record<ExportGroup, string> = {
  component: 'props',
  composable: 'properties',
  function: 'properties',
  class: 'members',
  constant: 'properties',
  type: 'properties',
}

function readPackageDocsAll(names: Set<string>): PackageDocs[] {
  const workspace = listWorkspacePackages()
  const owners = new Map(workspace.map((entry) => [entry.relDir.replace(/^packages\//, ''), entry.name]))
  return workspace
    .filter((entry) => names.has(entry.name))
    .map((entry) => ({
      name: entry.name,
      slug: entry.name.replace('@i18n-micro/', ''),
      description: entry.pkg.description ?? '',
      entries: readPackageDocs(entry.dir, entry.pkg, owners),
    }))
}

/**
 * The page that owns each declaration: the package that declares it, at the first entry
 * point exporting it. Every other page links there instead of repeating it — `ModuleOptions`
 * used to carry the same table on six pages.
 */
function homesOf(packages: PackageDocs[]): Map<string, Home> {
  const homes = new Map<string, Home>()
  for (const pkg of packages) {
    for (const item of pkg.entries.flatMap((entry) => entry.exports)) {
      if (item.owner !== pkg.name || homes.has(item.key)) continue
      homes.set(item.key, { href: `/api/packages/${pkg.slug}#${anchorOf(item.name)}`, name: item.name })
    }
  }
  return homes
}

const linkTo = (name: string, href: string): string => `[\`${name}\`](${href})`

/** Types a signature names that have a section somewhere, in the order it names them. */
function referencedTypes(item: ExportDoc, known: Map<string, string>): string {
  const names = [...new Set(item.signature.match(/\b[A-Z]\w*\b/g) ?? [])].filter((name) => name !== item.name && known.has(name))
  return names.length === 0 ? '' : `**See** ${names.map((name) => linkTo(name, known.get(name)!)).join(' · ')}`
}

/**
 * Members as fields. An optional member is the usual case for props and options, so the
 * mark goes on the required ones; a class member is neither.
 */
function memberFields(item: ExportDoc): string {
  const fields = item.members.map((member, index) => {
    // The overloads of one method share their JSDoc; saying it once is enough.
    const overload = item.members[index - 1]?.name === member.name
    const optional = member.name.endsWith('?')
    return {
      name: optional ? member.name.slice(0, -1) : member.name,
      type: member.type,
      required: item.group !== 'class' && !optional && !member.name.startsWith('['),
      text: overload ? '' : fieldText(member.description, member),
    }
  })
  return fieldGroup(fields, { label: MEMBER_LABELS[item.group] })
}

function paramFields(item: ExportDoc): string {
  if (!item.params.some((param) => param.description)) return ''
  return fieldGroup(
    item.params.map((param) => ({ name: param.name, type: param.type, required: param.optional === false, text: param.description })),
    { label: 'parameters' },
  )
}

/** One export: what it is, how it is called, what it takes and gives back. */
function exportSection(item: ExportDoc, level: number, known: Map<string, string>): string {
  const parts = [`${'#'.repeat(level)} \`${item.name}\``]
  if (item.deprecated) parts.push(`::warning\n**Deprecated** — ${item.deprecated}\n::`)
  if (item.description) parts.push(openListsWithABlankLine(item.description))
  parts.push(['```ts', item.signature, '```'].join('\n'))
  parts.push(paramFields(item))
  if (item.returns) parts.push(`**Returns** — ${item.returns}`)
  if (item.members.length > 0) parts.push(memberFields(item))
  for (const example of item.examples) parts.push(['```ts', example, '```'].join('\n'))
  parts.push(referencedTypes(item, known))
  return parts.filter(Boolean).join('\n\n')
}

/** `ReactI18n` is `I18n` under another name: say which section the link opens. */
const reexportLink = (item: ExportDoc, home: Home): string =>
  home.name === item.name ? linkTo(item.name, home.href) : `${linkTo(item.name, home.href)} (as \`${home.name}\`)`

/** Re-exports, one line per package that documents them. */
function reexportList(items: ExportDoc[], homes: Map<string, Home>, packages: PackageDocs[]): string {
  const byOwner = new Map<string, ExportDoc[]>()
  for (const item of items) byOwner.set(item.owner, [...(byOwner.get(item.owner) ?? []), item])

  return [...byOwner]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([owner, list]) => {
      const slug = packages.find((pkg) => pkg.name === owner)!.slug
      const links = list.map((item) => reexportLink(item, homes.get(item.key)!)).join(' · ')
      return `- From [\`${owner}\`](/api/packages/${slug}): ${links}`
    })
    .join('\n')
}

interface PageContext {
  pkg: PackageDocs
  packages: PackageDocs[]
  homes: Map<string, Home>
  /** Name → link for every type a signature on this page may mention. */
  known: Map<string, string>
  /** Declarations already documented on this page, by an earlier entry point. */
  seen: Map<string, string>
  /** Export headings so far, by anchor: two `useAstroI18n` sections are `#useastroi18n` and `#useastroi18n-1`. */
  anchors: Map<string, number>
}

/** The id the site gives the next heading of this name: repeats get `-1`, `-2`, … */
function nextAnchor(anchors: Map<string, number>, name: string): string {
  const anchor = anchorOf(name)
  const count = anchors.get(anchor) ?? 0
  anchors.set(anchor, count + 1)
  return count === 0 ? anchor : `${anchor}-${count}`
}

/**
 * What an entry point shares with one above it, said once: `@i18n-micro/react/client` is
 * the root entry again, and forty links would only hide that.
 */
function repeatedLine(entry: EntryDoc, repeated: ExportDoc[], earlier: EntryDoc[], seen: Map<string, string>): string {
  if (repeated.length === 0) return ''
  const source = earlier.find((candidate) => repeated.every((item) => candidate.exports.some((other) => other.id === item.id)))
  if (source && repeated.length === entry.exports.length && repeated.length === source.exports.length) {
    return `The same exports as \`${source.specifier}\` above.`
  }
  const from = source ? `\`${source.specifier}\`` : 'an entry point above'
  return `Also exports, as ${from} does: ${repeated.map((item) => linkTo(item.name, seen.get(item.id)!)).join(' · ')}.`
}

function entrySection(entry: EntryDoc, context: PageContext, level: number): string {
  const { pkg, homes, seen } = context
  const isHere = (item: ExportDoc): boolean => {
    const home = homes.get(item.key)
    return !home || home.href.startsWith(`/api/packages/${pkg.slug}#`)
  }

  const repeated = entry.exports.filter((item) => seen.has(item.id))
  const local = entry.exports.filter((item) => !seen.has(item.id) && isHere(item))
  const elsewhere = entry.exports.filter((item) => !seen.has(item.id) && !isHere(item))
  for (const item of local) seen.set(item.id, `#${nextAnchor(context.anchors, item.name)}`)
  for (const item of elsewhere) seen.set(item.id, homes.get(item.key)!.href)

  const parts = [repeatedLine(entry, repeated, pkg.entries.slice(0, pkg.entries.indexOf(entry)), seen)].filter(Boolean)

  const hooks = HOOK_PACKAGES.has(pkg.slug)
  for (const group of GROUP_ORDER) {
    const items = local.filter((item) => item.group === group)
    if (items.length === 0) continue
    const title = group === 'composable' && hooks ? 'Hooks' : GROUP_TITLES[group]
    parts.push(`${'#'.repeat(level)} ${title}`, ...items.map((item) => exportSection(item, level + 1, context.known)))
  }

  if (elsewhere.length > 0) {
    parts.push(
      `${'#'.repeat(level)} Re-exports`,
      'Declared in another package of this repository and documented on its page.',
      reexportList(elsewhere, homes, context.packages),
    )
  }
  return parts.join('\n\n')
}

function packagePage(pkg: PackageDocs, packages: PackageDocs[], homes: Map<string, Home>): string {
  // Links for the "See" lines: what this page exports, by where it is documented, then any
  // type with a section on another page — `interpolate` takes `Params` without re-exporting it.
  const known = new Map<string, string>()
  for (const item of pkg.entries.flatMap((entry) => entry.exports)) {
    const home = homes.get(item.key)
    if (!known.has(item.name))
      known.set(item.name, home && !home.href.startsWith(`/api/packages/${pkg.slug}#`) ? home.href : `#${anchorOf(item.name)}`)
  }
  for (const home of homes.values()) {
    if (!known.has(home.name)) known.set(home.name, home.href)
  }
  const context: PageContext = { pkg, packages, homes, known, seen: new Map(), anchors: new Map() }
  const multi = pkg.entries.length > 1

  const body = multi
    ? pkg.entries.map((entry) => [`## \`${entry.specifier}\``, entrySection(entry, context, 3)].join('\n\n'))
    : pkg.entries.map((entry) => entrySection(entry, context, 2))

  const intro = multi
    ? `Entry points: ${pkg.entries.map((entry) => `\`${entry.specifier}\``).join(', ')}.`
    : ['```ts', `import { … } from '${pkg.name}'`, '```'].join('\n')

  return [
    '---',
    `title: '${pkg.name}'`,
    `description: 'Exported API of ${pkg.name}, generated from the source.'`,
    // The sidebar group is already "Package APIs": drop the scope so long names fit.
    'navigation:',
    `  title: '${pkg.name.replace(/^@i18n-micro\//, '')}'`,
    '---',
    '',
    `# \`${pkg.name}\``,
    '',
    pkg.description,
    '',
    intro,
    '',
    ...body.flatMap((section) => [section, '']),
    '---',
    '',
    'Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.',
    'Back to [all packages](/api/packages) · [Integration guides](/integrations/)',
    '',
  ].join('\n')
}

function packagesIndex(packages: ApiPackage[]): string {
  return packages
    .map((pkg) => {
      const entries =
        pkg.entryPoints.length > 1
          ? ` — also ${pkg.entryPoints
              .slice(1)
              .map((entry) => `\`${entry.specifier}\``)
              .join(', ')}`
          : ''
      return `- [\`${pkg.name}\`](/api/packages/${pkg.slug}) · ${pkg.exportCount} exports${entries}`
    })
    .join('\n')
}

/* ------------------------------------------------------------------------------- CLI */

interface CliArg {
  type: 'string' | 'boolean' | 'positional'
  description: string
  default?: string | boolean
  required?: boolean
  values?: readonly string[]
  defaultHint?: string
}

interface CliCommand {
  description: string
  group: string
  args: Record<string, CliArg>
  examples?: string[]
}

interface CliSpec {
  COMMAND_GROUPS: readonly string[]
  commands: Record<string, CliCommand>
  CHECK_TYPES: readonly string[]
  LINT_RULES: ReadonlyArray<{ name: string; description: string; fixable: boolean }>
  EXIT_CODES: ReadonlyArray<readonly [number, string]>
  CONFIG_FILES: ReadonlyArray<readonly [string, string]>
  ENVIRONMENT: ReadonlyArray<readonly [string, string]>
  REMOVED_COMMANDS: Record<string, string>
}

/** On every command, so the reference states them once. */
const CLI_COMMON_FLAGS = new Set(['cwd', 'logLevel', 'debug'])

function cliDefault(arg: CliArg): string {
  if (arg.defaultHint) return `**Default** ${arg.defaultHint}`
  if (arg.default === undefined || arg.default === '') return ''
  return `**Default** ${inlineCode(String(arg.default))}`
}

const cliDescription = (arg: CliArg): string =>
  arg.values ? `${arg.description}: ${arg.values.map((value) => `\`${value}\``).join(', ')}` : arg.description

const cliFlagFields = (args: [string, CliArg][]): string =>
  fieldGroup(
    args.map(([name, arg]) => ({
      name: arg.type === 'positional' ? `<${name}>` : `--${name}`,
      type: arg.type === 'positional' ? 'string' : arg.type,
      required: arg.required,
      text: [cliDescription(arg), cliDefault(arg)].filter(Boolean).join('\n\n'),
    })),
    { label: 'flags', collapse: false },
  )

function cliCommandBlock(name: string, command: CliCommand): string {
  const flags = Object.entries(command.args).filter(([flag]) => !CLI_COMMON_FLAGS.has(flag))
  const parts = [`### \`${name}\``, '', command.description, '']
  if (flags.length > 0) parts.push(cliFlagFields(flags), '')
  if (command.examples?.length) parts.push('```bash', ...command.examples, '```', '')
  return parts.join('\n').trim()
}

/**
 * The command table of `@i18n-micro/cli`, read from its source.
 *
 * Through a computed path: this package has no dependency on the CLI, and a static import
 * would pull every command's parser into the type-check of the tooling.
 */
export async function cliReference(): Promise<string> {
  const spec = (await import(/* @vite-ignore */ pathToFileURL(join(repoRoot, 'packages/cli/src/spec.ts')).href)) as CliSpec
  const { COMMAND_GROUPS, commands, LINT_RULES, EXIT_CODES, CONFIG_FILES, ENVIRONMENT, REMOVED_COMMANDS } = spec
  const entries = Object.entries(commands)
  const common = entries.flatMap(([, command]) => Object.entries(command.args)).filter(([name]) => CLI_COMMON_FLAGS.has(name))
  const uniqueCommon = [...new Map(common).entries()]

  const groups = COMMAND_GROUPS.map((group) => {
    const members = entries.filter(([, command]) => command.group === group)
    return [`## ${group}`, '', ...members.flatMap(([name, command]) => [cliCommandBlock(name, command), ''])].join('\n').trim()
  })

  const reference: Array<[string, Field[]]> = [
    [
      'Lint rules',
      LINT_RULES.map(({ name, description, fixable }) => ({ name, text: fixable ? `${description}\n\nFixed by \`--fix\`.` : description })),
    ],
    ['Exit codes', EXIT_CODES.map(([exit, meaning]) => ({ name: String(exit), text: meaning }))],
    ['Configuration files', CONFIG_FILES.map(([file, purpose]) => ({ name: file, text: purpose }))],
    ['Environment variables', ENVIRONMENT.map(([name, purpose]) => ({ name, text: purpose }))],
    ['Removed commands', Object.entries(REMOVED_COMMANDS).map(([name, replacement]) => ({ name, text: `Instead: ${replacement}` }))],
  ]
  const blocks = reference.map(([title, fields]) => [`## ${title}`, '', fieldGroup(fields, { collapse: false })].join('\n'))

  return [
    '## Common flags',
    '',
    cliFlagFields(uniqueCommon),
    '',
    ...groups.flatMap((group) => [group, '']),
    ...blocks.flatMap((block) => [block, '']),
  ]
    .join('\n')
    .trim()
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

  return [
    `Measured on \`${budget.app}\` across ${budget.routes.map((route) => `\`${route}\``).join(', ')}:`,
    '',
    table(['Measurement', 'Size'], rows),
    '',
    'The playground is a test bench with generated dictionaries of up to 100k keys, so these are not figures to expect from a real',
    'application — they are a fixed point to measure against. The budget fails when they grow unexpectedly,',
    'which is how an accidental change to what the payload carries gets noticed.',
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
      'injected helpers, the `ModuleOptions` type for the option reference, the command',
      'table of @i18n-micro/cli, and the artifacts `api-surface` and `payload-budget`',
      'already produce.',
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
    const optionsPage = readFileSync(join(repoRoot, 'docs/content/api/module-options.md'), 'utf8')
    // Every top-level option gets a section (its nested keys render inside it): an option
    // with none would be missing from the reference altogether.
    const homeless = options.filter((option) => !option.path.includes('.') && !optionsPage.includes(BLOCK_START(`option:${option.path}`)))
    if (homeless.length > 0) {
      console.error(`docs/content/api/module-options.md has no section for: ${homeless.map((option) => option.path).join(', ')}.`)
      console.error('Add a `### `name`` heading with a generated:option:<name> region to the group it belongs to.')
      process.exit(1)
    }
    inBlock('docs/content/api/module-options.md', 'module-options', optionsIndex(optionGroups(optionsPage)))
    // Any page may give an option a section of its own — the option details on the
    // reference page do for most, the Strategy guide for `strategy` — and each takes its
    // facts from the type.
    const optionPages = ['docs/content/api/module-options.md', 'docs/content/guide/strategy.md']
    for (const page of optionPages) {
      const body = readFileSync(join(repoRoot, page), 'utf8')
      for (const option of options) {
        const id = `option:${option.path}`
        if (body.includes(BLOCK_START(id))) inBlock(page, id, optionFacts(option, options))
      }
    }

    // --- runtime helpers and composables ----------------------------------------------
    const methods = await readInterface('src/runtime/plugins/01.plugin.ts', 'PluginsInjections')
    const methodsPage = readFileSync(join(repoRoot, 'docs/content/api/methods.md'), 'utf8')
    const documented = new Set(methods.filter((method) => methodsPage.includes(BLOCK_START(`method:${method.name}`))).map((method) => method.name))

    inBlock('docs/content/api/methods.md', 'methods-index', methodsIndex(methods, documented))
    for (const name of documented) {
      inBlock('docs/content/api/methods.md', `method:${name}`, symbolBlock(methods.find((method) => method.name === name)!))
    }

    // `$defineI18nRoute` reaches an app through `useNuxtApp()` only, so it is not in
    // `PluginsInjections` — and was the last helper described by hand.
    const appOnly = await readInterface('src/runtime/plugins/01.plugin.ts', 'NuxtAppOnlyInjections')
    for (const symbol of appOnly) {
      const id = `method:${symbol.name}`
      if (methodsPage.includes(BLOCK_START(id))) inBlock('docs/content/api/methods.md', id, symbolBlock(symbol))
    }

    const composables = (await readModules('src/runtime/composables')).flatMap((module) => module.symbols)
    for (const symbol of composables.filter((entry) => entry.name.startsWith('use'))) {
      const page = `docs/content/composables/${symbol.name}.md`
      if (existsSync(join(repoRoot, page))) inBlock(page, `symbol:${symbol.name}`, symbolBlock(symbol))
    }

    // --- components -------------------------------------------------------------------
    const componentsDir = join(repoRoot, 'src/runtime/components')
    if (existsSync(componentsDir)) {
      for (const file of readdirSync(componentsDir).filter((name) => name.endsWith('.vue'))) {
        const tag = file.replace(/\.vue$/, '')
        const page = `docs/content/components/${tag}.md`
        if (!existsSync(join(repoRoot, page))) continue
        // oxlint-disable-next-line no-await-in-loop -- four files, and each compiles an SFC
        inBlock(page, `component:${tag}`, await componentBlock(join(componentsDir, file)))
      }
    }

    // --- packages ---------------------------------------------------------------------
    const packages = readPackages()
    inBlock('docs/content/api/packages.md', 'packages-index', packagesIndex(packages))

    const packagesDir = join(repoRoot, 'docs/content/api/packages')
    const packageDocs = readPackageDocsAll(new Set(packages.map((pkg) => pkg.name)))
    const homes = homesOf(packageDocs)
    for (const pkg of packageDocs) emit(`docs/content/api/packages/${pkg.slug}.md`, packagePage(pkg, packageDocs, homes))

    // A package removed from the workspace must lose its page too — and `--check` has to
    // say so, or a stale page passes CI forever.
    if (existsSync(packagesDir)) {
      const expected = new Set(packages.map((pkg) => `${pkg.slug}.md`))
      for (const file of readdirSync(packagesDir)) {
        if (!file.endsWith('.md') || expected.has(file)) continue
        if (args.check) report.stale.push(`docs/content/api/packages/${file}`)
        else rmSync(join(packagesDir, file))
      }
    }

    // --- CLI ---------------------------------------------------------------------------
    inBlock('docs/content/api/cli.md', 'cli-commands', await cliReference())

    // --- payload budget ---------------------------------------------------------------
    inBlock('docs/content/guide/performance.md', 'payload-budget', budgetTable())

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
