import { act, fireEvent, render } from '@testing-library/preact'
import { h, hydrate } from 'preact'
import { useEffect, useLayoutEffect, useState } from 'preact/hooks'
import { renderToString } from 'preact-render-to-string'
import { describe, expect, test, vi } from 'vitest'
import { behaviourSuite } from '../../react/tests/shared/behaviour'
import * as lib from '../src'

behaviourSuite({
  h,
  useEffect,
  useLayoutEffect,
  useState: useState as never,
  render,
  act,
  fireEvent,
  renderToString,
  async hydrate(node, container) {
    const errors: unknown[] = []
    const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => void errors.push(args[0]))
    await act(async () => hydrate(node, container))
    consoleError.mockRestore()
    return errors
  },
  lib,
})

// `style` is a string or an object in Preact; React takes only the object
describe('a string style', () => {
  const i18n = () => lib.createI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: {} }, missingWarn: false })
  const routingStrategy = { getCurrentPath: () => '/about', push: () => {}, replace: () => {} }

  test('I18nSwitcher keeps it over its own', () => {
    const { container } = render(
      h(lib.I18nProvider, { i18n: i18n() }, h(lib.I18nSwitcher, { style: 'margin-top: 3px; display: block', customWrapperStyle: { color: 'red' } })),
    )
    const wrapper = container.querySelector<HTMLElement>('.i18n-switcher-wrapper')!
    expect([wrapper.style.marginTop, wrapper.style.display, wrapper.style.color]).toEqual(['3px', 'block', 'red'])
    expect(wrapper.style.position).toBe('relative')
  })

  test('an active I18nLink merges activeStyle over it', () => {
    const { container } = render(
      h(
        lib.I18nProvider,
        { i18n: i18n(), routingStrategy },
        h(lib.I18nLink, { to: '/about', style: 'margin-top: 3px', activeStyle: { fontWeight: 700, marginBottom: 2 } }, 'x'),
      ),
    )
    const link = container.querySelector('a')!
    expect([link.style.marginTop, link.style.fontWeight, link.style.marginBottom]).toEqual(['3px', '700', '2px'])
  })

  test('renders on the server too', () => {
    const html = renderToString(h(lib.I18nProvider, { i18n: i18n() }, h(lib.I18nSwitcher, { style: 'margin-top: 3px' })))
    expect(html).toContain('margin-top: 3px')
    expect(html).toContain('position:relative')
  })
})
