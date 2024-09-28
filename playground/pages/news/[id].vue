<template>
  <div>
    <div>id: {{ params.id }}</div>
    <div>news: {{ news }}</div>
    <NuxtLink :to="$localeRoute({ name: 'articles-id', params: { id: '1' } })"
      >article-1</NuxtLink
    >
    <NuxtLink :to="$localeRoute({ name: 'news-id', params: { id: '4' } })"
      >news-4</NuxtLink
    >
    <NuxtLink :to="$localeRoute({ name: 'news-id', params: { id: '1' } })"
      >news-1</NuxtLink
    >
    <NuxtLink
      :to="
        $localeRoute({
          name: 'news-id',
          params: { id: '2' },
          query: { a: 'b' },
        })
      "
      >news-2</NuxtLink
    >
    <div>
      <pre>
        {{
          $localeRoute({
            name: "news-id",
            params: { id: "2" },
            hash: "#tada",
            query: { a: "b" },
          }).fullPath
        }}
      </pre>
    </div>
    {{ router.resolve("/en/news/2") }}

    <div>
      <NuxtLink :to="$switchLocaleRoute('en')">en</NuxtLink>
    </div>
    <div>
      <NuxtLink :to="$switchLocaleRoute('ru')">ru</NuxtLink>
    </div>
    <div>
      <NuxtLink :to="$switchLocaleRoute('de')">de</NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { params } = useRoute();
const router = useRouter();
const { $switchLocaleRoute, $setI18nRouteParams } = useI18n();

let route = router.resolve("/en/page");

definePageMeta({
  middleware: ["my-middleware"],
});

const { data: news } = await useAsyncData(`articles-${params.id}`, async () => {
  let response = await $fetch("/api/getNews", {
    query: {
      id: params.id,
    },
  });
  if (response?.metadata) {
    $setI18nRouteParams(response?.metadata);
  }
  return response;
});

// if (news?.metadata) {
//   $setI18nRouteParams(news?.metadata);
// }

function fire() {
  console.log(
    "file: [id].vue:49 ~ $switchLocaleRoute(en):",
    $switchLocaleRoute("en")
  );

  console.log(
    "file: [id].vue:49 ~ $switchLocaleRoute(ru):",
    $switchLocaleRoute("ru")
  );

  console.log(
    "file: [id].vue:49 ~ $switchLocaleRoute(de):",
    $switchLocaleRoute("de")
  );
}
</script>

<style></style>
