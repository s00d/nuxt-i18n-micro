import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { type MockServer, createProject, diffFiles, json, normalize, removeProject, runCli, snapshotFiles, startMock } from './harness'

/** Every command: exact arguments -> exit code, output, files written, requests sent. */
interface GoldenCase {
  name: string
  args: string[]
  /** Runs against the fresh project copy before the command. */
  setup?: (dir: string, mock: MockServer) => void
  stdin?: string
  /** Output too machine-specific to pin keeps only what this picks out. */
  pick?: (output: string) => unknown
}

const remote = (dir: string, mock: MockServer, config: Record<string, unknown> = {}) =>
  writeFileSync(join(dir, '.i18n-remote.json'), JSON.stringify({ type: 'custom', url: mock.url, auth: { username: 'u', password: 'p' }, ...config }))

const pickInfo = (output: string) => {
  const { defaultLocale, locales } = JSON.parse(output.slice(output.indexOf('{')))
  return { defaultLocale, locales }
}

const cases: GoldenCase[] = [
  { name: 'help', args: ['--help'] },
  { name: 'unknown-command', args: ['nope'] },
  { name: 'removed-command', args: ['validate'] },
  { name: 'info', args: ['info', '--json'], pick: pickInfo },
  { name: 'extract', args: ['extract'] },
  {
    name: 'extract-void-element',
    args: ['extract'],
    setup: (dir) =>
      writeFileSync(join(dir, 'pages/contact.vue'), `<template><img alt="Map" src="/m.png"><p>{{ $t('contact.title') }}</p></template>\n`),
  },
  {
    name: 'extract-custom-translation-dir',
    args: ['extract'],
    setup: (dir) => {
      const config = join(dir, 'nuxt.config.ts')
      writeFileSync(config, readFileSync(config, 'utf8').replace(`translationDir: 'locales'`, `translationDir: 'i18n'`))
    },
  },
  {
    name: 'extract-app-dir',
    args: ['extract'],
    setup: (dir) => {
      mkdirSync(join(dir, 'app'))
      renameSync(join(dir, 'pages'), join(dir, 'app/pages'))
    },
  },
  { name: 'check', args: ['check'] },
  { name: 'check-json', args: ['check', '--json'] },
  { name: 'check-duplicates', args: ['check', '--only', 'duplicates'] },
  { name: 'sync', args: ['sync'] },
  { name: 'sync-dry', args: ['sync', '--dryRun'] },
  { name: 'stats', args: ['stats'] },
  { name: 'stats-json', args: ['stats', '--json'] },
  { name: 'clean', args: ['clean'] },
  { name: 'clean-exclude', args: ['clean', '--exclude', '^common'] },
  { name: 'lint', args: ['lint', '--rules', 'no-trailing-spaces,no-empty-translation'] },
  { name: 'lint-fix', args: ['lint', '--rules', 'no-trailing-spaces', '--fix'] },
  { name: 'lint-json', args: ['lint', '--rules', 'no-trailing-spaces', '--json'] },
  { name: 'search', args: ['search', 'Save'] },
  { name: 'search-json', args: ['search', 'Welcome', '--json'] },
  { name: 'search-empty', args: ['search'] },
  { name: 'rename', args: ['rename', '--from', 'common.save', '--to', 'actions.save'] },
  { name: 'rename-dry', args: ['rename', '--from', 'common.save', '--to', 'actions.save', '--dryRun'] },
  { name: 'rename-missing', args: ['rename', '--from', 'no.such', '--to', 'other.key'] },
  { name: 'pseudo', args: ['pseudo', '--targetLocale', 'de', '--replace'] },
  { name: 'format', args: ['format'] },
  { name: 'format-check', args: ['format', '--check'] },
  { name: 'export', args: ['export'] },
  { name: 'import', args: ['import'] },
  { name: 'export-csv', args: ['export', '--format', 'csv'] },
  { name: 'import-csv', args: ['import', '--format', 'csv'] },
  { name: 'text-to-i18n-dry', args: ['text-to-i18n', '--dryRun'] },
  { name: 'text-to-i18n', args: ['text-to-i18n'] },
  {
    name: 'translate-libre',
    args: ['translate', '--service', 'libretranslate', '--token', 'k', '--options', 'baseUrl:<mock>'],
  },
  { name: 'translate-dry', args: ['translate', '--dryRun'] },
  { name: 'translate-unknown', args: ['translate', '--service', 'nope', '--token', 'k'] },
  { name: 'sync-remote-noconfig', args: ['sync-remote'] },
  { name: 'sync-remote-pull', args: ['sync-remote'], setup: (dir, mock) => remote(dir, mock) },
  { name: 'sync-remote-force', args: ['sync-remote', '--force'], setup: (dir, mock) => remote(dir, mock) },
  { name: 'sync-remote-push-dry', args: ['sync-remote', '--no-pull', '--push', '--dryRun'], setup: (dir, mock) => remote(dir, mock) },
]

describe('golden: every command', () => {
  let mock: MockServer

  beforeAll(async () => {
    mock = await startMock((request, response) => {
      if (request.method === 'GET') return json(response, { de: { common: { save: 'Remote' }, remote: { only: 'Neu' } } })
      if (request.url.startsWith('/translate'))
        return json(response, { translatedText: JSON.parse(request.text).q.map((text: string) => `de ${text}`) })
      return json(response, { ok: true })
    })
  })

  afterAll(() => mock.close())

  it.each(cases.map((entry) => [entry.name, entry] as const))('%s', { timeout: 120_000 }, async (name, entry) => {
    const dir = createProject()
    entry.setup?.(dir, mock)
    const before = snapshotFiles(dir)
    const requestCount = mock.requests.length

    const args = entry.args.map((arg) => arg.replace('<mock>', mock.url))
    const result = await runCli(args, { cwd: dir, stdin: entry.stdin })
    const after = snapshotFiles(dir)
    const output = normalize(result.stdout + result.stderr, dir, mock.port).trim()
    const sent = mock.requests.slice(requestCount).map((request) => `${request.method} ${request.url} ${normalize(request.text, dir, mock.port)}`)
    const shown = entry.pick ? JSON.stringify(entry.pick(result.stdout), null, 2) : output

    const page = [
      `# ${name}`,
      '',
      `\`i18n-micro ${entry.args.join(' ')}\` -> exit ${result.code}`,
      '',
      '## Output',
      '',
      '```',
      shown,
      '```',
      '',
      '## Files',
      '',
      normalize(diffFiles(before, after), dir, mock.port),
      '',
      ...(sent.length > 0 ? ['## Requests', '', '```', ...sent, '```', ''] : []),
    ].join('\n')

    removeProject(dir)
    await expect(page).toMatchFileSnapshot(`__golden__/${name}.md`)
  })
})
