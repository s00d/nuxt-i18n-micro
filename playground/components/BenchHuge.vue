<script setup lang="ts">
const props = defineProps<{ name: string; size: number }>()
const { $t, $resolveTranslations } = useNuxtApp()
// the last index that is a flat key, and one nested key
const lastFlat = props.size % 3 === 1 ? props.size - 2 : props.size - 1
const nested = `sec_${(props.size - (props.size % 3 || 3)) % 100}.key_${props.size - (props.size % 3 || 3)}`
const counted = ref(0)
const walk = (tree: object): number =>
  Object.values(tree).reduce((total: number, value) => total + (typeof value === 'object' && value ? walk(value) : 1), 0)
const count = () => (counted.value = walk($resolveTranslations()))
</script>

<template>
  <BenchPage :name="name">
    <R id="huge-size" :v="size" />
    <R id="huge-first" :v="$t('key_1', { name: 'Ada' })" />
    <R id="huge-last" :v="$t(`key_${lastFlat}`, { name: 'Ada' })" />
    <R id="huge-nested" :v="$t(nested)" />
    <R id="huge-counted" :v="counted" />
    <button data-testid="huge-count" @click="count">count keys</button>
  </BenchPage>
</template>
