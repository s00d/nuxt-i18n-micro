<template>
  <main>
    <h1 id="title">{{ $t('title') }}</h1>
    <p id="greeting">{{ $t('greeting', { name: 'World' }) }}</p>
    <p id="locale">{{ $getLocale() }}</p>
    <p id="count">{{ $tc('items', 2) }}</p>
  </main>
</template>
