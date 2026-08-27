import { useI18n } from '@i18n-micro/solid'
import type { Component } from 'solid-js'

const About: Component = () => {
  const { t } = useI18n()

  return (
    <div>
      <h1>{String(t('about.title'))}</h1>
      <p>{String(t('about.description'))}</p>
      <p>{String(t('welcome'))}</p>
    </div>
  )
}

export default About
