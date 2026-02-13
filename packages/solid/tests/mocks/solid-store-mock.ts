type SetStoreFunction<T> = {
  <K extends keyof T>(key: K, value: T[K] | ((prev: T[K]) => T[K])): void
  <K extends keyof T, SK extends keyof T[K]>(key: K, subKey: SK, value: T[K][SK] | ((prev: T[K][SK]) => T[K][SK])): void
}

export const createStore = <T extends Record<string, unknown>>(initial: T): [T, SetStoreFunction<T>] => {
  const store: Record<string, unknown> = { ...initial }
  const setStore: SetStoreFunction<T> = (key: keyof T, subKeyOrValue?: unknown, value?: unknown) => {
    if (value !== undefined) {
      // Handle nested updates like setStore('index', 'en', translations)
      const keyStr = String(key)
      if (!store[keyStr]) {
        store[keyStr] = {}
      }
      const nestedStore = store[keyStr] as Record<string, unknown>
      const subKeyStr = String(subKeyOrValue)
      if (typeof value === 'function') {
        const currentValue = nestedStore[subKeyStr]
        nestedStore[subKeyStr] = (value as (prev: unknown) => unknown)(currentValue)
      } else {
        nestedStore[subKeyStr] = value
      }
    } else if (typeof subKeyOrValue === 'function') {
      // Handle function updates like setStore('index', (prev) => ({ ...prev, ...new }))
      const keyStr = String(key)
      store[keyStr] = (subKeyOrValue as (prev: unknown) => unknown)(store[keyStr])
    } else if (subKeyOrValue !== undefined) {
      // Handle direct value updates
      store[String(key)] = subKeyOrValue
    }
  }
  return [store as T, setStore]
}
