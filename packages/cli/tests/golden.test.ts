import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { type MockServer, createProject, diffFiles, json, normalize, removeProject, runCli, snapshotFiles, startMock } from './harness'

/**
 * Characterization of every command: exact arguments -> exit code, output, files written.
 *
 * Generated first from the published `nuxt-i18n-micro-cli@2.1.2` (`CLI_BIN=<old bin> vitest -u`),
 * committed on their own, then re-run against the rewrite: every diff is an intended fix
 * listed in the rewrite's commit, or a bug.
 */
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
  const { project } = JSON.parse(output.slice(output.indexOf('{')))
  return {
    defaultLocale: project.defaultLocale,
    locales: project.locales.map((locale: { code: string }) => locale.code),
    total: project.totalLocales,
  }
}

const cases: GoldenCase[] = [
  { name: 'help', args: ['--help'] },
  { name: 'unknown-command', args: ['nope'] },
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
  { name: 'validate', args: ['validate'] },
  { name: 'diff', args: ['diff'] },
  { name: 'diff-json', args: ['diff', '--json'] },
  { name: 'sync', args: ['sync'] },
  { name: 'stats', args: ['stats'] },
  { name: 'stats-json', args: ['stats', '--json'] },
  { name: 'stats-full', args: ['stats', '--full'] },
  { name: 'clean', args: ['clean'] },
  { name: 'clean-exclude', args: ['clean', '--exclude', '^common'] },
  { name: 'lint', args: ['lint', '--rules', 'no-trailing-spaces,no-empty-translation'] },
  { name: 'lint-fix', args: ['lint', '--rules', 'no-trailing-spaces', '--fix'] },
  { name: 'lint-json', args: ['lint', '--rules', 'no-html-tags', '--json'] },
  { name: 'search', args: ['search', 'Save'] },
  { name: 'search-json', args: ['search', 'Welcome', '--json'] },
  { name: 'search-hardcoded', args: ['search', '--hardcodedOnly', '--onlyVue'] },
  { name: 'search-empty', args: ['search'] },
  { name: 'rename', args: ['rename', '--from', 'common.save', '--to', 'actions.save'] },
  { name: 'rename-dry', args: ['rename', '--from', 'common.save', '--to', 'actions.save', '--dryRun'] },
  { name: 'rename-missing', args: ['rename', '--from', 'no.such', '--to', 'other.key'] },
  { name: 'replace-values', args: ['replace-values', '--search', 'Save', '--replace', 'Store'] },
  { name: 'replace-values-regex', args: ['replace-values', '--search', '(W)elcome', '--replace', '$1ow', '--useRegex'] },
  { name: 'pseudo', args: ['pseudo', '--targetLocale', 'de', '--replace'] },
  { name: 'estimate', args: ['estimate'] },
  { name: 'estimate-json', args: ['estimate', '--json'] },
  { name: 'format', args: ['format'] },
  { name: 'split', args: ['split', '--splitByPrefix', '--outputDir', 'split-out'] },
  { name: 'split-default', args: ['split', '--maxKeys', '1', '--outputDir', 'split-out'] },
  { name: 'optimize', args: ['optimize', '--dryRun', '--minSize', '100'] },
  { name: 'optimize-json', args: ['optimize', '--json', '--minSize', '100'] },
  { name: 'export', args: ['export'] },
  { name: 'import', args: ['import'] },
  { name: 'export-csv', args: ['export-csv'] },
  { name: 'import-csv', args: ['import-csv'] },
  { name: 'check-duplicates', args: ['check-duplicates'] },
  { name: 'text-to-i18n-dry', args: ['text-to-i18n', '--dryRun'] },
  { name: 'text-to-i18n', args: ['text-to-i18n'] },
  { name: 'glossary-list', args: ['glossary'] },
  { name: 'glossary-add', args: ['glossary', '--action', 'add', '--source', 'Cancel', '--target', 'Abbrechen'] },
  { name: 'glossary-remove', args: ['glossary', '--action', 'remove', '--source', 'Save'] },
  { name: 'backup', args: ['backup', '--comment', 'golden'] },
  { name: 'restore-list', args: ['restore'], setup: (dir) => writeFileSync(join(dir, 'locales/x.json'), '{}') },
  {
    name: 'translate-libre',
    args: ['translate', '--service', 'libretranslate', '--token', 'k', '--options', 'baseUrl:<mock>'],
  },
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
