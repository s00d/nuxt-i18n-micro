import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    solidPlugin(),
    dts({
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }) as unknown as import('vite').Plugin,
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nMicroSolid',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        'solid-js/store',
        '@solidjs/router',
        '@i18n-micro/core',
        '@i18n-micro/types',
      ],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
})
