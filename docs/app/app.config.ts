export default defineAppConfig({
  ui: {
    colors: {
      // Matches @theme green scale in main.css (brand #32ba8c).
      primary: 'green',
      neutral: 'zinc',
    },
    contentNavigation: {
      slots: {
        // Default `truncate` cuts long titles ("Migrating from @nuxtjs/i18n"); wrap them instead.
        // `text-clip` replaces `truncate` in the tailwind-merge group; a wrapped group title (an
        // accordion button) would otherwise be centered.
        linkTitle: 'text-clip whitespace-normal text-pretty text-start',
      },
    },
    contentToc: {
      slots: {
        // Same as the sidebar: wrap long headings instead of cutting them off.
        linkText: 'text-clip whitespace-normal text-pretty',
      },
    },
    contentSurround: {
      slots: {
        root: 'gap-4',
        link: 'px-5 py-4',
        linkLeading: 'mb-2 p-1',
        linkLeadingIcon: 'size-4',
        linkTitle: 'mb-0.5',
      },
    },
    prose: {
      // Code-group tab icons from installed collections (vscode-icons is not bundled).
      codeIcon: {
        pnpm: 'i-simple-icons-pnpm',
        npm: 'i-simple-icons-npm',
        yarn: 'i-simple-icons-yarn',
        bun: 'i-simple-icons-bun',
        'nuxt.config.ts': 'i-simple-icons-nuxtdotjs',
        json: 'i-simple-icons-json',
      },
      // Inline code as a light tint, not a bordered chip: `inline` (not `inline-block`) keeps it on the
      // text baseline, lets long names wrap, and adds no height to the line or a table row.
      code: {
        base: 'inline px-1 py-px text-[0.875em] font-medium rounded box-decoration-clone wrap-break-word',
        variants: {
          color: {
            neutral: 'border-0 bg-elevated text-highlighted',
          },
        },
      },
      a: {
        base: '[&>code]:text-primary',
      },
      p: { base: 'my-4' },
      ul: { base: 'my-4' },
      ol: { base: 'my-4' },
      li: { base: 'my-1' },
      h2: { slots: { base: 'mt-12 mb-4' } },
      h3: { slots: { base: 'mt-8 mb-2' } },
      h4: { slots: { base: 'mt-6 mb-2' } },
      // Tables: one outer border with row rules, compact cells, content on one top line.
      table: {
        slots: {
          root: 'my-6 rounded-lg border border-default',
          base: 'border-collapse',
        },
      },
      thead: { base: 'bg-elevated/60' },
      th: {
        base: 'py-2 px-3 align-bottom text-highlighted border-0 border-b first:border-s-0 border-default whitespace-nowrap',
      },
      td: {
        base: 'py-2 px-3 align-top leading-6 border-0 border-b first:border-s-0 border-default [&_code]:text-[0.8125rem] [&_code]:leading-6',
      },
      tr: {
        base: '[&:last-child>td]:border-b-0',
      },
    },
  },
  seo: {
    siteName: 'Nuxt I18n Micro',
  },
  header: {
    search: true,
    colorMode: true,
  },
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      // Edit link base for the page footer.
      edit: 'https://github.com/s00d/nuxt-i18n-micro/edit/main/docs/content',
      links: [
        {
          icon: 'i-simple-icons-github',
          label: 'Star on GitHub',
          to: 'https://github.com/s00d/nuxt-i18n-micro',
          target: '_blank',
        },
        {
          icon: 'i-simple-icons-npm',
          label: 'npm package',
          to: 'https://www.npmjs.com/package/nuxt-i18n-micro',
          target: '_blank',
        },
      ],
    },
  },
  /** Header sections per docs version; `match` prefixes also pick the sidebar subtree. */
  sections: {
    v4: [
      { label: 'Guide', to: '/guide/getting-started', match: '/guide' },
      { label: 'Frameworks', to: '/integrations', match: '/integrations' },
      { label: 'API', to: '/api', match: ['/api', '/composables', '/components'] },
      { label: 'Contributing', to: '/contributing', match: '/contributing' },
      { label: 'News', to: '/news', match: '/news' },
    ],
    v3: [
      { label: 'Guide', to: '/v3/guide/getting-started', match: '/v3/guide' },
      { label: 'Integrations', to: '/v3/integrations', match: '/v3/integrations' },
      { label: 'API', to: '/v3/api', match: ['/v3/api', '/v3/examples'] },
      { label: 'Components', to: '/v3/components', match: '/v3/components' },
      { label: 'Composables', to: '/v3/composables', match: '/v3/composables' },
    ],
  },
})
