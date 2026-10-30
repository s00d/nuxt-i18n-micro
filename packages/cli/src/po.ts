/** The small part of gettext the CLI exchanges: one flat catalog of msgid -> msgstr, with msgctxt as a key prefix. */

const ESCAPES: Record<string, string> = { n: '\n', t: '\t', r: '\r', '"': '"', '\\': '\\' }

const escapePo = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')

const unescapePo = (text: string): string => text.replace(/\\(.)/g, (_match, char: string) => ESCAPES[char] ?? char)

export function compilePo(entries: Record<string, string>): string {
  const header = 'msgid ""\nmsgstr "Content-Type: text/plain; charset=utf-8\\n"\n'
  const body = Object.entries(entries).map(([key, value]) => `msgid "${escapePo(key)}"\nmsgstr "${escapePo(value)}"\n`)
  return `${[header, ...body].join('\n')}`
}

interface PoEntry {
  msgctxt: string
  msgid: string
  msgstr: string
}

const QUOTED = /^"((?:[^"\\]|\\.)*)"$/
const FIELD = /^(msgctxt|msgid_plural|msgid|msgstr)(?:\[(\d+)\])?\s+(".*")$/

const emptyEntry = (): PoEntry => ({ msgctxt: '', msgid: '', msgstr: '' })

function finish(entry: PoEntry, out: Record<string, string>): void {
  if (entry.msgid === '') return
  out[entry.msgctxt ? `${entry.msgctxt}.${entry.msgid}` : entry.msgid] = entry.msgstr
}

/** The field a line feeds. Plural msgids and forms past the first have no place in a flat catalog. */
const targetField = (name: string, form: string | undefined): keyof PoEntry | null => {
  if (name === 'msgid_plural' || (form && form !== '0')) return null
  return name as keyof PoEntry
}

export function parsePo(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  let entry = emptyEntry()
  let field: keyof PoEntry | null = null
  let inTranslation = false

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim()
    if (line === '' || line.startsWith('#')) continue

    const match = line.match(FIELD)
    if (match) {
      const name = match[1]!
      if (name !== 'msgstr' && name !== 'msgid_plural' && inTranslation) {
        finish(entry, out)
        entry = emptyEntry()
        inTranslation = false
      }
      if (name === 'msgstr') inTranslation = true
      field = targetField(name, match[2])
      if (field) entry[field] = unescapePo(match[3]!.slice(1, -1))
      continue
    }

    const continuation = line.match(QUOTED)
    if (continuation && field) entry[field] += unescapePo(continuation[1]!)
  }

  finish(entry, out)
  return out
}
