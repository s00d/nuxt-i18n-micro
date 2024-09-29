<template>
  <div>
    <div>id: {{ params.id }}</div>
    <div>articles: {{ articles }}</div>

    <NuxtLink :to="$localeRoute({ name: 'news-id', params: { id: '1' } })">
      news-1
    </NuxtLink>

    <div>
      <NuxtLink :to="$switchLocaleRoute('en')">
        en
      </NuxtLink>
    </div>
    <div>
      <NuxtLink :to="$switchLocaleRoute('ru')">
        ru
      </NuxtLink>
    </div>
    <div>
      <NuxtLink :to="$switchLocaleRoute('de')">
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
    const response = await $fetch('/api/getArticles', {
      query: {
        id: params.id,
      },
    })
    return response
  },
)
</script>

<style></style>
