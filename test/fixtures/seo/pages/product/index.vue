<script setup lang="ts">
import { createError, useFetch, useNuxtApp } from '#imports'

interface Product {
  id: string
  title: string
  price: string
  url: string
}

type ProductsByLocale = Record<string, Product[]>

const { $t, $defineI18nRoute, $getLocale, $switchLocalePath } = useNuxtApp()

const { data: products, error } = await useFetch<ProductsByLocale>('/api/product')
if (error.value)
  throw createError({
    statusCode: error.value?.statusCode,
    statusMessage: error.value?.statusMessage,
    fatal: true,
  })

$defineI18nRoute({
  locales: {
    en: {
      title: 'Our Product Range',
      description: 'Discover our collection of high-quality products designed to meet your needs and exceed your expectations.',
    },
    fr: {
      title: 'Notre gamme de produits',
      description: 'Découvrez notre collection de produits de haute qualité conçus pour répondre à vos besoins et dépasser vos attentes.',
    },
  },
  localeRoutes: {
    en: '/our-products',
    fr: '/nos-produits',
  },
})
</script>

<template>
  <div>
    <h1>{{ $t('title') }}</h1>
    <p>{{ $t('description') }}</p>
    <ul>
      <li v-for="product in products?.[$getLocale()] || []" :key="product.id">
        <I18nLink :to="{ name: 'product-slug', params: { slug: product.url } }"> {{ product.title }} – {{ product.price }} </I18nLink>
      </li>
    </ul>
    <I18nLink to="/"> Home </I18nLink>
    <div class="locale-switcher">
      <a :href="$switchLocalePath('en')" class="en">English</a>
      <a :href="$switchLocalePath('fr')" class="fr">Français</a>
    </div>
  </div>
</template>
