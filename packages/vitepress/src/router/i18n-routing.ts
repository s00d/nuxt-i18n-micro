import type { VitePressRouterAdapter } from './adapter'

/**
 * Minimal shapes used by VitePress `themeConfig.i18nRouting`.
 * Kept loose so we do not hard-depend on VitePress internal DefaultTheme types at compile time.
 */
export interface VitePressI18nRoutingData {
  site?: {
    value?: {
      locales?: Record<string, { link?: string, lang?: string }>
    }
  }
  localeIndex?: { value?: string }
}

export interface VitePressI18nRoutingRoute {
  path: string
  hash?: string
  query?: string
  data?: {
    relativePath?: string
  }
}

export type VitePressI18nRoutingFn = (
  data: VitePressI18nRoutingData,
  route: VitePressI18nRoutingRoute,
  targetLocale: string,
) => string

export interface I18nRoutingFromAdapterOptions {
  defaultLocale: string
  localeCodes: string[]
  localeKeyToCode?: Record<string, string>
}

function isAdapter(value: VitePressRouterAdapter | I18nRoutingFromAdapterOptions): value is VitePressRouterAdapter {
  return 'switchLocalePath' in value && typeof (value as VitePressRouterAdapter).switchLocalePath === 'function'
}

/**
 * Bridge so VitePress navbar language menu and `<I18nSwitcher>` share path logic.
 * Pass the result to `themeConfig.i18nRouting`.
 *
 * Returns a **self-contained** function (no closures) so VitePress can serialize it
 * into site data via `Function#toString()` + `new Function`.
 */
export function createI18nRoutingFromAdapter(
  adapterOrOptions: VitePressRouterAdapter | I18nRoutingFromAdapterOptions,
): VitePressI18nRoutingFn {
  const options: I18nRoutingFromAdapterOptions = isAdapter(adapterOrOptions)
    ? {
        defaultLocale: adapterOrOptions.defaultLocale,
        localeCodes: adapterOrOptions.localeCodes,
        localeKeyToCode: adapterOrOptions.localeKeyToCode ?? {},
      }
    : adapterOrOptions

  const defaultLocale = options.defaultLocale
  const localeCodes = options.localeCodes
  const localeKeyToCode = options.localeKeyToCode ?? {}

  // Inlined constants — required for VitePress themeConfig function serialization.
  // oxlint-disable-next-line typescript/no-implied-eval -- intentional for VP serializeFunctions
  return new Function(
    'data',
    'route',
    'targetLocale',
    `
      const defaultLocale = ${JSON.stringify(defaultLocale)};
      const localeCodes = ${JSON.stringify(localeCodes)};
      const localeKeyToCode = ${JSON.stringify(localeKeyToCode)};
      const code = targetLocale === 'root'
        ? (localeKeyToCode.root || defaultLocale)
        : (localeKeyToCode[targetLocale] || targetLocale);
      let path = (route && route.path) || '/';
      const hash = (route && route.hash) || '';
      const query = (route && route.query) || '';
      const hashIndex = path.indexOf('#');
      const queryIndex = path.indexOf('?');
      let cut = path.length;
      if (hashIndex >= 0) cut = Math.min(cut, hashIndex);
      if (queryIndex >= 0) cut = Math.min(cut, queryIndex);
      const pathname = path.slice(0, cut) || '/';
      const extras = path.slice(cut);
      const hadTrailingSlash = pathname === '/' || pathname.endsWith('/');
      const segments = pathname.split('/').filter(Boolean);
      if (segments[0] && localeCodes.includes(segments[0])) segments.shift();
      if (code !== defaultLocale) segments.unshift(code);
      let localized = segments.length === 0 ? '/' : '/' + segments.join('/');
      if (localized !== '/' && hadTrailingSlash) localized += '/';
      const q = extras.indexOf('?') >= 0
        ? ''
        : (query ? (query.charAt(0) === '?' ? query : '?' + query) : '');
      const h = hash
        ? (hash.charAt(0) === '#' ? hash : '#' + hash)
        : '';
      return localized + extras + q + h;
    `,
  ) as VitePressI18nRoutingFn
}
