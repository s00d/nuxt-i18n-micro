<template>
  <main>
    <h1 id="title">{{ $t('home') }}</h1>
    <span id="locale">{{ $getLocale() }}</span>
    <NuxtLink id="to-one" :to="$localePath('/one')">one</NuxtLink>
  </main>
</template>
