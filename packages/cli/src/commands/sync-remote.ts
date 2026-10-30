import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { findingsError, remoteConfigError } from '../errors'
import { readJsonObject } from '../fs'
import { type RequestOptions, jsonBody, requestJson } from '../http'
import { type JsonObject, type JsonValue, flatten, isObject, pathConflict, setPath } from '../json'
import { addSecret, log } from '../log'
import { Project } from '../project'

export interface SyncRemoteArgs {
  cwd?: string
  translationDir?: string
  pull?: boolean
  push?: boolean
  force?: boolean
  dryRun?: boolean
}

export interface RemoteConfig {
  type?: string
  url?: string
  path?: string
  token?: string
  auth?: { username?: string; password?: string }
}

export type LocaleTranslations = Record<string, JsonObject>

function loadConfig(rootDir: string): RemoteConfig {
  const path = join(rootDir, '.i18n-remote.json')
  if (!existsSync(path))
    throw remoteConfigError('Remote configuration file not found.', ['Create .i18n-remote.json with the url of your endpoint.'], { Path: path })
  const config = readJsonObject(path, { private: true }) as unknown as RemoteConfig
  if (config.type && config.type !== 'custom') {
    throw remoteConfigError(`Remote type "${config.type}" was removed: only an HTTP endpoint of your own is supported.`, [
      'For a translation platform, use its own CLI: see https://s00d.github.io/nuxt-i18n-micro/guide/crowdin',
    ])
  }
  if (!config.url) throw remoteConfigError('.i18n-remote.json needs "url".')
  const token = config.token ?? process.env.I18N_REMOTE_TOKEN
  addSecret(token)
  addSecret(config.auth?.password)
  return { ...config, token }
}

function requestOptions(config: RemoteConfig): RequestOptions {
  const { username, password } = config.auth ?? {}
  const basic = username ? `Basic ${Buffer.from(`${username}:${password ?? ''}`).toString('base64')}` : undefined
  const authorization = basic ?? (config.token ? `Bearer ${config.token}` : undefined)
  addSecret(authorization)
  return { headers: authorization ? { Authorization: authorization } : {} }
}

const remoteUrl = (config: RemoteConfig): string => `${config.url!.replace(/\/+$/, '')}/${(config.path ?? 'translations').replace(/^\/+/, '')}`

interface PullPlan {
  added: string[]
  updated: string[]
  conflicts: string[]
  apply: Array<[code: string, key: string, value: JsonValue]>
}

function planLocale(project: Project, code: string, tree: JsonObject, force: boolean, plan: PullPlan): void {
  const local = project.locale(code)
  // Planned writes count: a remote can conflict with itself, `{ "x": .., "x.y": .. }`.
  const planned = structuredClone(local.global)
  const apply = (key: string, value: JsonValue): void => {
    setPath(planned, key, value)
    plan.apply.push([code, key, value])
  }
  for (const [key, value] of Object.entries(flatten(tree))) {
    const mine = local.get(key)
    const label = `${code} ${key}`
    const blocker = pathConflict(planned, key)
    // A remote blank says nothing; a blocked path would cost a value or a whole subtree, --force or not.
    if (value === '' || JSON.stringify(mine) === JSON.stringify(value)) continue
    if (blocker) {
      plan.conflicts.push(`${label}: ${blocker} already holds a value`)
    } else if (mine === undefined || mine === '') {
      plan.added.push(label)
      apply(key, value)
    } else if (force) {
      plan.updated.push(label)
      apply(key, value)
    } else {
      plan.conflicts.push(`${label}\n    local:  ${JSON.stringify(mine)}\n    remote: ${JSON.stringify(value)}`)
    }
  }
}

export function planPull(project: Project, remote: LocaleTranslations, force: boolean): PullPlan {
  const plan: PullPlan = { added: [], updated: [], conflicts: [], apply: [] }
  for (const [code, tree] of Object.entries(remote)) {
    if (!project.codes.includes(code) || !isObject(tree)) {
      log.warn(`Skipping remote locale ${code}: not a configured locale.`)
      continue
    }
    planLocale(project, code, tree, force, plan)
  }
  return plan
}

async function pull(args: SyncRemoteArgs, project: Project, config: RemoteConfig): Promise<void> {
  const remote = await requestJson<unknown>(remoteUrl(config), requestOptions(config))
  if (!isObject(remote)) throw remoteConfigError('Invalid response from the remote: expected an object of locales.')
  const plan = planPull(project, remote as LocaleTranslations, Boolean(args.force))

  log.list('New', plan.added)
  log.list('Replaced', plan.updated)
  log.list('Conflicts', plan.conflicts)
  if (args.dryRun) {
    log.info(`Dry run: ${plan.added.length} new, ${plan.updated.length} replaced, ${plan.conflicts.length} conflicts. Nothing was written.`)
    return
  }

  // A pull lands whole or not at all: half a release's strings is worse than none.
  if (plan.conflicts.length > 0) {
    throw findingsError('Conflicts found between local and remote translations. Nothing was written.', [
      'Resolve them, or rerun with --force to take the remote values.',
      'Preview without writing: i18n-micro sync-remote --dryRun',
    ])
  }
  for (const [code, key, value] of plan.apply) project.locale(code).set(key, value)
  project.save()
  log.success(`Pulled ${plan.added.length} new and ${plan.updated.length} replaced values.`)
}

/** A blank local value is a gap, not a text: pushed, it could clear what a translator wrote. */
function withoutBlanks(tree: JsonObject): JsonObject {
  const entries = Object.entries(tree).flatMap(([key, value]): Array<[string, JsonValue]> => {
    if (value === '') return []
    return [[key, isObject(value) ? withoutBlanks(value) : value]]
  })
  return Object.fromEntries(entries)
}

async function push(args: SyncRemoteArgs, project: Project, config: RemoteConfig): Promise<void> {
  if (args.dryRun) {
    log.info(`Dry run: would push ${project.codes.join(', ')}. Nothing was sent.`)
    return
  }
  const body = Object.fromEntries(project.codes.map((code) => [code, withoutBlanks(project.locale(code).global)]))
  const options = requestOptions(config)
  await requestJson(remoteUrl(config), {
    ...options,
    method: 'PUT',
    ...jsonBody(body),
    headers: { ...options.headers, 'Content-Type': 'application/json' },
  })
  log.success(`Pushed ${project.codes.length} locales.`)
}

export default async function run(args: SyncRemoteArgs): Promise<void> {
  const project = await Project.load(args)
  const config = loadConfig(project.config.rootDir)
  const pages = project.reference.pageScopes.length
  if (pages > 0) log.warn(`Global files only: ${pages} page scopes are not exchanged.`)

  if (args.pull) await pull(args, project, config)
  if (args.push) await push(args, project, config)
}
