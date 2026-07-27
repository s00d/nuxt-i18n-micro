import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { parse as parseComponent } from 'vue-docgen-api'
import { indexSnapshot } from '../utils/api-surface'
import { readModuleOptions } from '../utils/module-options'
import { type DocSymbol, readInterface, readModules } from '../utils/typedoc-model'
import { repoRoot } from '../utils/workspace'

const OUT_DIR = 'docs/.data'

export interface DocsDataReport {
  files: { file: string; entries: number }[]
}

/* -------------------------------------------------------------------------- components */

export interface PropDoc {
  name: string
  type: string
  default: string | null
  required: boolean
  description: string
}

export interface SlotDoc {
  name: string
  description: string
  bindings: string[]
}

export interface ComponentDoc {
  /** Tag as written in a template, e.g. `i18n-t`. */
  tag: string
  description: string
  props: PropDoc[]
  slots: SlotDoc[]
  events: { name: string; description: string }[]
}

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

async function readComponents(): Promise<ComponentDoc[]> {
  const dir = join(repoRoot, 'src/runtime/components')
  if (!existsSync(dir)) return []

  const files = readdirSync(dir)
    .filter((file) => file.endsWith('.vue'))
    .sort()

  const docs: ComponentDoc[] = []

  for (const file of files) {
    // Sequential: vue-docgen-api compiles each SFC, and the whole set is four files.
    // oxlint-disable-next-line no-await-in-loop -- see above
    const parsed = await parseComponent(join(dir, file))

    docs.push({
      tag: file.replace(/\.vue$/, ''),
      description: parsed.description ?? '',
      props: (parsed.props ?? []).map((prop) => ({
        name: prop.name,
        type: typeText(prop.type),
        default: prop.defaultValue?.value ?? null,
        required: Boolean(prop.required),
        description: prop.description ?? '',
      })),
      // `slots` and `events` are arrays of descriptors, not name-keyed objects — walking
      // them with Object.entries silently names every slot after its index.
      slots: (parsed.slots ?? []).map((slot) => ({
        name: slot.name,
        description: slot.description ?? '',
        bindings: (slot.bindings ?? []).map((binding) => binding.name).filter((binding): binding is string => Boolean(binding)),
      })),
      events: (parsed.events ?? []).map((event) => ({ name: event.name, description: event.description ?? '' })),
    })
  }

  return docs
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
  const index = indexSnapshot(text)
  const bySubpath = new Map<string, Map<string, ApiExport>>()

  // Members arrive as `Owner.member`; fold them under the export they belong to so a
  // class is one entry with its methods rather than thirty siblings.
  for (const [key, value] of [...index].sort(([a], [b]) => a.localeCompare(b))) {
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

/* ------------------------------------------------------------------------------- budget */

function readBudget(): unknown {
  const file = join(repoRoot, 'scripts/payload-budget.json')
  if (!existsSync(file)) return null

  const budget = JSON.parse(readFileSync(file, 'utf8')) as { app: string; routes: string[]; observed?: Record<string, number> }
  const observed = budget.observed ?? {}

  const rows = [
    ['Translation sources on disk', observed.sourceDictionary],
    ['Served as separate payload files', observed.payloadFiles],
    ['Largest inline __NUXT_DATA__', observed.maxNuxtData],
    ['Client assets', observed.clientAssets],
  ]
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .map(([label, bytes]) => ({ label, bytes }))

  const ratio = observed.sourceDictionary && observed.maxNuxtData ? Math.round(observed.sourceDictionary / observed.maxNuxtData) : null
  return { app: budget.app, routes: budget.routes, rows, ratio }
}

export const docsDataCommand = defineCommand({
  meta: {
    name: 'docs-data',
    description: [
      'Collect everything the documentation reads from the code into `docs/.data/`.',
      '',
      'The documentation pages load these files and nothing else, so `docs/` never imports',
      'from the tooling package and a docs build needs no compiler, no TypeDoc and no',
      'vue-docgen-api of its own.',
      '',
      'Sources: vue-docgen-api for the components, TypeDoc for the composables and the',
      'injected helpers, the `ModuleOptions` type for the option reference, and the',
      'artifacts `api-surface` and `payload-budget` already produce.',
      '',
      'Examples:',
      '  pnpm -C scripts cli docs-data',
      '  pnpm -C scripts cli docs-data --check',
    ].join('\n'),
  },
  args: {
    check: { type: 'boolean', default: false, description: 'Fail when a file would change instead of writing it' },
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
  },
  async setup({ args }) {
    const outDir = join(repoRoot, OUT_DIR)
    mkdirSync(outDir, { recursive: true })

    const composables = await readModules('src/runtime/composables')
    const methods: DocSymbol[] = await readInterface('src/runtime/plugins/01.plugin.ts', 'PluginsInjections')

    const datasets: { name: string; value: unknown; entries: number }[] = [
      { name: 'components', value: await readComponents(), entries: 0 },
      { name: 'composables', value: composables, entries: composables.length },
      { name: 'methods', value: methods, entries: methods.length },
      { name: 'module-options', value: readModuleOptions(), entries: readModuleOptions().length },
      { name: 'packages', value: readPackages(), entries: readPackages().length },
      { name: 'payload-budget', value: readBudget(), entries: 1 },
    ]

    const report: DocsDataReport = { files: [] }
    const stale: string[] = []

    for (const dataset of datasets) {
      const file = join(outDir, `${dataset.name}.json`)
      const next = `${JSON.stringify(dataset.value, null, 2)}\n`
      const entries = Array.isArray(dataset.value) ? dataset.value.length : dataset.entries

      report.files.push({ file: `${OUT_DIR}/${dataset.name}.json`, entries })

      if (args.check) {
        if (!existsSync(file) || readFileSync(file, 'utf8') !== next) stale.push(`${OUT_DIR}/${dataset.name}.json`)
        continue
      }
      writeFileSync(file, next)
    }

    if (args.json) {
      console.log(JSON.stringify({ ...report, stale }, null, 2))
    } else if (args.check) {
      for (const file of stale) console.log(`  x ${file} is out of date`)
      console.log(
        stale.length === 0 ? `All ${report.files.length} data file(s) are up to date.` : '\nRun `pnpm run docs:data` and commit the result.',
      )
    } else {
      for (const entry of report.files) console.log(`  ${String(entry.entries).padStart(4)}  ${entry.file}`)
    }

    if (args.check && stale.length > 0) process.exit(1)
  },
})
