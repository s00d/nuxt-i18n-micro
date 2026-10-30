import { defineEventHandler, getRouterParam } from 'h3'

const posts = {
  'hello-en': {
    title: 'Hello post',
    locales: {
      en: 'https://example.com/hello-en',
      fr: 'https://example.com/fr/bonjour-fr',
    },
    urlEn: 'hello-en',
    urlFr: 'bonjour-fr',
  },
  'bonjour-fr': {
    title: 'Bonjour article',
    locales: {
      en: 'https://example.com/hello-en',
      fr: 'https://example.com/fr/bonjour-fr',
    },
    urlEn: 'hello-en',
    urlFr: 'bonjour-fr',
  },
}

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  return posts[slug] || null
})
