import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { I18nInjectionKey } from '../src/injection'
import { I18nSwitcher } from '../src/components/i18n-switcher'

describe('I18nSwitcher — customDisabledLinkStyle', () => {
  test('applies customDisabledLinkStyle to the button for disabled current locale', () => {
    const i18n = {
      locale: ref('de'),
    } as any

    const wrapper = mount(I18nSwitcher, {
      props: {
        currentLocale: 'de',
        locales: [
          { code: 'en', iso: 'en_EN', displayName: 'English' },
          { code: 'de', iso: 'de_DE', displayName: 'German', disabled: true },
        ],
        customDisabledLinkStyle: { cursor: 'not-allowed' },
      },
      global: {
        provide: {
          [I18nInjectionKey as any]: i18n,
        },
      },
    })

    const style = wrapper.find('button.i18n-switcher-button').attributes('style') ?? ''
    expect(style).toMatch(/cursor:\s*not-allowed/i)
  })
})

