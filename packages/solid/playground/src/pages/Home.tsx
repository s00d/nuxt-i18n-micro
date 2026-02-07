// @ts-nocheck

import { I18nT, useI18n } from '@i18n-micro/solid'
import type { Component } from 'solid-js'

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
