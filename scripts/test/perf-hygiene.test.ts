import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { repoRoot } from '../src/utils/workspace'

describe('perf suite hygiene', () => {
  it('does not use run:dev (e2e HMR only lives in recipes)', () => {
    const suite = readFileSync(join(repoRoot, 'scripts/src/perf/suite.ts'), 'utf8')
    const run = readFileSync(join(repoRoot, 'scripts/src/perf/run.ts'), 'utf8')
    expect(suite).not.toMatch(/run:\s*['"]dev['"]/)
    expect(run).not.toMatch(/run:\s*['"]dev['"]/)
    expect(suite).toContain('NITRO_SERVER_ENTRY')
    expect(suite).toContain('ensureConsumerModuleDist')
    expect(suite).toContain('artilleryKnobsFromProfile')
  })

  it('recipes keep run:dev only for translation-watcher HMR fixtures', () => {
    const recipes = readFileSync(join(repoRoot, 'test/recipes.ts'), 'utf8')
    const devHits = [...recipes.matchAll(/run:\s*['"]dev['"]/g)]
    expect(devHits.length).toBeGreaterThan(0)
    // Perf CLI path must not appear in recipes.
    expect(recipes).not.toMatch(/createI18nPerfSuite|test:performance/)
  })
})
