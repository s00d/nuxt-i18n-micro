export function parseAcceptLanguage(header: string | undefined): string[] {
  if (!header) return []
  return header
    .split(',')
    .map((entry) => {
      const [lang] = entry.split(';')
      return (lang ?? '').trim()
    })
    .filter((s): s is string => s.length > 0)
}

export function detectLocaleFromAcceptLanguage(header: string | undefined, validLocales: string[]): string | null {
  const langs = parseAcceptLanguage(header)
  for (const lang of langs) {
    const lowerCaseLanguage = lang.toLowerCase()
    const primaryLanguage = lowerCaseLanguage.split('-')[0]
    const found = validLocales.find((l) => l.toLowerCase() === lowerCaseLanguage || l.toLowerCase() === primaryLanguage)
    if (found) return found
  }
  return null
}

export function applyAutoDetectLanguage(
  locale: string,
  hasExplicitPreference: boolean,
  autoDetectLanguage: boolean | undefined,
  acceptLanguageHeader: string | undefined,
  validLocales: string[],
): string {
  if (!autoDetectLanguage || hasExplicitPreference) return locale
  return detectLocaleFromAcceptLanguage(acceptLanguageHeader, validLocales) ?? locale
}
