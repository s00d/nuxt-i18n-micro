import type {
  RouteLocationAsPathGeneric,
  RouteLocationNamedRaw,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolvedGeneric,
  Router,
} from 'vue-router'
import type { ModuleOptionsExtend } from 'nuxt-i18n-micro-types'
import { RouteService } from '../src'

describe('RouteService', () => {
  let routeService: RouteService
  let mockRouter: jest.Mocked<Router>
  let mockI18nConfig: ModuleOptionsExtend
  let setCookieMock: jest.Mock
  let navigateToMock: jest.Mock

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      currentRoute: { value: { params: { locale: 'en' } } },
      resolve: jest.fn((to: RouteLocationRaw | string) => ({
        fullPath: typeof to === 'string' ? to : to.path || '',
        path: typeof to === 'string' ? to : to.path || '',
        query: {},
        hash: '',
        params: {},
      })) as unknown as jest.MockedFunction<Router['resolve']>,
      hasRoute: jest.fn((_name: string) => false) as jest.MockedFunction<Router['hasRoute']>,
      push: jest.fn(() => Promise.resolve()) as unknown as jest.MockedFunction<Router['push']>,
    } as unknown as jest.Mocked<Router>

    // Mock ModuleOptionsExtend
    mockI18nConfig = {
      apiBaseUrl: '',
      dateBuild: 0,
      disablePageLocales: false,
      isSSG: false,
      defaultLocale: 'en',
      strategy: 'prefix_except_default',
      locales: [
        { code: 'en', iso: 'en-US' },
        { code: 'de', iso: 'de-DE' },
        { code: 'ru', iso: 'ru-RU' },
      ],
      hashMode: false,
    }

    // Mock setCookie and navigateTo
    setCookieMock = jest.fn()
    navigateToMock = jest.fn()

    // Initialize RouteService
    routeService = new RouteService(
      mockI18nConfig,
      mockRouter,
      null,
      null,
      navigateToMock,
      setCookieMock,
      null,
      null,
    )
  })

  test('getCurrentLocale should return the correct locale', () => {
    const locale = routeService.getCurrentLocale()
    expect(locale).toBe('en')
  })

  test('getCurrentLocale should return the hash locale if hashMode is enabled', () => {
    const mockI18nConfigWithHashMode = { ...mockI18nConfig, hashMode: true }
    routeService = new RouteService(mockI18nConfigWithHashMode, mockRouter, 'de', null, navigateToMock, setCookieMock, null, null)
    const locale = routeService.getCurrentLocale()
    expect(locale).toBe('de')
  })

  test('getCurrentLocale should return the noPrefix locale if noPrefix strategy is enabled', () => {
    const mockI18nConfigWithNoPrefix: ModuleOptionsExtend = { ...mockI18nConfig, strategy: 'no_prefix' }
    routeService = new RouteService(mockI18nConfigWithNoPrefix, mockRouter, null, 'ru', navigateToMock, setCookieMock, null, null)
    const locale = routeService.getCurrentLocale()
    expect(locale).toBe('ru')
  })

  test('getCurrentName should return the display name of the current locale', () => {
    const mockI18nConfigWithDisplayName = {
      ...mockI18nConfig,
      locales: [
        { code: 'en', iso: 'en-US', displayName: 'English' },
        { code: 'de', iso: 'de-DE', displayName: 'German' },
        { code: 'ru', iso: 'ru-RU', displayName: 'Russian' },
      ],
    }
    routeService = new RouteService(mockI18nConfigWithDisplayName, mockRouter, null, null, navigateToMock, setCookieMock, null, null)
    const route = { name: 'localized-about-en' } as RouteLocationNormalizedLoaded
    const displayName = routeService.getCurrentName(route)
    expect(displayName).toBe('English')
  })

  test('getRouteName should return the correct route name without locale suffix', () => {
    const route = { name: 'localized-about-en' } as RouteLocationNamedRaw
    const routeName = routeService.getRouteName(route, 'en')
    expect(routeName).toBe('about')
  })

  test('switchLocaleRoute should return the correct route for the new locale', () => {
    const route = { name: 'localized-about-en', params: {} } as RouteLocationNamedRaw
    const i18nRouteParams = { de: { param1: 'value1' } }
    const newRoute = routeService.switchLocaleRoute('en', 'de', route, i18nRouteParams)
    expect(newRoute).toEqual({
      name: 'localized-about',
      hash: undefined,
      query: undefined,
      params: { param1: 'value1', locale: 'de' },
    })
  })

  test('getLocalizedRoute should return the correct localized route', () => {
    const route = { name: 'about', params: {} } as RouteLocationNormalizedLoaded
    const to = { path: '/about' } as RouteLocationResolvedGeneric
    mockRouter.resolve.mockReturnValueOnce({
      fullPath: '/en/about',
      path: '/about',
      query: {},
      hash: '',
      params: {},
    } as RouteLocationResolvedGeneric)
    const localizedRoute = routeService.getLocalizedRoute(to, route, 'en')
    expect(localizedRoute).toEqual({
      path: '/about',
      fullPath: '/about',
      query: {},
      params: {},
      hash: '',
    })
  })

  test('switchLocaleLogic should switch the locale and navigate to the new route', async () => {
    const route = { name: 'about-en', params: {} } as RouteLocationResolvedGeneric
    const i18nRouteParams = { de: { param1: 'value1' } }
    await routeService.switchLocaleLogic('de', i18nRouteParams, route)

    // Check that push was called with correct arguments
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'localized-about',
      params: { param1: 'value1', locale: 'de' },
      hash: undefined,
      query: undefined,
    })
  })

  test('getFullPathWithBaseUrl should return the correct full path with base URL', () => {
    const currentLocale = { code: 'de', iso: 'de-DE', baseUrl: 'https://example.com/de' }
    const route = { path: '/about' } as RouteLocationRaw
    const fullPath = routeService.getFullPathWithBaseUrl(currentLocale, route)
    expect(fullPath).toBe('https://example.com/de/about')
  })

  test('updateCookies should update cookies for hashMode and noPrefixStrategy', () => {
    const mockI18nConfigWithHashMode: ModuleOptionsExtend = {
      ...mockI18nConfig,
      hashMode: true,
      strategy: 'prefix_except_default',
    }
    routeService = new RouteService(mockI18nConfigWithHashMode, mockRouter, 'de', null, navigateToMock, setCookieMock, null, null)
    routeService.updateCookies('de')
    expect(setCookieMock).toHaveBeenCalledWith('hash-locale', 'de')

    const mockI18nConfigWithNoPrefix: ModuleOptionsExtend = {
      ...mockI18nConfig,
      strategy: 'no_prefix',
    }
    routeService = new RouteService(mockI18nConfigWithNoPrefix, mockRouter, null, 'ru', navigateToMock, setCookieMock, null, null)
    routeService.updateCookies('ru')
    expect(setCookieMock).toHaveBeenCalledWith('no-prefix-locale', 'ru')
  })

  test('resolveLocalizedRoute should return the correct localized route', () => {
    const to = { path: '/about' } as RouteLocationAsPathGeneric
    mockRouter.resolve.mockReturnValueOnce({
      fullPath: '/en/about',
      path: '/about',
      query: {},
      hash: '',
      params: {},
    } as RouteLocationResolvedGeneric)
    const localizedRoute = routeService.resolveLocalizedRoute(to, 'en')
    expect(localizedRoute).toEqual({
      path: '/about',
      fullPath: '/about',
      query: {},
      params: {},
      hash: '',
    })
  })

  test('getCurrentLocale should return defaultLocale if locale is missing in route params', () => {
    mockRouter.currentRoute.value.params = {} // Remove locale from params
    mockRouter.currentRoute.value.path = '/' // No locale in path
    const locale = routeService.getCurrentLocale()
    expect(locale).toBe('en') // defaultLocale
  })

  test('getCurrentLocale should extract locale from URL path when route params are missing', () => {
    mockRouter.currentRoute.value.params = {} // Remove locale from params
    mockRouter.currentRoute.value.path = '/ru/sdfsdf' // URL with locale prefix
    const locale = routeService.getCurrentLocale()
    expect(locale).toBe('ru') // Should extract from URL
  })

  test('getCurrentLocale should use cookie locale when route params and URL path are missing', () => {
    routeService = new RouteService(
      mockI18nConfig,
      mockRouter,
      null,
      null,
      navigateToMock,
      setCookieMock,
      'de', // cookie locale
      'user-locale', // cookie name
    )
    mockRouter.currentRoute.value.params = {} // Remove locale from params
    mockRouter.currentRoute.value.path = '/' // No locale in path
    const locale = routeService.getCurrentLocale()
    expect(locale).toBe('de') // Should use cookie
  })

  test('getCurrentLocale should prioritize route params over URL path', () => {
    mockRouter.currentRoute.value.params = { locale: 'de' } // Route params have locale
    mockRouter.currentRoute.value.path = '/ru/sdfsdf' // URL has different locale
    const locale = routeService.getCurrentLocale()
    expect(locale).toBe('de') // Should use route params
  })

  test('getCurrentLocale should prioritize URL path over cookie', () => {
    routeService = new RouteService(
      mockI18nConfig,
      mockRouter,
      null,
      null,
      navigateToMock,
      setCookieMock,
      'de', // cookie locale
      'user-locale', // cookie name
    )
    mockRouter.currentRoute.value.params = {} // No locale in params
    mockRouter.currentRoute.value.path = '/ru/sdfsdf' // URL has locale
    const locale = routeService.getCurrentLocale()
    expect(locale).toBe('ru') // Should use URL path, not cookie
  })

  test('updateCookies should update cookie for regular strategy', () => {
    routeService = new RouteService(
      mockI18nConfig,
      mockRouter,
      null,
      null,
      navigateToMock,
      setCookieMock,
      null,
      'user-locale', // cookie name
    )
    routeService.updateCookies('ru')
    expect(setCookieMock).toHaveBeenCalledWith('user-locale', 'ru')
  })

  test('getCurrentName should return null if displayName is missing', () => {
    const mockI18nConfigWithoutDisplayName = {
      ...mockI18nConfig,
      locales: [
        { code: 'en', iso: 'en-US' }, // displayName is missing
        { code: 'de', iso: 'de-DE' },
        { code: 'ru', iso: 'ru-RU' },
      ],
    }
    routeService = new RouteService(mockI18nConfigWithoutDisplayName, mockRouter, null, null, navigateToMock, setCookieMock, null, null)
    const route = { name: 'localized-about-en' } as RouteLocationNormalizedLoaded
    const displayName = routeService.getCurrentName(route)
    expect(displayName).toBeNull()
  })

  test('switchLocaleRoute should handle missing i18nRouteParams', () => {
    const route = { name: 'localized-about-en', params: {} } as RouteLocationResolvedGeneric
    const newRoute = routeService.switchLocaleRoute('en', 'de', route, {})
    expect(newRoute).toEqual({
      name: 'localized-about',
      hash: undefined,
      query: undefined,
      params: { locale: 'de' },
    })
  })

  test('getFullPathWithBaseUrl should handle missing baseUrl', () => {
    const currentLocale = { code: 'de', iso: 'de-DE' } // baseUrl is missing
    const route = { path: '/about' } as RouteLocationRaw
    const fullPath = routeService.getFullPathWithBaseUrl(currentLocale, route)
    expect(fullPath).toBe('/about')
  })

  test('handlePrefixStrategy should handle invalid route', () => {
    const to = '/invalid-route'
    mockRouter.resolve.mockReturnValueOnce({
      fullPath: '/invalid-route',
      path: '/invalid-route',
      query: {},
      hash: '',
      params: {},
    } as RouteLocationResolvedGeneric)
    const processedTo = routeService['handlePrefixStrategy'](to)
    expect(processedTo).toEqual(to)
  })

  test('createLocalizedRoute should handle invalid route', () => {
    const to = '/invalid-route'
    const route = { name: 'about', params: {} } as RouteLocationNormalizedLoaded
    mockRouter.resolve.mockReturnValueOnce({
      fullPath: '/invalid-route',
      path: '/invalid-route',
      query: {},
      hash: '',
      params: {},
    } as RouteLocationResolvedGeneric)
    const localizedRoute = routeService['createLocalizedRoute'](to, route, 'en')
    expect(localizedRoute).toEqual({
      path: '/invalid-route',
      fullPath: '/invalid-route',
      query: {},
      params: {},
      hash: '',
    })
  })

  test('resolveLocalizedRoute should handle invalid route', () => {
    const to = '/invalid-route'
    mockRouter.resolve.mockReturnValueOnce({
      fullPath: '/invalid-route',
      path: '/invalid-route',
      query: {},
      hash: '',
      params: {},
    } as RouteLocationResolvedGeneric)
    const localizedRoute = routeService.resolveLocalizedRoute(to, 'en')
    expect(localizedRoute).toEqual({
      path: '/invalid-route',
      fullPath: '/invalid-route',
      query: {},
      params: {},
      hash: '',
    })
  })

  test('updateCookies should not update cookies if hashMode and noPrefixStrategy are disabled', () => {
    routeService.updateCookies('de')
    expect(setCookieMock).not.toHaveBeenCalled()
  })
})
