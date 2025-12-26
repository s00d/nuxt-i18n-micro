import type React from 'react'
import { useI18n } from '@i18n-micro/preact'

// @ts-expect-error - Preact/React type incompatibility
export const About: React.FC = () => {
  const { t } = useI18n()

  return (
    <div>
      <h1>{t('about.title')}</h1>
      <p>{t('about.description')}</p>
    </div>
  )
}
