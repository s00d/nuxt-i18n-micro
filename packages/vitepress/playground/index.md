---
title: Home
---

# VitePress + `@i18n-micro/vitepress`

Runtime UI strings (not a replacement for duplicated markdown prose).

<p>{{ $t('demo.intro') }}</p>

<p>
  <I18nT keypath="greeting" :params="{ name: 'VitePress' }" />
</p>

<p>
  <I18nLink to="/guide/demo">{{ $t('cta.readMore') }}</I18nLink>
</p>

Use the **built-in** language menu (globe icon) to switch locale.
