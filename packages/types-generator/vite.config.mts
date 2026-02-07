// @ts-nocheck
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        nuxt: resolve(__dirname, 'src/nuxt.ts'),
      },
      name: '@i18n-micro/types-generator',
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      external: ['@i18n-micro/types', 'globby', 'chokidar', 'unplugin', '@nuxt/kit', 'node:fs', 'node:path'],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
  },
  plugins: [
    dts({
      rollupTypes: false,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      copyDtsFiles: true,
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
})
