/**
 * Sticky PR comment: diff audit only (no deploy / chatops commands).
 *
 *   pnpm -C scripts cli pr-diff-audit body --files f.txt --numstat n.txt --name-status s.txt --pr 1
 */
import { createHash, randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { defineCommand } from 'citty'

export const PR_DIFF_COMMENT_MARKER = '<!-- pr-diff-audit:v1'

export interface DiffFile {
  path: string
  status: string
  added: number
  deleted: number
}

export interface DiffAudit {
  files: number
  added: number
  deleted: number
  modified: number
  renamed: number
  linesAdded: number
  linesDeleted: number
  testFiles: number
  testFilesAdded: number
  testLinesAdded: number
  testLinesDeleted: number
  areas: { name: string; files: number; linesAdded: number; linesDeleted: number }[]
  newTests: string[]
  topPaths: string[]
}

const AREA_RULES: { name: string; re: RegExp }[] = [
  { name: 'src', re: /^src\// },
  { name: 'packages', re: /^packages\// },
  { name: 'test', re: /^test\// },
  { name: 'docs', re: /^docs\// },
  { name: 'scripts', re: /^scripts\// },
  { name: 'client', re: /^client\// },
  { name: 'playground', re: /^playground\// },
  { name: '.github', re: /^\.github\// },
]

const TEST_PATH_RE = /(?:^|\/)(?:__)?tests?(?:\/|$)|(?:\.|\/)(?:test|spec)\.(?:ts|tsx|js|jsx|mjs|cjs)$/i
const TEST_FILE_RE = /(?:^|\/)[^/]+\.(?:test|spec)\.(?:ts|tsx|js|jsx|mjs|cjs)$/i

export function commentMarker(id: string, pr?: string | number): string {
  const prPart = pr !== undefined && pr !== null && String(pr) !== '' ? ` pr=${pr}` : ''
  return `${PR_DIFF_COMMENT_MARKER} id=${id}${prPart} -->`
}

export function extractDiffAuditId(body: string): string | null {
  const m = String(body || '').match(/<!--\s*pr-diff-audit:v1\s+id=([a-f0-9]+)/i)
  return m?.[1] ?? null
}

export function newDiffAuditId(): string {
  return randomBytes(6).toString('hex')
}

export function areaForPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  for (const rule of AREA_RULES) {
    if (rule.re.test(normalized)) return rule.name
  }
  return normalized.split('/')[0] || 'other'
}

export function isTestPath(filePath: string): boolean {
  return TEST_PATH_RE.test(filePath.replace(/\\/g, '/'))
}

export function isTestFile(filePath: string): boolean {
  return TEST_FILE_RE.test(filePath.replace(/\\/g, '/'))
}

export function parseNumstat(text: string): Map<string, { added: number; deleted: number }> {
  const map = new Map<string, { added: number; deleted: number }>()
  for (const line of String(text || '').split(/\r?\n/)) {
    if (!line.trim()) continue
    const parts = line.split('\t')
    if (parts.length < 3) continue
    const addedRaw = parts[0]!
    const deletedRaw = parts[1]!
    let path = parts.slice(2).join('\t')
    if (path.includes(' => ')) {
      // Prefer brace form `dir/{old => new}` so the directory prefix is kept.
      const brace = path.match(/^(.*)\{[^{}]* => ([^{}]*)\}(.*)$/)
      if (brace) {
        path = `${brace[1]}${brace[2]}${brace[3]}`
      } else {
        path = path.slice(path.lastIndexOf(' => ') + 4).replace(/^\{|\}$/g, '')
      }
    }
    path = path.trim()
    if (!path) continue
    const added = addedRaw === '-' ? 0 : Number(addedRaw) || 0
    const deleted = deletedRaw === '-' ? 0 : Number(deletedRaw) || 0
    const prev = map.get(path) || { added: 0, deleted: 0 }
    map.set(path, { added: prev.added + added, deleted: prev.deleted + deleted })
  }
  return map
}

export function parseNameStatus(text: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const line of String(text || '').split(/\r?\n/)) {
    if (!line.trim()) continue
    const parts = line.split('\t')
    const status = (parts[0] || 'M').replace(/[0-9]/g, '')
    if (parts.length >= 3 && (status.startsWith('R') || status.startsWith('C'))) {
      map.set(parts[2]!, status[0] || 'R')
      continue
    }
    if (parts[1]) map.set(parts[1], status[0] || 'M')
  }
  return map
}

export function buildDiffAudit(input: { files: string[]; numstatText?: string; nameStatusText?: string }): DiffAudit {
  const files = [...new Set((input.files || []).map((f) => f.replace(/\\/g, '/')).filter(Boolean))]
  const numstat = parseNumstat(input.numstatText || '')
  const nameStatus = parseNameStatus(input.nameStatusText || '')

  const rows: DiffFile[] = files.map((path) => {
    const stats = numstat.get(path) || { added: 0, deleted: 0 }
    return { path, status: nameStatus.get(path) || 'M', added: stats.added, deleted: stats.deleted }
  })

  for (const [path, stats] of numstat) {
    if (!files.includes(path)) {
      rows.push({ path, status: nameStatus.get(path) || 'M', added: stats.added, deleted: stats.deleted })
    }
  }

  let added = 0
  let deleted = 0
  let modified = 0
  let renamed = 0
  let linesAdded = 0
  let linesDeleted = 0
  let testFiles = 0
  let testFilesAdded = 0
  let testLinesAdded = 0
  let testLinesDeleted = 0
  const areaMap = new Map<string, { files: number; linesAdded: number; linesDeleted: number }>()
  const newTests: string[] = []

  for (const row of rows) {
    linesAdded += row.added
    linesDeleted += row.deleted
    if (row.status === 'A') added += 1
    else if (row.status === 'D') deleted += 1
    else if (row.status === 'R') renamed += 1
    else modified += 1

    const area = areaForPath(row.path)
    const bucket = areaMap.get(area) || { files: 0, linesAdded: 0, linesDeleted: 0 }
    bucket.files += 1
    bucket.linesAdded += row.added
    bucket.linesDeleted += row.deleted
    areaMap.set(area, bucket)

    if (isTestPath(row.path)) {
      testFiles += 1
      testLinesAdded += row.added
      testLinesDeleted += row.deleted
      if (row.status === 'A' && isTestFile(row.path)) {
        testFilesAdded += 1
        newTests.push(row.path)
      }
    }
  }

  const areas = [...areaMap.entries()]
    .map(([name, v]) => Object.assign({ name }, v))
    .sort((a, b) => b.files - a.files || b.linesAdded + b.linesDeleted - (a.linesAdded + a.linesDeleted))

  const topPaths = [...rows]
    .sort((a, b) => b.added + b.deleted - (a.added + a.deleted) || a.path.localeCompare(b.path))
    .slice(0, 8)
    .map((r) => r.path)

  return {
    files: rows.length,
    added,
    deleted,
    modified,
    renamed,
    linesAdded,
    linesDeleted,
    testFiles,
    testFilesAdded,
    testLinesAdded,
    testLinesDeleted,
    areas,
    newTests: newTests.sort(),
    topPaths,
  }
}

/** Escape for a single Markdown inline code span (paths come from the PR tree). */
export function mdCodeSpan(value: string): string {
  const text = String(value).replace(/\r?\n/g, ' ')
  const longest = Math.max(0, ...[...text.matchAll(/`+/g)].map((m) => m[0]!.length))
  const fence = '`'.repeat(longest + 1)
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : ''
  return `${fence}${pad}${text}${pad}${fence}`
}

export function formatAuditMarkdown(audit: DiffAudit): string {
  const renamedPart = audit.renamed ? ` · ⇄${audit.renamed}` : ''
  const newTestsPart = audit.testFilesAdded ? ` · **+${audit.testFilesAdded} new**` : ''
  const lines = [
    '### Diff audit',
    '',
    '| | |',
    '| --- | --- |',
    `| Files | **${audit.files}** (+${audit.added} · ~${audit.modified} · −${audit.deleted}${renamedPart}) |`,
    `| Lines | **+${audit.linesAdded}** / **−${audit.linesDeleted}** |`,
    `| Tests | **${audit.testFiles}** files${newTestsPart} · +${audit.testLinesAdded}/−${audit.testLinesDeleted} lines |`,
    '',
  ]

  if (audit.areas.length > 0) {
    lines.push('| Area | Files | Lines |', '| --- | ---: | ---: |')
    for (const area of audit.areas.slice(0, 10)) {
      lines.push(`| ${mdCodeSpan(area.name)} | ${area.files} | +${area.linesAdded}/−${area.linesDeleted} |`)
    }
    lines.push('')
  }

  if (audit.newTests.length > 0) {
    lines.push('**New tests**', '')
    for (const p of audit.newTests.slice(0, 12)) lines.push(`- ${mdCodeSpan(p)}`)
    if (audit.newTests.length > 12) lines.push(`- _…+${audit.newTests.length - 12} more_`)
    lines.push('')
  }

  if (audit.topPaths.length > 0 && audit.linesAdded + audit.linesDeleted > 0) {
    lines.push('<details>', '<summary>Largest diffs</summary>', '')
    for (const p of audit.topPaths) lines.push(`- ${mdCodeSpan(p)}`)
    lines.push('', '</details>', '')
  }

  return lines.join('\n')
}

export function buildPrDiffCommentBody(opts: { id: string; pr?: string | number; audit: DiffAudit; headSha?: string }): string {
  const sha = (opts.headSha || '').slice(0, 7)
  return [
    commentMarker(opts.id, opts.pr),
    '## PR changes',
    '',
    opts.pr !== undefined && opts.pr !== null && String(opts.pr) !== '' ? `**PR:** #${opts.pr}` : '',
    sha ? `**Head:** \`${sha}\`` : '',
    '',
    formatAuditMarkdown(opts.audit).trimEnd(),
    '',
    '_Sticky diff audit — rewritten on each push. No deploy/test commands._',
    '',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n')
}

function readLines(path: string): string[] {
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

export const prDiffAuditCommand = defineCommand({
  meta: {
    name: 'pr-diff-audit',
    description: 'Build sticky PR markdown describing changed files (no deploy commands).',
  },
  args: {
    mode: { type: 'positional', description: 'body | new-id | extract-id', required: true },
    files: { type: 'string', description: 'Path to name-only file list (body)' },
    numstat: { type: 'string', description: 'Path to git diff --numstat' },
    nameStatus: { type: 'string', description: 'Path to git diff --name-status' },
    id: { type: 'string', description: 'Sticky comment id' },
    pr: { type: 'string', description: 'PR number' },
    headSha: { type: 'string', description: 'Head commit sha' },
  },
  run({ args }) {
    const mode = String(args.mode || '')
    if (mode === 'new-id') {
      process.stdout.write(`${newDiffAuditId()}\n`)
      return
    }
    if (mode === 'extract-id') {
      const body = readFileSync(0, 'utf8')
      const id = extractDiffAuditId(body)
      if (id) process.stdout.write(`${id}\n`)
      return
    }
    if (mode !== 'body') {
      console.error('Usage: pr-diff-audit body|new-id|extract-id')
      process.exit(1)
    }
    if (!args.files) {
      console.error('pr-diff-audit body requires --files')
      process.exit(1)
    }
    const files = readLines(args.files)
    const audit = buildDiffAudit({
      files,
      numstatText: args.numstat ? readFileSync(args.numstat, 'utf8') : '',
      nameStatusText: args.nameStatus ? readFileSync(args.nameStatus, 'utf8') : '',
    })
    const id = args.id || createHash('sha1').update(files.join('\n')).digest('hex').slice(0, 12)
    process.stdout.write(
      buildPrDiffCommentBody({
        id,
        pr: args.pr,
        audit,
        headSha: args.headSha,
      }),
    )
  },
})
