/**
 * Characterization of the whole routing pipeline: every app in scenarios.ts under every
 * strategy, built by route-strategy and served by path-strategy on a real vue-router. The
 * golden files record what each URL reads as and where every navigation lands; a change to
 * either package shows up as a diff in them.
 */
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { captureWarnings, describeApp } from './describe'
import { APPS, STRATEGIES } from './scenarios'

let restore: () => void
beforeAll(() => {
  restore = captureWarnings()
})
afterAll(() => restore())

describe('routing characterization', () => {
  for (const app of APPS)
    for (const strategy of app.strategies ?? STRATEGIES)
      test(`${app.name} · ${strategy}`, async () => {
        await expect(describeApp(app, strategy)).toMatchFileSnapshot(`./__golden__/${app.name}.${strategy}.md`)
        for (const host of app.hosts ?? [])
          await expect(describeApp(app, strategy, host)).toMatchFileSnapshot(`./__golden__/${app.name}.${strategy}.${host}.md`)
      })
})
