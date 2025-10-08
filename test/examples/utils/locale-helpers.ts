// Test utility functions for locale helpers
export function getSupportedLocales(): string[] {
  return ['en', 'de', 'fr']
}

export function getLocalePaths(): Record<string, string> {
  return {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
  }
}
