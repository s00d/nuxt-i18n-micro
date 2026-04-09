/**
 * Keep only whitelisted query params and return pathname + filtered query.
 * Input can be relative path or absolute URL.
 */
export function filterQueryByWhitelist(fullPath: string, whitelist: string[]): string {
  const url = new URL(fullPath, 'http://localhost')
  const params = new URLSearchParams(url.search)
  const filtered = new URLSearchParams()

  for (const key of whitelist) {
    if (!params.has(key)) continue
    const values = params.getAll(key)
    for (const value of values) {
      filtered.append(key, value)
    }
  }

  const query = filtered.toString()
  return query ? `${url.pathname}?${query}` : url.pathname
}
