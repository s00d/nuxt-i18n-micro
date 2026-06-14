import { extractBaseRoutePattern, stripLocalizedRouteNamePrefix } from '../src/route-pattern'

describe('route-pattern', () => {
  it('extracts file-based route patterns from vue-router paths', () => {
    expect(extractBaseRoutePattern('/:locale(es)/test/:param()')).toBe('/test/[param]')
    expect(extractBaseRoutePattern('/:locale(en)/static')).toBe('/static')
    expect(extractBaseRoutePattern('/:locale(fr)/about/:id')).toBe('/about/[id]')
  })

  it('strips localized route name prefix', () => {
    expect(stripLocalizedRouteNamePrefix('localized-contact')).toBe('contact')
    expect(stripLocalizedRouteNamePrefix('contact')).toBe('contact')
  })
})
