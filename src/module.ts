import path from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
} from '@nuxt/kit'
import type { HookResult, NuxtPage } from '@nuxt/schema'
import { watch } from 'chokidar'
import { setupDevToolsUI } from './devtools'

export interface Locale {
  code: string
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
}

interface DefineI18nRouteConfig {
  locales?: Record<string, Record<string, string>>
  localeRoutes?: Record<string, string>
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  locales?: Locale[]
  meta?: boolean
  metaBaseUrl?: string
  define?: boolean
  defaultLocale?: string
  translationDir?: string
  autoDetectLanguage?: boolean
  disableWatcher?: boolean
  includeDefaultLocaleRoute?: boolean
  routesLocaleLinks?: Record<string, string>
  plural?: string
  disablePageLocales?: boolean
}

export interface ModuleOptionsExtend extends ModuleOptions {
  rootDir: string
  pluralString: string
  rootDirs: string[]
  dateBuild: number
  baseURL: string
}

declare module '@nuxt/schema' {
  interface ConfigSchema {
    publicRuntimeConfig?: {
      i18nConfig?: ModuleOptionsExtend
    }
  }
  interface NuxtConfig {
    i18nConfig?: ModuleOptionsExtend
  }
  interface NuxtOptions {
    i18nConfig?: ModuleOptionsExtend
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-i18n-micro',
    configKey: 'i18n',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    locales: [],
    meta: true,
    define: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
    disablePageLocales: false,
    disableWatcher: false,
    includeDefaultLocaleRoute: false,
    routesLocaleLinks: {},
    plural: `function (translation, count, _locale) {
      const forms = translation.toString().split('|')
      if (count === 0 && forms.length > 2) {
        return forms[0].trim() // Case for "no apples"
      }
      if (count === 1 && forms.length > 1) {
        return forms[1].trim() // Case for "one apple"
      }
      return (forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
    }`,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const rootDirs = nuxt.options._layers.map(layer => layer.config.rootDir).reverse()

    const locales = (options.locales ?? [])
      .reduce((acc, locale) => {
        const existingLocale = acc.find(l => l.code === locale.code)
        if (existingLocale) {
          // Объединяем свойства объекта
          Object.assign(existingLocale, locale)
        }
        else {
          acc.push(locale)
        }
        return acc
      }, [] as Locale[])
      .filter(locale => !locale.disabled)

    nuxt.options.runtimeConfig.public.i18nConfig = {
      rootDir: nuxt.options.rootDir,
      rootDirs: rootDirs,
      plural: options.plural!,
      locales: locales ?? [],
      meta: options.meta ?? true,
      metaBaseUrl: options.metaBaseUrl ?? undefined,
      define: options.define ?? true,
      disableWatcher: options.disableWatcher ?? false,
      defaultLocale: options.defaultLocale ?? 'en',
      translationDir: options.translationDir ?? 'locales',
      autoDetectLanguage: options.autoDetectLanguage ?? true,
      includeDefaultLocaleRoute: options.includeDefaultLocaleRoute ?? false,
      routesLocaleLinks: options.routesLocaleLinks ?? {},
      dateBuild: Date.now(),
      baseURL: nuxt.options.app.baseURL,
    }

    addPlugin({
      src: resolver.resolve('./runtime/plugins/01.plugin'),
      order: 1,
    })

    if (options.meta) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/02.meta'),
        order: 2,
      })
    }

    if (options.define) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/03.define'),
        order: 3,
      })
    }

    if (options.autoDetectLanguage) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/04.auto-detect'),
        mode: 'client',
        order: 4,
      })
    }

    addImportsDir(resolver.resolve('./runtime/composables'))

    if (options.includeDefaultLocaleRoute) {
      addServerHandler({
        middleware: true,
        handler: resolver.resolve('./runtime/server/middleware/i18n-redirect'),
      })
    }

    addServerHandler({
      route: '/_locales/:page/:locale/data.json',
      handler: resolver.resolve('./runtime/server/middleware/i18n-loader'),
    })

    await addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      extensions: ['vue'],
    })

    const localeRegex = locales
      .filter(locale => locale.code !== options.defaultLocale || options.includeDefaultLocaleRoute) // Фильтрация локалей, исключая дефолтную
      .map(locale => locale.code) // Извлечение поля code из каждого объекта Locale

    const pagesDir = path.resolve(nuxt.options.rootDir, options.translationDir!, 'pages')

    extendPages((pages) => {
      const customPaths: { [key: string]: { [locale: string]: string } } = {}

      function extractCustomPaths(pages: NuxtPage[], parentPath = '') {
        for (const page of pages) {
          if (page.file) {
            // Read the content of the page file
            const filePath = path.resolve(nuxt.options.rootDir, page.file)
            const fileContent = readFileSync(filePath, 'utf-8')

            // Extract the defineI18nRoute call from the file content
            const i18nRouteConfig = extractDefineI18nRouteConfig(fileContent, filePath)

            if (i18nRouteConfig && i18nRouteConfig.localeRoutes) {
              const fullPath = parentPath ? `${parentPath}/${page.path}` : page.path
              customPaths[fullPath] = i18nRouteConfig.localeRoutes
            }
          }

          // Recursively check children for custom paths, passing the combined parent and current route name
          if (page.children && page.children.length > 0) {
            const fullParentName = parentPath ? `${parentPath}/${page.path}` : page.path
            extractCustomPaths(page.children, fullParentName)
          }
        }
      }

      extractCustomPaths(pages)

      const pagesNames = pages
        .map(page => page.name)
        .filter(name => name && (!options.routesLocaleLinks || !options.routesLocaleLinks[name]))

      function ensureFileExists(filePath: string) {
        const fileDir = path.dirname(filePath) // Get the directory of the file

        // Ensure the directory exists
        if (!existsSync(fileDir)) {
          mkdirSync(fileDir, { recursive: true }) // Create the directory if it doesn't exist
        }

        // Check if the file exists; if not, create it with an empty object
        if (!existsSync(filePath)) {
          writeFileSync(filePath, JSON.stringify({}), 'utf-8')
        }
      }

      if (!options.disableWatcher) {
        locales.forEach((locale) => {
          // Process global translation files
          const globalFilePath = path.join(nuxt.options.rootDir, options.translationDir!, `${locale.code}.json`)
          ensureFileExists(globalFilePath)

          if (!options.disablePageLocales) {
            // Process page-specific translation files
            pagesNames.forEach((name) => {
              const pageFilePath = path.join(pagesDir, `${name}/${locale.code}.json`)
              ensureFileExists(pageFilePath)
            })
          }
        })
      }

      const newRoutes: NuxtPage[] = []
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]

        if (page.redirect && !page.file) {
          continue
        }

        let modLocaleRegex = localeRegex
        locales.forEach((locale) => {
          if (customPaths[page.path] && customPaths[page.path][locale.code]) {
            modLocaleRegex = modLocaleRegex.filter((locale) => {
              // Remove locale from regex if it has a custom path
              return !Object.values(customPaths).some(paths => paths[locale])
            })
          }
        })

        if (customPaths[page.path]) {
          locales.forEach((locale) => {
            if (customPaths[page.path][locale.code]) {
              const newRoute = {
                file: page.file,
                meta: { ...page.meta },
                alias: page.alias,
                redirect: page.redirect,
                children: page.children,
                mode: page.mode,
                path: `/:locale(${locale.code})${customPaths[page.path][locale.code]}`,
                name: `localized-${page.name}-${locale.code}`,
              }
              newRoutes.push(newRoute)
            }
          })
        }

        if (!modLocaleRegex.length && !page.children?.length) {
          continue
        }

        function localizeChildren(routes: NuxtPage[], parentPath = ''): NuxtPage[] {
          if (!parentPath.startsWith('/')) {
            parentPath = '/' + parentPath
          }
          return routes.map((route) => {
            // Combine parent and current path to find custom paths
            const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path
            const customLocalePaths = customPaths[fullPath]

            // Process children recursively
            const localizedChildren = route.children ? localizeChildren(route.children, fullPath) : []

            // Generate the localized route paths if custom paths exist
            const localizedRoutes = locales.map((locale) => {
              // If a custom path exists for this locale, use it; otherwise, use the default path
              let path = customLocalePaths && customLocalePaths[locale.code]
                ? `${customLocalePaths[locale.code]}`
                : `${fullPath}`

              if (path.startsWith('/')) {
                path = path.slice(1) // Removes the leading '/'
              }

              return {
                ...route,
                name: `localized-${route.name}-${locale.code}`,
                path,
                children: localizedChildren, // Use localized children
              }
            })

            // If there are custom paths, return localized routes for each locale; otherwise, just return the localized route
            if (customLocalePaths) {
              return localizedRoutes
            }
            return {
              ...route,
              name: `localized-${route.name}`,
              children: localizedChildren, // Use localized children
            }
          }).flat() // Flatten in case custom localized routes were generated
        }

        const newRoute = {
          file: page.file,
          meta: { ...page.meta },
          alias: page.alias,
          redirect: page.redirect,
          children: page.children ? localizeChildren(page.children, page.name) : [],
          mode: page.mode,
          path: `/:locale(${modLocaleRegex.join('|')})${page.path}`,
          name: `localized-${page.name}`,
        }

        newRoutes.push(newRoute)
      }

      pages.push(...newRoutes)

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []

      locales.forEach((locale) => {
        if (!options.disablePageLocales) {
          pagesNames.forEach((name) => {
            addPrerenderRoutes(`/_locales/${name}/${locale.code}/data.json`)
          })
        }
        addPrerenderRoutes(`/_locales/general/${locale.code}/data.json`)
      })
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      const routes = nitroConfig.prerender?.routes || []

      nuxt.options.generate.routes = Array.isArray(nuxt.options.generate.routes) ? nuxt.options.generate.routes : []
      // Получаем все страницы приложения
      const pages = nuxt.options.generate.routes || []

      // Генерируем маршруты для всех локалей, кроме дефолтной
      locales.forEach((locale) => {
        if (locale.code !== options.defaultLocale || options.includeDefaultLocaleRoute) {
          pages.forEach((page) => {
            routes.push(`/${locale.code}${page}`)
          })
        }
      })

      // Обновляем опцию routes в конфигурации Nitro
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = routes
    })

    nuxt.hook('nitro:build:before', async (_nitro) => {
      const isProd = nuxt.options.dev === false
      if (!isProd) {
        const translationPath = path.resolve(nuxt.options.rootDir, options.translationDir!)

        console.log('ℹ add file watcher', translationPath)

        const watcherEvent = async (path: string) => {
          watcher.close()
          console.log('↻ update store item', path)
          nuxt.callHook('restart')
        }

        const watcher = watch(translationPath, { depth: 1, persistent: true }).on('change', watcherEvent)

        nuxt.hook('close', () => {
          watcher.close()
        })
      }
    })

    nuxt.hook('prerender:routes', async (prerenderRoutes) => {
      const routesSet = prerenderRoutes.routes
      const additionalRoutes = new Set<string>()

      // Проходим по каждому существующему маршруту и добавляем локализованные версии, кроме дефолтной локали
      routesSet.forEach((route) => {
        options.locales!.forEach((locale) => {
          if (locale.code !== options.defaultLocale) {
            if (route === '/') {
              additionalRoutes.add(`/${locale.code}`)
            }
            else {
              additionalRoutes.add(`/${locale.code}${route}`)
            }
          }
        })
      })

      // Добавляем новые локализованные маршруты к существующим
      additionalRoutes.forEach(route => routesSet.add(route))
    })

    // Setup DevTools integration
    if (nuxt.options.dev) {
      setupDevToolsUI(options, resolver.resolve)
    }
  },
})

function cleanObjectString(objectString: string): string {
  // Replace single quotes with double quotes
  let cleanedString = objectString.replace(/'/g, '"')
  // Add double quotes around keys if not already quoted
  cleanedString = cleanedString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
  // Remove trailing commas
  cleanedString = cleanedString.replace(/,(\s*[}\]])/g, '$1')
  // Remove multiple consecutive commas
  cleanedString = cleanedString.replace(/,+/g, ',')
  // Remove commas at the start of objects or arrays
  cleanedString = cleanedString.replace(/(\{|\[)\s*,/g, '$1')
  // Remove commas before closing brackets or braces
  cleanedString = cleanedString.replace(/,(\s*[}\]])/g, '$1')
  // Trim leading and trailing whitespace
  cleanedString = cleanedString.trim()
  // Check if the object starts and ends correctly
  if (!cleanedString.startsWith('{') || !cleanedString.endsWith('}')) {
    throw new Error('Invalid object format after cleaning')
  }

  return cleanedString
}

function extractDefineI18nRouteConfig(content: string, path: string): DefineI18nRouteConfig | null {
  const match = content.match(/\$defineI18nRoute\((\{[\s\S]*?\})\)/)
  if (match && match[1]) {
    try {
      const cleanedString = cleanObjectString(match[1])
      // Use JSON.parse after cleaning the string
      const configObject = JSON.parse(cleanedString) as DefineI18nRouteConfig
      // Validate parsed object
      if (validateDefineI18nRouteConfig(configObject)) {
        return configObject
      }
      else {
        console.error('Invalid defineI18nRoute configuration format:', configObject, 'in file: ', path)
      }
    }
    catch (error) {
      console.error('Failed to parse defineI18nRoute configuration:', error, 'in file: ', path)
    }
  }
  return null
}

function validateDefineI18nRouteConfig(obj: DefineI18nRouteConfig): obj is DefineI18nRouteConfig {
  if (typeof obj !== 'object' || obj === null) return false

  if (obj.locales) {
    if (typeof obj.locales !== 'object') return false

    // Check that locales is an object of objects containing string values
    for (const localeKey in obj.locales) {
      const translations = obj.locales[localeKey]
      if (typeof translations !== 'object' || translations === null) return false
    }
  }

  // Check that localeRoutes, if present, is an object of strings
  if (obj.localeRoutes) {
    if (typeof obj.localeRoutes !== 'object') return false

    for (const routeKey in obj.localeRoutes) {
      if (typeof obj.localeRoutes[routeKey] !== 'string') return false
    }
  }

  return true
}

export interface ModuleHooks {
  'i18n:register': (
    registerModule: (translations: unknown, locale: string) => void
  ) => HookResult
}

declare module '@nuxt/schema' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtHooks extends ModuleHooks {}
}
