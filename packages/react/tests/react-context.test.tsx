import { describe, expect, test, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { stderr } from 'node:process'
import React from 'react'
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
  test('should throw error when used outside provider', () => {
    // React logs via console.error; jsdom also dumps the same Error to stderr (bypassing console).
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const stderrWrite = stderr.write.bind(stderr)
    stderr.write = (() => true) as typeof stderr.write

    const ErrorComponent = () => {
      useI18n()
      return <div>Should not render</div>
    }

    try {
      expect(() => {
        // @ts-expect-error - React Testing Library type issue
        render(<ErrorComponent />)
      }).toThrow(/I18nContext not found/)
    } finally {
      stderr.write = stderrWrite
      consoleSpy.mockRestore()
    }
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
})
