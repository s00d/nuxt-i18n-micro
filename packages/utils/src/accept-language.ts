interface WeightedTag {
  tag: string
  q: number
}

/** RFC 9110 `qvalue`: `0`, `0.` + up to 3 digits, `1`, `1.` + up to 3 zeros. */
const QVALUE = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/

/** `q` of the parameters after a tag (`;q=0.8`): 1 when absent, NaN when not a qvalue (`0x1`, `1e-1`, `.5`). */
function weightOf(params: string): number {
  const at = params.search(/(?:^|;)\s*q=/i)
  if (at === -1) return 1
  const start = params.indexOf('=', at) + 1
  const end = params.indexOf(';', start)
  const raw = params.slice(start, end === -1 ? undefined : end).trim()
  return QVALUE.test(raw) ? Number(raw) : Number.NaN
}

/** `en_US` → `en-US`; `__proto__` stays junk rather than becoming a tag. */
const normalizeTag = (tag: string) => (tag.includes('_') ? tag.replace(/([a-z0-9])_(?=[a-z0-9])/gi, '$1-') : tag)

function parseEntry(entry: string): WeightedTag | null {
  const semi = entry.indexOf(';')
  const tag = normalizeTag((semi === -1 ? entry : entry.slice(0, semi)).trim())
  const q = semi === -1 ? 1 : weightOf(entry.slice(semi + 1))
  // q=0 is "not acceptable"; a malformed q is ignored rather than guessed
  return tag && q > 0 ? { tag, q } : null
}

/**
 * Language tags of an `Accept-Language` header, most preferred first (stable for equal `q`).
 * `_` becomes `-`; entries with `q=0` or a malformed `q` are dropped.
 */
export function parseAcceptLanguage(header: string | undefined): string[] {
  if (!header) return []
  const entries: WeightedTag[] = []
  let ordered = true
  for (const part of header.split(',')) {
    const entry = parseEntry(part)
    if (!entry) continue
    // browsers send the list already in q order: sort only when it is not
    ordered &&= entries.length === 0 || entries[entries.length - 1]!.q >= entry.q
    entries.push(entry)
  }
  if (!ordered) entries.sort((a, b) => b.q - a.q)
  return entries.map((entry) => entry.tag)
}

/** Chinese regions that imply a script: a `zh-TW` reader does not read Simplified. */
const IMPLIED_SCRIPT = new Map([
  ['cn', 'hans'],
  ['sg', 'hans'],
  ['my', 'hans'],
  ['tw', 'hant'],
  ['hk', 'hant'],
  ['mo', 'hant'],
])

/** The script of a lowercased tag: an explicit 4-letter subtag, else the one a zh region implies, else ''. */
function scriptOf(tag: string): string {
  const parts = tag.split('-')
  const explicit = parts.find((part, i) => i > 0 && part.length === 4)
  if (explicit) return explicit
  return (parts[0] === 'zh' && IMPLIED_SCRIPT.get(parts[1] ?? '')) || ''
}

/** Same language may stand in, but never across scripts both sides name (`zh-CN` is not `zh-Hant`). */
function sameScript(script: string, code: string): boolean {
  if (script === '') return true
  const other = scriptOf(code)
  return other === '' || other === script
}

/**
 * The config locale one language tag asks for: the tag itself or a shorter form of it
 * (`zh-Hant-TW` → `zh-Hant` → `zh`), else a regional locale of the same language and script
 * (`en` → `en-US`, `zh-TW` → `zh-Hant-HK`, never `zh-Hans`). Independent of config order.
 * `lower` is `validLocales` lowercased.
 */
function matchTag(tag: string, validLocales: readonly string[], lower: readonly string[]): string | null {
  let candidate = tag
  let cut = candidate.length
  while (cut !== -1) {
    candidate = candidate.slice(0, cut)
    const exact = lower.indexOf(candidate)
    if (exact !== -1) return validLocales[exact]!
    cut = candidate.lastIndexOf('-')
  }
  // `candidate` is the primary language now
  const regional = `${candidate}-`
  // no other language's locale can match: skip the script work
  const script = lower.some((code) => code.startsWith(regional)) ? scriptOf(tag) : ''
  const index = lower.findIndex((code) => code.startsWith(regional) && sameScript(script, code))
  return index === -1 ? null : validLocales[index]!
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
