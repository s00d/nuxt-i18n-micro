import path from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import type { Locale, ModuleOptions } from '@i18n-micro/types'

export class LocaleManager {
  locales: Locale[]
  options: ModuleOptions
  rootDirs: string[]
  defaultLocale: string

  constructor(options: ModuleOptions, rootDirs: string[]) {
    this.options = options
    this.rootDirs = rootDirs
    this.locales = this.mergeLocales(options.locales ?? [])
    this.defaultLocale = options.defaultLocale ?? 'en'
  }

  private mergeLocales(locales: Locale[]): Locale[] {
    return locales.reduce((acc, locale) => {
      const existingLocale = acc.find(l => l.code === locale.code)
      if (existingLocale) {
        Object.assign(existingLocale, locale)
      }
      else {
        acc.push(locale)
      }
      return acc
    }, [] as Locale[]).filter(locale => !locale.disabled)
  }

  public ensureTranslationFilesExist(pagesNames: string[], translationDir: string, rootDir: string) {
    this.locales.forEach((locale) => {
      const globalFilePath = path.join(rootDir, translationDir, `${locale.code}.json`)
      this.ensureFileExists(globalFilePath)

      if (!this.options.disablePageLocales) {
        pagesNames.forEach((name) => {
          const pageFilePath = path.join(rootDir, translationDir, 'pages', `${name}/${locale.code}.json`)
          this.ensureFileExists(pageFilePath)
        })
      }
    })
  }

  private ensureFileExists(filePath: string) {
    const fileDir = path.dirname(filePath)
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true })
    }
    if (!existsSync(filePath)) {
      writeFileSync(filePath, JSON.stringify({}), 'utf-8')
    }
  }
}
