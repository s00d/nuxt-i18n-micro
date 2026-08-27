import { I18nT, useI18n } from '@i18n-micro/solid'
import type { Component } from 'solid-js'

const Home: Component = () => {
  const { t, tc } = useI18n()

  return (
    <div>
      <h1>{String(t('home.title'))}</h1>
      <p>{String(t('home.description'))}</p>
      <p>{String(t('greeting', { name: 'World' }))}</p>
      <p>{String(tc('apples', 5))}</p>
      <I18nT keypath="welcome" />
    </div>
  )
}

export default Home
