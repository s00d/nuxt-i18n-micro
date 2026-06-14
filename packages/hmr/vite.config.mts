import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

const libEntries = {
  watcher: resolve(rootDir, 'src/watcher.ts'),
  'generate-plugin': resolve(rootDir, 'src/generate-plugin.ts'),
  'cache-keys': resolve(rootDir, 'src/cache-keys.ts'),
} as const

const publishedEntryNames = new Set(Object.keys(libEntries))

function isPublishedDeclaration(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/')
  const base = normalized
    .split('/')
    .pop()
    ?.replace(/\.d\.ts$/, '')
  return base !== undefined && publishedEntryNames.has(base)
}

function beforeWriteDeclaration(filePath: string, content: string) {
  if (isPublishedDeclaration(filePath)) {
    const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
    mkdirSync(dirname(ctsPath), { recursive: true })
    writeFileSync(ctsPath, content)
  }
  return { filePath, content }
}

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: resolve(rootDir, 'tsconfig.build.json'),
      entryRoot: resolve(rootDir, 'src'),
      outDir: resolve(rootDir, 'dist'),
      beforeWriteFile: beforeWriteDeclaration,
    }),
  ],
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    lib: {
      entry: libEntries,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [/^@i18n-micro\//, /^node:/],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].mjs',
          exports: 'named',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          exports: 'named',
        },
      ],
      onwarn(warning, warn) {
        if (warning.code === 'EMPTY_BUNDLE') return
        warn(warning)
      },
    },
  },
})
