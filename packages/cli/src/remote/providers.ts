import { remoteConfigError } from '../errors'
import { type RequestOptions, jsonBody, request, requestJson } from '../http'
import { type JsonObject, isObject } from '../json'
import { readZip } from '../zip'

export type LocaleTranslations = Record<string, JsonObject>

export interface RemoteConfig {
  type: string
  /** Repository, server or API root. Optional for services with one public host. */
  url?: string
  /** API root override, for self-hosted servers. */
  apiUrl?: string
  branch?: string
  token?: string
  path?: string
  projectId?: string
  /** Weblate component slug. */
  component?: string
  /** Crowdin source file id; defaults to the project's only or first JSON file. */
  fileId?: number
  languageMapping?: Record<string, string>
  pollIntervalMs?: number
  pollMaxAttempts?: number
  auth?: { username?: string; password?: string }
}

export interface RemoteProvider {
  pull(): Promise<LocaleTranslations>
  push(translations: LocaleTranslations): Promise<void>
}

const trim = (url: string): string => url.replace(/\/+$/, '')

const toRemote = (locale: string, config: RemoteConfig): string => config.languageMapping?.[locale] ?? locale

function toLocal(remote: string, config: RemoteConfig): string {
  return Object.entries(config.languageMapping ?? {}).find(([, value]) => value === remote)?.[0] ?? remote
}

function requireField(value: string | undefined, type: string, field: string): string {
  if (!value) throw remoteConfigError(`${type} remote requires "${field}" in .i18n-remote.json`)
  return value
}

const parseObject = (text: string, source: string): JsonObject => {
  const parsed = JSON.parse(text) as unknown
  if (!isObject(parsed)) throw remoteConfigError(`Expected a JSON object from ${source}`)
  return parsed
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

async function poll<T>(check: () => Promise<T>, done: (value: T) => boolean, config: RemoteConfig): Promise<T> {
  const attempts = config.pollMaxAttempts ?? 80
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    // oxlint-disable-next-line no-await-in-loop -- polling is sequential by nature
    const value = await check()
    if (done(value)) return value
    // oxlint-disable-next-line no-await-in-loop -- see above
    await sleep(config.pollIntervalMs ?? 1500)
  }
  throw remoteConfigError('Remote process polling timed out')
}

const localesFromZip = (zip: Buffer, config: RemoteConfig): LocaleTranslations => {
  const out: LocaleTranslations = {}
  for (const { name, data } of readZip(zip)) {
    const file = name.split('/').pop() ?? ''
    if (file.endsWith('.json')) out[toLocal(file.slice(0, -5), config)] = parseObject(data.toString('utf8'), name)
  }
  return out
}

/* ------------------------------------------------------------------------------ github */

function github(config: RemoteConfig): RemoteProvider {
  const url = new URL(requireField(config.url, 'github', 'url'))
  const [owner, repo] = url.pathname.split('/').filter(Boolean)
  if (!owner || !repo) throw remoteConfigError('Invalid GitHub repository URL')
  const api = config.apiUrl ? trim(config.apiUrl) : url.hostname === 'github.com' ? 'https://api.github.com' : `${url.origin}/api/v3`
  const branch = config.branch ?? 'main'
  const folder = config.path ?? 'translations'
  const headers = { Authorization: `Bearer ${config.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  const contents = (path: string): string => `${api}/repos/${owner}/${repo}/contents/${path}`
  const ref = `?ref=${encodeURIComponent(branch)}`

  return {
    async pull() {
      const listing = await requestJson<Array<{ type: string; name: string; path: string }>>(`${contents(folder)}${ref}`, { headers })
      const out: LocaleTranslations = {}
      for (const file of listing) {
        if (file.type !== 'file' || !file.name.endsWith('.json')) continue
        // The raw media type: base64 `content` is empty for files over 1 MB.
        // oxlint-disable-next-line no-await-in-loop -- few files, and GitHub penalizes concurrent requests
        const response = await request(`${contents(file.path)}${ref}`, { headers: { ...headers, Accept: 'application/vnd.github.raw+json' } })
        // oxlint-disable-next-line no-await-in-loop -- see above
        out[toLocal(file.name.slice(0, -5), config)] = parseObject(await response.text(), file.path)
      }
      return out
    },
    async push(translations) {
      for (const [locale, content] of Object.entries(translations)) {
        const remote = toRemote(locale, config)
        const path = `${folder}/${remote}.json`
        // oxlint-disable-next-line no-await-in-loop -- commits to one branch must be sequential
        const sha = await existingSha(contents(path), ref, headers)
        // oxlint-disable-next-line no-await-in-loop -- see above
        await requestJson(contents(path), {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Update ${remote}.json translations`,
            content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString('base64'),
            branch,
            sha,
          }),
        })
      }
    },
  }
}

/** Only a 404 means "new file": a 401 read as one would surface later as a confusing write error. */
async function existingSha(url: string, ref: string, headers: Record<string, string>): Promise<string | undefined> {
  const response = await fetch(`${url}${ref}`, { headers, signal: AbortSignal.timeout(30_000) })
  if (response.status === 404) return undefined
  if (!response.ok) throw remoteConfigError(`GitHub answered ${response.status} reading ${url}`)
  return ((await response.json()) as { sha?: string }).sha
}

/* ------------------------------------------------------------------------------ gitlab */

function gitlab(config: RemoteConfig): RemoteProvider {
  const url = new URL(requireField(config.url, 'gitlab', 'url'))
  const project = encodeURIComponent(url.pathname.replace(/^\/+|\/+$/g, ''))
  if (!project) throw remoteConfigError('Invalid GitLab project URL')
  const api = `${config.apiUrl ? trim(config.apiUrl) : url.origin}/api/v4/projects/${project}/repository`
  const branch = config.branch ?? 'main'
  const folder = config.path ?? 'translations'
  const headers = { 'PRIVATE-TOKEN': config.token ?? '' }
  const fileUrl = (path: string): string => `${api}/files/${encodeURIComponent(path)}`

  return {
    async pull() {
      const query = new URLSearchParams({ path: folder, ref: branch, per_page: '100' })
      const tree = await requestJson<Array<{ type: string; path: string; name: string }>>(`${api}/tree?${query}`, { headers })
      const out: LocaleTranslations = {}
      for (const item of tree) {
        if (item.type !== 'blob' || !item.name.endsWith('.json')) continue
        // oxlint-disable-next-line no-await-in-loop -- a handful of locale files
        const response = await request(`${fileUrl(item.path)}/raw?ref=${encodeURIComponent(branch)}`, { headers })
        // oxlint-disable-next-line no-await-in-loop -- see above
        out[toLocal(item.name.slice(0, -5), config)] = parseObject(await response.text(), item.path)
      }
      return out
    },
    async push(translations) {
      for (const [locale, content] of Object.entries(translations)) {
        const remote = toRemote(locale, config)
        const path = fileUrl(`${folder}/${remote}.json`)
        // oxlint-disable-next-line no-await-in-loop -- commits to one branch must be sequential
        const head = await fetch(`${path}?ref=${encodeURIComponent(branch)}`, { method: 'HEAD', headers, signal: AbortSignal.timeout(30_000) })
        if (!head.ok && head.status !== 404) throw remoteConfigError(`GitLab answered ${head.status} reading ${path}`)
        const body = jsonBody({ branch, content: `${JSON.stringify(content, null, 2)}\n`, commit_message: `Update ${remote}.json translations` })
        // oxlint-disable-next-line no-await-in-loop -- see above
        await requestJson(path, { method: head.ok ? 'PUT' : 'POST', body: body.body, headers: { ...headers, ...body.headers } })
      }
    },
  }
}

/* ---------------------------------------------------------------------------- lokalise */

interface LokaliseProcess {
  process: { process_id: string; status: string; message?: string; details?: { download_url?: string } }
}

const LOKALISE_DONE = new Set(['finished', 'failed', 'cancelled'])

function lokalise(config: RemoteConfig): RemoteProvider {
  const project = requireField(config.projectId ?? config.path, 'lokalise', 'projectId')
  const api = `${trim(config.apiUrl ?? 'https://api.lokalise.com/api2')}/projects/${project}`
  const headers = { 'X-Api-Token': config.token ?? '' }
  const post = <T>(path: string, value: unknown): Promise<T> => {
    const body = jsonBody(value)
    return requestJson<T>(`${api}${path}`, { method: 'POST', body: body.body, headers: { ...headers, ...body.headers } })
  }
  const finish = (id: string): Promise<LokaliseProcess> =>
    poll(
      () => requestJson<LokaliseProcess>(`${api}/processes/${id}`, { headers }),
      ({ process }) => LOKALISE_DONE.has(process.status),
      config,
    )

  return {
    async pull() {
      const started = await post<{ process_id: string }>('/files/async-download', {
        format: 'json',
        original_filenames: false,
        bundle_structure: '%LANG_ISO%.json',
        // The default rewrites `{name}` into Lokalise's own placeholder format.
        convert_placeholders: false,
      })
      const { process } = await finish(started.process_id)
      if (process.status !== 'finished') throw remoteConfigError(`Lokalise export ${process.status}: ${process.message ?? ''}`)
      const url = process.details?.download_url
      if (!url) throw remoteConfigError('Lokalise export finished without a download URL')
      return localesFromZip(Buffer.from(await (await request(url)).arrayBuffer()), config)
    },
    async push(translations) {
      for (const [locale, content] of Object.entries(translations)) {
        const remote = toRemote(locale, config)
        // oxlint-disable-next-line no-await-in-loop -- Lokalise allows one upload per project at a time
        const upload = await post<LokaliseProcess>('/files/upload', {
          data: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
          filename: `${remote}.json`,
          lang_iso: remote,
          replace_modified: true,
          convert_placeholders: false,
        })
        // oxlint-disable-next-line no-await-in-loop -- see above
        const { process } = await finish(upload.process.process_id)
        if (process.status !== 'finished') throw remoteConfigError(`Lokalise upload of ${locale} ${process.status}: ${process.message ?? ''}`)
      }
    },
  }
}

/* ----------------------------------------------------------------------------- crowdin */

function crowdin(config: RemoteConfig): RemoteProvider {
  const project = requireField(config.projectId ?? config.path, 'crowdin', 'projectId')
  const root = trim(config.apiUrl ?? 'https://api.crowdin.com/api/v2')
  const api = `${root}/projects/${project}`
  const headers = { Authorization: `Bearer ${config.token}` }
  const post = <T>(url: string, value: unknown): Promise<T> => {
    const body = jsonBody(value)
    return requestJson<T>(url, { method: 'POST', body: body.body, headers: { ...headers, ...body.headers } })
  }

  async function sourceFileId(): Promise<number> {
    if (config.fileId) return config.fileId
    const files = await requestJson<{ data: Array<{ data: { id: number; name: string } }> }>(`${api}/files?limit=500`, { headers })
    const file = files.data.find((item) => item.data.name.endsWith('.json'))
    if (!file) throw remoteConfigError('Crowdin project has no JSON source file', ['Set "fileId" in .i18n-remote.json.'])
    return file.data.id
  }

  return {
    async pull() {
      const info = await requestJson<{ data: { targetLanguageIds?: string[] } }>(api, { headers })
      const fileId = await sourceFileId()
      const out: LocaleTranslations = {}
      for (const language of info.data.targetLanguageIds ?? []) {
        // oxlint-disable-next-line no-await-in-loop -- Crowdin limits concurrent exports
        const exported = await post<{ data?: { url: string } } | undefined>(`${api}/translations/exports`, {
          targetLanguageId: language,
          fileIds: [fileId],
        })
        if (!exported?.data) continue
        // oxlint-disable-next-line no-await-in-loop -- see above
        out[toLocal(language, config)] = parseObject(await (await request(exported.data.url)).text(), language)
      }
      return out
    },
    async push(translations) {
      const fileId = await sourceFileId()
      for (const [locale, content] of Object.entries(translations)) {
        const language = toRemote(locale, config)
        // ZIP uploads are refused, and every non-XLIFF import needs a `fileId`: one language, one file.
        // oxlint-disable-next-line no-await-in-loop -- imports are queued one at a time
        const storage = await requestJson<{ data: { id: number } }>(`${root}/storages`, {
          method: 'POST',
          body: JSON.stringify(content),
          headers: { ...headers, 'Content-Type': 'application/json', 'Crowdin-API-FileName': `${language}.json` },
        })
        // oxlint-disable-next-line no-await-in-loop -- see above
        const started = await post<{ data: { identifier: string } }>(`${api}/translations/imports`, {
          storageId: storage.data.id,
          fileId,
          languageIds: [language],
        })
        // oxlint-disable-next-line no-await-in-loop -- see above
        const status = await poll(
          () => requestJson<{ data: { status: string } }>(`${api}/translations/imports/${started.data.identifier}`, { headers }),
          ({ data }) => ['finished', 'failed', 'canceled'].includes(data.status),
          config,
        )
        if (status.data.status !== 'finished') throw remoteConfigError(`Crowdin import of ${locale} ${status.data.status}`)
      }
    },
  }
}

/* ------------------------------------------------------------------------------ tolgee */

function tolgee(config: RemoteConfig): RemoteProvider {
  const project = requireField(config.projectId ?? config.path, 'tolgee', 'projectId')
  const api = `${trim(config.apiUrl ?? config.url ?? 'https://app.tolgee.io')}/v2/projects/${project}`
  const headers = { 'X-API-Key': config.token ?? '' }

  return {
    async pull() {
      const list = await requestJson<{ _embedded?: { languages?: Array<{ tag: string }> } }>(`${api}/languages?size=1000`, { headers })
      const out: LocaleTranslations = {}
      for (const { tag } of list._embedded?.languages ?? []) {
        const query = new URLSearchParams({ format: 'JSON', languages: tag, zip: 'false', structureDelimiter: '.' })
        // oxlint-disable-next-line no-await-in-loop -- exports are sequential to stay under the rate limit
        const response = await request(`${api}/export?${query}`, { headers })
        // oxlint-disable-next-line no-await-in-loop -- see above
        out[toLocal(tag, config)] = parseObject(await response.text(), tag)
      }
      return out
    },
    async push(translations) {
      const form = new FormData()
      const fileMappings: Array<Record<string, string>> = []
      for (const [locale, content] of Object.entries(translations)) {
        const languageTag = toRemote(locale, config)
        const fileName = `${languageTag}.json`
        form.append('files', new Blob([JSON.stringify(content)], { type: 'application/json' }), fileName)
        fileMappings.push({ fileName, languageTag, format: 'JSON_ICU' })
      }
      const params = {
        convertPlaceholdersToIcu: false,
        createNewKeys: true,
        fileMappings,
        forceMode: 'OVERRIDE',
        overrideKeyDescriptions: false,
        tagNewKeys: [],
      }
      form.append('params', new Blob([JSON.stringify(params)], { type: 'application/json' }))
      await requestJson(`${api}/single-step-import`, { method: 'POST', body: form, headers })
    },
  }
}

/* ----------------------------------------------------------------------------- weblate */

function weblate(config: RemoteConfig): RemoteProvider {
  const project = requireField(config.projectId ?? config.path, 'weblate', 'projectId')
  const component = requireField(config.component, 'weblate', 'component')
  const api = `${trim(requireField(config.apiUrl ?? config.url, 'weblate', 'url'))}/api`
  const headers = { Authorization: `Token ${config.token}` }
  const fileUrl = (language: string): string => `${api}/translations/${project}/${component}/${language}/file/`

  return {
    async pull() {
      const out: LocaleTranslations = {}
      let next: string | null = `${api}/components/${project}/${component}/translations/`
      while (next) {
        // oxlint-disable-next-line no-await-in-loop -- pagination is sequential
        const page: { next: string | null; results: Array<{ language_code: string }> } = await requestJson(next, { headers })
        for (const { language_code: language } of page.results) {
          // oxlint-disable-next-line no-await-in-loop -- see above
          const response = await request(fileUrl(language), { headers })
          // oxlint-disable-next-line no-await-in-loop -- see above
          out[toLocal(language, config)] = parseObject(await response.text(), language)
        }
        next = page.next
      }
      return out
    },
    async push(translations) {
      for (const [locale, content] of Object.entries(translations)) {
        const language = toRemote(locale, config)
        const form = new FormData()
        form.append('file', new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }), `${language}.json`)
        // `translate`, not `replace`: `replace` drops strings missing from the upload.
        form.append('method', 'translate')
        form.append('conflicts', 'replace-translated')
        // oxlint-disable-next-line no-await-in-loop -- Weblate commits per upload
        await requestJson(fileUrl(language), { method: 'POST', body: form, headers })
      }
    },
  }
}

/* ------------------------------------------------------------------------------ custom */

function custom(config: RemoteConfig): RemoteProvider {
  const url = `${trim(requireField(config.url, 'custom', 'url'))}/${(config.path ?? 'translations').replace(/^\/+/, '')}`
  const { username, password } = config.auth ?? {}
  const authorization = username ? `Basic ${Buffer.from(`${username}:${password ?? ''}`).toString('base64')}` : `Bearer ${config.token}`
  const headers = { Authorization: authorization }
  const options = (extra: RequestOptions = {}): RequestOptions => ({ ...extra, headers: { ...headers, ...extra.headers } })

  return {
    async pull() {
      const data = await requestJson<unknown>(url, options())
      if (!isObject(data)) throw remoteConfigError('Invalid response from custom remote')
      return data as LocaleTranslations
    },
    async push(translations) {
      await requestJson(url, options({ method: 'PUT', ...jsonBody(translations) }))
    },
  }
}

export const providers: Record<string, (config: RemoteConfig) => RemoteProvider> = { github, gitlab, lokalise, crowdin, tolgee, weblate, custom }
