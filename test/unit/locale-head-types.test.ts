import type { LocaleHead } from '@i18n-micro/utils/locale-head'
import type { UseHeadInput } from '@unhead/vue'
import { expect, test } from 'vitest'
import { ref } from 'vue'

// the documented `useHead(metaObject)`: this file compiles only while the head object is what useHead takes
test('metaObject is a valid useHead argument', () => {
  const metaObject = ref<LocaleHead>({ htmlAttrs: { lang: 'en' }, link: [{ rel: 'canonical', href: '/' }], meta: [] })
  const input: UseHeadInput = metaObject
  expect(input).toBe(metaObject)
})
