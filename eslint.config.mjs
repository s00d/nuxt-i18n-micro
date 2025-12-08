// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: true,
  },
  dirs: {
    src: [
      './playground',
    ],
  },
})
  .prepend({
    ignores: [
      '**/.astro/**',
      '**/.astro/**/*',
      '**/playground/**/.astro/**',
      '**/packages/*/playground/**/.astro/**',
      '**/packages/astro/playground/.astro/**',
      '**/packages/astro/playground/src/env.d.ts',
    ],
  })
  .append({
    rules: {
      'vue/no-v-html': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      // Enforce consistent comment spacing
      'spaced-comment': ['error', 'always', {
        exceptions: ['*'],
        markers: ['/'],
      }],
    },
  })
