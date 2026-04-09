<template>
  <div id="content">useLocaleHead manual usage</div>
  <pre id="meta-object">{{ JSON.stringify(metaObject) }}</pre>
</template>

<script setup>
const { metaObject } = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: "id",
  addSeoAttributes: true,
});

useHead(metaObject);
</script>
