// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState } from 'react'
import { I18nProvider, useAstroI18n } from '@i18n-micro/astro/client/react'
import type { I18nClientProps } from '@i18n-micro/astro'
import './ReactCard.css'

interface ReactCardProps {
  i18n: I18nClientProps
}

function CardContent() {
  const { t, locale, tn, tc } = useAstroI18n()
  const [count, setCount] = useState(0)

  return (
    <div className="island-card react-card">
      <h3>{t('islands.react.title')}</h3>
      <p>{t('islands.react.description')}</p>
      <div className="counter">
        <button type="button" onClick={() => setCount(count + 1)}>+</button>
        <span>{count}</span>
        <p>{tc('islands.apples', count)}</p>
        <p>{t('islands.number', { number: tn(count) })}</p>
      </div>
      <p className="locale-info">
        Locale:
        {locale}
      </p>
    </div>
  )
}

export default function ReactCard({ i18n }: ReactCardProps) {
  return (
    <I18nProvider value={i18n}>
      <CardContent />
    </I18nProvider>
  )
}
