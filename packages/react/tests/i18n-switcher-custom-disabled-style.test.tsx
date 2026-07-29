import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
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
      <I18nProvider i18n={i18n}>
        <I18nLocalesContext.Provider
          value={[
            { code: 'en', displayName: 'English' },
            { code: 'de', displayName: 'German', disabled: true },
          ]}
        >
          <I18nSwitcher currentLocale="de" customDisabledLinkStyle={{ cursor: 'not-allowed' }} />
        </I18nLocalesContext.Provider>
      </I18nProvider>,
    )

    const button = screen.getByRole('button', { name: /German/i })
    expect(button.getAttribute('style') ?? '').toMatch(/cursor:\s*not-allowed/i)
  })
})
