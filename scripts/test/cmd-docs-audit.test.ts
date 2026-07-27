import { describe, expect, it } from 'vitest'
import { collectLinks, markdownLinks, pageCandidatesForLink, pageLinks } from '../src/commands/docs-audit'

describe('collectLinks', () => {
  it('flattens nav items and their children', () => {
    const links = collectLinks({ nav: [{ text: 'Home', link: '/' }, { text: 'Guide', items: [{ text: 'A', link: '/guide/a' }] }] })
    expect(links).toEqual(['/', '/guide/a'])
  })

  it('resolves a sidebar group base against its children', () => {
    // Without this, `base: '/guide'` + `link: '/seo'` reads as a link to `/seo` and every
    // sidebar entry in the repo looks broken.
    const links = collectLinks({ sidebar: { '/guide/': [{ text: 'Guide', base: '/guide', items: [{ text: 'SEO', link: '/seo' }] }] } })
    expect(links).toEqual(['/guide/seo'])
  })

  it('lets a nested base override the one above it', () => {
    const links = collectLinks({
      sidebar: [{ base: '/guide', items: [{ link: '/a' }, { base: '/api', items: [{ link: '/b' }] }] }],
    })
    expect(links).toEqual(['/guide/a', '/api/b'])
  })

  it('accepts a sidebar given as a flat array', () => {
    expect(collectLinks({ sidebar: [{ text: 'A', link: '/a' }] })).toEqual(['/a'])
  })

  it('leaves a relative link untouched by the base', () => {
    expect(collectLinks({ sidebar: [{ base: '/guide', items: [{ link: 'https://example.dev' }] }] })).toEqual(['https://example.dev'])
  })
})

describe('pageCandidatesForLink', () => {
  it('offers both forms for a clean URL', () => {
    // cleanUrls is on, so /news may be news.md or news/index.md — both are correct.
    expect(pageCandidatesForLink('/news')).toEqual(['news.md', 'news/index.md'])
  })

  it('treats a trailing slash as naming a directory index', () => {
    expect(pageCandidatesForLink('/api/')).toEqual(['api/index.md'])
  })

  it('maps the root to the root index', () => {
    expect(pageCandidatesForLink('/')).toEqual(['index.md'])
  })

  it('ignores an anchor', () => {
    expect(pageCandidatesForLink('/guide/seo#meta')).toEqual(['guide/seo.md', 'guide/seo/index.md'])
  })

  it.each(['https://example.dev', 'mailto:a@b.dev', './relative', '#anchor', '//example.dev/x'])('returns nothing for %s, which leaves the docs', (link) => {
    expect(pageCandidatesForLink(link)).toEqual([])
  })
})

describe('pageLinks', () => {
  it('resolves a relative link against the page it is on', () => {
    expect(pageLinks('api/packages.md', 'see [core](./packages/core.md)')).toContain('api/packages/core.md')
  })

  it('accepts the extensionless form the site renders', () => {
    expect(pageLinks('api/packages.md', 'see [core](/api/packages/core)')).toContain('api/packages/core.md')
  })

  it('offers the index form for a bare path', () => {
    // `/guide/` and `/guide` are both written; only one has a file behind it.
    expect(pageLinks('index.md', 'see [guide](/guide)')).toContain('guide/index.md')
    expect(pageLinks('index.md', 'see [guide](/guide/)')).toEqual(['guide/index.md'])
  })

  it('ignores external links, bare anchors and protocol-relative URLs', () => {
    expect(pageLinks('a.md', 'see [x](https://example.dev) and [y](#section)')).toEqual([])
    // `//example.dev/x` is external; treating it as a path put a phantom page into the
    // reachability walk.
    expect(pageLinks('a.md', 'see [x](//example.dev/x)')).toEqual([])
  })
})

describe('markdownLinks', () => {
  it('finds inline links', () => {
    expect(markdownLinks('see [a](./a.md) and [b](/guide/b.md)')).toEqual(['./a.md', '/guide/b.md'])
  })

  it('reads a link that carries a title', () => {
    // `](/page.md "Title")` is valid Markdown; requiring the paren to follow the target
    // immediately skipped those links entirely.
    expect(markdownLinks('see [a](./a.md "Why")')).toEqual(['./a.md'])
    expect(markdownLinks('see [a](<./a b.md>)')).toEqual(['./a b.md'])
  })

  it('ignores links inside fenced and inline code', () => {
    // Docs are full of example snippets; a link in one is not a link.
    expect(markdownLinks('```md\n[x](./ghost.md)\n```\ntext')).toEqual([])
    expect(markdownLinks('use `[x](./ghost.md)` here')).toEqual([])
  })
})
