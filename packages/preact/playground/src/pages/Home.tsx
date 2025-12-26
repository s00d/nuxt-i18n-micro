/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type React from 'react'
import { useI18n } from '@i18n-micro/preact'

// @ts-expect-error - Preact/React type incompatibility
export const Home: React.FC = () => {
  const { t, tc, tn, td, tdr, locale } = useI18n()

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
      <p>{t('welcome')}</p>
      <p>{t('greeting', { name: 'World' })}</p>
      <p>{tc('apples', 0)}</p>
      <p>{tc('apples', 1)}</p>
      <p>{tc('apples', 5)}</p>
      <p>{t('number', { number: tn(1234.56) })}</p>
      <p>{t('date', { date: td(new Date()) })}</p>
      <p>{t('relativeDate', { relativeDate: tdr(Date.now() - 86400000) })}</p>
      <p>
        Current locale:
        {' '}
        {locale}
      </p>
    </div>
  )
}
