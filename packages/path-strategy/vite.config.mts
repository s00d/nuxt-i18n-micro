import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'prefix-strategy': 'src/strategies/prefix.ts',
        'no-prefix-strategy': 'src/strategies/no-prefix.ts',
        'prefix-except-default-strategy': 'src/strategies/prefix-except-default.ts',
        'prefix-and-default-strategy': 'src/strategies/prefix-and-default.ts',
        types: 'src/types.ts',
      },
      name: 'I18nMicroPathStrategy',
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@i18n-micro/types'],
      output: {
        exports: 'named',
      },
      onwarn(warning, warn) {
        if (warning.code === 'EMPTY_BUNDLE') return
        warn(warning)
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: true,
      outDir: 'dist',
      entryRoot: 'src',
    }),
  ],
})
