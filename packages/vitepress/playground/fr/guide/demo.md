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

<I18nGroup prefix="cta">
  <I18nT keypath="readMore" />
</I18nGroup>

## `<I18nSwitcher>` optionnel (thèmes custom)

Avec le thème par défaut, utilisez le menu globe dans la barre de navigation.
Montez `<I18nSwitcher>` seulement hors de ce chrome (hero, layout custom) — pas à côté du globe.

<div style="max-width: 12rem; margin-top: 0.5rem">
  <I18nSwitcher />
</div>

## Clé page-scoped

{{ $t('pageNote') }}

## `<I18nLink>`

<I18nLink to="/">{{ $t('cta.readMore') }}</I18nLink>
