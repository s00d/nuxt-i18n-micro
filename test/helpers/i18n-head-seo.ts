import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface I18nHeadScenario {
  name: string
  path: string
  linkLabel: string
  testId?: string
  content?: string
  ogTitle?: string
  ogDescription?: string
  canonical?: RegExp | string
  alternates?: Array<{ hreflang: string; href: string }>
  skipXDefault?: boolean
  noHreflang?: boolean
  keepModuleHreflang?: boolean
}

export const i18nHeadScenarios: I18nHeadScenario[] = [
  {
    name: 'post with per-locale slugs',
    path: '/post/hello-en',
    linkLabel: 'Post (slugs)',
    testId: 'post-title',
    content: 'Hello post',
    ogTitle: 'Hello post',
    alternates: [
      { hreflang: 'en', href: 'https://example.com/hello-en' },
      { hreflang: 'fr', href: 'https://example.com/fr/bonjour-fr' },
    ],
    skipXDefault: true,
  },
  {
    name: 'canonical and og:url override',
    path: '/canonical/cms-canonical',
    linkLabel: 'Canonical override',
    testId: 'article-title',
    content: 'CMS canonical article',
    ogTitle: 'CMS canonical article',
    canonical: 'https://www.example.com/en/blog/cms-canonical',
    alternates: [
      { hreflang: 'en', href: 'https://www.example.com/en/blog/cms-canonical' },
      { hreflang: 'fr', href: 'https://www.example.com/fr/blog/cms-canonical-fr' },
    ],
  },
  {
    name: 'partial alternates only',
    path: '/partial/partial-only',
    linkLabel: 'Partial alternates',
    testId: 'article-title',
    content: 'Partial translation article',
    canonical: /\/partial\/partial-only/,
    alternates: [
      { hreflang: 'en', href: 'https://example.com/articles/partial-only' },
      { hreflang: 'fr', href: 'https://example.com/fr/articles/partial-only-fr' },
    ],
  },
  {
    name: 'custom x-default',
    path: '/x-default/with-xdefault',
    linkLabel: 'Custom x-default',
    testId: 'article-title',
    content: 'Article with custom x-default',
    alternates: [
      { hreflang: 'x-default', href: 'https://example.com/articles/default-en' },
      { hreflang: 'en', href: 'https://example.com/articles/default-en' },
      { hreflang: 'fr', href: 'https://example.com/fr/articles/default-fr' },
    ],
  },
  {
    name: 'full meta bundle',
    path: '/full/full-meta',
    linkLabel: 'Full meta',
    testId: 'article-title',
    content: 'Full meta article',
    ogTitle: 'Full meta article',
    ogDescription: 'Full article description',
    canonical: 'https://example.com/blog/full-meta',
    alternates: [
      { hreflang: 'en', href: 'https://example.com/blog/full-meta' },
      { hreflang: 'fr', href: 'https://example.com/fr/blog/full-meta-fr' },
    ],
  },
  {
    name: 'shared helper blog',
    path: '/blog/shared-blog',
    linkLabel: 'Blog (shared helper)',
    testId: 'article-title',
    content: 'Shared helper blog post',
    ogTitle: 'Shared helper blog post',
    canonical: 'https://example.com/blog/shared-blog',
    alternates: [{ hreflang: 'fr', href: 'https://example.com/fr/blog/shared-blog-fr' }],
  },
  {
    name: 'shared helper guide',
    path: '/guides/shared-guide',
    linkLabel: 'Guide (shared helper)',
    testId: 'article-title',
    content: 'Shared helper guide',
    ogTitle: 'Shared helper guide',
    canonical: 'https://example.com/guides/shared-guide',
    alternates: [{ hreflang: 'fr', href: 'https://example.com/fr/guides/shared-guide-fr' }],
  },
]

export const i18nHeadStaticPages: I18nHeadScenario[] = [
  {
    name: 'custom alternates with disable',
    path: '/custom-alternates',
    linkLabel: 'Custom alternates (disable)',
    testId: 'page-id',
    content: 'custom-alternates',
    alternates: [
      { hreflang: 'en', href: 'https://example.com/custom/en' },
      { hreflang: 'fr', href: 'https://example.com/custom/fr' },
    ],
    skipXDefault: true,
  },
  {
    name: 'landing og only',
    path: '/landing',
    linkLabel: 'Landing OG only',
    testId: 'page-id',
    content: 'landing',
    ogTitle: 'Landing OG title',
    ogDescription: 'Landing OG description',
    keepModuleHreflang: true,
  },
  {
    name: 'no hreflang',
    path: '/no-hreflang',
    linkLabel: 'No hreflang',
    testId: 'page-id',
    content: 'no-hreflang',
    noHreflang: true,
  },
]

export async function assertI18nHeadScenario(page: Page, scenario: I18nHeadScenario) {
  if (scenario.testId && scenario.content) {
    await expect(page.getByTestId(scenario.testId)).toHaveText(scenario.content)
  }

  if (scenario.ogTitle) {
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', scenario.ogTitle)
  }

  if (scenario.ogDescription) {
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', scenario.ogDescription)
  }

  if (scenario.canonical) {
    const canonical = page.locator('link[rel="canonical"]')
    if (typeof scenario.canonical === 'string') {
      await expect(canonical).toHaveAttribute('href', scenario.canonical)
    } else {
      await expect(canonical).toHaveAttribute('href', scenario.canonical)
    }
  }

  if (scenario.noHreflang) {
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(0)
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(0)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    return
  }

  if (scenario.alternates) {
    await Promise.all(
      scenario.alternates.map((alternate) =>
        expect(page.locator(`link[rel="alternate"][hreflang="${alternate.hreflang}"]`)).toHaveAttribute('href', alternate.href),
      ),
    )
  }

  if (scenario.skipXDefault) {
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(0)
  }

  if (scenario.keepModuleHreflang) {
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
  }
}

export function expectHtmlScenario(html: string, scenario: I18nHeadScenario) {
  if (scenario.content) {
    expect(html).toContain(scenario.content)
  }

  if (scenario.ogTitle) {
    expect(html).toMatch(new RegExp(`<meta[^>]*property="og:title"[^>]*content="${scenario.ogTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
  }

  if (scenario.ogDescription) {
    expect(html).toMatch(
      new RegExp(`<meta[^>]*property="og:description"[^>]*content="${scenario.ogDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
    )
  }

  if (scenario.canonical) {
    if (typeof scenario.canonical === 'string') {
      const escaped = scenario.canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      expect(html).toMatch(new RegExp(`<link[^>]*rel="canonical"[^>]*href="${escaped}"`))
    } else {
      expect(html).toMatch(scenario.canonical)
    }
  }

  if (scenario.noHreflang) {
    expect(html).not.toMatch(/hreflang="en"/)
    expect(html).not.toMatch(/hreflang="fr"/)
    expect(html).not.toMatch(/hreflang="x-default"/)
    expect(html).toMatch(/<link[^>]*rel="canonical"/)
    return
  }

  if (scenario.alternates) {
    for (const alternate of scenario.alternates) {
      const escapedHref = alternate.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      expect(html).toMatch(new RegExp(`<link[^>]*rel="alternate"[^>]*hreflang="${alternate.hreflang}"[^>]*href="${escapedHref}"`))
    }
  }

  if (scenario.skipXDefault) {
    expect(html).not.toMatch(/hreflang="x-default"/)
  }

  if (scenario.keepModuleHreflang) {
    expect(html).toMatch(/hreflang="en"/)
    expect(html).toMatch(/hreflang="fr"/)
    expect(html).toMatch(/hreflang="x-default"/)
  }
}

export function staticHtmlPath(publicDir: string, routePath: string): string {
  const normalized = routePath.replace(/^\//, '').replace(/\/$/, '')
  if (!normalized) return `${publicDir}/index.html`
  return `${publicDir}/${normalized}/index.html`
}
