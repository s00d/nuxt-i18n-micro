<template>
  <div>
    <div class="article-id">
      id: {{ params.id }}
    </div>
    <div class="article-data">
      articles: {{ articles }}
    </div>

    <NuxtLink
      class="link-news-1"
      :to="$localeRoute({ name: 'articles-id', params: { id: '1' } })"
    >
      news-1
    </NuxtLink>

    <div class="locale-switcher">
      <NuxtLink
        class="locale-en"
        :to="$switchLocaleRoute('en')"
      >
        en
      </NuxtLink>
      <NuxtLink
        class="locale-ru"
        :to="$switchLocaleRoute('ru')"
      >
        ru
      </NuxtLink>
      <NuxtLink
        class="locale-de"
        :to="$switchLocaleRoute('de')"
      >
        de
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { params } = useRoute()
const { $switchLocaleRoute } = useI18n()

const { data: articles } = await useAsyncData(
  `articles-${params.id}`,
  async () => {
    return await $fetch('/api/getArticles', {
      query: {
        id: params.id,
      },
    })
  },
)
</script>

<style></style>
