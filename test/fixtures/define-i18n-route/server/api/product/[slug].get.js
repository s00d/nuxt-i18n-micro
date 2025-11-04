import { defineEventHandler, getRouterParam } from 'h3'

const products = {
  'coffee-filter-en': {
    title: 'Coffee Filter',
    price: '$18.00',
    urlEn: 'coffee-filter-en',
    urlEs: 'filtro-cafe-es',
  },
  'filtro-cafe-es': {
    title: 'Filtro de Café',
    price: '18,00 €',
    urlEn: 'coffee-filter-en',
    urlEs: 'filtro-cafe-es',
  },
  'solar-power-bank': {
    title: 'Solar Power Bank',
    price: '$119.95',
    urlEn: 'solar-power-bank',
    urlEs: 'banco-energia-solar',
  },
  'banco-energia-solar': {
    title: 'Banco de Energía Solar',
    price: '119,95 €',
    urlEn: 'solar-power-bank',
    urlEs: 'banco-energia-solar',
  },
}

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  return products[slug] || null
})
