<template>
  <div>
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
import { useI18nHead } from '#imports'

useI18nHead({
  meta: [{ property: 'og:title', content: 'Index page' }],
})
</script>
