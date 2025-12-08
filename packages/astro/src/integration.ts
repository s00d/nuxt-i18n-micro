import type { AstroIntegration } from 'astro'
import { AstroI18n, type AstroI18nOptions } from './composer'
import type { Locale, ModuleOptions, PluralFunc } from '@i18n-micro/types'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface I18nIntegrationOptions extends Omit<ModuleOptions, 'plural'> {
  locale: string
  fallbackLocale?: string
  locales?: Locale[]
  messages?: Record<string, Record<string, unknown>>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  localeCookie?: string
  autoDetect?: boolean
  redirectToDefault?: boolean
  translationDir?: string
}

interface SaveTranslationData {
  file: string
  content: unknown
}

// SVG иконка для dev toolbar (плоская иконка глобуса)
const GLOBE_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'

/**
 * Astro Integration for i18n-micro
 */
export function i18nIntegration(options: I18nIntegrationOptions): AstroIntegration {
  const {
    locale: defaultLocale,
    fallbackLocale,
    translationDir,
  } = options

  return {
    name: '@i18n-micro/astro',
    hooks: {
      'astro:config:setup': async ({ addDevToolbarApp, command, injectTypes }: { addDevToolbarApp: (options: { id: string, name: string, icon?: string, entrypoint: string }) => void, command: string, injectTypes?: (options: { filename: string, content: string }) => void }) => {
        // 1. АВТОМАТИЧЕСКАЯ ИНЪЕКЦИЯ ТИПОВ
        // Astro добавит ссылку на этот файл в свой .astro/types.d.ts
        if (injectTypes) {
          injectTypes({
            filename: 'i18n-micro-env.d.ts',
            content: '/// <reference types="@i18n-micro/astro/env" />',
          })
        }

        // Load translations from directory if provided
        if (translationDir) {
          try {
            // Динамический импорт корректен, но убедитесь, что пакет есть в dependencies
            const { I18n } = await import('@i18n-micro/node')
            const nodeI18n = new I18n({
              locale: defaultLocale,
              fallbackLocale: fallbackLocale || defaultLocale,
              translationDir,
              disablePageLocales: options.disablePageLocales ?? false,
            })
            await nodeI18n.loadTranslations()
            // Note: Translations would need to be manually loaded into AstroI18n instance
            // This is handled in middleware setup
          }
          catch (error) {
            // Игнорируем ошибку, если пакета нет (например в проде)
            console.warn('[i18n] Could not load translations from directory:', error)
          }
        }

        // Register Dev Toolbar App (only in dev mode)
        if (command === 'dev') {
          addDevToolbarApp({
            id: 'i18n-micro',
            name: 'i18n Micro',
            icon: GLOBE_ICON_SVG,
            // Используем package export путь, который определен в package.json
            // Это работает как в монорепозитории, так и после установки пакета
            entrypoint: '@i18n-micro/astro/toolbar-app',
          })
        }
      },
      'astro:server:setup': async ({ toolbar, logger }) => {
        if (!toolbar) return

        const rootDir = process.cwd()
        const localesDir = path.join(rootDir, translationDir || 'src/locales')

        // Утилита для рекурсивного чтения файлов (вынесена чтобы не дублировать код)
        const readLocales = (): Record<string, Record<string, unknown>> => {
          const filesList: Record<string, Record<string, unknown>> = {}

          if (!fs.existsSync(localesDir)) {
            logger.warn(`[i18n] Locales directory does not exist: ${localesDir}`)
            return filesList
          }

          const processDirectory = (dir: string) => {
            fs.readdirSync(dir).forEach((file) => {
              const filePath = path.join(dir, file)
              // Пропускаем скрытые файлы и системные папки
              if (file.startsWith('.')) return

              const stat = fs.lstatSync(filePath)
              if (stat.isDirectory()) {
                processDirectory(filePath)
              }
              else if (file.endsWith('.json')) {
                try {
                  // Ключ - относительный путь для удобства отображения в UI
                  const relativePath = path.relative(localesDir, filePath)
                  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
                  // Убедимся, что content - это объект
                  if (content && typeof content === 'object' && !Array.isArray(content)) {
                    filesList[relativePath] = content as Record<string, unknown>
                  }
                  else {
                    logger.warn(`[i18n] Invalid content format in ${filePath}, expected object`)
                  }
                }
                catch (e) {
                  logger.warn(`Error parsing locale file ${filePath}: ${e instanceof Error ? e.message : String(e)}`)
                }
              }
            })
          }
          processDirectory(localesDir)
          return filesList
        }

        toolbar.on('i18n:get-locales', async () => {
          try {
            const localesData = readLocales()
            const keys = Object.keys(localesData)
            logger.info(`[i18n] Sending locales data: ${keys.length} files`)
            logger.info(`[i18n] Locales keys: ${keys.join(', ')}`)
            if (keys.length > 0 && keys[0]) {
              logger.info(`[i18n] Sample file content keys: ${Object.keys(localesData[keys[0]] as Record<string, unknown>).slice(0, 5).join(', ')}`)
            }
            toolbar.send('i18n:locales-data', localesData)
          }
          catch (error) {
            logger.error(`Error in i18n:get-locales handler: ${error}`)
            toolbar.send('i18n:locales-data', {})
          }
        })

        toolbar.on('i18n:get-configs', () => {
          toolbar.send('i18n:configs-data', {
            defaultLocale,
            fallbackLocale: fallbackLocale || defaultLocale,
            locales: options.locales || [],
            translationDir: translationDir || 'src/locales',
            ...options,
          } as ModuleOptions)
        })

        toolbar.on('i18n:save', async (data: SaveTranslationData) => {
          try {
            // data.file приходит как относительный путь (ключ из readLocales)
            const filePath = path.join(localesDir, data.file)

            // Убедимся, что записываем только в папку локалей (security check)
            if (!filePath.startsWith(localesDir)) {
              throw new Error('Access denied: Cannot write outside locales directory')
            }

            if (fs.existsSync(filePath)) {
              fs.writeFileSync(filePath, JSON.stringify(data.content, null, 2), 'utf-8')
              toolbar.send('i18n:save-result', { success: true })
              // Отправляем обновленные данные
              toolbar.send('i18n:updated', readLocales())
            }
            else {
              toolbar.send('i18n:save-result', { success: false, error: `File not found: ${data.file}` })
            }
          }
          catch (error) {
            logger.error(`Error saving translation: ${error instanceof Error ? error.message : String(error)}`)
            toolbar.send('i18n:save-result', { success: false, error: String(error) })
          }
        })
      },
    },
  }
}
/**
 * Create i18n instance (for manual setup)
 */
export function createI18n(options: AstroI18nOptions): AstroI18n {
  return new AstroI18n(options)
}
