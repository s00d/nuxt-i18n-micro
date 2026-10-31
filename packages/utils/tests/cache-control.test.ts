import { afterEach, describe, expect, it, vi } from 'vitest'
import { CacheControl } from '../src/cache-control'

afterEach(() => {
  vi.useRealTimers()
})

const filled = (options: ConstructorParameters<typeof CacheControl<number>>[0], count = 5) => {
  const cache = new CacheControl<number>(options)
  for (let i = 0; i < count; i++) cache.set(`k${i}`, i)
  return cache
}

describe('CacheControl.configure on a filled cache', () => {
  it('a smaller size drops the oldest entries at once', () => {
    const cache = filled({ maxSize: 5 })
    cache.get('k0')
    cache.configure({ maxSize: 2 })
    expect(cache.size).toBe(2)
    expect([...cache.keys()]).toEqual(['k4', 'k0'])
  })

  it('no limit keeps everything', () => {
    const cache = filled({ maxSize: 5 })
    cache.configure({})
    expect(cache.size).toBe(5)
  })

  it('a TTL turned on later covers what is stored, counted from then', () => {
    vi.useFakeTimers()
    const cache = filled({})
    cache.configure({ ttl: 10 })
    vi.advanceTimersByTime(9000)
    expect(cache.get('k0')).toBe(0)
    vi.advanceTimersByTime(2000)
    expect(cache.get('k0')).toBeUndefined()
    expect(cache.has('k1')).toBe(false)
  })

  it('an entry that already expires keeps its time', () => {
    vi.useFakeTimers()
    const cache = filled({ ttl: 10 })
    vi.advanceTimersByTime(9000)
    cache.configure({ ttl: 10 })
    vi.advanceTimersByTime(2000)
    expect(cache.get('k0')).toBeUndefined()
  })
})
