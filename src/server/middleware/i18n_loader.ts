import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptionsExtend } from '~/src/module'

export default defineEventHandler(async (event) => {
  console.log(1111, event.context.params)
  const { page, locale } = event.context.params as { page: string, locale: string }
  const config = useRuntimeConfig()
  const { rootDir, translationDir } = config.public.myModule as ModuleOptionsExtend

  const translationPath = resolve(rootDir!, translationDir, `pages/${page}_${locale}.json`)

  try {
    const fileContent = await readFile(translationPath, 'utf-8')
    return JSON.parse(fileContent)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch (error: unknown) {
    event.node.res.statusCode = 404
    return { error: 'Translations not found' }
  }
})
