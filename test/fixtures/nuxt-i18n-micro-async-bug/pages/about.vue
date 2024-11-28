<script setup>
const { data } = await useFetch('/api/hello')
</script>

<template>
  <div>
    This is the about page
    <h1>Title : {{ $t('title') }}</h1>
    <I18nLink to="/">
      Index
    </I18nLink>

    {{ data }}
  </div>
</template>
