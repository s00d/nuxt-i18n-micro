import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss({
      // Плагин Tailwind CSS 4.0 с Vite
    }),
    vue({
      customElement: true, // Enable custom element mode for .ce.vue files
    }),
    dts({
      rollupTypes: false,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      copyDtsFiles: true,
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nDevToolsUI',
      formats: ['es', 'umd'],
      fileName: (format: string) => `index.${format === 'es' ? 'es' : 'umd'}.js`,
    },
    rollupOptions: {
      // НЕ добавляем Vue в external - бандлим внутрь для независимости
      external: [
        '@i18n-micro/types',
      ],
      output: {
        exports: 'named',
        globals: {
          '@i18n-micro/types': 'I18nMicroTypes',
        },
      },
      onwarn(warning, warn) {
        // Подавляем предупреждения о sourcemap от плагина Tailwind CSS
        // Эти предупреждения не критичны, так как плагин работает корректно
        if (
          warning.message?.includes('Sourcemap is likely to be incorrect')
          || warning.plugin?.includes('tailwindcss')
        ) {
          return
        }
        warn(warning)
      },
    },
    outDir: 'dist',
    cssCodeSplit: false, // Все CSS в один файл
    sourcemap: true, // Sourcemap для JS
  },
  define: {
    'process.env': {},
  },
  css: {
    postcss: {}, // Используем пустую конфигурацию PostCSS, Vite плагин Tailwind обработает CSS
  },
})
