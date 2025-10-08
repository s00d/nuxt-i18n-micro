<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
// Test with very long lines
$defineI18nRoute({locales:['en','de','fr','es','it','pt','ru','ja','ko','zh'],localeRoutes:{'en':'/welcome','de':'/willkommen','fr':'/bienvenue','es':'/bienvenido','it':'/benvenuto','pt':'/bem-vindo','ru':'/dobro-pozhalovat','ja':'/yokoso','ko':'/hwan-yeong','zh':'/huan-ying'}})
</script>
