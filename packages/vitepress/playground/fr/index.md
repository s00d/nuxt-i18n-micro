---
title: Accueil
---

# VitePress + `@i18n-micro/vitepress`

Chaînes UI runtime (pas un remplacement du markdown dupliqué).

<p>{{ $t('demo.intro') }}</p>

<p>
  <I18nT keypath="greeting" :params="{ name: 'VitePress' }" />
</p>

<p>
  <a href="/fr/guide/demo">{{ $t('cta.readMore') }}</a>
</p>

Utilisez le menu de langue **intégré** (icône globe) pour changer de locale.
