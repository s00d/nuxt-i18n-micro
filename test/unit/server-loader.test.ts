import { expect, test, vi } from 'vitest'
import { toEntry } from '../../src/runtime/utils/translation-entry'

test('a chunk is serialized only when the /_locales route asks, once, safe to inline', () => {
  const stringify = vi.spyOn(JSON, 'stringify')
  const entry = toEntry({ html: '</script>' })
  expect(stringify).not.toHaveBeenCalled()

  expect(entry.data).toEqual({ html: '</script>' })
  expect(stringify).not.toHaveBeenCalled()

  expect(entry.json).toBe('{"html":"\\u003c/script>"}')
  expect(entry.json).toBe('{"html":"\\u003c/script>"}')
  expect(stringify).toHaveBeenCalledTimes(1)
  stringify.mockRestore()
})
