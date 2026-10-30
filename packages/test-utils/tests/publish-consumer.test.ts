import { describe, expect, test } from 'vitest'
import { compilerOutput } from '../src/publish-consumer'

describe('compilerOutput', () => {
  const run = (status: number | null, stdout = '', stderr = '') => ({ status, stdout, stderr, signal: null })

  test('a clean compile is empty', () => {
    expect(compilerOutput(run(0))).toBe('')
  })

  test('diagnostics come back as they are', () => {
    expect(compilerOutput(run(2, 'a.ts(1,1): error TS1\n'))).toBe('a.ts(1,1): error TS1')
  })

  test('a failure with nothing printed is no clean compile', () => {
    expect(compilerOutput(run(1))).toContain('status 1')
    expect(compilerOutput({ ...run(null), error: new Error('spawn ENOENT') })).toContain('spawn ENOENT')
  })
})
