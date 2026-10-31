import { describe, expect, it } from 'vitest'
import { renderI18nT, type RenderApi } from '../src/render'
import type { TextHost } from '../src/text'

const api: RenderApi = { h: (type, props, children) => ({ type, props, children }), Fragment: 'fragment' }
const host: TextHost = {
  pluralFunc: () => null,
  getLocale: () => 'en',
  t: (key) => ({ empty: '' })[key as string] ?? key,
  tc: (key) => String(key),
  tn: String,
  td: String,
  tdr: String,
}

describe('renderI18nT hideIfEmpty', () => {
  // a component's `defaultValue` prop defaults to '': an empty text node has no twin in server HTML, so hydration breaks
  it('renders nothing for an empty default', () => {
    expect(renderI18nT(api, host, { keypath: 'empty', hideIfEmpty: true, defaultValue: '' }, {}, {})).toBeNull()
  })

  it('renders a default that has text', () => {
    expect(renderI18nT(api, host, { keypath: 'empty', hideIfEmpty: true, defaultValue: 'Default' }, {}, {})).toBe('Default')
  })
})
