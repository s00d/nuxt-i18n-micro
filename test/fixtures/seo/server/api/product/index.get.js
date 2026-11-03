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
    fr: [
      {
        id: 'prod001',
        title: 'Filtre à café',
        price: '18,00 €',
        url: 'filtre-cafe-fr',
      },
      {
        id: 'prod002',
        title: 'Batterie solaire',
        price: '119,95 €',
        url: 'batterie-solaire',
      },
    ],
  }
})
