/**
 * The command table: one source of truth for parsing, `--help` and the generated
 * [command reference](https://s00d.github.io/nuxt-i18n-micro/api/cli).
 *
 * This file imports nothing, and handlers load on demand, so `--help` stays instant and the
 * docs generator can read the table without pulling in parsers or vendor drivers.
 */

export interface ArgSpec {
  type: 'string' | 'boolean' | 'positional'
  description: string
  default?: string | boolean
  required?: boolean
  alias?: string
  /** Accepted values: anything else is a usage error. */
  values?: readonly string[]
  /** Parsed to a number and checked to be positive. */
  numeric?: 'int' | 'number'
  /** Shown in the docs where a computed default has no literal value. */
  defaultHint?: string
}

export type CommandHandler = (args: never) => Promise<void>

export interface CommandSpec {
  description: string
  group: CommandGroup
  args: Record<string, ArgSpec>
  examples?: string[]
  load: () => Promise<{ default: CommandHandler }>
}

export const COMMAND_GROUPS = ['Inspect', 'Translation workflow', 'Refactoring', 'Exchange'] as const
export type CommandGroup = (typeof COMMAND_GROUPS)[number]

/** Translation services of `translate`. A test keeps this equal to the drivers. */
export const SERVICES = ['ai', 'azure', 'deepl', 'google', 'libretranslate', 'yandexcloud'] as const

/** What `check` looks for. `duplicates` is off by default: the same word under two keys is often fine. */
export const CHECK_TYPES = ['missing', 'empty', 'extra', 'placeholders', 'undefined', 'unused', 'duplicates'] as const
export type CheckType = (typeof CHECK_TYPES)[number]

export const LINT_RULES = [
  { name: 'no-trailing-spaces', description: 'Spaces at the end of a value or a line', fixable: true },
  { name: 'no-multiple-spaces', description: 'Two or more spaces in a row', fixable: true },
  { name: 'no-empty-translation', description: 'An empty or blank value', fixable: false },
] as const
export type LintRuleName = (typeof LINT_RULES)[number]['name']

export const EXIT_CODES: ReadonlyArray<readonly [code: number, meaning: string]> = [
  [0, 'Done, nothing to report'],
  [
    1,
    'Findings: `check`, `lint` or `format --check` found something, `clean` or `sync` could not prove a removal safe, `export` would overwrite unimported work, `translate` left keys out, `import` or `sync-remote` met a conflict',
  ],
  [2, 'Failure: bad usage, unreadable project, network or file error'],
]

export const CONFIG_FILES: ReadonlyArray<readonly [file: string, purpose: string]> = [
  ['.i18n-lintrc.json', '`lint`: `enabledRules`, `disabledRules`, `customRegexRules` (`name`, `pattern`, `flags`, `description`, `replacement`)'],
  ['.i18n-remote.json', '`sync-remote`: `url`, `path`, `token`, `auth` (`username`, `password`). `type` may be left out; only `custom` exists'],
  ['.i18n-glossary.json', '`translate --service ai`: `entries` of `source`, `target`, and optional `from`, `to`'],
]

export const ENVIRONMENT: ReadonlyArray<readonly [name: string, purpose: string]> = [
  ['I18N_TRANSLATE_TOKEN', 'API key of `translate`. Read from `.env` too'],
  ['I18N_REMOTE_TOKEN', 'Bearer token of `sync-remote`. Read from `.env` too'],
  ['AI_GATEWAY_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY', 'Key of the `ai` service, when `I18N_TRANSLATE_TOKEN` is not set'],
  ['DEFAULT_LOCALE', 'Overrides `defaultLocale`, as in the module'],
]

/** Commands that went away, and what to run instead. */
export const REMOVED_COMMANDS: Record<string, string> = {
  validate: 'check',
  diff: 'check --only missing',
  'check-duplicates': 'check --only duplicates',
  'export-csv': 'export --format csv',
  'import-csv': 'import --format csv',
  estimate: 'translate --dryRun',
  optimize: 'check --only duplicates',
  backup: 'git, which already keeps your locale files',
  restore: 'git, which already keeps your locale files',
  init: 'nuxi init, then add nuxt-i18n-micro to modules',
  split: 'nothing: the module does not read split files',
  'replace-values': 'your editor or sed',
  glossary: 'editing .i18n-glossary.json by hand',
}

const shared: Record<string, ArgSpec> = {
  cwd: { type: 'string', description: 'Project directory', defaultHint: 'current directory' },
  logLevel: { type: 'string', description: 'Output level', values: ['silent', 'info'], default: 'info' },
  debug: { type: 'boolean', description: 'Print a stack trace when a command fails', default: false },
}

const translationDir: ArgSpec = {
  type: 'string',
  description: 'Translation directory, relative to the project',
  defaultHint: '`i18n.translationDir` of nuxt.config',
}

const projectArgs: Record<string, ArgSpec> = { ...shared, translationDir }

const json: ArgSpec = { type: 'boolean', description: 'Print JSON instead of text', default: false }

const ignore: ArgSpec = { type: 'string', description: 'Comma-separated globs of source files to skip, relative to the project' }

export const commands: Record<string, CommandSpec> = {
  info: {
    group: 'Inspect',
    description: 'Print the resolved i18n configuration of the project',
    args: { ...shared, json },
    load: () => import('./commands/info'),
  },
  check: {
    group: 'Inspect',
    description: 'The CI gate: fail on missing, empty, extra, undefined or unused keys and broken placeholders',
    args: {
      ...projectArgs,
      only: {
        type: 'string',
        description: `Comma-separated checks to run: ${CHECK_TYPES.join(', ')}. \`unused\` named here fails when it cannot run`,
        defaultHint: 'all but duplicates',
      },
      duplicates: { type: 'boolean', description: 'Also report the same text under different keys', default: false },
      ignore,
      json,
    },
    examples: ['i18n-micro check', 'i18n-micro check --only missing,placeholders --json'],
    load: () => import('./commands/check'),
  },
  stats: {
    group: 'Inspect',
    description: 'Show translation completion per locale',
    args: {
      ...projectArgs,
      html: { type: 'string', description: 'Also write an HTML report to this file' },
      json,
      baseRef: { type: 'string', description: 'Git ref to compare completion with, e.g. HEAD~1 or main' },
    },
    examples: ['i18n-micro stats --baseRef main', 'i18n-micro stats --html reports/i18n.html'],
    load: () => import('./commands/stats'),
  },
  lint: {
    group: 'Inspect',
    description: 'Check the text of translations; fails when issues remain',
    args: {
      ...projectArgs,
      rules: {
        type: 'string',
        description: `Comma-separated rules to run: ${LINT_RULES.map((rule) => rule.name).join(', ')}, or a custom one`,
        defaultHint: 'all, or `enabledRules` of .i18n-lintrc.json',
      },
      fix: { type: 'boolean', description: 'Fix what can be fixed: spaces, and custom rules with a replacement', default: false },
      json,
    },
    examples: ['i18n-micro lint --rules no-trailing-spaces --fix'],
    load: () => import('./commands/lint'),
  },
  search: {
    group: 'Inspect',
    description: 'Search keys and values, and show where each key is used',
    args: {
      ...projectArgs,
      query: { type: 'positional', description: 'Text or key to search for', required: false },
      caseSensitive: { type: 'boolean', description: 'Match case', default: false },
      onlyUnused: { type: 'boolean', description: 'Only keys `clean` would remove; the query becomes optional', default: false },
      scope: { type: 'string', description: 'Where to search', values: ['global', 'pages', 'all'], default: 'all' },
      limit: { type: 'string', description: 'Return at most this many keys', numeric: 'int' },
      ignore,
      json,
    },
    examples: ['i18n-micro search "Welcome"', 'i18n-micro search --onlyUnused'],
    load: () => import('./commands/search'),
  },
  extract: {
    group: 'Translation workflow',
    description: 'List the keys source files use that have no text yet, and add those with a default text to the default locale',
    args: { ...projectArgs, ignore },
    examples: ['i18n-micro extract'],
    load: () => import('./commands/extract'),
  },
  translate: {
    group: 'Translation workflow',
    description: 'Fill missing translations from the default locale through a translation service',
    args: {
      ...projectArgs,
      service: { type: 'string', description: `Translation service: ${SERVICES.join(', ')}` },
      token: { type: 'string', description: 'API key. Prefer the I18N_TRANSLATE_TOKEN environment variable: flags end up in shell history' },
      options: { type: 'string', description: 'Service options as key:value pairs, separated by commas' },
      locale: { type: 'string', description: 'Comma-separated locales to fill', defaultHint: 'every locale but the default one' },
      replace: { type: 'boolean', description: 'Translate every key again, replacing existing values', default: false },
      dryRun: { type: 'boolean', description: 'Count keys and characters per locale; send nothing', default: false },
      chunkSize: { type: 'string', description: 'Strings per request; capped at what the service accepts', numeric: 'int' },
      pluralSeparator: { type: 'string', description: 'Separator of plural forms in messages', default: '|' },
      glossaryFile: { type: 'string', description: 'Glossary file, used by the `ai` service', defaultHint: '`.i18n-glossary.json` when it exists' },
    },
    examples: [
      'i18n-micro translate --dryRun',
      'I18N_TRANSLATE_TOKEN=... i18n-micro translate --service deepl --locale de,fr',
      'i18n-micro translate --service ai --options provider:openai,model:gpt-4o-mini',
      'i18n-micro translate --service libretranslate --options baseUrl:https://translate.example.com',
    ],
    load: () => import('./commands/translate'),
  },
  sync: {
    group: 'Translation workflow',
    description: 'Remove keys the default locale does not have; stops when that cannot be proven safe. Missing keys stay missing',
    args: {
      ...projectArgs,
      ignore,
      dryRun: { type: 'boolean', description: 'List what would be removed; write nothing', default: false },
      force: { type: 'boolean', description: 'Remove keys even though it cannot be proven safe', default: false },
    },
    examples: ['i18n-micro sync --dryRun'],
    load: () => import('./commands/sync'),
  },
  clean: {
    group: 'Translation workflow',
    description: 'Remove keys nothing in the project uses; stops when that cannot be proven',
    args: {
      ...projectArgs,
      include: { type: 'string', description: 'Regular expression: consider only matching keys for removal' },
      exclude: { type: 'string', description: 'Regular expression: never remove matching keys' },
      ignore,
      dryRun: { type: 'boolean', description: 'List what would be removed; write nothing', default: false },
      force: { type: 'boolean', description: 'Remove keys even though usage cannot be proven for all of them', default: false },
    },
    examples: ['i18n-micro clean --dryRun', `i18n-micro clean --exclude '^errors\\.'`],
    load: () => import('./commands/clean'),
  },
  'text-to-i18n': {
    group: 'Refactoring',
    description: 'Replace hardcoded text in Vue templates with translation calls, and report hardcoded text in code',
    args: {
      ...shared,
      translationFile: { type: 'string', description: 'File the new keys go to', defaultHint: '`<translationDir>/<defaultLocale>.json`' },
      path: { type: 'string', description: 'File or directory to process', defaultHint: 'the whole project' },
      context: { type: 'string', description: 'Prefix for generated keys' },
      ignore,
      dryRun: { type: 'boolean', description: 'Show what would change; write nothing', default: false },
      interactive: { type: 'boolean', description: 'Confirm or edit every generated key', default: false },
    },
    examples: ['i18n-micro text-to-i18n --dryRun', 'i18n-micro text-to-i18n --path components --context ui'],
    load: () => import('./commands/text-to-i18n'),
  },
  rename: {
    group: 'Refactoring',
    description: 'Rename a key or a namespace in every locale and in source files',
    args: {
      ...projectArgs,
      from: { type: 'string', description: 'Current key or namespace', required: true },
      to: { type: 'string', description: 'New key or namespace', required: true },
      ignore,
      dryRun: { type: 'boolean', description: 'Report the changes; write nothing', default: false },
    },
    examples: ['i18n-micro rename --from common.save --to actions.save'],
    load: () => import('./commands/rename'),
  },
  pseudo: {
    group: 'Refactoring',
    description: 'Fill a locale with pseudo-translations to find layout and hardcoded-text issues',
    args: {
      ...projectArgs,
      sourceLocale: { type: 'string', description: 'Locale to read', defaultHint: 'the default locale' },
      targetLocale: { type: 'string', description: 'Locale to fill', required: true },
      replace: { type: 'boolean', description: 'Overwrite existing values', default: false },
    },
    load: () => import('./commands/pseudo'),
  },
  format: {
    group: 'Refactoring',
    description: 'Rewrite locale files with sorted keys and uniform indentation',
    args: {
      ...projectArgs,
      indent: { type: 'string', description: 'Spaces of indentation', default: '2', numeric: 'int' },
      sortKeys: { type: 'boolean', description: 'Sort keys; use --no-sortKeys to keep their order', default: true },
      check: { type: 'boolean', description: 'Fail if a file would change; write nothing', default: false },
    },
    examples: ['i18n-micro format --check'],
    load: () => import('./commands/format'),
  },
  export: {
    group: 'Exchange',
    description: 'Export locale files to PO or CSV, with the default-locale text as the source',
    args: {
      ...projectArgs,
      format: { type: 'string', description: 'File format', values: ['po', 'csv'], default: 'po' },
      dir: { type: 'string', description: 'Output directory, relative to the project', defaultHint: '`pots` for po, `csv_exports` for csv' },
      force: { type: 'boolean', description: 'Overwrite files changed since the last export and never imported', default: false },
    },
    examples: ['i18n-micro export --format csv'],
    load: () => import('./commands/export'),
  },
  import: {
    group: 'Exchange',
    description: 'Merge PO or CSV files into the locale files',
    args: {
      ...projectArgs,
      format: { type: 'string', description: 'File format', values: ['po', 'csv'], default: 'po' },
      dir: { type: 'string', description: 'Input directory, relative to the project', defaultHint: '`pots` for po, `csv_exports` for csv' },
      dryRun: { type: 'boolean', description: 'Report what would be imported; write nothing', default: false },
    },
    examples: ['i18n-micro import --format csv --dryRun'],
    load: () => import('./commands/import'),
  },
  'sync-remote': {
    group: 'Exchange',
    description: 'Pull global translations from, or push them to, the HTTP endpoint in .i18n-remote.json',
    args: {
      ...projectArgs,
      pull: { type: 'boolean', description: 'Pull from the remote', default: true },
      push: { type: 'boolean', description: 'Push to the remote', default: false },
      force: { type: 'boolean', description: 'On a conflict, take the remote value', default: false },
      dryRun: { type: 'boolean', description: 'Report what a pull would change; write and push nothing', default: false },
    },
    examples: ['i18n-micro sync-remote --dryRun', 'i18n-micro sync-remote --no-pull --push'],
    load: () => import('./commands/sync-remote'),
  },
}
