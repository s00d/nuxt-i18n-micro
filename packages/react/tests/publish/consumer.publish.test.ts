// The peer range is a promise about types too: both ends, on packed tarballs.
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileConsumer } from '../../../test-utils/src/publish-consumer'
import { packageRootFromImportMeta } from '../../../test-utils/src/publish-smoke'

const packagesDir = join(packageRootFromImportMeta(import.meta.url), '..')

const APP = `
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createI18n, I18nGroup, I18nLink, I18nProvider, I18nSwitcher, I18nT, useI18n, useLocaleSwitch, useT } from '@i18n-micro/react'
import { createReactRouterAdapter } from '@i18n-micro/react/router'

const i18n = createI18n({ locale: 'en', messages: { en: { a: 'A' } } })

const Reader = () => {
  const { t } = useI18n()
  const text = useT('a')
  const [go] = useLocaleSwitch(async () => {})
  return <p onClick={() => go('en')}>{String(t('a'))}{text}</p>
}

export const App = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const router = useMemo(() => createReactRouterAdapter([{ code: 'en' }], 'en', location, navigate), [location, navigate])
  return (
    <I18nProvider i18n={i18n} routingStrategy={router}>
      <Reader />
      <I18nT keypath="a" className="c" components={{ x: <b /> }} />
      <I18nT keypath="a">{({ translation }) => <u>{translation}</u>}</I18nT>
      <I18nLink to="/x" activeStyle={{ color: 'red' }} className="l" onClick={() => {}}>link</I18nLink>
      <I18nGroup prefix="g">{({ t }) => <b>{t('x')}</b>}</I18nGroup>
      <I18nSwitcher className="s" customLabels={{ en: 'EN' }} />
    </I18nProvider>
  )
}
`

/** The sample of docs/integrations/react-package.md. */
const SERVER = `
import type { ReactNode } from 'react'
import { cache } from 'react'
import { createI18n, I18nT } from '@i18n-micro/react/server'
import { I18nProvider } from '@i18n-micro/react/client'

const getI18n = cache(async (locale: string) => createI18n({ locale, messages: { [locale]: { title: 'x' } } }))

export default async function Layout({ params, children }: { params: Promise<{ locale: string }>; children: ReactNode }) {
  const { locale } = await params
  const i18n = await getI18n(locale)
  return (
    <I18nProvider locale={locale} messages={{ [locale]: i18n.resolveTranslations() }}>
      <h1>
        <I18nT i18n={i18n} keypath="title" />
      </h1>
      {children}
    </I18nProvider>
  )
}
`

describe.each([
  ['18', { react: '18.3.1', 'react-dom': '18.3.1', '@types/react': '18.3.12', 'react-router-dom': '6.30.1' }, { 'app.tsx': APP }],
  [
    '19',
    { react: '19.2.0', 'react-dom': '19.2.0', '@types/react': '19.2.0', 'react-router-dom': '7.18.4' },
    { 'app.tsx': APP, 'layout.tsx': SERVER },
  ],
])('@i18n-micro/react on react %s', (_major, dependencies, files) => {
  it('the app compiles', { timeout: 240_000 }, () => {
    const output = compileConsumer({ packagesDir, name: 'react', dependencies, compilerOptions: { jsx: 'react-jsx', types: ['react'] }, files })
    expect(output).toBe('')
  })
})
