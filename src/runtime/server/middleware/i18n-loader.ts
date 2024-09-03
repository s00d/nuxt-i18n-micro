import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import type { ModuleOptionsExtend } from '../../../types'
import type { Translations } from '../../plugins/01.plugin'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { page, locale } = event.context.params as { page: string, locale: string }
  const config = useRuntimeConfig()
  const { rootDirs, translationDir } = config.public.i18nConfig as ModuleOptionsExtend

  let path = `${locale}.json`
  if (page !== 'general') {
    path = `pages/${page}/${locale}.json`
  }

  let translations: Translations = {}

  for (const i in rootDirs) {
    const translationPath = resolve(rootDirs[i], translationDir!, path)

    try {
      const fileContent = await readFile(translationPath, 'utf-8')
      const content = JSON.parse(fileContent) as Translations
      translations = { ...translations, ...content }
    }
    catch { /* empty */ }
  }

  return translations
})
