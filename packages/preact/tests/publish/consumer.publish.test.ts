// The peer range is a promise about types too: both ends, on packed tarballs.
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileConsumer } from '../../../test-utils/src/publish-consumer'
import { packageRootFromImportMeta } from '../../../test-utils/src/publish-smoke'

const packagesDir = join(packageRootFromImportMeta(import.meta.url), '..')

const APP = `
import { createI18n, I18nGroup, I18nLink, I18nProvider, I18nSwitcher, I18nT, useI18n, useLocaleSwitch, useT } from '@i18n-micro/preact'
import { createBrowserHistoryAdapter } from '@i18n-micro/preact/router'

const i18n = createI18n({ locale: 'en', messages: { en: { a: 'A' } } })
const router = createBrowserHistoryAdapter([{ code: 'en' }], 'en')

const Reader = () => {
  const { t } = useI18n()
  const text = useT('a')
  const [go] = useLocaleSwitch(async () => {})
  return <p onClick={() => go('en')}>{t('a')}{text}</p>
}

export const App = () => (
  <I18nProvider i18n={i18n} routingStrategy={router}>
    <Reader />
    <I18nT keypath="a" class="c" components={{ x: <b /> }} />
    <I18nT keypath="a">{({ translation }) => <u>{translation}</u>}</I18nT>
    <I18nLink to="/x" activeStyle={{ color: 'red' }} class="l" onClick={() => {}}>link</I18nLink>
    <I18nGroup prefix="g">{({ t }) => <b>{t('x')}</b>}</I18nGroup>
    <I18nSwitcher class="s" customLabels={{ en: 'EN' }} />
  </I18nProvider>
)
`

describe.each(['10.27.2', '11'])('@i18n-micro/preact on preact %s', (preact) => {
  it('the app compiles', { timeout: 240_000 }, () => {
    const output = compileConsumer({
      packagesDir,
      name: 'preact',
      dependencies: { preact },
      compilerOptions: { jsx: 'react-jsx', jsxImportSource: 'preact' },
      files: { 'app.tsx': APP },
    })
    expect(output).toBe('')
  })
})
