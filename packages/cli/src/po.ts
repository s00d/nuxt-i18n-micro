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

type PoField = keyof PoEntry

const QUOTED = /^"((?:[^"\\]|\\.)*)"$/
const FIELD = /^(msgctxt|msgid|msgstr)(?:\[(\d+)\])?\s+(".*")$/

function finish(entry: PoEntry, out: Record<string, string>): void {
  if (entry.msgid === '') return
  out[entry.msgctxt ? `${entry.msgctxt}.${entry.msgid}` : entry.msgid] = entry.msgstr
}

const emptyEntry = (): PoEntry => ({ msgctxt: '', msgid: '', msgstr: '' })

export function parsePo(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  let entry = emptyEntry()
  let field: PoField | null = null

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim()
    if (line === '' || line.startsWith('#')) continue

    const match = line.match(FIELD)
    if (match) {
      const name = match[1] as PoField
      if (name !== 'msgstr' && field === 'msgstr') {
        finish(entry, out)
        entry = emptyEntry()
      }
      // Plural entries: the first form is the one a flat key can hold.
      field = match[2] && match[2] !== '0' ? null : name
      if (field) entry[field] = unescapePo(match[3]!.slice(1, -1))
      continue
    }

    const continuation = line.match(QUOTED)
    if (continuation && field) entry[field] += unescapePo(continuation[1]!)
  }

  finish(entry, out)
  return out
}
