<template>
  <div>
    <i18n-switcher />

    <div class="welcome" v-text="$t('generic.welcome')" />
    <div class="title" v-text="$t('generic.title')" />
    <div class="global" v-text="$t('global')" />
    <div class="page" v-text="$t('page')" />
    <p class="arr">
      {{ $t('arr') }}
    </p>
    <p class="arr_obj">
      {{ $t('arr_obj') }}
    </p>
  </div>
</template>
