import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    tailwindcss({
      // Tailwind CSS 4.0 plugin with Vite
    }) as any,
    vue({
      customElement: true, // Enable custom element mode for .ce.vue files
    }) as any,
    dts({
      rollupTypes: false,
      include: ['src/**/*.ts', 'src/**/*.vue', 'vite/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      copyDtsFiles: true,
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      // Generate types for the plugin in dist/vite
      beforeWriteFile: (filePath, content) => {
        if (filePath.includes('vite/plugin')) {
          return {
            filePath: filePath.replace(/dist\/vite\/plugin\.d\.ts$/, 'vite/plugin.d.ts'),
            content,
          }
        }
      },
    }) as any,
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nDevToolsUI',
      formats: ['es', 'umd'],
      fileName: (format: string) => `index.${format === 'es' ? 'es' : 'umd'}.js`,
    },
    rollupOptions: {
      // Do NOT add Vue to external - bundle it inside for independence
      external: ['@i18n-micro/types'],
      output: {
        exports: 'named',
        globals: {
          '@i18n-micro/types': 'I18nMicroTypes',
        },
      },
      onwarn(warning, warn) {
        // Suppress sourcemap warnings from the Tailwind CSS plugin
        // These warnings are not critical as the plugin works correctly
        if (warning.message?.includes('Sourcemap is likely to be incorrect') || warning.plugin?.includes('tailwindcss')) {
          return
        }
        warn(warning)
      },
    },
    outDir: 'dist',
    cssCodeSplit: false, // All CSS in one file
    sourcemap: true, // Sourcemap for JS
  },
  define: {
    'process.env': {},
  },
  css: {
    postcss: {}, // Use empty PostCSS config, Vite Tailwind plugin will handle CSS
  },
})
