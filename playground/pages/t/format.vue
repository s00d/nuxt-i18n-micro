<script setup lang="ts">
const { $tn, $td, $tdr } = useNuxtApp()
const fixed = new Date('2026-03-04T05:06:07Z')
const soon = Date.now() + 86_400_000 + 60_000
const ago = Date.now() - 300_000
const rows: Record<string, () => unknown> = {
  'tn-plain': () => $tn(1234.5),
  'tn-options': () => $tn(1234.5, { style: 'currency', currency: 'EUR' }),
  'tn-named': () => $tn(1000, 'currency'),
  'tn-named-locale': () => $tn(1000, 'currency', 'de'),
  'tn-named-overrides': () => $tn(1000.55, 'currency', { maximumFractionDigits: 0 }),
  'tn-named-unknown': () => $tn(1000, 'nope'),
  'tn-nan': () => $tn(Number.NaN),
  'td-plain': () => $td(fixed),
  'td-options': () => $td(fixed, { dateStyle: 'long' }),
  'td-named': () => $td(fixed, 'short'),
  'td-named-locale': () => $td(fixed, 'short', 'de'),
  'td-named-zone': () => $td(fixed, 'tokyo'),
  'td-number': () => $td(fixed.getTime()),
  'td-string': () => $td('2026-03-04T05:06:07Z'),
  'td-invalid': () => $td('not a date'),
  'tdr-past': () => $tdr(ago),
  'tdr-future': () => $tdr(soon),
  'tdr-options': () => $tdr(ago, { style: 'short' }),
  'tdr-invalid': () => $tdr('not a date'),
}
</script>

<template>
  <BenchPage name="t-format">
    <R v-for="(read, id) in rows" :id="id" :key="id" :v="safe(read)" />
  </BenchPage>
</template>
