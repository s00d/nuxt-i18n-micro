import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CommandResult } from '../src/utils/git-baseline'

const runCapture = vi.hoisted(() => vi.fn<(cmd: string, args: string[]) => CommandResult>())
vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  runCapture,
}))

const { publishedVersions } = await import('../src/commands/check-versions')

const npmSays = (stdout: string, ok = true) => runCapture.mockReturnValue({ ok, stdout, stderr: '' })
const E404 = JSON.stringify({ error: { code: 'E404', summary: 'Not Found', detail: 'not in this registry' } })

beforeEach(() => runCapture.mockReset())

describe('publishedVersions', () => {
  it('reads the version list npm prints', () => {
    npmSays('["3.21.3","3.21.4"]')
    expect(publishedVersions('nuxt-i18n-micro')).toEqual(['3.21.3', '3.21.4'])
  })

  it('wraps the single-version form npm uses for a one-release package', () => {
    npmSays('"1.0.0"')
    expect(publishedVersions('x')).toEqual(['1.0.0'])
  })

  it('reports a package the registry never heard of as no versions, not as a failure', () => {
    // First release of a new workspace package: npm exits non-zero with an E404 body.
    // Treating that as a failure would block every package's first publish.
    npmSays(E404, false)
    expect(publishedVersions('@i18n-micro/brand-new')).toEqual([])
  })

  it('reports an empty response as no versions', () => {
    npmSays('')
    expect(publishedVersions('never-published')).toEqual([])
  })

  it('reports a failed lookup as null so the gate can fail closed', () => {
    // The bug this guards: returning [] here reads as "not published yet", which lets an
    // already-published version through the release gate during an npm outage.
    npmSays(JSON.stringify({ error: { code: 'E500', summary: 'Internal Server Error' } }), false)
    expect(publishedVersions('x')).toBeNull()

    npmSays('<!DOCTYPE html><html>502 Bad Gateway</html>', false)
    expect(publishedVersions('x')).toBeNull()

    npmSays('', false)
    expect(publishedVersions('x')).toBeNull()
  })
})
