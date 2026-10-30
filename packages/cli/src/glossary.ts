import { readJsonObject } from './fs'

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
  const raw = readJsonObject(path).entries
  if (!Array.isArray(raw)) return { entries: [] }
  const entries = raw.flatMap((item): GlossaryEntry[] => {
    const entry = item as Record<string, unknown> | null
    if (typeof entry?.source !== 'string' || typeof entry.target !== 'string') return []
    return [{ source: entry.source, target: entry.target, from: optionalString(entry.from), to: optionalString(entry.to) }]
  })
  return { entries }
}

const matches = (bound: string | undefined, locale: string): boolean => !bound || bound.toLowerCase() === locale.toLowerCase()

/** Terms for one language pair, as the lines a translation prompt quotes. At most 100: a prompt has a budget. */
export function glossaryContext(glossary: Glossary, from: string, to: string): string | undefined {
  const terms = glossary.entries.filter((entry) => matches(entry.from, from) && matches(entry.to, to)).slice(0, 100)
  return terms.length === 0 ? undefined : terms.map((entry) => `${entry.source} => ${entry.target}`).join('\n')
}
