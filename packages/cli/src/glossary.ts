import { readJsonIfExists } from './fs'

export interface GlossaryEntry {
  source: string
  target: string
  from?: string
  to?: string
}

export interface Glossary {
  entries: GlossaryEntry[]
}

const optionalString = (value: unknown): string | undefined => (typeof value === 'string' && value !== '' ? value : undefined)

export function loadGlossary(path: string): Glossary {
  const raw = readJsonIfExists(path).entries
  if (!Array.isArray(raw)) return { entries: [] }
  const entries = raw.flatMap((item) => {
    const entry = item as Record<string, unknown> | null
    if (typeof entry?.source !== 'string' || typeof entry.target !== 'string') return []
    return [{ source: entry.source, target: entry.target, from: optionalString(entry.from), to: optionalString(entry.to) }]
  })
  return { entries }
}

const same = (a: string | undefined, b: string | undefined): boolean => a?.toLowerCase() === b?.toLowerCase()

export function addEntry(glossary: Glossary, entry: GlossaryEntry): void {
  const index = glossary.entries.findIndex((item) => item.source === entry.source && same(item.from, entry.from) && same(item.to, entry.to))
  if (index >= 0) glossary.entries[index] = entry
  else glossary.entries.push(entry)
}

export function removeEntries(glossary: Glossary, query: Pick<GlossaryEntry, 'source' | 'from' | 'to'>): number {
  const before = glossary.entries.length
  glossary.entries = glossary.entries.filter(
    (item) => item.source !== query.source || (query.from && !same(item.from, query.from)) || (query.to && !same(item.to, query.to)),
  )
  return before - glossary.entries.length
}

const matches = (bound: string | undefined, locale: string): boolean => !bound || same(bound, locale)

/** Terms for one language pair, as the lines a translation prompt quotes. At most 100: a prompt has a budget. */
export function glossaryContext(glossary: Glossary, from: string, to: string): string | undefined {
  const terms = glossary.entries.filter((entry) => matches(entry.from, from) && matches(entry.to, to)).slice(0, 100)
  return terms.length === 0 ? undefined : terms.map((entry) => `${entry.source} => ${entry.target}`).join('\n')
}
