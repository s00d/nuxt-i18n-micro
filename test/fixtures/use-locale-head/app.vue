<template>
  <div id="content">useLocaleHead manual usage</div>
</template>

<script setup lang="ts">
const { metaObject } = useLocaleHead()
useHead(metaObject)
</script>
