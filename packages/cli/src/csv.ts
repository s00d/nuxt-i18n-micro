import { validationError } from './errors'

/** RFC 4180: enough for the files the CLI reads and writes. */

const quote = (cell: string): string => (/[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)

export const stringifyCsv = (rows: string[][]): string => rows.map((row) => `${row.map(quote).join(',')}\n`).join('')

/** A quote out of place makes the rest of the file mean something else, so it stops the read. */
export function parseCsv(content: string, name = 'the CSV'): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  let openedAt = 0

  const malformed = (index: number): Error =>
    validationError(`Quote out of place in ${name}, line ${content.slice(0, index).split('\n').length}.`, [
      'A quote inside a field is written "a ""b"" c".',
    ])

  const endCell = (): void => {
    row.push(cell)
    cell = ''
  }
  const endRow = (): void => {
    endCell()
    if (row.length > 1 || row[0] !== '') rows.push(row)
    row = []
  }

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]!
    if (quoted) {
      if (char !== '"') cell += char
      else if (content[index + 1] === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = false
        if (!/^(?:[,\r\n]|$)/.test(content.slice(index + 1, index + 2))) throw malformed(index)
      }
      continue
    }
    if (char === '"') {
      if (cell !== '') throw malformed(index)
      quoted = true
      openedAt = index
    } else if (char === ',') endCell()
    else if (char === '\n') endRow()
    else if (char !== '\r') cell += char
  }
  if (quoted) throw malformed(openedAt)
  if (cell !== '' || row.length > 0) endRow()
  return rows
}
