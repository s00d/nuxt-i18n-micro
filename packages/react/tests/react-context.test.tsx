/* eslint-disable @typescript-eslint/no-empty-object-type */
import { describe, test, expect, jest } from '@jest/globals'
import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { createI18n, I18nProvider, useI18n } from '../src'

// Test component that uses useI18n
// @ts-expect-error - React.FC type compatibility
const TestComponent: React.FC<{}> = () => {
  const { ts, locale, tc, tn, td, tdr, has } = useI18n()

  return (
    <div>
      <div data-testid="greeting">{ts('greeting')}</div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="has-greeting">{has('greeting') ? 'true' : 'false'}</div>
      <div data-testid="has-missing">{has('missing') ? 'true' : 'false'}</div>
      <div data-testid="plural-0">{tc('apples', 0)}</div>
      <div data-testid="plural-1">{tc('apples', 1)}</div>
      <div data-testid="plural-5">{tc('apples', 5)}</div>
      <div data-testid="number">{tn(1234.56)}</div>
      <div data-testid="date">{td(new Date('2023-01-15'))}</div>
      <div data-testid="relative">{tdr(Date.now() - 3600000)}</div>
    </div>
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

    render(
      // @ts-expect-error - React Testing Library type issue
      <I18nProvider i18n={i18n}>
        {/* @ts-expect-error - React Testing Library type issue */}
        <TestComponent />
      </I18nProvider>,
    )

    expect(screen.getByTestId('greeting').textContent).toBe('Hello')
    expect(screen.getByTestId('locale').textContent).toBe('en')
    expect(screen.getByTestId('has-greeting').textContent).toBe('true')
    expect(screen.getByTestId('has-missing').textContent).toBe('false')
  })

  test('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // React Testing Library will catch the error, so we need to check it differently
    // @ts-expect-error - React.FC type compatibility
    const ErrorComponent: React.FC<{}> = () => {
      useI18n()
      return <div>Should not render</div>
    }

    expect(() => {
      // @ts-expect-error - Testing error case
      render(<ErrorComponent />)
    }).toThrow()

    consoleSpy.mockRestore()
  })

  test('should handle pluralization in component', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          apples: 'no apples | one apple | {count} apples',
        },
      },
    })

    render(
      // @ts-expect-error - React Testing Library type issue
      <I18nProvider i18n={i18n}>
        {/* @ts-expect-error - React Testing Library type issue */}
        <TestComponent />
      </I18nProvider>,
    )

    expect(screen.getByTestId('plural-0').textContent).toBe('no apples')
    expect(screen.getByTestId('plural-1').textContent).toBe('one apple')
    expect(screen.getByTestId('plural-5').textContent).toBe('5 apples')
  })

  test('should format numbers and dates in component', () => {
    const i18n = createI18n({
      locale: 'en',
    })

    render(
      // @ts-expect-error - React Testing Library type issue
      <I18nProvider i18n={i18n}>
        {/* @ts-expect-error - React Testing Library type issue */}
        <TestComponent />
      </I18nProvider>,
    )

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
        },
        fr: {
          greeting: 'Bonjour',
        },
      },
    })

    render(
      // @ts-expect-error - React Testing Library type issue
      <I18nProvider i18n={i18n}>
        {/* @ts-expect-error - React Testing Library type issue */}
        <TestComponent />
      </I18nProvider>,
    )

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

    i18n.addRouteTranslations('en', 'home', {
      title: 'Home Title',
    }, false)

    // @ts-expect-error - React.FC type compatibility
    const RouteTestComponent: React.FC<{}> = () => {
      const { ts } = useI18n()
      return (
        <div>
          <div data-testid="route-title">{ts('title')}</div>
        </div>
      )
    }

    render(
      // @ts-expect-error - React Testing Library type issue
      <I18nProvider i18n={i18n}>
        {/* @ts-expect-error - React Testing Library type issue */}
        <RouteTestComponent />
      </I18nProvider>,
    )

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
