import type { NuxtPage } from '@nuxt/schema'
import { createRoute } from '../core/builder'
import type { GeneratorContext } from '../core/context'
import { buildRouteName, buildRouteNameFromRoute, cloneArray, normalizePath } from '../utils'
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

    // prefix_and_default: isPrefixStrategy returns false — original pages are not removed in postProcess.
    // The default locale is also served without a prefix, at its custom path when it has one.
    // Its children follow the default locale's custom paths but keep their own names.
    if (allowedLocales.includes(defaultLocaleCode)) {
      const defaultCustomPath = customPaths?.[defaultLocaleCode]
      const defaultPath = defaultCustomPath ? normalizePath(defaultCustomPath) : originalPath
      const children = originalChildren.length
        ? this.localizeChildPathsKeepNames(originalChildren, defaultPath, originalPath, defaultLocaleCode, context)
        : undefined
      const aliases = this.routeAliases(page, defaultPath, null, context)
      const aliasFields = aliases.length ? { alias: aliases, meta: { alias: aliases } } : {}
      // the page as-is already carries its declared aliases; encoded variants need a new record
      const declared = (page as NuxtPage & { alias?: string[] }).alias ?? (page.meta?.alias as string[] | undefined) ?? []
      const aliasesChanged = aliases.join('\n') !== declared.join('\n')
      result.push(defaultCustomPath || children || aliasesChanged ? createRoute(page, { path: defaultPath, children, ...aliasFields }) : page)
    } else {
      result.push(page)
    }

    const localesToGenerate = context.locales.filter((locale) => allowedLocales.includes(locale.code))

    if (localesToGenerate.length > 0) {
      if (customPaths) {
        for (const locale of localesToGenerate) {
          const customPath = customPaths[locale.code]
          if (customPath) {
            if (locale.code === defaultLocaleCode) {
              // Only the prefixed route: an unprefixed one would share the name
              // `localized-<name>-<default>`, and vue-router keeps just the last record.
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
            } else {
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
        }
        // Locales without their own custom path share one :locale(a|b) route, so that
        // `localized-<name>` stays unique (vue-router drops all but the last duplicate name).
        const plainLocales = localesToGenerate.filter((locale) => !customPaths[locale.code]).map((l) => l.code)
        if (plainLocales.length) {
          const newRoute = this.createLocalizedRoute(
            page,
            plainLocales,
            originalChildren,
            false,
            '',
            context.customRegex,
            false,
            plainLocales.length === 1 ? plainLocales[0]! : true,
            originalPath,
            context,
          )
          if (newRoute) result.push(newRoute)
        }
      } else {
        const localeCodes = localesToGenerate.map((l) => l.code)
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

    return result
  }

  override postProcess(pages: NuxtPage[], context: GeneratorContext): NuxtPage[] {
    // prefix_and_default: first all base pages, then pages with localizedRouteNamePrefix
    const basePages: NuxtPage[] = []
    const localizedPages: NuxtPage[] = []
    for (const page of pages) {
      const name = page.name ?? ''
      if (typeof name === 'string' && name.startsWith(context.localizedRouteNamePrefix)) {
        localizedPages.push(page)
      } else {
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
      customPath,
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
    const routeName = buildRouteName(
      buildRouteNameFromRoute(page.name ?? '', parentPathForChildren),
      firstLocale,
      isCustom,
      context.localizedRouteNamePrefix,
    )

    const addPrefix = force || firstLocale !== context.defaultLocale.code
    const children =
      localeCodes.length === 1
        ? this.localizeChildren(originalChildren, routePath, parentPathForChildren, firstLocale, context, addPrefix)
        : this.localizeChildrenAllLocales(originalChildren, routePath, parentPathForChildren, localeCodes, context)

    const aliases = this.routeAliases(page, routePath, localeCodes, context)
    return createRoute(page, {
      path: routePath,
      name: routeName,
      children,
      alias: aliases,
      meta: { alias: aliases },
    })
  }
}
