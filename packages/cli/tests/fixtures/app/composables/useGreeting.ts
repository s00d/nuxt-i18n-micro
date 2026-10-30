export function useGreeting(i18n: { $t: (key: string) => string }) {
  return i18n.$t('greeting.hello')
}
