/**
 * Tests for builder.ts - createLocalizedRouteObject
 */
import { createLocalizedRouteObject } from '../src/core/builder'

describe('createLocalizedRouteObject', () => {
  test('creates route object with name', () => {
    const source = { path: '/about', params: { id: '1' }, query: { foo: 'bar' }, hash: '#section' }
    const result = createLocalizedRouteObject('about-en', '/en/about', '/en/about', source)

    expect(result).toEqual({
      name: 'about-en',
      path: '/en/about',
      fullPath: '/en/about',
      params: { id: '1' },
      query: { foo: 'bar' },
      hash: '#section',
    })
  })

  test('creates route object without name when undefined', () => {
    const source = { path: '/page', params: {}, query: {}, hash: '' }
    const result = createLocalizedRouteObject(undefined, '/de/page', '/de/page', source)

    expect(result).not.toHaveProperty('name')
    expect(result.path).toBe('/de/page')
  })

  test('uses resolvedParams when provided', () => {
    const source = { path: '/page', params: { old: 'value' } }
    const result = createLocalizedRouteObject('page', '/page', '/page', source, { new: 'param' })

    expect(result.params).toEqual({ new: 'param' })
  })

  test('uses resolvedQuery when provided', () => {
    const source = { path: '/page', query: { old: 'query' } }
    const result = createLocalizedRouteObject('page', '/page', '/page', source, undefined, { new: 'query' })

    expect(result.query).toEqual({ new: 'query' })
  })

  test('uses resolvedHash when source hash is undefined', () => {
    const source = { path: '/page' }
    const result = createLocalizedRouteObject('page', '/page', '/page', source, undefined, undefined, '#resolved')

    expect(result.hash).toBe('#resolved')
  })

  test('uses source hash over resolvedHash', () => {
    const source = { path: '/page', hash: '#source' }
    const result = createLocalizedRouteObject('page', '/page', '/page', source, undefined, undefined, '#resolved')

    expect(result.hash).toBe('#source')
  })

  test('defaults empty when source has no params/query/hash', () => {
    const source = { path: '/page' }
    const result = createLocalizedRouteObject('page', '/page', '/page', source)

    expect(result.params).toEqual({})
    expect(result.query).toEqual({})
    expect(result.hash).toBe('')
  })
})
