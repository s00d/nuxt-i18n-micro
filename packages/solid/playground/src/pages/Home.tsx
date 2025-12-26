/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { Component } from 'solid-js'
import { useI18n, I18nT } from '@i18n-micro/solid'

const Home: Component = () => {
  const { t, tc } = useI18n()

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
      <p>{t('greeting', { name: 'World' })}</p>
      <p>{tc('apples', 5)}</p>
      <I18nT keypath="welcome" />
    </div>
  )
}

export default Home
