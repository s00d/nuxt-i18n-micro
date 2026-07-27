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
  return value === null || value === undefined || value === '' ? '—' : `\`${cell(value)}\``
}

export function table(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return ''
  return [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${row.join(' | ')} |`)].join('\n')
}

/** First sentence of a description, for an index table. */
export function summarise(text: string): string {
  return cell(text.split(/\.\s|\.$/)[0] ?? '')
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
