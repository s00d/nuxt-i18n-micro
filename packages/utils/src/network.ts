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
