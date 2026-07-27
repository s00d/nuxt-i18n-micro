/**
 * Rendering reference documentation as plain Markdown.
 *
 * Plain Markdown rather than a Vue component reading JSON at runtime: the site, the
 * `llms.txt` bundle and anything else that reads the sources all get the same content
 * from the same file. A table that only exists once the page is mounted is invisible to
 * every consumer except a browser.
 */

/** Escape a value so it survives a table cell. */
export function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()
}

export function code(value: string | null | undefined): string {
  // Presence, not truthiness: `false` and `0` are real defaults, and testing for truth
  // rendered them as "no default at all".
  if (value === null || value === undefined || value === '') return '—'

  const text = cell(value)
  // A template-literal type carries backticks of its own; a single-backtick span would
  // close on the first of them and render the rest as fragments.
  const longest = Math.max(0, ...[...text.matchAll(/`+/g)].map((match) => match[0].length))
  const fence = '`'.repeat(longest + 1)
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : ''
  return `${fence}${pad}${text}${pad}${fence}`
}

export function table(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return ''
  return [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n')
}

/**
 * First sentence of a description, for an index table.
 *
 * A period is only a sentence end when what follows starts a new one, so `e.g.` and
 * `i.e.` do not truncate the summary — `noPrefixRedirect` used to render as `For … (e.g`.
 */
export function summarise(text: string): string {
  const flat = cell(text)
  // A period ends a sentence only when a new one follows and it is not part of a known
  // abbreviation — `noPrefixRedirect` used to render as `For … (e.g`.
  const match = /(?<!\b(?:e\.g|i\.e|etc|vs|cf|approx|Mr|Mrs|Dr|St|No|[A-Za-z]))[.!?](?=\s+[A-Z(`]|$)/.exec(flat)
  return match ? flat.slice(0, match.index + 1) : flat
}

export const BLOCK_START = (id: string): string => `<!-- generated:${id} — do not edit; run \`pnpm run docs:generate\` -->`
export const BLOCK_END = (id: string): string => `<!-- /generated:${id} -->`

export class MissingBlockError extends Error {
  constructor(public readonly id: string) {
    super(`no <!-- generated:${id} --> region`)
  }
}

/**
 * Replace the contents of the `id` region in `source`.
 *
 * Throws when the region is absent: appending instead would drop a generated table
 * wherever the file happens to end, and skipping silently would leave a stale page
 * looking current.
 */
export function replaceBlock(source: string, id: string, body: string): string {
  const start = source.indexOf(BLOCK_START(id))
  const end = source.indexOf(BLOCK_END(id))
  if (start === -1 || end === -1 || end < start) throw new MissingBlockError(id)

  return `${source.slice(0, start)}${BLOCK_START(id)}\n\n${body.trim()}\n\n${BLOCK_END(id)}${source.slice(end + BLOCK_END(id).length)}`
}
