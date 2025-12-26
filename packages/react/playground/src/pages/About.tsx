/* eslint-disable @typescript-eslint/no-empty-object-type */
import type React from 'react'
import { useI18n } from '@i18n-micro/react'

// @ts-expect-error - React.FC type compatibility
export const About: React.FC<{}> = () => {
  const { t } = useI18n()

  return (
    <div>
      <h1>{t('about.title')}</h1>
      <p>{t('about.description')}</p>
    </div>
  )
}
