---
title: In-page demo
---

<script setup>
import { ref } from 'vue'
import { useI18n } from '@i18n-micro/vitepress'

const { t, tc, locale } = useI18n()
const count = ref(3)
</script>

# {{ t('section.title') }}

Current locale: **{{ locale }}**

## Global `$t`

{{ $t('demo.intro') }}

## Component

<I18nT keypath="greeting" :params="{ name: 'Docs' }" />

## Plural (`useI18n`)

<button @click="count++">+1</button>
<span> {{ tc('apples', count) }}</span>

## Group

<I18nGroup prefix="cta">
  <I18nT keypath="readMore" />
</I18nGroup>

## Optional `<I18nSwitcher>` (custom themes)

For the default theme, use the built-in globe menu in the navbar.
Mount `<I18nSwitcher>` only when you need a switcher outside that chrome (hero, custom layout) — not next to the globe.

<div style="max-width: 12rem; margin-top: 0.5rem">
  <I18nSwitcher />
</div>

## Page-scoped key

{{ $t('pageNote') }}

## `<I18nLink>`

<I18nLink to="/">{{ $t('cta.readMore') }}</I18nLink>
