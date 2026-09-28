import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { h } from 'preact'
import type { AnchorHTMLAttributes, HTMLAttributes, TargetedMouseEvent } from 'preact'
import { createI18n, I18nProvider } from '../src'
import { I18nGroup } from '../src/components/I18nGroup'
import { I18nLink } from '../src/components/I18nLink'
import { I18nSwitcher } from '../src/components/I18nSwitcher'
import { I18nT } from '../src/components/I18nT'
import { I18nLocalesContext } from '../src/injection'

/**
 * Smoke coverage for Preact 11-compatible prop bases (HTMLAttributes /
 * AnchorHTMLAttributes / TargetedMouseEvent imported from `preact`, not JSX.*).
 */
describe('Preact 11-compatible component props', () => {
  const i18n = createI18n({
    locale: 'en',
    messages: {
      en: {
        greeting: 'Hello',
        home: 'Home',
      },
    },
  })

  test('I18nT accepts HTMLAttributes-style props and renders keypath', () => {
    const attrs: HTMLAttributes<HTMLElement> = { class: 't-class', id: 't-id' }
    render(h(I18nProvider, { i18n }, h(I18nT, { keypath: 'greeting', ...attrs })))
    const el = document.getElementById('t-id')
    expect(el?.textContent).toBe('Hello')
    expect(el?.className).toContain('t-class')
  })

  test('I18nGroup accepts HTMLAttributes and wraps children', () => {
    render(
      h(
        I18nProvider,
        { i18n },
        h(I18nGroup, { prefix: 'page', class: 'group', 'data-testid': 'group' }, ({ t }) => t('title')),
      ),
    )
    // missing page.title → key fallback; still proves HTMLAttributes apply
    expect(screen.getByTestId('group').className).toContain('group')
  })

  test('I18nLink accepts AnchorHTMLAttributes and TargetedMouseEvent onClick', () => {
    const clicks: TargetedMouseEvent<HTMLAnchorElement>[] = []
    const attrs: AnchorHTMLAttributes<HTMLAnchorElement> = {
      class: 'link',
      title: 'go',
      onClick: (e) => {
        clicks.push(e)
      },
    }
    render(h(I18nProvider, { i18n }, h(I18nLink, { to: '/en', ...attrs }, 'Home')))
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link.getAttribute('title')).toBe('go')
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(clicks.length).toBe(1)
  })

  test('I18nSwitcher accepts HTMLAttributes on the root', () => {
    render(
      h(
        I18nProvider,
        { i18n },
        h(
          I18nLocalesContext.Provider,
          {
            value: [
              { code: 'en', displayName: 'English' },
              { code: 'de', displayName: 'German' },
            ],
          },
          h(I18nSwitcher, { currentLocale: 'en', class: 'switcher', 'data-testid': 'switcher' }),
        ),
      ),
    )
    expect(screen.getByTestId('switcher').className).toContain('switcher')
  })
})
