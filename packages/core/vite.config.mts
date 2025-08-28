// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'nuxt-i18n-micro-core',
      formats: ['es'],
      fileName: _format => `index.mjs`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
      },
    },
  },
  plugins: [
    dts({
      outDir: 'dist',
      tsConfigPath: './tsconfig.json',
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
})
