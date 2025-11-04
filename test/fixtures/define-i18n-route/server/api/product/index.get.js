import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  return {
    en: [
      {
        id: 'prod001',
        title: 'Coffee Filter',
        price: '$18.00',
        url: 'coffee-filter-en',
      },
      {
        id: 'prod002',
        title: 'Solar Power Bank',
        price: '$119.95',
        url: 'solar-power-bank',
      },
    ],
    es: [
      {
        id: 'prod001',
        title: 'Filtro de Café',
        price: '18,00 €',
        url: 'filtro-cafe-es',
      },
      {
        id: 'prod002',
        title: 'Banco de Energía Solar',
        price: '119,95 €',
        url: 'banco-energia-solar',
      },
    ],
  }
})
