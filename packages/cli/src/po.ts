/** The small part of gettext the CLI exchanges: a flat catalog of msgid -> msgstr, with msgctxt as a key prefix. */

const ESCAPES: Record<string, string> = { n: '\n', t: '\t', r: '\r', '"': '"', '\\': '\\' }

const escapePo = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')

const unescapePo = (text: string): string => text.replace(/\\(.)/g, (_match, char: string) => ESCAPES[char] ?? char)

export interface PoMessage {
  key: string
  value: string
  /** The default-locale text: what a translator works from. */
  source?: string
}

const sourceComment = (source: string | undefined): string => (source ? `${source.replace(/\n/g, '\n#. ').replace(/^/, '#. ')}\n` : '')

export function compilePo(messages: PoMessage[]): string {
  const header = 'msgid ""\nmsgstr "Content-Type: text/plain; charset=utf-8\\n"\n'
  const body = messages.map(({ key, value, source }) => `${sourceComment(source)}msgid "${escapePo(key)}"\nmsgstr "${escapePo(value)}"\n`)
  return [header, ...body].join('\n')
}

interface PoEntry {
  msgctxt: string
  msgid: string
  /** One per plural form. */
  forms: string[]
  fuzzy: boolean
}

export interface PoCatalog {
  messages: Record<string, string>
  /** Marked fuzzy: a machine's guess nobody confirmed, not a translation. */
  fuzzy: string[]
}

const QUOTED = /^"((?:[^"\\]|\\.)*)"$/
const FIELD = /^(msgctxt|msgid_plural|msgid|msgstr)(?:\[(\d+)\])?\s+(".*")$/

const emptyEntry = (fuzzy = false): PoEntry => ({ msgctxt: '', msgid: '', forms: [], fuzzy })

function finish(entry: PoEntry, catalog: PoCatalog): void {
  if (entry.msgid === '') return
  const key = entry.msgctxt ? `${entry.msgctxt}.${entry.msgid}` : entry.msgid
  // The runtime keeps plural forms in one string.
  if (entry.fuzzy) catalog.fuzzy.push(key)
  else catalog.messages[key] = entry.forms.every((form) => form === '') ? '' : entry.forms.join('|')
}

export function parsePo(content: string): PoCatalog {
  const catalog: PoCatalog = { messages: {}, fuzzy: [] }
  let entry = emptyEntry()
  let write: ((text: string) => void) | null = null
  let inTranslation = false
  let nextFuzzy = false

  const assign = (name: string, form: number, first: string): void => {
    const current = entry
    const apply = {
      msgctxt: (text: string) => (current.msgctxt += text),
      msgid: (text: string) => (current.msgid += text),
      msgstr: (text: string) => (current.forms[form] = (current.forms[form] ?? '') + text),
      msgid_plural: () => '',
    }[name]!
    write = apply
    apply(first)
  }

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('#,') && line.includes('fuzzy')) nextFuzzy = true
    if (line === '' || line.startsWith('#')) continue

    const match = line.match(FIELD)
    if (match) {
      const name = match[1]!
      if (name !== 'msgstr' && name !== 'msgid_plural' && inTranslation) {
        finish(entry, catalog)
        entry = emptyEntry()
        inTranslation = false
      }
      if (nextFuzzy) entry.fuzzy = true
      nextFuzzy = false
      if (name === 'msgstr') inTranslation = true
      assign(name, Number(match[2] ?? 0), unescapePo(match[3]!.slice(1, -1)))
      continue
    }

    const continuation = line.match(QUOTED)
    if (continuation) (write as ((text: string) => void) | null)?.(unescapePo(continuation[1]!))
  }

  finish(entry, catalog)
  return catalog
}
