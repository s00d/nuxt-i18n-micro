import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import type { RollupLog } from 'rollup'
import { defineConfig, type Plugin, type UserConfig } from 'vite'
import dts from 'vite-plugin-dts'

const tailwindPlugins = tailwindcss() as Plugin | Plugin[]

const rootDir = fileURLToPath(new URL('.', import.meta.url))

function writeIndexRequireTypes(filePath: string, content: string) {
  const normalized = filePath.replace(/\\/g, '/')
  if (!normalized.endsWith('/dist/index.d.ts')) {
    return { filePath, content }
  }
  const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
  mkdirSync(dirname(ctsPath), { recursive: true })
  writeFileSync(ctsPath, content)
  return { filePath, content }
}

function suppressTailwindSourcemapWarn(warning: RollupLog, warn: (warning: RollupLog) => void) {
  if (warning.message?.includes('Sourcemap is likely to be incorrect') || warning.plugin?.includes('tailwindcss')) {
    return
  }
  warn(warning)
}

const libEs: UserConfig = {
  plugins: [
    ...(Array.isArray(tailwindPlugins) ? tailwindPlugins : [tailwindPlugins]),
    vue({ features: { customElement: true } }),
    dts({
      rollupTypes: false,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      outDir: resolve(rootDir, 'dist'),
      tsconfigPath: resolve(rootDir, 'tsconfig.json'),
      beforeWriteFile: writeIndexRequireTypes,
    }),
  ],
  define: { 'process.env': {} },
  css: { postcss: {} },
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: {
        index: resolve(rootDir, 'src/index.ts'),
        'bridge/interface': resolve(rootDir, 'src/bridge/interface.ts'),
        'bridge/create-bridge': resolve(rootDir, 'src/bridge/create-bridge.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => (entryName === 'index' ? 'index.es.js' : `${entryName}.js`),
    },
    rollupOptions: {
      external: ['@i18n-micro/types'],
      output: { exports: 'named' },
      onwarn: suppressTailwindSourcemapWarn,
    },
  },
}

const libUmd: UserConfig = {
  plugins: [vue({ features: { customElement: true } })],
  define: { 'process.env': {} },
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: resolve(rootDir, 'src/index.ts'),
      name: 'I18nDevToolsUI',
      formats: ['umd'],
      fileName: () => 'index.umd.js',
    },
    rollupOptions: {
      external: ['@i18n-micro/types'],
      output: {
        exports: 'named',
        globals: { '@i18n-micro/types': 'I18nMicroTypes' },
      },
      onwarn: suppressTailwindSourcemapWarn,
    },
  },
}

function publishPluginTypes() {
  const emitted = resolve(rootDir, 'vite/plugin.d.ts')
  const target = resolve(rootDir, 'dist/vite/plugin.d.ts')
  if (!existsSync(emitted)) {
    throw new Error('Missing vite/plugin.d.ts after plugin build')
  }
  const content = readFileSync(emitted, 'utf8')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, content)
  writeFileSync(target.replace(/\.d\.ts$/, '.d.cts'), content)
  unlinkSync(emitted)
}

const vitePlugin: UserConfig = {
  plugins: [
    dts({
      rollupTypes: false,
      strictOutput: false,
      include: ['vite/plugin.ts'],
      entryRoot: resolve(rootDir, 'vite'),
      outDir: resolve(rootDir, 'dist/vite'),
      tsconfigPath: resolve(rootDir, 'tsconfig.json'),
      afterBuild: publishPluginTypes,
    }),
  ],
  build: {
    ssr: true,
    emptyOutDir: true,
    outDir: resolve(rootDir, 'dist/vite'),
    sourcemap: true,
    lib: {
      entry: resolve(rootDir, 'vite/plugin.ts'),
      name: 'i18nDevToolsPlugin',
      formats: ['es'],
      fileName: () => 'plugin.mjs',
    },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/'),
      output: {
        format: 'es',
        entryFileNames: 'plugin.mjs',
        exports: 'named',
      },
    },
  },
}

export default defineConfig(({ mode }) => {
  if (mode === 'umd') return libUmd
  if (mode === 'plugin') return vitePlugin
  return libEs
})
