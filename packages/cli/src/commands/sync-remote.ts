import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { deepMergeTranslationsRecursive } from '@i18n-micro/utils/deep-merge'
import { commandFailed, remoteConfigError } from '../errors'
import { readJsonObject, writeJson } from '../fs'
import { type JsonObject, flattenStrings } from '../json'
import { log } from '../log'
import { Project } from '../project'
import { type LocaleTranslations, type RemoteConfig, providers } from '../remote/providers'

export interface SyncRemoteArgs {
  cwd?: string
  translationDir?: string
  pull?: boolean
  push?: boolean
  force?: boolean
  dryRun?: boolean
}

export interface Conflict {
  locale: string
  key: string
  local: string
  remote: string
}

const TOKENLESS = new Set(['custom'])

function loadConfig(rootDir: string): RemoteConfig {
  const path = join(rootDir, '.i18n-remote.json')
  if (!existsSync(path)) {
    throw remoteConfigError('Remote configuration file not found.', [`Create .i18n-remote.json. Providers: ${Object.keys(providers).join(', ')}`], {
      Path: path,
    })
  }
  const config = readJsonObject(path) as unknown as RemoteConfig
  const token = config.token ?? process.env.I18N_REMOTE_TOKEN
  if (!providers[config.type]) throw remoteConfigError(`Unsupported remote type: ${config.type}`, [`Supported: ${Object.keys(providers).join(', ')}`])
  if (!token && !TOKENLESS.has(config.type))
    throw remoteConfigError(`${config.type} remote needs a token.`, ['Set I18N_REMOTE_TOKEN, or "token" in .i18n-remote.json.'])
  return { ...config, token }
}

export function findConflicts(local: LocaleTranslations, remote: LocaleTranslations): Conflict[] {
  const conflicts: Conflict[] = []
  for (const [locale, tree] of Object.entries(remote)) {
    const current = flattenStrings(local[locale] ?? {})
    for (const [key, value] of Object.entries(flattenStrings(tree))) {
      const mine = current[key]
      // An empty local value is a gap to fill, not an opinion.
      if (mine && mine !== value) conflicts.push({ locale, key, local: mine, remote: value })
    }
  }
  return conflicts
}

function applyPull(project: Project, remote: LocaleTranslations, local: LocaleTranslations): { added: string[]; updated: string[] } {
  const added: string[] = []
  const updated: string[] = []

  for (const [code, tree] of Object.entries(remote)) {
    const merged = deepMergeTranslationsRecursive(local[code] ?? {}, tree) as JsonObject
    if (JSON.stringify(merged) === JSON.stringify(local[code] ?? {})) continue
    const known = project.codes.includes(code)
    ;(known ? updated : added).push(code)
    local[code] = merged
    if (known) project.locale(code).replaceTree('global', merged)
    else writeJson(join(project.config.translationDir, `${code}.json`), merged)
  }
  return { added, updated }
}

const reportConflicts = (conflicts: Conflict[]): void => {
  for (const { locale, key, local, remote } of conflicts) log.warn(`Conflict ${locale} ${key}:\n  local:  ${local}\n  remote: ${remote}`)
}

async function pull(args: SyncRemoteArgs, project: Project, config: RemoteConfig, local: LocaleTranslations): Promise<void> {
  const remote = await providers[config.type]!(config).pull()
  const conflicts = findConflicts(local, remote)
  reportConflicts(conflicts)

  if (conflicts.length > 0 && !args.force && !args.dryRun) {
    throw commandFailed('Conflicts found between local and remote translations.', [
      'Resolve them, or rerun with --force to take the remote values.',
      'Preview without writing: i18n-micro sync-remote --dryRun',
    ])
  }
  if (args.dryRun) {
    log.info(`Dry run: ${Object.keys(remote).length} remote locales, ${conflicts.length} conflicts. Nothing was written.`)
    return
  }

  const { added, updated } = applyPull(project, remote, local)
  project.save()
  if (added.length > 0) log.success(`Added ${added.length} new locales: ${added.join(', ')}`)
  log.success(`Updated ${updated.length} locales${updated.length > 0 ? `: ${updated.join(', ')}` : ''}`)
}

async function push(args: SyncRemoteArgs, config: RemoteConfig, local: LocaleTranslations): Promise<void> {
  if (args.dryRun) {
    log.info(`Dry run: would push ${Object.keys(local).join(', ')}. Nothing was sent.`)
    return
  }
  await providers[config.type]!(config).push(local)
  log.success(`Pushed ${Object.keys(local).length} locales.`)
}

export default async function run(args: SyncRemoteArgs): Promise<void> {
  const project = await Project.load(args)
  const config = loadConfig(project.config.rootDir)
  const local: LocaleTranslations = Object.fromEntries(project.codes.map((code) => [code, project.locale(code).global]))

  if (args.pull) await pull(args, project, config, local)
  if (args.push) await push(args, config, local)
}
