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
  <I18nLink to="/guide/demo">{{ $t('cta.readMore') }}</I18nLink>
</p>

Utilisez le menu de langue **intégré** (icône globe) pour changer de locale.
