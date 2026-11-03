import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { joinURL } from 'ufo'
import { redirects, redirectTarget } from './redirects'

const rootDir = dirname(fileURLToPath(import.meta.url))

const docsBase = process.env.NUXT_APP_BASE_URL || (process.env.NODE_ENV === 'production' ? '/nuxt-i18n-micro/' : '/')

const routeRules = Object.fromEntries(
  Object.entries(redirects).map(([from, to]) => {
    const source = from.endsWith('/') && from !== '/' ? from.slice(0, -1) : from
    const destination = to.includes('#') ? to : to.endsWith('/') && to !== '/' ? to.slice(0, -1) : to
    // Nitro does not add `app.baseURL` to redirect targets; the prerendered stub needs it on GH Pages.
    return [source, { redirect: { to: joinURL(docsBase, destination), statusCode: 301 as const } }]
  }),
)

/**
 * Prerendered page at an old URL (GitHub Pages has no server redirects). Replaces Nitro's bare
 * meta-refresh stub: adds noindex + canonical, and keeps the old `#hash` unless the target has one.
 */
function redirectStub(target: string): string {
  const canonical = new URL(target.split('#')[0]!, 'https://s00d.github.io').href
  const keepHash = !target.includes('#')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${canonical}">
<meta http-equiv="refresh" content="0; url=${target}">
<script>location.replace(${JSON.stringify(target)}${keepHash ? ' + location.hash' : ''})</script>
</head>
<body><p>This page has moved to <a href="${target}">${target}</a>.</p></body>
</html>
`
}

/**
 * Content page paths for prerender.
 * Nitro crawlLinks skips pathnames that look like file extensions (`/news/v4.0.0` → `.0`),
 * so dotted release URLs must be listed explicitly (see nitro.build/docs/prerendering).
 */
function contentPageRoutes(contentDir: string): string[] {
  const routes: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (!entry.name.endsWith('.md')) continue
      const rel = relative(contentDir, full).replace(/\\/g, '/')
      if (rel === 'index.md') {
        routes.push('/')
        continue
      }
      if (rel.endsWith('/index.md')) routes.push(`/${rel.slice(0, -'/index.md'.length)}`)
      else routes.push(`/${rel.slice(0, -'.md'.length)}`)
    }
  }
  walk(contentDir)
  return [...new Set(routes)]
}

const contentDir = resolve(rootDir, 'content')

/** ISO date of the last commit touching a file (VitePress `lastUpdated`); `undefined` when uncommitted. */
function gitLastUpdated(file: string): string | undefined {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--follow', '--', file], { cwd: rootDir, encoding: 'utf8' })
    return out.trim() || undefined
  } catch {
    return undefined
  }
}

export default defineNuxtConfig({
  modules: ['@nuxt/image', '@nuxt/ui', '@nuxt/content', 'nuxt-og-image', 'nuxt-llms'],

  css: ['~/assets/css/main.css'],

  site: {
    name: 'Nuxt I18n Micro',
    url: 'https://s00d.github.io',
  },

  app: {
    baseURL: docsBase,
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', href: `${docsBase}favicon.ico`, sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: `${docsBase}favicon.svg` },
        { rel: 'apple-touch-icon', href: `${docsBase}apple-touch-icon.png` },
      ],
    },
  },

  runtimeConfig: {
    public: {
      mintlifyAssistantId: 'mint_widget_fe4a84f3-0f6c-4dc0-94d6-3941d70125c2',
    },
  },

  icon: {
    // Bundle every icon the site renders: prerender then never waits on lazy collection loads,
    // and client navigation on the static host never falls back to the Iconify API.
    clientBundle: {
      scan: true,
      // Not visible to the scanner: code-block filename icons mapped in app.config.ts (ui.prose.codeIcon).
      icons: ['simple-icons:pnpm', 'simple-icons:yarn', 'simple-icons:bun', 'simple-icons:npm', 'simple-icons:nuxtdotjs', 'simple-icons:json'],
      sizeLimitKb: 512,
    },
  },

  colorMode: {
    preference: 'system',
  },

  content: {
    build: {
      markdown: {
        toc: { searchDepth: 2 },
      },
      // Keep composable/API camelCase filenames as URL paths (default slugify lowercases).
      pathMeta: {
        slugifyOptions: { lower: false },
      },
    },
    experimental: {
      sqliteConnector: 'native',
    },
  },

  routeRules,

  nitro: {
    hooks: {
      'prerender:generate'(route) {
        // Old routes are never pages (scripts/test/docs-redirects.test.ts), so a match is a stub.
        const target = redirectTarget(route.route, docsBase)
        if (target && !route.error) route.contents = redirectStub(target)
      },
    },
    prerender: {
      // `guide/strategy.html`, not `guide/strategy/index.html`: GitHub Pages serves `/guide/strategy`
      // from it as is, while a folder index answers with a 301 to the trailing-slash URL.
      autoSubfolderIndex: false,
      crawlLinks: true,
      failOnError: true,
    },
  },

  hooks: {
    'content:file:afterParse'(ctx) {
      if (ctx.collection.name !== 'docs') return
      const lastUpdated = gitLastUpdated(resolve(contentDir, ctx.file.path))
      if (lastUpdated) ctx.content.lastUpdated = lastUpdated
    },
    'prerender:routes'(ctx) {
      for (const route of contentPageRoutes(contentDir)) ctx.routes.add(route)
      ctx.routes.add('/sitemap.xml')
    },
  },

  llms: {
    domain: 'https://s00d.github.io/nuxt-i18n-micro',
    title: 'Nuxt I18n Micro',
    description: 'Fast, lightweight i18n for Nuxt with strategy-based routing and minimal overhead.',
    // The current docs only: the archived v3 collection would mislead an assistant reading llms.txt.
    sections: [
      {
        title: 'Documentation',
        contentCollection: 'docs',
        contentFilters: [{ field: 'extension', operator: '=', value: 'md' }],
      },
    ],
    full: {
      title: 'Nuxt I18n Micro — full docs',
      description: 'Complete documentation for nuxt-i18n-micro and @i18n-micro/* packages.',
    },
  },

  ogImage: {
    zeroRuntime: true,
  },

  compatibilityDate: '2025-11-03',

  future: {
    compatibilityVersion: 4,
  },
})
