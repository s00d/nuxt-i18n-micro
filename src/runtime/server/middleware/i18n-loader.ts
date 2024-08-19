import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import type { ModuleOptions } from '../../../module'
import { useRuntimeConfig } from '#imports'

export interface ModuleOptionsExtend extends ModuleOptions {
  rootDir?: string
}

export default defineEventHandler(async (event) => {
  const { page, locale } = event.context.params as { page: string, locale: string }
  const config = useRuntimeConfig()
  const { rootDir, translationDir } = config.public.i18nConfig as ModuleOptionsExtend

  let path = `${locale}.json`
  if (page !== 'general') {
    path = `pages/${page}/${locale}.json`
  }

  const translationPath = resolve(rootDir!, translationDir!, path)

  try {
    const fileContent = await readFile(translationPath, 'utf-8')
    return JSON.parse(fileContent)
  }
  catch (error: unknown) {
    console.log('error', error)
    event.node.res.statusCode = 404
    return { error: 'Translations not found' }
  }
})
