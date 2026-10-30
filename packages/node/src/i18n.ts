import { I18n as RuntimeI18n, type I18nOptions as RuntimeI18nOptions } from '@i18n-micro/runtime'
import { loadTranslations } from './loader'

export interface I18nOptions extends RuntimeI18nOptions {
  translationDir?: string
  disablePageLocales?: boolean
}

export class I18n extends RuntimeI18n {
  public translationDir?: string
  private disablePageLocales: boolean

  constructor(options: I18nOptions) {
    const { translationDir, disablePageLocales, ...runtimeOptions } = options
    super(runtimeOptions)

    this.translationDir = translationDir
    this.disablePageLocales = disablePageLocales ?? false
  }

  public async loadTranslations(dir?: string): Promise<void> {
    const targetDir = dir || this.translationDir
    if (!targetDir) {
      console.warn('[i18n-node] No translation directory specified')
      return
    }

    const { root, routes } = await loadTranslations(targetDir, this.disablePageLocales)

    // root keys resolve from the root chunk; route chunks hold only their own keys
    this.loadMessages(root, routes)
  }

  public async reload(): Promise<void> {
    const targetDir = this.translationDir
    if (!targetDir) {
      console.warn('[i18n-node] No translation directory specified')
      return
    }

    this.clearCache()
    await this.loadTranslations(targetDir)
    console.log('[i18n-node] Cache cleared and translations reloaded.')
  }
}

export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
