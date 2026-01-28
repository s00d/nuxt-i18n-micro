import type { NuxtPage } from '@nuxt/schema'
import {
  buildRouteName,
  buildRouteNameFromRoute,
  cloneArray,
} from '../utils'
import { createRoute } from '../core/builder'
import { generateAliasRoutes } from '../core/alias'
import type { GeneratorContext } from '../core/context'
import { BaseStrategy } from './abstract'

export class PrefixAndDefaultStrategy extends BaseStrategy {
  protected generateVariants(page: NuxtPage, context: GeneratorContext): NuxtPage[] {
    const originalPath = page.path ?? ''
    const pageName = buildRouteNameFromRoute(page.name, page.path)
    const allowedLocales = context.getAllowedLocales(originalPath, pageName)
    const customPaths = context.getCustomPathsForPage(originalPath, pageName)
    const originalChildren = cloneArray(page.children ?? [])
    const result: NuxtPage[] = []
    const defaultLocaleCode = context.defaultLocale.code

    // prefix_and_default: isPrefixStrategy returns false — оригинальные страницы не удаляются в postProcess
    result.push(page)

    const localesToGenerate = context.locales.filter(locale => allowedLocales.includes(locale.code))

    if (localesToGenerate.length > 0) {
      if (customPaths) {
        for (const locale of localesToGenerate) {
          const customPath = customPaths[locale.code]
          if (customPath) {
            if (locale.code === defaultLocaleCode) {
              const nonPrefixedRoute = this.createLocalizedRoute(
                page,
                [locale.code],
                originalChildren,
                true,
                customPath,
                context.customRegex,
                false,
                locale.code,
                originalPath,
                context,
              )
              if (nonPrefixedRoute) result.push(nonPrefixedRoute)
              const prefixedRoute = this.createLocalizedRoute(
                page,
                [locale.code],
                originalChildren,
                true,
                customPath,
                context.customRegex,
                true,
                locale.code,
                originalPath,
                context,
              )
              if (prefixedRoute) result.push(prefixedRoute)
            }
            else {
              const newRoute = this.createLocalizedRoute(
                page,
                [locale.code],
                originalChildren,
                true,
                customPath,
                context.customRegex,
                false,
                locale.code,
                originalPath,
                context,
              )
              if (newRoute) result.push(newRoute)
            }
          }
          else {
            const newRoute = this.createLocalizedRoute(
              page,
              [locale.code],
              originalChildren,
              false,
              '',
              context.customRegex,
              false,
              locale.code,
              originalPath,
              context,
            )
            if (newRoute) result.push(newRoute)
          }
        }
      }
      else {
        const localeCodes = localesToGenerate.map(l => l.code)
        const newRoute = this.createLocalizedRoute(
          page,
          localeCodes,
          originalChildren,
          false,
          '',
          context.customRegex,
          false,
          true,
          originalPath,
          context,
        )
        if (newRoute) result.push(newRoute)
      }
    }

    const aliasRoutes = generateAliasRoutes(page, allowedLocales, context.customRegex, context.localizedRouteNamePrefix)
    if (aliasRoutes.length) {
      result.push(...aliasRoutes)
    }

    return result
  }

  override postProcess(pages: NuxtPage[], context: GeneratorContext): NuxtPage[] {
    // prefix_and_default: сначала все базовые страницы, затем с префиксом localizedRouteNamePrefix
    const basePages: NuxtPage[] = []
    const localizedPages: NuxtPage[] = []
    for (const page of pages) {
      const name = page.name ?? ''
      if (typeof name === 'string' && name.startsWith(context.localizedRouteNamePrefix)) {
        localizedPages.push(page)
      }
      else {
        basePages.push(page)
      }
    }
    return [...basePages, ...localizedPages]
  }

  private createLocalizedRoute(
    page: NuxtPage,
    localeCodes: string[],
    originalChildren: NuxtPage[],
    isCustom: boolean,
    customPath: string = '',
    customRegex: string | RegExp | undefined,
    force = false,
    _parentLocale: string | boolean = false,
    originalPagePath: string | undefined,
    context: GeneratorContext,
  ): NuxtPage | null {
    const routePath = this.buildRoutePathForLocales(
      localeCodes,
      page.path ?? '',
      encodeURI(customPath),
      isCustom,
      customRegex,
      force,
      context.defaultLocale.code,
    )
    const isPrefixAndDefaultWithCustomPath = isCustom && customPath
    if (!routePath || (!isPrefixAndDefaultWithCustomPath && routePath === page.path)) return null
    if (localeCodes.length === 0) return null
    const firstLocale = localeCodes[0]
    if (!firstLocale) return null
    const parentPathForChildren = originalPagePath ?? page.path ?? ''
    const routeName = buildRouteName(buildRouteNameFromRoute(page.name ?? '', parentPathForChildren), firstLocale, isCustom, context.localizedRouteNamePrefix)

    const addPrefix = force || firstLocale !== context.defaultLocale.code
    const children = localeCodes.length === 1
      ? this.localizeChildren(originalChildren, routePath, parentPathForChildren, firstLocale, context, addPrefix)
      : this.localizeChildrenAllLocales(originalChildren, routePath, parentPathForChildren, localeCodes, context)

    return createRoute(page, {
      path: routePath,
      name: routeName,
      children,
      alias: [],
      meta: { alias: [] },
    })
  }
}
