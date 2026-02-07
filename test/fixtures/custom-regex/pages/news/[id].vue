<template>
  <div>
    <div class="news-id">
      id: {{ params.id }}
    </div>
    <div class="news-data">
      news: {{ news }}
    </div>

    <NuxtLink
      class="link-article-1"
      :to="$localeRoute({ name: 'articles-id', params: { id: '1' } })"
    >
      article-1
    </NuxtLink>
    <NuxtLink
      class="link-news-4"
      :to="$localeRoute({ name: 'news-id', params: { id: '4' } })"
    >
      news-4
    </NuxtLink>
    <NuxtLink
      class="link-news-1"
      :to="$localeRoute({ name: 'news-id', params: { id: '1' } })"
    >
      news-1
    </NuxtLink>
    <NuxtLink
      class="link-news-2"
      :to="
        $localeRoute({
          name: 'news-id',
          params: { id: '2' },
          query: { a: 'b' },
        })
      "
    >news-2</NuxtLink>

    <div class="news-link-path">
      <pre>{{ newsLink.fullPath }}</pre>
    </div>

    <client-only>
      <div class="resolved-route">
        {{ router.resolve("/news/2") }}
      </div>
    </client-only>

    <div class="locale-switcher">
      <NuxtLink
        class="locale-en"
        :to="$switchLocaleRoute('en-us')"
      >
        en
      </NuxtLink>
      <NuxtLink
        class="locale-ru"
        :to="$switchLocaleRoute('ru-ru')"
      >
        ru
      </NuxtLink>
      <NuxtLink
        class="locale-de"
        :to="$switchLocaleRoute('de-de')"
      >
        de
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAsyncData, useRoute, useRouter } from '#app'
import { useI18n } from '#imports'

const { params } = useRoute()
const router = useRouter()
const { $switchLocaleRoute, $setI18nRouteParams, $localeRoute } = useI18n()

const newsLink = computed(() =>
  $localeRoute({
    name: 'news-id',
    params: { id: '2' },
    hash: '#tada',
    query: { a: 'b' },
  }),
)

const { data: news } = await useAsyncData(`articles-${params.id}`, async () => {
  const response = (await $fetch('/api/getNews', {
    query: {
      id: params.id,
    },
  })) as { metadata: { [key: string]: { id: string } } }
  if (response?.metadata) {
    $setI18nRouteParams(response?.metadata)
  }
  return response
})
</script>
