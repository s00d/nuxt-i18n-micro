import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

/**
 * Caret pins of the released nuxt-i18n-micro@3.30.3 on packages that lost something it imports or
 * changed behaviour under it. A publish inside its pin reaches every fresh install of that release:
 * utils 1.x without `/build`, `/payload-config`, `/payload-stats`, `/route` or `resolveServerLocale`
 * would break it at load. `@i18n-micro/types` stays 1.x: all it lost is a field nothing reads.
 */
const pinnedMajors = { core: 1, 'path-strategy': 1, 'route-strategy': 1, 'test-utils': 1, utils: 1 }

test.each(Object.entries(pinnedMajors))('@i18n-micro/%s publishes outside the pin of the released module', (name, major) => {
  const { version } = JSON.parse(readFileSync(new URL(`../../packages/${name}/package.json`, import.meta.url), 'utf8'))
  expect(Number(version.split('.')[0])).toBeGreaterThan(major)
})
