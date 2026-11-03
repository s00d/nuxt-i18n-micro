import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const pageSchema = z.object({
  /** Set at build time from git (nuxt.config `content:file:afterParse`). */
  lastUpdated: z.string().optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        icon: z.string().optional(),
        to: z.string(),
        target: z.string().optional(),
      }),
    )
    .optional(),
  navigation: z
    .union([
      z.boolean(),
      z.object({
        title: z.string().optional(),
        order: z.number().optional(),
        /** Sidebar heading the page is listed under (`useSectionNavigation`). */
        group: z.string().optional(),
      }),
    ])
    .optional(),
})

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.md',
    }),
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['index.md', 'v3/**'],
      },
      schema: pageSchema,
    }),
    /** Archived v3 docs under `/v3`: a collection of their own keeps them out of v4 search and navigation. */
    v3: defineCollection({
      type: 'page',
      source: 'v3/**',
      schema: pageSchema,
    }),
  },
})
