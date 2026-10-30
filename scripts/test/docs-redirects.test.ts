import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { redirects, redirectTarget } from '../../docs/.vitepress/redirects'
import { repoRoot } from '../src/utils/workspace'

const page = (route: string): string => join(repoRoot, 'docs', route.endsWith('/') ? `${route}index.md` : `${route}.md`)

describe('docs redirect map', () => {
  it('sends every old route to a page that exists, and no old route is still a page', () => {
    for (const [from, to] of Object.entries(redirects)) {
      expect(existsSync(page(from)), `${from} is still a page`).toBe(false)
      expect(existsSync(page(to.split('#')[0]!)), `${from} → ${to} has no page`).toBe(true)
    }
  })

  it('resolves base, .html, index and hashes', () => {
    expect(redirectTarget('https://x.dev/nuxt-i18n-micro/guide/v3-upgrade.html#a', '/nuxt-i18n-micro/')).toBe('/nuxt-i18n-micro/guide/upgrade#a')
    expect(redirectTarget('/guide/firebase#old', '/')).toBe('/guide/deployment#firebase')
    expect(redirectTarget('/composables/index', '/')).toBe('/api/')
    expect(redirectTarget('/composables', '/')).toBe('/api/')
    expect(redirectTarget('/guide/strategy', '/')).toBeUndefined()
  })
})
