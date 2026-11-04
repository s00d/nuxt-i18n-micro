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

/** One entry of a `::field-group`: Nuxt UI's prose `Field` (name, type, required, text). */
export interface Field {
  name: string
  type?: string
  required?: boolean
  /** Markdown; lists and code blocks are fine, it is the field's slot. */
  text?: string
}

/** Above this many fields a group starts collapsed: the signature above already lists the names. */
const COLLAPSE_AFTER = 8

/**
 * Fields instead of a table: a table squeezes a long type and a paragraph of text into one
 * row, a field gives each its own line and keeps the text's Markdown.
 *
 * Props go in a YAML block rather than `{name="…"}` attributes: a type carries quotes,
 * braces and pipes, and JSON is valid YAML whatever it holds.
 *
 * @param depth how many components this group sits inside (each adds a colon)
 */
export function fieldGroup(fields: Field[], options: { depth?: number; label?: string; collapse?: boolean } = {}): string {
  if (fields.length === 0) return ''
  const base = options.depth ?? 0
  // A reference list (exit codes, flags) is the content itself; only member lists fold.
  const collapse = (options.collapse ?? true) && fields.length > COLLAPSE_AFTER
  const depth = base + (collapse ? 1 : 0)
  const outer = ':'.repeat(depth + 2)
  const inner = ':'.repeat(depth + 3)

  const body = fields.map((field) => {
    const props = [`name: ${JSON.stringify(field.name)}`]
    if (field.type) props.push(`type: ${JSON.stringify(field.type)}`)
    if (field.required) props.push('required: true')
    return [`${inner}field`, '---', ...props, '---', field.text?.trim() ?? '', inner].join('\n')
  })
  const group = [`${outer}field-group`, ...body, outer].join('\n')
  if (!collapse) return group

  const wrapper = ':'.repeat(base + 2)
  return [`${wrapper}collapsible{name=${JSON.stringify(`${fields.length} ${options.label ?? 'fields'}`)}}`, group, wrapper].join('\n')
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
  // Anything that can open a sentence counts, not just a capital: a Markdown link, a
  // quote, an emphasis marker or a tag all start one.
  const match = /(?<!\b(?:e\.g|i\.e|etc|vs|cf|approx|Mr|Mrs|Dr|St|No|[A-Za-z]))[.!?](?=\s+[A-Z(`[<"'*_~]|$)/.exec(flat)
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
