import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const pages = fileURLToPath(new URL('../../docs/api/packages/', import.meta.url))

test('the generated API pages name no path of this repository', () => {
  const leaks = readdirSync(pages).filter((page) => /import\("\.{1,2}\//.test(readFileSync(`${pages}${page}`, 'utf8')))
  expect(leaks).toEqual([])
})
