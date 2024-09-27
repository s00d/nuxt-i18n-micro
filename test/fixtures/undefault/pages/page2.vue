<template>
  <div>
    <h1>Subpage with route param</h1>
    <p>{{ useRoute().params.id }}</p>
    <NuxtLink to="/">
      Home
    </NuxtLink>

    <hr>

    <NuxtLink
      id="unlocalized"
      :to="$localeRoute({ name: 'unlocalized' })"
    >
      unlocalized
    </NuxtLink>
  </div>
</template>
