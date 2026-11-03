<script setup lang="ts">
const fixed = new Date('2026-03-04T05:06:07Z')
const ago = Date.now() - 300_000
const rule = (_key: string, count: number) => `custom rule ${count}`
</script>

<template>
  <BenchPage name="comp-i18n-t">
    <R id="it-plain"><i18n-t keypath="title" /></R>
    <R id="it-tag"><i18n-t keypath="title" tag="h2" /></R>
    <R id="it-params"><i18n-t keypath="welcome" :params="{ name: 'Ada' }" /></R>
    <R id="it-html"><i18n-t keypath="html" :params="{ name: '<i>Ada</i>' }" html /></R>
    <R id="it-html-off"><i18n-t keypath="html" :params="{ name: 'Ada' }" /></R>
    <R id="it-slot-default"
      ><i18n-t v-slot="{ translation }" keypath="title"
        ><b data-testid="it-slot-b">{{ translation }}</b></i18n-t
      ></R
    >
    <R id="it-slot-named">
      <i18n-t keypath="slotted"
        ><template #link
          ><a href="#x">{{ $t('title') }}</a></template
        ></i18n-t
      >
    </R>
    <R id="it-plural-0"><i18n-t keypath="apples" :plural="0" /></R>
    <R id="it-plural-1"><i18n-t keypath="apples" :plural="1" /></R>
    <R id="it-plural-5"><i18n-t keypath="apples" :plural="5" /></R>
    <R id="it-plural-string"><i18n-t keypath="apples" plural="5" /></R>
    <R id="it-plural-marker"><i18n-t keypath="files" :plural="3" /></R>
    <R id="it-plural-rule"><i18n-t keypath="apples" :plural="5" :custom-plural-rule="rule" /></R>
    <R id="it-number"><i18n-t keypath="total" :number="1234.5" /></R>
    <R id="it-date"><i18n-t keypath="dated" :date="fixed" /></R>
    <R id="it-relative"><i18n-t keypath="updated" :relative-date="ago" /></R>
    <R id="it-default"><i18n-t keypath="missing.key" default-value="Default text" /></R>
    <R id="it-missing"><i18n-t keypath="missing.key" /></R>
    <R id="it-hide-empty"><i18n-t keypath="empty" hide-if-empty default-value="Was empty" /></R>
    <R id="it-show-empty"><i18n-t keypath="empty" /></R>
    <R id="it-attrs"><i18n-t keypath="title" class="bench-class" data-extra="1" /></R>
    <R id="it-first-wins"><i18n-t keypath="total" :number="1" :plural="2" :date="fixed" /></R>
  </BenchPage>
</template>
