import { describe, expect, test } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { I18nInjectionKey } from '../src/injection'
import { I18nT } from '../src/components/i18n-t'
import { VueI18n } from '../src/composer'

function mountWithSlots(keypath: string) {
  const i18n = new VueI18n({
    locale: 'en',
    missingWarn: false,
    messages: {
      en: {
        inOrder: '{count} out of {total}',
        reordered: 'Of {total}, {count}',
      },
    },
  })

  return mount(I18nT, {
    props: { keypath },
    slots: {
      count: () => h('b', '8'),
      total: () => h('i', '10'),
    },
    global: {
      provide: {
        [I18nInjectionKey as never]: i18n,
      },
    },
  })
}

describe('I18nT named slots', () => {
  test('fills slots whose placeholders follow the slot order', () => {
    expect(mountWithSlots('inOrder').text()).toBe('8 out of 10')
  })

  test('fills slots whose placeholders appear in a different order than the slots', () => {
    const wrapper = mountWithSlots('reordered')
    expect(wrapper.text()).toBe('Of 10, 8')
    expect(wrapper.find('i').element.nextElementSibling?.tagName).toBe('B')
  })
})
