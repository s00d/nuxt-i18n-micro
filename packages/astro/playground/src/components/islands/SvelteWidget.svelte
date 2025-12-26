<script lang="ts">
  import { createI18nStore, useAstroI18n } from '@i18n-micro/astro/client/svelte'
  import type { I18nClientProps } from '@i18n-micro/astro'

  export let i18n: I18nClientProps

  // Создаем store и инициализируем хук
  const i18nStore = createI18nStore(i18n)
  const { t, locale, tn, tc } = useAstroI18n(i18nStore)

  let count = 0
  const increment = () => count++
</script>

<div class="island-card svelte-card">
  <h3>{t('islands.svelte.title')}</h3>
  <p>{t('islands.svelte.description')}</p>
  <div class="counter">
    <button on:click={increment}>+</button>
    <span>{count}</span>
    <p>{tc('islands.apples', count)}</p>
    <p>{t('islands.number', { number: tn(count) })}</p>
  </div>
  <p class="locale-info">Locale: {locale}</p>
</div>

<style>
  .island-card {
    padding: 1.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    margin: 1rem 0;
  }

  .svelte-card {
    border-color: #ff3e00;
    background: #fff5f2;
  }

  .counter {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;
  }

  button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background: #cc3100;
  }

  .locale-info {
    font-size: 0.875rem;
    color: #666;
    margin-top: 1rem;
  }
</style>

