<template>
  <i18n-t
    :keypath="keypath"
    :class="className"
  />
</template>

<script lang="ts" setup>
interface Props {
  keypath: string
  className: string
}

defineProps<Props>()
</script>
