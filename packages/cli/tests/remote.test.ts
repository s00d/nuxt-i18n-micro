import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { findConflicts } from '../src/commands/sync-remote'
import { type RemoteConfig, providers } from '../src/remote/providers'
import { createZip } from '../src/zip'
import { type MockHandler, type MockServer, json, startMock } from './harness'

let mock: MockServer
let routes: Record<string, MockHandler> = {}

beforeAll(async () => {
  mock = await startMock((request, response) => {
    const handler = routes[`${request.method} ${request.url}`]
    if (handler) return handler(request, response)
    return json(response, { message: `no route for ${request.method} ${request.url}` }, 404)
  })
})
afterAll(() => mock.close())
afterEach(() => {
  routes = {}
  mock.requests.length = 0
})

const fast = { pollIntervalMs: 1, token: 'tok' }
const seen = () => mock.requests.map((request) => `${request.method} ${request.url}`)
const text =
  (body: string): MockHandler =>
  (_req, res) =>
    res.end(body)
const provider = (config: RemoteConfig) => providers[config.type]!(config)
const DE = { de: { a: 'A' } }

describe('github', () => {
  const config = (): RemoteConfig => ({ type: 'github', url: 'https://github.com/o/r', apiUrl: mock.url, branch: 'dev', path: 'i18n', ...fast })

  it('pulls JSON files through the raw media type', async () => {
    routes = {
      'GET /repos/o/r/contents/i18n?ref=dev': (_req, res) =>
        json(res, [
          { type: 'file', name: 'de.json', path: 'i18n/de.json' },
          { type: 'file', name: 'notes.md', path: 'i18n/notes.md' },
          { type: 'dir', name: 'x', path: 'i18n/x' },
        ]),
      'GET /repos/o/r/contents/i18n/de.json?ref=dev': text('{"a":"A"}'),
    }
    await expect(provider(config()).pull()).resolves.toEqual(DE)
    expect(mock.requests[0]!.headers.authorization).toBe('Bearer tok')
    expect(mock.requests[0]!.headers['x-github-api-version']).toBeTruthy()
    expect(mock.requests[1]!.headers.accept).toBe('application/vnd.github.raw+json')
  })

  it('pushes with the sha of an existing file and without one for a new file', async () => {
    routes = {
      'GET /repos/o/r/contents/i18n/de.json?ref=dev': (_req, res) => json(res, { sha: 'abc' }),
      'GET /repos/o/r/contents/i18n/fr.json?ref=dev': (_req, res) => json(res, {}, 404),
      'PUT /repos/o/r/contents/i18n/de.json': (_req, res) => json(res, {}),
      'PUT /repos/o/r/contents/i18n/fr.json': (_req, res) => json(res, {}, 201),
    }
    await provider(config()).push({ ...DE, fr: { a: 'B' } })
    const [, put, , putNew] = mock.requests
    const body = JSON.parse(put!.text)
    expect(body).toMatchObject({ sha: 'abc', branch: 'dev' })
    expect(JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'))).toEqual({ a: 'A' })
    expect(JSON.parse(putNew!.text).sha).toBeUndefined()
  })

  it('stops on a failed sha lookup instead of treating it as a new file', async () => {
    routes = { 'GET /repos/o/r/contents/i18n/de.json?ref=dev': (_req, res) => json(res, {}, 401) }
    await expect(provider(config()).push(DE)).rejects.toThrow('401')
    expect(seen()).toHaveLength(1)
  })

  it('applies languageMapping both ways', async () => {
    routes = {
      'GET /repos/o/r/contents/i18n?ref=dev': (_req, res) => json(res, [{ type: 'file', name: 'de-DE.json', path: 'i18n/de-DE.json' }]),
      'GET /repos/o/r/contents/i18n/de-DE.json?ref=dev': text('{"a":"A"}'),
    }
    await expect(provider({ ...config(), languageMapping: { de: 'de-DE' } }).pull()).resolves.toEqual(DE)
  })
})

describe('gitlab', () => {
  const project = 'group%2Fapp'
  const config = (): RemoteConfig => ({ type: 'gitlab', url: 'https://gitlab.example/group/app', apiUrl: mock.url, path: 'i18n', ...fast })
  const base = `/api/v4/projects/${project}/repository`

  it('pulls the tree and raw files with PRIVATE-TOKEN', async () => {
    routes = {
      [`GET ${base}/tree?path=i18n&ref=main&per_page=100`]: (_req, res) =>
        json(res, [
          { type: 'blob', path: 'i18n/de.json', name: 'de.json' },
          { type: 'tree', path: 'i18n/sub', name: 'sub' },
        ]),
      [`GET ${base}/files/i18n%2Fde.json/raw?ref=main`]: text('{"a":"A"}'),
    }
    await expect(provider(config()).pull()).resolves.toEqual(DE)
    expect(mock.requests[0]!.headers['private-token']).toBe('tok')
  })

  it('updates an existing file with PUT and creates a new one with POST', async () => {
    routes = {
      [`HEAD ${base}/files/i18n%2Fde.json?ref=main`]: (_req, res) => res.end(),
      [`PUT ${base}/files/i18n%2Fde.json`]: (_req, res) => json(res, {}),
      [`POST ${base}/files/i18n%2Ffr.json`]: (_req, res) => json(res, {}, 201),
    }
    await provider(config()).push({ ...DE, fr: { a: 'B' } })
    expect(seen()).toEqual([
      `HEAD ${base}/files/i18n%2Fde.json?ref=main`,
      `PUT ${base}/files/i18n%2Fde.json`,
      `HEAD ${base}/files/i18n%2Ffr.json?ref=main`,
      `POST ${base}/files/i18n%2Ffr.json`,
    ])
    expect(JSON.parse(mock.requests[1]!.text)).toMatchObject({ branch: 'main', commit_message: 'Update de.json translations' })
  })

  it('does not create a file when the lookup is refused', async () => {
    routes = { [`HEAD ${base}/files/i18n%2Fde.json?ref=main`]: (_req, res) => json(res, {}, 403) }
    await expect(provider(config()).push(DE)).rejects.toThrow('403')
  })
})

describe('lokalise', () => {
  const config = (): RemoteConfig => ({ type: 'lokalise', apiUrl: mock.url, projectId: 'p1', ...fast })

  it('downloads the bundle through a process and reads the zip', async () => {
    let polls = 0
    const zip = createZip([{ name: 'locale/de.json', data: Buffer.from('{"a":"A"}') }])
    routes = {
      'POST /projects/p1/files/async-download': (_req, res) => json(res, { process_id: 'q1' }),
      'GET /projects/p1/processes/q1': (_req, res) => {
        polls += 1
        const status = polls === 1 ? 'running' : 'finished'
        json(res, { process: { process_id: 'q1', status, details: { download_url: `${mock.url}/bundle.zip` } } })
      },
      'GET /bundle.zip': (_req, res) => res.end(zip),
    }
    await expect(provider(config()).pull()).resolves.toEqual(DE)
    expect(mock.requests[0]!.headers['x-api-token']).toBe('tok')
    expect(JSON.parse(mock.requests[0]!.text)).toEqual({
      format: 'json',
      original_filenames: false,
      bundle_structure: '%LANG_ISO%.json',
      convert_placeholders: false,
    })
    expect(polls).toBe(2)
  })

  it('uploads base64 per locale and stops on a cancelled process', async () => {
    routes = {
      'POST /projects/p1/files/upload': (_req, res) => json(res, { process: { process_id: 'u1', status: 'queued' } }, 202),
      'GET /projects/p1/processes/u1': (_req, res) => json(res, { process: { process_id: 'u1', status: 'cancelled' } }),
    }
    await expect(provider(config()).push(DE)).rejects.toThrow('cancelled')
    const body = JSON.parse(mock.requests[0]!.text)
    expect(body).toMatchObject({ filename: 'de.json', lang_iso: 'de', replace_modified: true })
    expect(JSON.parse(Buffer.from(body.data, 'base64').toString('utf8'))).toEqual({ a: 'A' })
  })
})

describe('crowdin', () => {
  const config = (): RemoteConfig => ({ type: 'crowdin', apiUrl: mock.url, projectId: '7', ...fast })

  it('exports one language per request', async () => {
    routes = {
      'GET /projects/7': (_req, res) => json(res, { data: { targetLanguageIds: ['de', 'fr'] } }),
      'GET /projects/7/files?limit=500': (_req, res) => json(res, { data: [{ data: { id: 11, name: 'en.json' } }] }),
      'POST /projects/7/translations/exports': (req, res) => {
        if (JSON.parse(req.text).targetLanguageId === 'fr') return res.writeHead(204).end()
        return json(res, { data: { url: `${mock.url}/de-file` } })
      },
      'GET /de-file': text('{"a":"A"}'),
    }
    await expect(provider(config()).pull()).resolves.toEqual(DE)
    expect(mock.requests[0]!.headers.authorization).toBe('Bearer tok')
    expect(JSON.parse(mock.requests[2]!.text)).toEqual({ targetLanguageId: 'de', fileIds: [11] })
  })

  it('pushes raw JSON to storage, imports with fileId, polls to the end', async () => {
    routes = {
      'POST /storages': (_req, res) => json(res, { data: { id: 5 } }),
      'POST /projects/7/translations/imports': (_req, res) => json(res, { data: { identifier: 'imp' } }),
      'GET /projects/7/translations/imports/imp': (_req, res) => json(res, { data: { status: 'finished' } }),
    }
    await provider({ ...config(), fileId: 11 }).push(DE)
    expect(mock.requests[0]!.headers['crowdin-api-filename']).toBe('de.json')
    expect(JSON.parse(mock.requests[0]!.text)).toEqual({ a: 'A' })
    expect(JSON.parse(mock.requests[1]!.text)).toEqual({ storageId: 5, fileId: 11, languageIds: ['de'] })
  })

  it('reports a failed import', async () => {
    routes = {
      'POST /storages': (_req, res) => json(res, { data: { id: 5 } }),
      'POST /projects/7/translations/imports': (_req, res) => json(res, { data: { identifier: 'imp' } }),
      'GET /projects/7/translations/imports/imp': (_req, res) => json(res, { data: { status: 'failed' } }),
    }
    await expect(provider({ ...config(), fileId: 11 }).push(DE)).rejects.toThrow('failed')
  })
})

describe('tolgee', () => {
  const config = (): RemoteConfig => ({ type: 'tolgee', apiUrl: mock.url, projectId: '3', ...fast })

  it('lists languages and exports each', async () => {
    routes = {
      'GET /v2/projects/3/languages?size=1000': (_req, res) => json(res, { _embedded: { languages: [{ tag: 'de' }] } }),
      'GET /v2/projects/3/export?format=JSON&languages=de&zip=false&structureDelimiter=.': text('{"a":"A"}'),
    }
    await expect(provider(config()).pull()).resolves.toEqual(DE)
    expect(mock.requests[0]!.headers['x-api-key']).toBe('tok')
  })

  it('imports all locales in one multipart request', async () => {
    routes = { 'POST /v2/projects/3/single-step-import': (_req, res) => json(res, {}) }
    await provider(config()).push(DE)
    const request = mock.requests[0]!
    expect(request.headers['content-type']).toContain('multipart/form-data')
    expect(request.text).toContain('name="files"; filename="de.json"')
    expect(request.text).toContain('"forceMode":"OVERRIDE"')
    expect(request.text).toContain('"languageTag":"de"')
  })
})

describe('weblate', () => {
  const config = (): RemoteConfig => ({ type: 'weblate', url: mock.url, projectId: 'site', component: 'ui', ...fast })

  it('follows pagination and downloads each translation file', async () => {
    routes = {
      'GET /api/components/site/ui/translations/': (_req, res) => json(res, { next: `${mock.url}/api/page2`, results: [{ language_code: 'de' }] }),
      'GET /api/page2': (_req, res) => json(res, { next: null, results: [] }),
      'GET /api/translations/site/ui/de/file/': text('{"a":"A"}'),
    }
    await expect(provider(config()).pull()).resolves.toEqual(DE)
    expect(mock.requests[0]!.headers.authorization).toBe('Token tok')
  })

  it('uploads with method=translate, never replace', async () => {
    routes = { 'POST /api/translations/site/ui/de/file/': (_req, res) => json(res, { accepted: 1 }) }
    await provider(config()).push(DE)
    const body = mock.requests[0]!.text
    expect(body).toContain('name="method"\r\n\r\ntranslate')
    expect(body).toContain('name="conflicts"\r\n\r\nreplace-translated')
  })

  it('requires a component', () => {
    expect(() => provider({ type: 'weblate', url: mock.url, projectId: 'site' })).toThrow('component')
  })
})

describe('custom', () => {
  it('pulls and pushes with basic auth', async () => {
    routes = {
      'GET /api/i18n': (_req, res) => json(res, DE),
      'PUT /api/i18n': (_req, res) => json(res, {}),
    }
    const remote = provider({ type: 'custom', url: `${mock.url}/api/`, path: 'i18n', auth: { username: 'u', password: 'p' } })
    await expect(remote.pull()).resolves.toEqual(DE)
    await remote.push(DE)
    expect(mock.requests[0]!.headers.authorization).toBe(`Basic ${Buffer.from('u:p').toString('base64')}`)
    expect(JSON.parse(mock.requests[1]!.text)).toEqual(DE)
  })
})

describe('conflicts', () => {
  it('counts differing values only; an empty local value is a gap', () => {
    const local = { de: { a: 'x', b: '', c: 'same' } }
    const remote = { de: { a: 'y', b: 'filled', c: 'same' }, fr: { a: 'z' } }
    expect(findConflicts(local, remote)).toEqual([{ locale: 'de', key: 'a', local: 'x', remote: 'y' }])
  })
})
