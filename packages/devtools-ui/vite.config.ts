import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
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
      external: ['@i18n-micro/types', '@i18n-micro/utils/merge-source', '@i18n-micro/utils/parse-path'],
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
      external: ['@i18n-micro/types', '@i18n-micro/utils/merge-source', '@i18n-micro/utils/parse-path'],
      output: {
        exports: 'named',
        globals: { '@i18n-micro/types': 'I18nMicroTypes' },
      },
      onwarn: suppressTailwindSourcemapWarn,
    },
  },
}

const pluginTypesDir = resolve(rootDir, 'dist/vite')
const pluginTypesStem = resolve(pluginTypesDir, 'plugin.d.ts')

/** Keep Vite plugin declarations under dist/vite only (never beside vite/plugin.ts). */
function writePluginDeclarationTypes(filePath: string, content: string) {
  const normalized = filePath.replace(/\\/g, '/')
  if (!normalized.endsWith('plugin.d.ts')) {
    return { filePath, content }
  }

  mkdirSync(pluginTypesDir, { recursive: true })
  writeFileSync(pluginTypesStem, content)
  writeFileSync(pluginTypesStem.replace(/\.d\.ts$/, '.d.cts'), content)

  if (normalized.includes('/vite/plugin.d.ts') && !normalized.includes('/dist/vite/')) {
    return false
  }

  return { filePath: pluginTypesStem, content }
}

function removeStrayPluginTypeArtifacts() {
  for (const rel of ['vite/plugin.d.ts', 'vite/plugin.d.cts']) {
    const path = resolve(rootDir, rel)
    if (existsSync(path)) unlinkSync(path)
  }
}

const vitePlugin: UserConfig = {
  plugins: [
    dts({
      rollupTypes: false,
      strictOutput: false,
      include: ['vite/plugin.ts'],
      entryRoot: resolve(rootDir, 'vite'),
      outDir: pluginTypesDir,
      tsconfigPath: resolve(rootDir, 'tsconfig.json'),
      beforeWriteFile: writePluginDeclarationTypes,
      afterBuild: removeStrayPluginTypeArtifacts,
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
