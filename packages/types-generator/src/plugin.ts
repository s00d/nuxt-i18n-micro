import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { type GeneratorOptions, generateTypes } from './core/generator'

const DEBOUNCE_MS = 300

/** A Vite (and Rollup) plugin: generates at build start, and again in dev after a locale file changes. */
export function I18nTypesPlugin(options: GeneratorOptions): Plugin {
  const generate = () => {
    try {
      generateTypes(options)
    } catch (error) {
      console.warn('[i18n-types] Failed to generate types:', error)
    }
  }

  return {
    name: 'i18n-micro-types-generator',
    buildStart: generate,
    configureServer(server) {
      const dirs = [options.translationDir].flat().map((dir) => resolve(options.srcDir, dir))
      let timer: ReturnType<typeof setTimeout> | undefined
      const onFile = (file: string) => {
        if (!file.endsWith('.json') || !dirs.some((dir) => file.startsWith(dir))) return
        clearTimeout(timer)
        timer = setTimeout(generate, DEBOUNCE_MS)
      }
      server.watcher.add(dirs)
      server.watcher.on('add', onFile).on('change', onFile).on('unlink', onFile)
      server.httpServer?.once('close', () => clearTimeout(timer))
    },
  }
}
