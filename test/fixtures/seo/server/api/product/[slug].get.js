import { defineEventHandler, getRouterParam } from 'h3'

const products = {
  'coffee-filter-en': {
    title: 'Coffee Filter',
    price: '$18.00',
    urlEn: 'coffee-filter-en',
    urlFr: 'filtre-cafe-fr',
  },
  'filtre-cafe-fr': {
    title: 'Filtre à café',
    price: '18,00 €',
    urlEn: 'coffee-filter-en',
    urlFr: 'filtre-cafe-fr',
  },
  'solar-power-bank': {
    title: 'Solar Power Bank',
    price: '$119.95',
    urlEn: 'solar-power-bank',
    urlFr: 'batterie-solaire',
  },
  'batterie-solaire': {
    title: 'Batterie solaire',
    price: '119,95 €',
    urlEn: 'solar-power-bank',
    urlFr: 'batterie-solaire',
  },
}

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  return products[slug] || null
})
