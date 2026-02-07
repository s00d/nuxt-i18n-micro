import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Separate configuration for building the plugin
// The plugin should work in a Node.js environment, not in the browser
export default defineConfig({
  build: {
    ssr: true, // SSR mode for Node.js environment
    lib: {
      entry: resolve(__dirname, 'vite/plugin.ts'),
      name: 'i18nDevToolsPlugin',
      formats: ['es'],
      fileName: () => 'plugin.mjs',
    },
    rollupOptions: {
      external: (id) => {
        // Externalize all dependencies, including node:*
        // The plugin runs in Node.js, so node: modules should be external
        return !id.startsWith('.') && !id.startsWith('/')
      },
      output: {
        format: 'es',
        entryFileNames: 'plugin.mjs',
        exports: 'named',
      },
    },
    outDir: resolve(__dirname, 'dist/vite'),
    emptyOutDir: true,
    sourcemap: true,
  },
})
