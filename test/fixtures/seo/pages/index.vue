<template>
  <div>
    <p id="content">
      {{ $t('key0') }}
    </p>

    <i18n-link id="contact" :to="{ name: 'contact' }"> Contact </i18n-link>

    <i18n-link id="about" :to="{ name: 'about' }"> About </i18n-link>

    <div id="locale-switcher">
      <i18n-switcher />
    </div>

    <!-- useI18nHead scenarios (SEO_VARIANT=use-i18n-head): test/helpers/i18n-head-seo.ts -->
    <h1>{{ $t('title') }}</h1>
    <nav data-testid="nav">
      <NuxtLink to="/post/hello-en">Post (slugs)</NuxtLink>
      <NuxtLink to="/canonical/cms-canonical">Canonical override</NuxtLink>
      <NuxtLink to="/partial/partial-only">Partial alternates</NuxtLink>
      <NuxtLink to="/x-default/with-xdefault">Custom x-default</NuxtLink>
      <NuxtLink to="/full/full-meta">Full meta</NuxtLink>
      <NuxtLink to="/blog/shared-blog">Blog (shared helper)</NuxtLink>
      <NuxtLink to="/guides/shared-guide">Guide (shared helper)</NuxtLink>
      <NuxtLink to="/custom-alternates">Custom alternates (disable)</NuxtLink>
      <NuxtLink to="/landing">Landing OG only</NuxtLink>
      <NuxtLink to="/no-hreflang">No hreflang</NuxtLink>
      <NuxtLink to="/reactive">Reactive client load</NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useI18nHead, useNuxtApp } from '#imports'

const { $t } = useNuxtApp()

useI18nHead({
  meta: [{ property: 'og:title', content: 'Index page' }],
})
</script>
