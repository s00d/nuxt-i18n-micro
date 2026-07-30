// @ts-nocheck

import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { h } from 'preact'
import { createI18n, I18nProvider } from '../src'
import { I18nSwitcher } from '../src/components/I18nSwitcher'
import { I18nLocalesContext } from '../src/injection'

describe('I18nSwitcher — customDisabledLinkStyle', () => {
  test('applies customDisabledLinkStyle to the button for disabled current locale', () => {
    const i18n = createI18n({
      locale: 'de',
      messages: { de: {} },
    })

    render(
      h(
        I18nProvider,
        { i18n },
        h(
          I18nLocalesContext.Provider,
          {
            value: [
              { code: 'en', displayName: 'English' },
              { code: 'de', displayName: 'German', disabled: true },
            ],
          },
          h(I18nSwitcher, { currentLocale: 'de', customDisabledLinkStyle: { cursor: 'not-allowed' } }),
        ),
      ),
    )

    const button = screen.getByRole('button', { name: /German/i })
    expect(button.getAttribute('style') ?? '').toMatch(/cursor:\s*not-allowed/i)
  })
})
