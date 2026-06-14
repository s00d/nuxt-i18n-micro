import { findAllowedLocalesForRoute, isMetaDisabledForRoute } from '../src/route'

describe('route locale helpers', () => {
  it('finds allowed locales by route name and path', () => {
    const allowed = findAllowedLocalesForRoute(
      { path: '/contact', name: 'contact' },
      {
        contact: ['en', 'fr'],
        '/contact': ['de'],
      },
    )

    expect(allowed).toEqual(['en', 'fr'])
  })

  it('checks meta disable flags for route patterns', () => {
    expect(
      isMetaDisabledForRoute(
        {
          path: '/es/about',
          matched: [{ path: '/:locale(es)/about/:id' }],
        },
        {
          '/about/[id]': true,
        },
        'es',
      ),
    ).toBe(true)
  })
})
