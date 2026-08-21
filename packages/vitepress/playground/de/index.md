---
title: Start
---

# VitePress + `@i18n-micro/vitepress`

Runtime-UI-Strings (kein Ersatz für dupliziertes Markdown).

<p>{{ $t('demo.intro') }}</p>

<p>
  <I18nT keypath="greeting" :params="{ name: 'VitePress' }" />
</p>

<p>
  <I18nLink to="/guide/demo">{{ $t('cta.readMore') }}</I18nLink>
</p>

Nutzen Sie das **eingebaute** Sprachmenü (Globus), um die Locale zu wechseln.
