// @ts-nocheck

import { useI18n } from '@i18n-micro/solid'
import type { Component } from 'solid-js'

const About: Component = () => {
  const { t } = useI18n()

  return (
    <div>
      <h1>{t('about.title')}</h1>
      <p>{t('about.description')}</p>
      <p>{t('welcome')}</p>
    </div>
  )
}

export default About
