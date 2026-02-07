// @ts-nocheck

import { describe, expect, jest, test } from '@jest/globals'
import { act, render, screen, waitFor } from '@testing-library/preact'
import { h } from 'preact'
import React from 'react'
import { createI18n, I18nProvider, useI18n } from '../src'

// Test component that uses useI18n
const TestComponent = () => {
  const { ts, locale, tc, tn, td, tdr, has } = useI18n()

  return React.createElement(
    'div',
    null,
    React.createElement('div', { 'data-testid': 'greeting' }, ts('greeting')),
    React.createElement('div', { 'data-testid': 'locale' }, locale),
    React.createElement('div', { 'data-testid': 'has-greeting' }, has('greeting') ? 'true' : 'false'),
    React.createElement('div', { 'data-testid': 'has-missing' }, has('missing') ? 'true' : 'false'),
    React.createElement('div', { 'data-testid': 'plural-0' }, tc('apples', 0)),
    React.createElement('div', { 'data-testid': 'plural-1' }, tc('apples', 1)),
    React.createElement('div', { 'data-testid': 'plural-5' }, tc('apples', 5)),
    React.createElement('div', { 'data-testid': 'number' }, tn(1234.56)),
    React.createElement('div', { 'data-testid': 'date' }, td(new Date('2023-01-15'))),
    React.createElement('div', { 'data-testid': 'relative' }, tdr(Date.now() - 3600000)),
  )
}

describe('I18nProvider and useI18n', () => {
  test('should provide i18n context', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
          apples: 'no apples | one apple | {count} apples',
        },
      },
    })

    // @ts-expect-error - h() returns Preact VNode, render expects compatible type
    render(h(I18nProvider, { i18n }, h(TestComponent, null)))

    expect(screen.getByTestId('greeting').textContent).toBe('Hello')
    expect(screen.getByTestId('locale').textContent).toBe('en')
    expect(screen.getByTestId('has-greeting').textContent).toBe('true')
    expect(screen.getByTestId('has-missing').textContent).toBe('false')
  })

  test('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // React Testing Library will catch the error, so we need to check it differently
    const ErrorComponent = () => {
      useI18n()
      return React.createElement('div', null, 'Should not render')
    }

    expect(() => {
      render(h(ErrorComponent, null))
    }).toThrow()

    consoleSpy.mockRestore()
  })

  test('should handle pluralization in component', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
          apples: 'no apples | one apple | {count} apples',
        },
      },
    })

    // @ts-expect-error - h() returns Preact VNode, render expects compatible type
    render(h(I18nProvider, { i18n }, h(TestComponent, null)))

    expect(screen.getByTestId('plural-0').textContent).toBe('no apples')
    expect(screen.getByTestId('plural-1').textContent).toBe('one apple')
    expect(screen.getByTestId('plural-5').textContent).toBe('5 apples')
  })

  test('should format numbers and dates in component', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
          apples: 'no apples | one apple | {count} apples',
        },
      },
    })

    // @ts-expect-error - h() returns Preact VNode, render expects compatible type
    render(h(I18nProvider, { i18n }, h(TestComponent, null)))

    expect(screen.getByTestId('number').textContent).toMatch(/1[,.]234[.,]56/)
    expect(screen.getByTestId('date').textContent).toBeTruthy()
    expect(screen.getByTestId('relative').textContent).toMatch(/hour/)
  })

  test('should react to locale changes', async () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
          apples: 'no apples | one apple | {count} apples',
        },
        fr: {
          greeting: 'Bonjour',
          apples: 'pas de pommes | une pomme | {count} pommes',
        },
      },
    })

    // @ts-expect-error - h() returns Preact VNode, render expects compatible type
    render(h(I18nProvider, { i18n }, h(TestComponent, null)))

    expect(screen.getByTestId('greeting').textContent).toBe('Hello')
    expect(screen.getByTestId('locale').textContent).toBe('en')

    // Change locale - this should trigger re-render via useSyncExternalStore
    act(() => {
      i18n.locale = 'fr'
    })

    // Wait for React to re-render
    await waitFor(() => {
      expect(screen.getByTestId('locale').textContent).toBe('fr')
      expect(screen.getByTestId('greeting').textContent).toBe('Bonjour')
    })
  })

  test('should handle route-specific translations', async () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          title: 'Global Title',
        },
      },
    })

    i18n.addRouteTranslations(
      'en',
      'home',
      {
        title: 'Home Title',
      },
      false,
    )

    const RouteTestComponent = () => {
      const { ts } = useI18n()
      return React.createElement('div', null, React.createElement('div', { 'data-testid': 'route-title' }, ts('title')))
    }

    // @ts-expect-error - h() returns Preact VNode, render expects compatible type
    render(h(I18nProvider, { i18n }, h(RouteTestComponent, null)))

    expect(screen.getByTestId('route-title').textContent).toBe('Global Title')

    // Set route to home - should trigger re-render
    act(() => {
      i18n.setRoute('home')
    })
    await waitFor(() => {
      expect(screen.getByTestId('route-title').textContent).toBe('Home Title')
    })

    // Set route back to general
    act(() => {
      i18n.setRoute('general')
    })
    await waitFor(() => {
      expect(screen.getByTestId('route-title').textContent).toBe('Global Title')
    })
  })
})
