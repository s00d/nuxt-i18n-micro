import { describe, expect, it } from 'vitest'
import {
  buildCiSummaryMarkdown,
  extractErrors,
  formatStickyCiComment,
  isFailedOutcome,
  PR_CHECKS_COMMENT_MARKER,
  statusIcon,
} from '../src/commands/ci-pr-report'

describe('ci-pr-report', () => {
  it('marks failed outcomes', () => {
    expect(isFailedOutcome('success')).toBe(false)
    expect(isFailedOutcome('skipped')).toBe(false)
    expect(isFailedOutcome('failure')).toBe(true)
  })

  it('builds green summary', () => {
    const { markdown, failed } = buildCiSummaryMarkdown({
      checks: [
        { name: 'Lint', key: 'lint', outcome: 'success' },
        { name: 'Typecheck', key: 'typecheck', outcome: 'skipped' },
      ],
      readLog: () => '',
    })
    expect(failed).toBe(false)
    expect(markdown).toContain(statusIcon('success'))
    expect(markdown).not.toContain('### Failures')
  })

  it('collects failure excerpts and sticky marker', () => {
    const { markdown, failed } = buildCiSummaryMarkdown({
      checks: [
        { name: 'Lint', key: 'lint', outcome: 'failure' },
        { name: 'Test unit', key: 'test-unit', outcome: 'success' },
      ],
      readLog: (key) => (key === 'lint' ? 'src/a.ts:1:1: error foo\nFinished in 1ms\n' : ''),
    })
    expect(failed).toBe(true)
    expect(markdown).toContain('### Failures')
    expect(markdown).toContain('src/a.ts:1:1: error foo')
    expect(extractErrors('lint', 'src/a.ts:1:1: error foo\n')).toEqual(['src/a.ts:1:1: error foo'])
    const comment = formatStickyCiComment(markdown, 'abcdef0')
    expect(comment).toContain(PR_CHECKS_COMMENT_MARKER)
    expect(comment).toContain('abcdef0')
  })
})
