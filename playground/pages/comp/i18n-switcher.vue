<template>
  <BenchPage name="comp-i18n-switcher">
    <div data-testid="switcher-plain"><i18n-switcher /></div>
    <div data-testid="switcher-styled">
      <i18n-switcher
        :custom-labels="{ en: 'EN!', de: 'DE!' }"
        :custom-wrapper-style="{ outline: '1px solid red' }"
        :custom-button-style="{ color: 'red' }"
        :custom-dropdown-style="{ color: 'green' }"
        :custom-item-style="{ color: 'blue' }"
        :custom-link-style="{ color: 'purple' }"
        :custom-active-link-style="{ color: 'orange' }"
        :custom-disabled-link-style="{ color: 'gray' }"
        :custom-icon-style="{ color: 'pink' }"
      />
    </div>
    <div data-testid="switcher-slots">
      <i18n-switcher>
        <template #before-button><i data-testid="s-before-button">x</i></template>
        <template #before-selected-locale><i data-testid="s-before-selected">x</i></template>
        <template #after-selected-locale><i data-testid="s-after-selected">x</i></template>
        <template #before-dropdown><i data-testid="s-before-dropdown">x</i></template>
        <template #before-dropdown-items><li data-testid="s-before-items">x</li></template>
        <template #before-item="{ locale }"><i :data-testid="`s-before-item-${locale.code}`">x</i></template>
        <template #before-link-content="{ locale }"><i :data-testid="`s-before-link-${locale.code}`">x</i></template>
        <template #after-link-content="{ locale }"><i :data-testid="`s-after-link-${locale.code}`">x</i></template>
        <template #after-item="{ locale }"><i :data-testid="`s-after-item-${locale.code}`">x</i></template>
        <template #after-dropdown-items><li data-testid="s-after-items">x</li></template>
        <template #after-dropdown><i data-testid="s-after-dropdown">x</i></template>
      </i18n-switcher>
    </div>
  </BenchPage>
</template>
