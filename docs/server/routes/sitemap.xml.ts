import { queryCollection } from '@nuxt/content/server'

/** Prerendered to `sitemap.xml` (robots.txt points here). `lastmod` comes from git, like VitePress. */
const SITE_URL = 'https://s00d.github.io/nuxt-i18n-micro'

export default defineEventHandler(async (event) => {
  const pages = await queryCollection(event, 'docs').where('extension', '=', 'md').select('path', 'lastUpdated').all()
  const urls = [{ path: '/', lastUpdated: undefined as string | undefined }, ...pages]
    .map(({ path, lastUpdated }) => {
      const loc = `${SITE_URL}${path === '/' ? '/' : path}`
      return `  <url><loc>${loc}</loc>${lastUpdated ? `<lastmod>${lastUpdated}</lastmod>` : ''}</url>`
    })
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
})
