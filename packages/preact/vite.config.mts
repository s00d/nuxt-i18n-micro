import { mkdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

function dualPackageBeforeWriteFile(filePath: string, content: string) {
  // only the bundled declarations at the top of the output dir
  const entry = ['index.d.ts', 'router.d.ts'].includes(basename(filePath))
  if (!entry || resolve(dirname(filePath)) !== resolve(import.meta.dirname, 'dist')) {
    return { filePath, content }
  }
  const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
  mkdirSync(dirname(ctsPath), { recursive: true })
  writeFileSync(ctsPath, content)
  return { filePath, content }
}

export default defineConfig({
  resolve: { alias: { '#host': resolve(import.meta.dirname, 'src/host.ts') } },
  esbuild: {
    // Используем современный (automatic) JSX трансформ
    // Это позволяет не импортировать 'h' в каждом файле
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
  plugins: [
    dts({
      afterDiagnostic(diagnostics) {
        const errors = diagnostics.filter((d) => d.category === 1)
        if (errors.length > 0) {
          throw new Error(`[vite:dts] ${errors.length} TypeScript error(s) — build aborted`)
        }
      },
      bundleTypes: true,
      // the source shared with @i18n-micro/react sits next to this package
      entryRoot: '..',
      include: ['src/**/*.ts', '../react/src/shared.ts', '../react/src/context.tsx', '../react/src/injection.ts', '../react/src/components/*'],
      outDir: 'dist',
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.json'),
      compilerOptions: {
        // Убеждаемся, что типы генерируются с учетом preact
        rootDir: resolve(import.meta.dirname, '..'),
        jsx: 4 as const, // JsxEmit.ReactJSX
        jsxImportSource: 'preact' as const,
        types: ['preact'] as const,
      },
      beforeWriteFile: dualPackageBeforeWriteFile,
    }) as unknown as import('vite').Plugin,
  ],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        router: resolve(import.meta.dirname, 'src/router/index.ts'),
      },
      name: 'I18nMicroPreact',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'preact',
        'preact/hooks',
        // ВАЖНО: Добавляем jsx-runtime, чтобы он не попал в бандл
        'preact/jsx-runtime',
        '@i18n-micro/core',
        '@i18n-micro/core/render',
        '@i18n-micro/runtime',
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
