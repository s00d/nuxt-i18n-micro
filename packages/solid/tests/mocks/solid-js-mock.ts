// Mock for solid-js: signals with dependency tracking, enough to catch effects that subscribe to
// what they write (Solid semantics: reading a signal inside an effect subscribes it; a setter
// accepts a value or an updater function).
type Effect = () => void

let running: Effect | null = null

export const createSignal = <T>(initial: T): [() => T, (value: T | ((prev: T) => T)) => void] => {
  let value = initial
  const subscribers = new Set<Effect>()
  return [
    () => {
      if (running) subscribers.add(running)
      return value
    },
    (next) => {
      value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next
      for (const effect of [...subscribers]) effect()
    },
  ]
}

export const createEffect = (fn: () => void): void => {
  const effect: Effect = () => {
    const previous = running
    running = effect
    try {
      fn()
    } finally {
      running = previous
    }
  }
  effect()
}

export const createRoot = <T>(fn: (dispose: () => void) => T): T => fn(() => {})
