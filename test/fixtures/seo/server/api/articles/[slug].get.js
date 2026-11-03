import { defineEventHandler, getRouterParam } from 'h3'

/** Shared article payloads for useI18nHead scenario pages */
const articles = {
  'cms-canonical': {
    title: 'CMS canonical article',
    excerpt: 'Short excerpt for meta tags',
    canonicalUrl: 'https://www.example.com/en/blog/cms-canonical',
    imageUrl: 'https://www.example.com/media/cms-canonical.jpg',
    locales: {
      en: 'https://www.example.com/en/blog/cms-canonical',
      fr: 'https://www.example.com/fr/blog/cms-canonical-fr',
    },
  },
  'partial-only': {
    title: 'Partial translation article',
    locales: {
      en: 'https://example.com/articles/partial-only',
      fr: 'https://example.com/fr/articles/partial-only-fr',
    },
  },
  'with-xdefault': {
    title: 'Article with custom x-default',
    locales: {
      en: 'https://example.com/articles/default-en',
      fr: 'https://example.com/fr/articles/default-fr',
    },
    defaultHref: 'https://example.com/articles/default-en',
  },
  'full-meta': {
    title: 'Full meta article',
    excerpt: 'Full article description',
    imageUrl: 'https://example.com/images/full-meta.jpg',
    canonicalUrl: 'https://example.com/blog/full-meta',
    locales: {
      en: 'https://example.com/blog/full-meta',
      fr: 'https://example.com/fr/blog/full-meta-fr',
    },
  },
  'shared-blog': {
    title: 'Shared helper blog post',
    canonicalUrl: 'https://example.com/blog/shared-blog',
    locales: {
      en: 'https://example.com/blog/shared-blog',
      fr: 'https://example.com/fr/blog/shared-blog-fr',
    },
  },
  'shared-guide': {
    title: 'Shared helper guide',
    canonicalUrl: 'https://example.com/guides/shared-guide',
    locales: {
      en: 'https://example.com/guides/shared-guide',
      fr: 'https://example.com/fr/guides/shared-guide-fr',
    },
  },
  'reactive-client': {
    title: 'Client-loaded article',
    locales: {
      en: 'https://example.com/articles/reactive-en',
      fr: 'https://example.com/fr/articles/reactive-fr',
    },
  },
}

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  return articles[slug] || null
})
