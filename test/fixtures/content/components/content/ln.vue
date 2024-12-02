<template>
  <div>
    <i18n-link
      class="page-link"
      :to="`/${name}`"
    >
      {{ title }}
    </i18n-link>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  name: string
  title: string
}

defineProps<Props>()
</script>
