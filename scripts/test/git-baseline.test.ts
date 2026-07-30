import { describe, expect, it } from 'vitest'
import { affectsPublishedArtifact } from '../src/utils/git-baseline'

describe('affectsPublishedArtifact', () => {
  it.each(['test/foo.test.ts', 'tests/foo.ts', '__tests__/a.ts', 'playground/app.vue', 'example/x.ts', 'README.md', 'vitest.config.ts', 'CHANGELOG.md'])(
    'ignores %s — it cannot change what ships',
    (path) => {
      expect(affectsPublishedArtifact(path)).toBe(false)
    },
  )

  it.each(['src/index.ts', 'dist/index.mjs', 'package.json', 'build.config.ts', 'something-new.json'])('counts %s', (path) => {
    expect(affectsPublishedArtifact(path)).toBe(true)
  })

  it('does not mistake a nested path for an ignored one', () => {
    // The rules anchor at the package root: `src/test/helper.ts` still ships.
    expect(affectsPublishedArtifact('src/test/helper.ts')).toBe(true)
    expect(affectsPublishedArtifact('src/docs.md')).toBe(false)
  })
})
