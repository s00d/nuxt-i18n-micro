<template>
  <div id="content">useLocaleHead manual usage</div>
  <pre id="meta-object">{{ JSON.stringify(metaObject) }}</pre>
</template>

<script setup>
// meta: false app-wide, so this head comes only from the manual useLocaleHead + useHead (#233)
const { metaObject } = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

useHead(metaObject)
</script>
