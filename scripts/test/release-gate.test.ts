import { beforeEach, describe, expect, it, vi } from 'vitest'

const tryRun = vi.hoisted(() => vi.fn())
vi.mock('../src/utils/git-baseline', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/utils/git-baseline')>()),
  tryRun,
}))

const { publishedVersions } = await import('../src/commands/check-versions')

beforeEach(() => tryRun.mockReset())

describe('publishedVersions', () => {
  it('reads the version list npm prints', () => {
    tryRun.mockReturnValue('["3.21.3","3.21.4"]')
    expect(publishedVersions('nuxt-i18n-micro')).toEqual(['3.21.3', '3.21.4'])
  })

  it('wraps the single-version form npm uses for a one-release package', () => {
    tryRun.mockReturnValue('"1.0.0"')
    expect(publishedVersions('x')).toEqual(['1.0.0'])
  })

  it('reports an empty registry as no versions, not as a failure', () => {
    tryRun.mockReturnValue('')
    expect(publishedVersions('never-published')).toEqual([])
  })

  it('reports a failed lookup as null so the gate can fail closed', () => {
    // The bug this guards: returning [] here reads as "not published yet", which lets an
    // already-published version through the release gate during an npm outage.
    tryRun.mockReturnValue(null)
    expect(publishedVersions('x')).toBeNull()

    tryRun.mockReturnValue('<!DOCTYPE html><html>502</html>')
    expect(publishedVersions('x')).toBeNull()
  })
})
