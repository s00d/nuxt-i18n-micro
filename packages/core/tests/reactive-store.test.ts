import { describe, expect, test } from 'vitest'
import { createReactiveI18nStore } from '../src'

describe('createReactiveI18nStore', () => {
  test('a throwing listener does not stop the others; the error surfaces after all ran', () => {
    const store = createReactiveI18nStore({ locale: 'en' })
    const calls: string[] = []
    store.subscribe(() => {
      throw new Error('boom')
    })
    store.subscribe(() => calls.push('second'))
    expect(() => store.setLocale('de')).toThrow('boom')
    expect(calls).toEqual(['second'])
    expect(store.getLocale()).toBe('de')
  })

  test('a listener that resubscribes during notify runs once per notify', () => {
    const store = createReactiveI18nStore({ locale: 'en' })
    let calls = 0
    const listener = () => {
      calls++
      off()
      off = store.subscribe(listener)
    }
    let off = store.subscribe(listener)
    store.notify()
    expect(calls).toBe(1)
  })
})
