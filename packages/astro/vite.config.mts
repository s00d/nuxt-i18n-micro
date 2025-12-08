// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@i18n-micro/astro',
      formats: ['cjs', 'es'],
      fileName: format => `index.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      external: [
        '@i18n-micro/core',
        '@i18n-micro/types',
        'node:fs',
        'node:fs/promises',
        'node:path',
        'node:url',
        'astro',
      ],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
  },
  plugins: [
    dts({
      rollupTypes: false,
      include: ['src/**/*.ts', 'src/**/*.d.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      copyDtsFiles: true,
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
})
