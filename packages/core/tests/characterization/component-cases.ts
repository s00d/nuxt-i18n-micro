/** Inputs of the link, switcher and router goldens, shared by the React family and Solid. */
import type { Locale } from '@i18n-micro/types'

export const LOCALES: Locale[] = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'ar', iso: 'ar-EG', dir: 'rtl' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français', disabled: true },
]

export const LINK_TARGETS: unknown[] = [
  '/about',
  'about',
  '/about/',
  '/about?x=1#y',
  '/about/team',
  '#top',
  '?x=1',
  '/',
  { path: '/a' },
  'https://e.com/x',
  'HTTPS://e.com/x',
  'mailto:a@b.c',
  'tel:+1',
  'report.pdf',
  'index.html',
  'example.com/x',
  'www.example.com',
  '//cdn.e.com/y',
]

export const PATH_TARGETS: unknown[] = ['/', '/about', 'about', '/de', '/de/', '/de/about', '/de?x=1', '/de#top', '/about?x=1#h', { path: '/a' }, {}]

export const report = (lines: string[]) => `${lines.join('\n')}\n`
