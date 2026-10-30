/**
 * Dev-only: load a page/locale payload by merging live files under `translationDir`
 * (across Nuxt layers + `additionalTranslationDirs`), same as the HMR watcher.
 *
 * Avoids serving stale `.nuxt/i18n-merged` / `i18n-source` after a cache miss when
 * locale files changed but `build:before` has not re-run.
 */
import { createTranslationDirReader, mergeDevTranslations, resolveLiveTranslationDirs } from './translation-watcher'
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { toTranslations } from '@i18n-micro/utils/normalize'
import { getI18nPrivateConfig } from '#i18n-internal/config'

export async function loadLiveDevTranslations(locale: string, pageName: string, config: ModuleOptionsExtend): Promise<Translations> {
  const privateConfig = getI18nPrivateConfig()
  const { translationRoots, additionalRoots } = resolveLiveTranslationDirs({
    rootDirs: privateConfig.rootDirs?.length ? privateConfig.rootDirs : [privateConfig.rootDir],
    translationDir: privateConfig.translationDir,
    additionalTranslationDirs: privateConfig.additionalTranslationDirs,
  })
  const readLocaleFile = createTranslationDirReader(translationRoots, additionalRoots)

  const merged = await mergeDevTranslations({
    locale,
    pageName,
    // a fallback may live on another domain, as in production
    locales: config.linkLocales ?? config.locales,
    fallbackLocale: config.fallbackLocale,
    disablePageLocales: config.disablePageLocales,
    readLocaleFile,
  })

  return toTranslations(merged)
}
