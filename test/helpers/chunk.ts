import { mergeTranslationChunk } from '@i18n-micro/core/helpers'
import type { APIRequestContext } from '@playwright/test'

/** A page's dictionary as a browser ends up with it: a file with a root mark is a delta on the root file. */
export async function readChunk(request: APIRequestContext, page: string, locale: string): Promise<Record<string, unknown>> {
  const read = async (name: string) => (await (await request.get(`/_locales/${name}/${locale}/data.json`)).json()) as Record<string, unknown>
  const { __i18n_root: mark, ...file } = await read(page)
  if (!mark) return file
  const { __i18n_root: _, ...root } = await read('__root')
  return mergeTranslationChunk(root, file)
}
