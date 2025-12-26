// Mock for solid-js
export const createSignal = <T>(initial: T): [() => T, (value: T) => void] => {
  let value = initial
  return [
    () => value,
    (newValue: T) => {
      value = newValue
    },
  ]
}
