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

export const COMMAND_GROUPS = ['Setup and diagnostics', 'Translation workflow', 'Refactoring', 'Import and export', 'Backup and planning'] as const
export type CommandGroup = (typeof COMMAND_GROUPS)[number]

const shared: Record<string, ArgSpec> = {
  cwd: { type: 'string', description: 'Project directory', defaultHint: 'current directory' },
  logLevel: { type: 'string', description: 'Output level', values: ['silent', 'info', 'verbose'], default: 'info' },
}

const translationDir: ArgSpec = {
  type: 'string',
  description: 'Translation directory, relative to the project',
  defaultHint: '`i18n.translationDir` of nuxt.config',
}

const projectArgs: Record<string, ArgSpec> = { ...shared, translationDir }

const json: ArgSpec = { type: 'boolean', description: 'Print JSON instead of text', default: false }

export const commands: Record<string, CommandSpec> = {
  init: {
    group: 'Setup and diagnostics',
    description: 'Create a new Nuxt project wired to nuxt-i18n-micro',
    args: { ...shared, name: { type: 'string', description: 'Project directory name; asked for when omitted' } },
    examples: ['i18n-micro init --name shop'],
    load: () => import('./commands/init'),
  },
  info: {
    group: 'Setup and diagnostics',
    description: 'Print the CLI version, the resolved project configuration and the environment',
    args: { ...shared, json, debug: { type: 'boolean', description: 'Also print process and OS details', default: false } },
    load: () => import('./commands/info'),
  },
  extract: {
    group: 'Translation workflow',
    description: 'Add the translation keys used in source files to the locale files',
    args: projectArgs,
    examples: ['i18n-micro extract', 'i18n-micro extract && i18n-micro sync'],
    load: () => import('./commands/extract'),
  },
  translate: {
    group: 'Translation workflow',
    description: 'Fill missing translations from the default locale through a translation service',
    args: {
      ...projectArgs,
      service: {
        type: 'string',
        description: 'Translation service: ai, azure, baidu, deepl, google, libretranslate, mymemory, papago, systran, tencent, yandexcloud',
      },
      token: { type: 'string', description: 'API key. Prefer the I18N_TRANSLATE_TOKEN environment variable: flags end up in shell history' },
      options: { type: 'string', description: 'Service options as key:value pairs, separated by commas' },
      replace: { type: 'boolean', description: 'Translate every key again, replacing existing values', default: false },
      chunkSize: { type: 'string', description: 'Strings per request; capped at what the service accepts', numeric: 'int' },
      pluralSeparator: { type: 'string', description: 'Separator of plural forms in messages', default: '|' },
      glossaryFile: { type: 'string', description: 'Glossary file, used by the `ai` service' },
    },
    examples: [
      'I18N_TRANSLATE_TOKEN=... i18n-micro translate --service deepl',
      'i18n-micro translate --service ai --options provider:openai,model:gpt-4o-mini',
      'i18n-micro translate --service libretranslate --options baseUrl:https://translate.example.com',
    ],
    load: () => import('./commands/translate'),
  },
  sync: {
    group: 'Translation workflow',
    description: 'Give every locale the key structure of the default locale, removing extra keys',
    args: projectArgs,
    load: () => import('./commands/sync'),
  },
  'sync-remote': {
    group: 'Translation workflow',
    description: 'Pull translations from, or push them to, the remote described in .i18n-remote.json',
    args: {
      ...projectArgs,
      pull: { type: 'boolean', description: 'Pull from the remote', default: true },
      push: { type: 'boolean', description: 'Push to the remote', default: false },
      force: { type: 'boolean', description: 'On a conflict, take the remote value', default: false },
      dryRun: { type: 'boolean', description: 'Report what would change; send and write nothing', default: false },
    },
    examples: ['i18n-micro sync-remote --dryRun', 'i18n-micro sync-remote --no-pull --push'],
    load: () => import('./commands/sync-remote'),
  },
  validate: {
    group: 'Translation workflow',
    description: 'Fail when a locale misses keys of the default locale or has extra ones',
    args: projectArgs,
    load: () => import('./commands/validate'),
  },
  stats: {
    group: 'Translation workflow',
    description: 'Show translation completion per locale',
    args: {
      ...projectArgs,
      full: { type: 'boolean', description: 'Show detailed statistics', default: false },
      html: { type: 'string', description: 'Also write an HTML report to this file' },
      json,
      baseRef: { type: 'string', description: 'Git ref to compare completion with, e.g. HEAD~1 or main' },
    },
    examples: ['i18n-micro stats --baseRef main', 'i18n-micro stats --html reports/i18n.html'],
    load: () => import('./commands/stats'),
  },
  lint: {
    group: 'Translation workflow',
    description: 'Check translation quality; fails when issues remain',
    args: {
      ...projectArgs,
      rules: { type: 'string', description: 'Comma-separated rules to run', defaultHint: 'all, or `enabledRules` of .i18n-lintrc.json' },
      fix: { type: 'boolean', description: 'Fix what can be fixed, keeping a .bak copy of each file', default: false },
      json,
    },
    examples: ['i18n-micro lint --rules no-trailing-spaces,no-empty-translation --fix'],
    load: () => import('./commands/lint'),
  },
  clean: {
    group: 'Translation workflow',
    description: 'Remove keys no source file uses',
    args: {
      ...projectArgs,
      include: { type: 'string', description: 'Regular expression: consider only matching keys for removal' },
      exclude: { type: 'string', description: 'Regular expression: never remove matching keys' },
      dryRun: { type: 'boolean', description: 'List what would be removed; write nothing', default: false },
      force: { type: 'boolean', description: 'Remove keys even though some keys are computed at runtime', default: false },
    },
    examples: ['i18n-micro clean --dryRun', `i18n-micro clean --exclude '^errors\\.'`],
    load: () => import('./commands/clean'),
  },
  search: {
    group: 'Translation workflow',
    description: 'Search keys, values, source usages and hardcoded text across all layers',
    args: {
      ...projectArgs,
      query: { type: 'positional', description: 'Text or key to search for', required: false },
      caseSensitive: { type: 'boolean', description: 'Match case', default: false },
      onlyUnused: { type: 'boolean', description: 'Only keys without source usages', default: false },
      preferUnused: { type: 'boolean', description: 'Rank unused keys first', default: false },
      scope: { type: 'string', description: 'Where to search', values: ['global', 'pages', 'all'], default: 'all' },
      limit: { type: 'string', description: 'Return at most this many keys', numeric: 'int' },
      hardcodedOnly: { type: 'boolean', description: 'Report source text missing from translations; the query becomes optional', default: false },
      onlyVue: { type: 'boolean', description: 'Scan only .vue files', default: false },
      json,
    },
    examples: ['i18n-micro search "Welcome"', 'i18n-micro search --hardcodedOnly --onlyVue'],
    load: () => import('./commands/search'),
  },
  'text-to-i18n': {
    group: 'Refactoring',
    description: 'Replace hardcoded text in templates and code with translation calls',
    args: {
      ...shared,
      translationFile: { type: 'string', description: 'File the new keys go to', defaultHint: '`<translationDir>/<defaultLocale>.json`' },
      path: { type: 'string', description: 'File or directory to process', defaultHint: 'pages, components, plugins, layouts' },
      context: { type: 'string', description: 'Prefix for generated keys' },
      dryRun: { type: 'boolean', description: 'Show what would change; write nothing', default: false },
      verbose: { type: 'boolean', description: 'List every file processed', default: false },
      extractOnlyDirs: { type: 'string', description: 'Comma-separated directories whose files are never rewritten', default: 'plugins' },
      extractOnlyPatterns: { type: 'string', description: 'Comma-separated globs of such files; prefix with ! to exclude' },
      interactive: { type: 'boolean', description: 'Confirm or edit every generated key', default: false },
    },
    examples: ['i18n-micro text-to-i18n --dryRun', 'i18n-micro text-to-i18n --path components --context ui'],
    load: () => import('./commands/text-to-i18n'),
  },
  rename: {
    group: 'Refactoring',
    description: 'Rename a key in every locale, in linked messages and in source files',
    args: {
      ...projectArgs,
      from: { type: 'string', description: 'Current key', required: true },
      to: { type: 'string', description: 'New key', required: true },
      dryRun: { type: 'boolean', description: 'Report the changes; write nothing', default: false },
    },
    examples: ['i18n-micro rename --from common.save --to actions.save'],
    load: () => import('./commands/rename'),
  },
  'replace-values': {
    group: 'Refactoring',
    description: 'Replace text in the values of every locale',
    args: {
      ...projectArgs,
      search: { type: 'string', description: 'Text or regular expression to find', required: true },
      replace: { type: 'string', description: 'Replacement; with --useRegex, $1 is the first group', required: true },
      useRegex: { type: 'boolean', description: 'Treat --search as a regular expression', default: false },
    },
    load: () => import('./commands/replace-values'),
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
  optimize: {
    group: 'Refactoring',
    description: 'Report oversized files, deep nesting and duplicated values',
    args: {
      ...projectArgs,
      minSize: { type: 'string', description: 'Report files above this size in bytes', default: '1024', numeric: 'int' },
      maxDepth: { type: 'string', description: 'Report keys nested deeper than this', default: '3', numeric: 'int' },
      dryRun: { type: 'boolean', description: 'Accepted for compatibility: this command never writes', default: false },
      json,
    },
    load: () => import('./commands/optimize'),
  },
  format: {
    group: 'Refactoring',
    description: 'Rewrite locale files with sorted keys and uniform indentation',
    args: {
      ...projectArgs,
      indent: { type: 'string', description: 'Spaces of indentation', default: '2', numeric: 'int' },
      sortKeys: { type: 'boolean', description: 'Sort keys; use --no-sortKeys to keep their order', default: true },
    },
    load: () => import('./commands/format'),
  },
  split: {
    group: 'Refactoring',
    description: 'Write each locale as smaller files grouped by top-level key, for review or hand-off',
    args: {
      ...projectArgs,
      maxKeys: { type: 'string', description: 'Keys per file before a group is split further', default: '100', numeric: 'int' },
      maxDepth: { type: 'string', description: 'Levels joined into dotted keys', default: '2', numeric: 'int' },
      splitByPrefix: { type: 'boolean', description: 'Flatten keys fully before grouping', default: false },
      outputDir: { type: 'string', description: 'Output directory, relative to the project', defaultHint: '`<translationDir>/split`' },
    },
    load: () => import('./commands/split'),
  },
  export: {
    group: 'Import and export',
    description: 'Export locale files to PO',
    args: { ...projectArgs, potsDir: { type: 'string', description: 'PO directory, relative to the project', default: 'pots' } },
    load: () => import('./commands/export'),
  },
  import: {
    group: 'Import and export',
    description: 'Merge PO files into the locale files',
    args: { ...projectArgs, potsDir: { type: 'string', description: 'PO directory, relative to the project', default: 'pots' } },
    load: () => import('./commands/import'),
  },
  'export-csv': {
    group: 'Import and export',
    description: 'Export every locale to one CSV file, page files included',
    args: { ...projectArgs, csvDir: { type: 'string', description: 'CSV directory, relative to the project', default: 'csv_exports' } },
    load: () => import('./commands/export-csv'),
  },
  'import-csv': {
    group: 'Import and export',
    description: 'Merge CSV files into the locale files',
    args: { ...projectArgs, csvDir: { type: 'string', description: 'CSV directory, relative to the project', default: 'csv_exports' } },
    load: () => import('./commands/import-csv'),
  },
  diff: {
    group: 'Import and export',
    description: 'List keys each locale misses compared with the default locale',
    args: { ...projectArgs, json },
    load: () => import('./commands/diff'),
  },
  'check-duplicates': {
    group: 'Import and export',
    description: 'List identical values under different keys, per locale',
    args: projectArgs,
    load: () => import('./commands/check-duplicates'),
  },
  backup: {
    group: 'Backup and planning',
    description: 'Archive the translation directory',
    args: {
      ...projectArgs,
      backupDir: { type: 'string', description: 'Archive directory, relative to the project', defaultHint: '`<translationDir>/backups`' },
      password: { type: 'string', description: 'Encrypt the archive with AES-256-GCM' },
      comment: { type: 'string', description: 'Added to the archive name' },
    },
    load: () => import('./commands/backup'),
  },
  restore: {
    group: 'Backup and planning',
    description: 'List backups, or restore one over the translation directory',
    args: {
      ...projectArgs,
      backupDir: { type: 'string', description: 'Archive directory, relative to the project', defaultHint: '`<translationDir>/backups`' },
      backup: { type: 'string', description: 'Archive to restore, or the start of its name' },
      password: { type: 'string', description: 'Password of an encrypted archive' },
      force: { type: 'boolean', description: 'Do not ask for confirmation', default: false },
    },
    load: () => import('./commands/restore'),
  },
  estimate: {
    group: 'Backup and planning',
    description: 'Estimate tokens and cost of a translate run',
    args: {
      ...projectArgs,
      replace: { type: 'boolean', description: 'Estimate re-translating every key', default: false },
      inputCostPer1kTokens: { type: 'string', description: 'USD per 1k input tokens', default: '0.5', numeric: 'number' },
      outputCostPer1kTokens: { type: 'string', description: 'USD per 1k output tokens', default: '1.5', numeric: 'number' },
      outputTokenRatio: { type: 'string', description: 'Expected output/input token ratio', default: '1.0', numeric: 'number' },
      json,
    },
    load: () => import('./commands/estimate'),
  },
  glossary: {
    group: 'Backup and planning',
    description: 'Manage the glossary the `ai` translation service follows',
    args: {
      ...shared,
      file: { type: 'string', description: 'Glossary file, relative to the project', default: '.i18n-glossary.json' },
      action: { type: 'string', description: 'What to do', values: ['list', 'add', 'remove'], default: 'list' },
      source: { type: 'string', description: 'Source term' },
      target: { type: 'string', description: 'Target term' },
      from: { type: 'string', description: 'Limit to this source locale' },
      to: { type: 'string', description: 'Limit to this target locale' },
      json,
    },
    examples: ['i18n-micro glossary --action add --source Cart --target Warenkorb --to de'],
    load: () => import('./commands/glossary'),
  },
}
