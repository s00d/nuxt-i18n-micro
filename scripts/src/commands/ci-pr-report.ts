/**
 * Collect soft-check outcomes + logs → Job Summary markdown and sticky PR comment.
 *
 *   CI_LOG_DIR=… FORMAT_OUTCOME=… pnpm -C scripts cli ci-pr-report summary
 *   … pnpm -C scripts cli ci-pr-report comment
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'

export const PR_CHECKS_COMMENT_MARKER = '<!-- pr-checks-ci -->'

export interface CheckSpec {
  name: string
  key: string
  outcome: string
}

/** Soft checks in `.github/workflows/ci.yml` (continue-on-error steps). */
export const DEFAULT_CHECKS = Object.freeze([
  { name: 'Versions', key: 'versions', env: 'VERSIONS_OUTCOME' },
  { name: 'Lint', key: 'lint', env: 'LINT_OUTCOME' },
  { name: 'Typecheck', key: 'typecheck', env: 'TYPECHECK_OUTCOME' },
  { name: 'Test packages', key: 'test-packages', env: 'TEST_PACKAGES_OUTCOME' },
  { name: 'Test unit', key: 'test-unit', env: 'TEST_UNIT_OUTCOME' },
  { name: 'Test integration', key: 'test-integration', env: 'TEST_INTEGRATION_OUTCOME' },
  { name: 'Test e2e', key: 'test-e2e', env: 'TEST_E2E_OUTCOME' },
  { name: 'Verify packages', key: 'verify-packages', env: 'VERIFY_PACKAGES_OUTCOME' },
  { name: 'Test dist', key: 'test-dist', env: 'TEST_DIST_OUTCOME' },
  { name: 'Compare published', key: 'compare-published', env: 'COMPARE_PUBLISHED_OUTCOME' },
])

export const DEFAULT_LIMITS = Object.freeze({
  maxLines: 40,
  maxChars: 8000,
  maxTotalChars: 28000,
})

export function stripAnsi(text: string): string {
  let out = ''
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) === 0x1b && text[i + 1] === '[') {
      i += 2
      while (i < text.length && text[i] !== 'm') i += 1
    } else {
      out += text[i]!
    }
  }
  return out
}

export function statusIcon(outcome: string): string {
  if (outcome === 'success') return '✅'
  if (outcome === 'skipped') return '⏭️'
  return '❌'
}

export function isFailedOutcome(outcome: string): boolean {
  return outcome !== 'success' && outcome !== 'skipped'
}

export function checksFromEnv(outcomes: Partial<Record<string, string>> = {}): CheckSpec[] {
  return DEFAULT_CHECKS.map((check) => ({
    name: check.name,
    key: check.key,
    outcome: outcomes[check.env] ?? process.env[check.env] ?? 'skipped',
  }))
}

export function extractErrors(checkKey: string, log: string): string[] {
  if (!log.trim()) return []
  const lines = log.split('\n')

  switch (checkKey) {
    case 'lint':
      return lines
        .map((line) => line.replace(/^##\[error\]/, '').trimEnd())
        .filter((line) => {
          const t = line.trim()
          if (!t || t.startsWith('> ') || t.startsWith('Finished in')) return false
          return (
            /Found \d+ warnings and \d+ error/.test(t) ||
            /:\d+:\d+:\s*error\b/i.test(t) ||
            /\berror\b.+\bhelp:/i.test(t) ||
            /^[^\s].+\.(?:[cm]?[jt]sx?|vue|mjs):\d+(?::\d+)?\b/.test(t)
          )
        })
    case 'typecheck':
      return lines.filter((line) => {
        const t = line.trim()
        if (!t || t.startsWith('> ')) return false
        return /error TS\d+:/.test(t) || /Failed|ELIFECYCLE|ERR_PNPM|typecheck.*(failed|error)/i.test(t) || /^✖|FAIL\s/.test(t)
      })
    case 'versions':
    case 'verify-packages':
    case 'compare-published':
      return lines.filter((line) => {
        const t = line.trim()
        if (!t || t.startsWith('> ')) return false
        return /error|fail|✖|ERR_|ELIFECYCLE|✗/i.test(t) && !/0 errors/i.test(t)
      })
    default:
      // vitest / general
      return lines.filter((line) => {
        const t = line.trim()
        if (!t || t.startsWith('> ')) return false
        return (
          /^FAIL\s/.test(t) ||
          /AssertionError|Tests\s+\d+\s+failed|Test Files.*failed|✖/.test(t) ||
          (/^Error:/.test(t) && !t.includes('Process completed'))
        )
      })
  }
}

export function truncateBlock(text: string, maxLines: number, maxChars: number): string {
  const lines = text.split('\n')
  let clipped = lines.slice(0, maxLines).join('\n')
  if (lines.length > maxLines) clipped += `\n\n… ${lines.length - maxLines} more line(s) — see job log.`
  if (clipped.length > maxChars) clipped = `${clipped.slice(0, maxChars)}\n\n… truncated — see job log.`
  return clipped.trimEnd()
}

export function buildCiSummaryMarkdown(input: {
  checks: CheckSpec[]
  readLog: (key: string) => string
  limits?: { maxLines: number; maxChars: number; maxTotalChars: number }
}): { markdown: string; failed: boolean } {
  const limits = { ...DEFAULT_LIMITS, ...(input.limits || {}) }
  const sections = ['## CI summary', '']
  let failed = false

  for (const check of input.checks) {
    if (isFailedOutcome(check.outcome)) failed = true
    const suffix = check.outcome === 'success' || check.outcome === 'skipped' ? '' : ` (${check.outcome})`
    sections.push(`- ${statusIcon(check.outcome)} ${check.name}${suffix}`)
  }

  if (!failed) {
    return { markdown: sections.join('\n').trimEnd(), failed: false }
  }

  sections.push('', '### Failures', '')
  let totalChars = sections.join('\n').length

  for (const check of input.checks.filter((c) => isFailedOutcome(c.outcome))) {
    const errors = extractErrors(check.key, input.readLog(check.key))
    const body = truncateBlock(errors.join('\n'), limits.maxLines, limits.maxChars)
    sections.push(`#### ${check.name}`, '')
    if (body) {
      sections.push('```', body, '```', '')
    } else {
      sections.push('_Failed — see the step log in this job._', '')
    }
    totalChars += body.length
    if (totalChars >= limits.maxTotalChars) {
      sections.push('_Further failure details omitted — see job log._', '')
      break
    }
  }

  return { markdown: sections.join('\n').trimEnd(), failed: true }
}

export function formatStickyCiComment(markdown: string, commitId?: string): string {
  const sha = (commitId || '').slice(0, 7)
  return [
    PR_CHECKS_COMMENT_MARKER,
    markdown,
    '',
    sha
      ? `_Head \`${sha}\` · rewritten each CI run (soft checks keep going after the first failure)._`
      : '_Rewritten each CI run (soft checks keep going after the first failure)._',
    '',
  ].join('\n')
}

async function upsertStickyComment(options: {
  token: string
  repo: string
  prNumber: number
  marker: string
  body: string
  createIfMissing?: boolean
}): Promise<'created' | 'updated' | 'noop'> {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${options.token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
  const base = `https://api.github.com/repos/${options.repo}`

  const list: { id: number; body?: string; user?: { login?: string } }[] = []
  for (let page = 1; page <= 20; page += 1) {
    const res = await fetch(`${base}/issues/${options.prNumber}/comments?per_page=100&page=${page}`, { headers })
    if (!res.ok) throw new Error(`list comments: ${res.status}`)
    const batch = (await res.json()) as { id: number; body?: string; user?: { login?: string } }[]
    list.push(...batch)
    if (batch.length < 100) break
  }

  // Only our bot comments — a human pasting the marker must not become the sticky target.
  const ours = list.filter((c) => c.user?.login === 'github-actions[bot]' && c.body?.includes(options.marker))
  const [keep, ...dupes] = ours
  await Promise.all(
    dupes.map((c) =>
      fetch(`${base}/issues/comments/${c.id}`, {
        method: 'DELETE',
        headers,
      }),
    ),
  )

  if (keep) {
    const res = await fetch(`${base}/issues/comments/${keep.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: options.body }),
    })
    if (!res.ok) throw new Error(`update comment: ${res.status}`)
    return 'updated'
  }

  if (options.createIfMissing === false) return 'noop'

  const res = await fetch(`${base}/issues/${options.prNumber}/comments`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: options.body }),
  })
  if (!res.ok) throw new Error(`create comment: ${res.status}`)
  return 'created'
}

function readLogDir(logDir: string): (key: string) => string {
  return (key: string) => {
    const path = join(logDir, `${key}.log`)
    if (!existsSync(path)) return ''
    return stripAnsi(readFileSync(path, 'utf8'))
  }
}

function runSummary(): { markdown: string; failed: boolean } {
  const logDir = process.env.CI_LOG_DIR ?? join(process.env.RUNNER_TEMP ?? '/tmp', 'ci-logs')
  const result = buildCiSummaryMarkdown({
    checks: checksFromEnv(),
    readLog: readLogDir(logDir),
    limits: {
      maxLines: Number(process.env.CI_SUMMARY_MAX_LINES ?? DEFAULT_LIMITS.maxLines),
      maxChars: Number(process.env.CI_SUMMARY_MAX_CHARS ?? DEFAULT_LIMITS.maxChars),
      maxTotalChars: Number(process.env.CI_SUMMARY_MAX_TOTAL_CHARS ?? DEFAULT_LIMITS.maxTotalChars),
    },
  })
  process.stdout.write(`${result.markdown}\n`)
  return result
}

export const ciPrReportCommand = defineCommand({
  meta: {
    name: 'ci-pr-report',
    description: 'Build CI Job Summary / sticky PR comment from soft-check outcomes + CI_LOG_DIR.',
  },
  args: {
    mode: { type: 'positional', description: 'summary | comment', required: true },
  },
  async run({ args }) {
    const mode = String(args.mode || '')
    if (mode === 'summary') {
      const result = runSummary()
      process.exit(result.failed ? 1 : 0)
    }

    if (mode !== 'comment') {
      console.error('Usage: ci-pr-report summary|comment')
      process.exit(1)
    }

    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || ''
    const repo = process.env.GITHUB_REPOSITORY || ''
    const prNumber = Number(process.env.PR_NUMBER || '')
    const commitId = process.env.HEAD_SHA || process.env.GITHUB_SHA || ''
    if (!token || !repo || !prNumber) {
      console.error('ci-pr-report comment: need GH_TOKEN, GITHUB_REPOSITORY, PR_NUMBER — skipping')
      process.exit(0)
    }

    const logDir = process.env.CI_LOG_DIR ?? join(process.env.RUNNER_TEMP ?? '/tmp', 'ci-logs')
    const { markdown, failed } = buildCiSummaryMarkdown({
      checks: checksFromEnv(),
      readLog: readLogDir(logDir),
    })
    const body = formatStickyCiComment(markdown, commitId)
    const action = await upsertStickyComment({
      token,
      repo,
      prNumber,
      marker: PR_CHECKS_COMMENT_MARKER,
      body,
      createIfMissing: failed,
    })
    console.log(`[ci-pr-report] comment action=${action} failed=${failed}`)
  },
})
