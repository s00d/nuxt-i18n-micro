const PLACEHOLDER = /%?\{[^{}]+\}|\{\{[^{}]+\}\}/g

export interface Protected {
  masked: string
  tokens: string[]
}

/** Replaces placeholders with XML tags, the one thing every service with markup support leaves alone. */
export function protect(text: string): Protected {
  const tokens: string[] = []
  const masked = text.replace(PLACEHOLDER, (match) => {
    tokens.push(match)
    return `<v${tokens.length - 1}/>`
  })
  return { masked, tokens }
}

export function restore(masked: string, tokens: string[]): string {
  let out = masked
  for (const [index, token] of tokens.entries()) {
    const selfClosed = new RegExp(`<\\s*v${index}\\s*/\\s*>`, 'gi')
    const paired = new RegExp(`<\\s*v${index}\\s*>\\s*</\\s*v${index}\\s*>`, 'gi')
    out = out.replace(selfClosed, () => token).replace(paired, () => token)
  }
  return out
}

const bag = (items: string[]): string => [...items].sort().join('\u0000')

/** A placeholder lost, repeated, added or still masked after translation: such a value must not reach a locale file. */
export const isIntact = (translated: string, tokens: string[]): boolean =>
  !/<\s*\/?\s*v\d+\s*\/?\s*>/i.test(translated) && bag(translated.match(PLACEHOLDER) ?? []) === bag(tokens)

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': `'`, '&#x27;': `'` }

/** Services in HTML mode return `&#39;` for an apostrophe. */
export const decodeEntities = (text: string): string => text.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (entity) => ENTITIES[entity] ?? entity)
