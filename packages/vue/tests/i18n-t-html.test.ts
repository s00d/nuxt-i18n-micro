import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { I18nInjectionKey } from '../src/injection'
import { I18nT } from '../src/components/i18n-t'
import { VueI18n } from '../src/composer'

function mountI18nT(props: Record<string, unknown>) {
  const i18n = new VueI18n({
    locale: 'en',
    missingWarn: false,
    messages: {
      en: {
        items: '{count} apples',
        priced: 'Price: {number}',
        rich: '<b>{count}</b> apples',
      },
    },
  })

  return mount(I18nT, {
    props,
    global: {
      provide: {
        [I18nInjectionKey as never]: i18n,
      },
    },
  })
}

describe('I18nT html prop', () => {
  test('plural mode renders text, not HTML, when html is false', () => {
    const wrapper = mountI18nT({ keypath: 'rich', plural: 5 })
    expect(wrapper.html()).not.toContain('<b>')
    expect(wrapper.text()).toBe('<b>5</b> apples')
  })

  test('plural mode renders HTML only when html is true', () => {
    const wrapper = mountI18nT({ keypath: 'rich', plural: 5, html: true })
    expect(wrapper.html()).toContain('<b>5</b>')
    expect(wrapper.text()).toBe('5 apples')
  })

  test('number mode does not use innerHTML by default', () => {
    const wrapper = mountI18nT({ keypath: 'priced', number: 10 })
    expect(wrapper.html()).not.toMatch(/innerHTML/i)
    expect(wrapper.text()).toContain('Price:')
  })

  test('strips fallthrough innerHTML when html is false', () => {
    const wrapper = mount(I18nT, {
      props: { keypath: 'rich', plural: 5 },
      attrs: { innerHTML: '<img src=x onerror=alert(1)>' },
      global: {
        provide: {
          [I18nInjectionKey as never]: new VueI18n({
            locale: 'en',
            missingWarn: false,
            messages: { en: { rich: '<b>{count}</b> apples' } },
          }),
        },
      },
    })
    expect(wrapper.html()).not.toContain('<img')
    expect(wrapper.text()).toBe('<b>5</b> apples')
  })

  test('strips fallthrough outerHTML when html is false', () => {
    const wrapper = mount(I18nT, {
      props: { keypath: 'rich', plural: 5 },
      attrs: { outerHTML: '<img src=x onerror=alert(1)>' },
      global: {
        provide: {
          [I18nInjectionKey as never]: new VueI18n({
            locale: 'en',
            missingWarn: false,
            messages: { en: { rich: '<b>{count}</b> apples' } },
          }),
        },
      },
    })
    expect(wrapper.html()).not.toContain('<img')
    expect(wrapper.text()).toBe('<b>5</b> apples')
  })
})
