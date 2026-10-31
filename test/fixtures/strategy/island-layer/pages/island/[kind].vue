<template>
  <div id="island-page">
    <LocaleIsland v-if="$route.params.kind === 'server'" :locale="$getLocale()" />
    <NuxtIsland v-else name="LocaleIsland" :props="{ locale: $getLocale() }" />
  </div>
</template>
