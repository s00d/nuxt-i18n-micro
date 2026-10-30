interface WeightedTag {
  tag: string
  q: number
}

/** `q` of one `;`-separated parameter list: 1 when absent, NaN when malformed or out of range. */
function weightOf(params: string[]): number {
  const param = params.find((p) => p.trim().toLowerCase().startsWith('q='))
  if (param === undefined) return 1
  const raw = param.trim().slice(2)
  const q = raw === '' ? Number.NaN : Number(raw)
  return q >= 0 && q <= 1 ? q : Number.NaN
}

function parseEntry(entry: string): WeightedTag | null {
  const [lang = '', ...params] = entry.split(';')
  const tag = lang.trim().replace(/([a-z0-9])_(?=[a-z0-9])/gi, '$1-')
  const q = weightOf(params)
  // q=0 is "not acceptable"; a malformed q is ignored rather than guessed
  return tag && q > 0 ? { tag, q } : null
}

/**
 * Language tags of an `Accept-Language` header, most preferred first (stable for equal `q`).
 * `_` becomes `-`; entries with `q=0` or a malformed `q` are dropped.
 */
export function parseAcceptLanguage(header: string | undefined): string[] {
  if (!header) return []
  return header
    .split(',')
    .map(parseEntry)
    .filter((entry): entry is WeightedTag => entry !== null)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag)
}

/**
 * The config locale one language tag asks for: the tag itself or a shorter form of it
 * (`zh-Hant-TW` → `zh-Hant` → `zh`), else a regional locale of the same language (`en` → `en-US`).
 * Independent of config order. `lower` is `validLocales` lowercased.
 */
function matchTag(tag: string, validLocales: readonly string[], lower: readonly string[]): string | null {
  let candidate = tag
  while (candidate) {
    const exact = lower.indexOf(candidate)
    if (exact !== -1) return validLocales[exact]!
    const cut = candidate.lastIndexOf('-')
    candidate = cut === -1 ? '' : candidate.slice(0, cut)
  }
  const primary = tag.split('-')[0]
  const regional = lower.findIndex((code) => code.split('-')[0] === primary)
  return regional === -1 ? null : validLocales[regional]!
}

/** The config locale an `Accept-Language` header prefers, in `q` order; `*` matches nothing. */
export function detectLocaleFromAcceptLanguage(header: string | undefined, validLocales: readonly string[]): string | null {
  const tags = parseAcceptLanguage(header)
  if (tags.length === 0) return null
  const lower = validLocales.map((code) => code.toLowerCase())
  for (const tag of tags) {
    const found = matchTag(tag.toLowerCase(), validLocales, lower)
    if (found) return found
  }
  return null
}

export function applyAutoDetectLanguage(
  locale: string,
  hasExplicitPreference: boolean,
  autoDetectLanguage: boolean | undefined,
  acceptLanguageHeader: string | undefined,
  validLocales: readonly string[],
): string {
  if (!autoDetectLanguage || hasExplicitPreference) return locale
  return detectLocaleFromAcceptLanguage(acceptLanguageHeader, validLocales) ?? locale
}
