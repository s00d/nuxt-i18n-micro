import { describe, expect, it } from 'vitest'
import {
  areaForPath,
  buildDiffAudit,
  buildPrDiffCommentBody,
  extractDiffAuditId,
  formatAuditMarkdown,
  isTestFile,
  parseNameStatus,
  parseNumstat,
  PR_DIFF_COMMENT_MARKER,
} from '../src/commands/pr-diff-audit'

describe('pr-diff-audit', () => {
  it('maps areas for this monorepo', () => {
    expect(areaForPath('src/module.ts')).toBe('src')
    expect(areaForPath('packages/hmr/src/watcher.ts')).toBe('packages')
    expect(areaForPath('test/basic.spec.ts')).toBe('test')
  })

  it('parses numstat and name-status', () => {
    const numstat = parseNumstat('10\t2\tsrc/a.ts\n3\t0\ttest/a.test.ts\n')
    expect(numstat.get('src/a.ts')).toEqual({ added: 10, deleted: 2 })
    const status = parseNameStatus('M\tsrc/a.ts\nA\ttest/a.test.ts\n')
    expect(status.get('test/a.test.ts')).toBe('A')
    expect(isTestFile('test/a.test.ts')).toBe(true)
  })

  it('keeps directory prefix for brace-form renames in numstat', () => {
    const numstat = parseNumstat('10\t2\tdir/{old.txt => new.txt}\n3\t1\to/a.ts => o/b.ts\n')
    expect(numstat.get('dir/new.txt')).toEqual({ added: 10, deleted: 2 })
    expect(numstat.get('o/b.ts')).toEqual({ added: 3, deleted: 1 })
    expect(numstat.has('new.txt')).toBe(false)
  })

  it('builds audit markdown and sticky marker', () => {
    const audit = buildDiffAudit({
      files: ['src/a.ts', 'test/a.test.ts'],
      numstatText: '10\t2\tsrc/a.ts\n5\t0\ttest/a.test.ts\n',
      nameStatusText: 'M\tsrc/a.ts\nA\ttest/a.test.ts\n',
    })
    expect(audit.files).toBe(2)
    expect(audit.testFilesAdded).toBe(1)
    const md = formatAuditMarkdown(audit)
    expect(md).toContain('### Diff audit')
    expect(md).toContain('`src`')
    const body = buildPrDiffCommentBody({ id: 'abc123', pr: 42, audit, headSha: 'deadbeef' })
    expect(body).toContain(PR_DIFF_COMMENT_MARKER)
    expect(body).toContain('PR:** #42')
    expect(extractDiffAuditId(body)).toBe('abc123')
  })

  it('escapes backticks in paths rendered into the sticky comment', () => {
    const audit = buildDiffAudit({
      files: ['evil`x.png'] ,
      numstatText: '1\t0\tevil`x.png\n',
      nameStatusText: 'A\tevil`x.png\n',
    })
    const md = formatAuditMarkdown(audit)
    expect(md).toContain('``evil`x.png``')
    expect(md).not.toMatch(/(^|\n)- `evil`x\.png`(\n|$)/)
  })
})
