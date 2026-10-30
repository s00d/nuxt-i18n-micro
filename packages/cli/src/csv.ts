/** RFC 4180: enough for the three-column files the CLI reads and writes. */

const quote = (cell: string): string => (/[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)

export const stringifyCsv = (rows: string[][]): string => rows.map((row) => `${row.map(quote).join(',')}\n`).join('')

export function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

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
      } else quoted = false
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') endCell()
    else if (char === '\n') endRow()
    else if (char !== '\r') cell += char
  }
  if (cell !== '' || row.length > 0) endRow()
  return rows
}
