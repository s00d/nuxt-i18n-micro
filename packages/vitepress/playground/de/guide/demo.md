---
title: In-page Demo
---

<script setup>
import { ref } from 'vue'
import { useI18n } from '@i18n-micro/vitepress'

const { t, tc, locale } = useI18n()
const count = ref(3)
</script>

# {{ t('section.title') }}

Aktuelle Locale: **{{ locale }}**

## Globales `$t`

{{ $t('demo.intro') }}

## Komponente

<I18nT keypath="greeting" :params="{ name: 'Docs' }" />

## Plural (`useI18n`)

<button @click="count++">+1</button>
<span> {{ tc('apples', count) }}</span>

## Gruppe

<I18nGroup prefix="cta" v-slot="{ t: tg }">
  {{ tg('readMore') }}
</I18nGroup>

## Routing (`localePath` / `switchLocale`)

<PathHelpersDemo />

## Page-scoped Schlüssel

{{ $t('pageNote') }}

## `<I18nLink>`

<I18nLink to="/">{{ $t('cta.readMore') }}</I18nLink>
<I18nLink to="/guide/no-seo">{{ $t('nav.noSeo') }}</I18nLink>

## SEO

Mit `metaBaseUrl` auf `withI18n` injiziert der Build canonical / hreflang / `og:locale`.
Siehe [/de/guide/no-seo](/de/guide/no-seo) für `i18n.disableMeta: true`.
