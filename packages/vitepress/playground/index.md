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
  <a href="/guide/demo">{{ $t('cta.readMore') }}</a>
</p>

Use the **built-in** language menu (globe icon) to switch locale.
