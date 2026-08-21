---
title: Démo in-page
---

<script setup>
import { ref } from 'vue'
import { useI18n } from '@i18n-micro/vitepress'

const { t, tc, locale } = useI18n()
const count = ref(3)
</script>

# {{ t('section.title') }}

Locale actuelle : **{{ locale }}**

## `$t` global

{{ $t('demo.intro') }}

## Composant

<I18nT keypath="greeting" :params="{ name: 'Docs' }" />

## Pluriel (`useI18n`)

<button @click="count++">+1</button>
<span> {{ tc('apples', count) }}</span>

## Groupe

<I18nGroup prefix="cta" v-slot="{ t: tg }">
  {{ tg('readMore') }}
</I18nGroup>

## Routing (`localePath` / `switchLocale`)

<PathHelpersDemo />

## Clé page-scoped

{{ $t('pageNote') }}

## `<I18nLink>`

<I18nLink to="/">{{ $t('cta.readMore') }}</I18nLink>
<I18nLink to="/guide/no-seo">{{ $t('nav.noSeo') }}</I18nLink>

## SEO

Avec `metaBaseUrl` sur `withI18n`, le build injecte canonical / hreflang / `og:locale`.
Voir [/fr/guide/no-seo](/fr/guide/no-seo) pour `i18n.disableMeta: true`.
