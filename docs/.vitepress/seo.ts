import type { HeadConfig, TransformContext } from 'vitepress'
import pkg from '../../package.json'

export const SITE = {
  name: 'Nuxt I18n Micro',
  url: 'https://s00d.github.io/nuxt-i18n-micro',
  locale: 'en_US',
  language: 'en-US',
  author: 's00d',
  github: 'https://github.com/s00d/nuxt-i18n-micro',
  npm: 'https://www.npmjs.com/package/nuxt-i18n-micro',
  defaultDescription:
    'Fast, simple, and lightweight internationalization for Nuxt.js with strategy-based routing and minimal bundle impact.',
  ogImage: '/og-image.png',
  themeColor: '#32ba8c',
  version: pkg.version,
} as const

const SECTION_LABELS: Record<string, string> = {
  guide: 'Guide',
  api: 'API',
  integrations: 'Integrations',
  components: 'Components',
  composables: 'Composables',
  news: 'News',
}

function toCanonicalPath(relativePath: string): string {
  let route = relativePath.replace(/\.md$/, '')
  if (route === 'index') return '/'
  if (route.endsWith('/index')) return `/${route.slice(0, -'/index'.length)}/`
  return `/${route}`
}

function absoluteUrl(pathname: string): string {
  const base = SITE.url.replace(/\/$/, '')
  if (pathname === '/') return `${base}/`
  return `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

function buildBreadcrumbs(relativePath: string, pageTitle: string) {
  const items: Array<{ name: string; url: string }> = [{ name: 'Home', url: absoluteUrl('/') }]

  if (relativePath === 'index.md') return items

  const parts = relativePath.replace(/\.md$/, '').split('/')
  if (parts.at(-1) === 'index') parts.pop()

  let current = ''
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    current = current ? `${current}/${part}` : part
    const isLast = i === parts.length - 1
    items.push({
      name: isLast ? pageTitle : (SECTION_LABELS[part] ?? part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())),
      url: absoluteUrl(`/${current}${isLast ? '' : '/'}`),
    })
  }

  return items
}

function jsonLdScript(data: unknown): HeadConfig {
  return ['script', { type: 'application/ld+json' }, JSON.stringify(data)]
}

function buildJsonLd(relativePath: string, title: string, description: string, url: string) {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.defaultDescription,
      inLanguage: SITE.language,
      publisher: { '@id': `${SITE.url}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      sameAs: [SITE.github, SITE.npm],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE.url}/#software`,
      name: SITE.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      softwareVersion: SITE.version,
      description: SITE.defaultDescription,
      url: SITE.github,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ]

  if (relativePath !== 'index.md') {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: title,
      description,
      url,
      inLanguage: SITE.language,
      isPartOf: { '@id': `${SITE.url}/#website` },
      author: {
        '@type': 'Person',
        name: SITE.author,
      },
      publisher: { '@id': `${SITE.url}/#organization` },
    })

    const breadcrumbs = buildBreadcrumbs(relativePath, title)
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function transformHead(context: TransformContext): HeadConfig[] {
  const { pageData } = context
  const title = pageData.title ?? SITE.name
  const description = pageData.description ?? SITE.defaultDescription
  const canonicalPath = toCanonicalPath(pageData.relativePath)
  const canonicalUrl = absoluteUrl(canonicalPath)
  const ogImage = absoluteUrl(SITE.ogImage)

  return [
    ['link', { rel: 'canonical', href: canonicalUrl }],
    ['meta', { name: 'author', content: SITE.author }],
    ['meta', { name: 'theme-color', content: SITE.themeColor }],
    ['meta', { property: 'og:site_name', content: SITE.name }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:type', content: pageData.relativePath === 'index.md' ? 'website' : 'article' }],
    ['meta', { property: 'og:url', content: canonicalUrl }],
    ['meta', { property: 'og:locale', content: SITE.locale }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:image:alt', content: `${SITE.name} logo` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    jsonLdScript(buildJsonLd(pageData.relativePath, title, description, canonicalUrl)),
  ]
}
