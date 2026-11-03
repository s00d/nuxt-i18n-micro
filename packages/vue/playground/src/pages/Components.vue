<template>
  <ul data-testid="page-components">
    <li data-testid="it-basic"><I18nT keypath="welcome" /></li>
    <li data-testid="it-params"><I18nT keypath="greeting" :params="{ name: 'Ada' }" /></li>
    <li data-testid="it-tag"><I18nT keypath="welcome" tag="h3" /></li>
    <li data-testid="it-plural-0"><I18nT keypath="apples" :plural="0" /></li>
    <li data-testid="it-plural-2"><I18nT keypath="apples" :plural="2" /></li>
    <li data-testid="it-plural-string"><I18nT keypath="apples" plural="3" /></li>
    <li data-testid="it-plural-null"><I18nT keypath="welcome" :plural="null" /></li>
    <li data-testid="it-plural-fraction"><I18nT keypath="apples" :plural="1.5" /></li>
    <li data-testid="it-plural-custom"><I18nT keypath="apples" :plural="2" :custom-plural-rule="customRule" /></li>
    <li data-testid="it-number"><I18nT keypath="stats" :number="1234.5" :params="{ date: 'd', relativeDate: 'r' }" /></li>
    <li data-testid="it-date"><I18nT keypath="stats" :date="0" :params="{ number: 'n', relativeDate: 'r' }" /></li>
    <li data-testid="it-relative"><I18nT keypath="stats" :relative-date="hourAgo" :params="{ number: 'n', date: 'd' }" /></li>
    <li data-testid="it-html"><I18nT keypath="html" :params="{ name: '<i>x</i>' }" html /></li>
    <li data-testid="it-no-html"><I18nT keypath="html" :params="{ name: '<i>x</i>' }" /></li>
    <li data-testid="it-missing"><I18nT keypath="no.such.key" /></li>
    <li data-testid="it-missing-html"><I18nT keypath="no.<b>key" html /></li>
    <li data-testid="it-default"><I18nT keypath="no.such.key" default-value="Default" /></li>
    <li data-testid="it-hide-empty"><I18nT keypath="empty" hide-if-empty /></li>
    <li data-testid="it-hide-missing"><I18nT keypath="no.such.key" hide-if-empty /></li>
    <li data-testid="it-show-empty"><I18nT keypath="empty" /></li>
    <li data-testid="it-slot-name">
      <I18nT keypath="greeting"
        ><template #name><b>Slot</b></template></I18nT
      >
    </li>
    <li data-testid="it-slot-default">
      <I18nT keypath="welcome"
        ><template #default="{ translation }">[{{ translation }}]</template></I18nT
      >
    </li>
    <li data-testid="it-slot-two">
      <I18nT keypath="two">
        <template #a><i>A</i></template>
        <template #b><u>B</u></template>
      </I18nT>
    </li>
    <li data-testid="it-slot-plural">
      <I18nT keypath="apples" :plural="5"
        ><template #count><b>five</b></template></I18nT
      >
    </li>
    <li data-testid="group-basic">
      <I18nGroup prefix="section" group-class="g"
        ><template #default="{ t, prefix }">{{ prefix }}: {{ t('title') }}</template></I18nGroup
      >
    </li>
    <li data-testid="group-deep">
      <I18nGroup prefix="section.deep.er"
        ><template #default="{ t }">{{ t('value') }}</template></I18nGroup
      >
    </li>
    <li data-testid="group-missing">
      <I18nGroup prefix="section"
        ><template #default="{ t }">{{ t('nope') }}</template></I18nGroup
      >
    </li>
    <li data-testid="link-string"><I18nLink to="/routing">string</I18nLink></li>
    <li data-testid="link-object"><I18nLink :to="{ path: '/routing' }">object</I18nLink></li>
    <li data-testid="link-query"><I18nLink to="/routing?a=1#b">query</I18nLink></li>
    <li data-testid="link-hash-only"><I18nLink to="#top">hash</I18nLink></li>
    <li data-testid="link-external"><I18nLink to="https://example.test/x">external</I18nLink></li>
    <li data-testid="link-active"><I18nLink to="/components" :active-style="{ fontWeight: 'bold' }">active</I18nLink></li>
    <li data-testid="link-custom"><I18nLink to="/x" :locale-route="(to) => `/custom${to}`">custom</I18nLink></li>
    <li data-testid="switcher-labels"><I18nSwitcher :custom-labels="{ de: 'DE!' }" /></li>
    <li data-testid="switcher-slot">
      <I18nSwitcher><template #before-button>before</template></I18nSwitcher>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { I18nGroup, I18nLink, I18nSwitcher, I18nT } from '@i18n-micro/vue'

const hourAgo = Date.now() - 3_600_000
const customRule = (_key: string, count: number) => `rule ${count}`
</script>
