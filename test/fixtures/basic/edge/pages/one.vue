<template>
  <main>
    <section id="before">before</section>
    <section id="case">
      <div v-if="m === 'text'" id="host">{{ $t(k) }}</div>
      <div v-else-if="m === 'params'" id="host">{{ $t(k, params) }}</div>
      <div v-else-if="m === 'vhtml'" id="host" v-html="$t(k)" />
      <p v-else-if="m === 'vhtml-p'" id="host" v-html="$t(k)" />
      <div v-else-if="m === 'vhtml-params'" id="host" v-html="$t(k, params)" />
      <div v-else-if="m === 'tc'" id="host">{{ $tc(k, 2) }}</div>
      <div v-else-if="m === 'tc-html'" id="host" v-html="$tc(k, 2)" />
      <i18n-t v-else-if="m === 'it'" id="host" :keypath="k" :params="params" />
      <i18n-t v-else-if="m === 'it-html'" id="host" :keypath="k" :params="params" html />
      <i18n-t v-else-if="m === 'it-p'" id="host" tag="p" :keypath="k" :params="params" html />
      <i18n-t v-else-if="m === 'it-slot'" id="host" :keypath="k">
        <template #x><b class="slot">slot</b></template>
      </i18n-t>
      <i18n-t v-else-if="m === 'it-default'" id="host" :keypath="k" :params="params">
        <template #default="{ translation }">
          <em>{{ translation }}</em>
        </template>
      </i18n-t>
      <i18n-t v-else-if="m === 'it-plural'" id="host" :keypath="k" :plural="2" />
      <i18n-t v-else-if="m === 'it-plural-html'" id="host" :keypath="k" :plural="2" html />
      <div v-else id="host">{{ m }}</div>
    </section>
    <section id="after">after <b>bold</b></section>
    <p id="after-p">para</p>
    <button id="btn" @click="clicks++">{{ clicks }}</button>
    <span id="locale">{{ $getLocale() }}</span>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead, useI18n, useRoute } from '#imports'

const route = useRoute()
const { $t } = useI18n()
const clicks = ref(0)
const params = { x: 'V', count: 2 }
const k = computed(() => String(route.query.k ?? 'home'))
const m = computed(() => String(route.query.m ?? 'text'))

useHead({ title: () => (m.value === 'title' ? String($t(k.value)) : 'edge') })
</script>
