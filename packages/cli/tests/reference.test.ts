import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { commands } from '../src/spec'

const repoRoot = join(import.meta.dirname, '../../..')

/** Through a computed path, as the generator reads the spec: the tooling stays out of this package's type-check. */
const cliReference = async (): Promise<string> => {
  const generator = pathToFileURL(join(repoRoot, 'scripts/src/commands/docs-generate.ts')).href
  return ((await import(/* @vite-ignore */ generator)) as { cliReference(): Promise<string> }).cliReference()
}

describe('docs/api/cli.md', () => {
  it('is what the generator writes from the spec', async () => {
    const page = readFileSync(join(repoRoot, 'docs/api/cli.md'), 'utf8')
    expect(page).toContain((await cliReference()).trim())
  })

  it('Common flags holds only flags of every command', async () => {
    const common = (await cliReference()).split('\n## ')[0]!
    const flags = [...common.matchAll(/^\| `--(\w+)`/gm)].map((match) => match[1]!)
    expect(flags.length).toBeGreaterThan(0)
    for (const spec of Object.values(commands)) expect(Object.keys(spec.args)).toEqual(expect.arrayContaining(flags))
  })

  it('every flag outside that list is in the block of its command', async () => {
    const blocks = (await cliReference()).split('\n### ').slice(1)
    for (const [name, spec] of Object.entries(commands)) {
      const block = blocks.find((text) => text.startsWith(`\`${name}\``))!
      for (const [flag, arg] of Object.entries(spec.args)) {
        if (!['cwd', 'logLevel', 'debug'].includes(flag)) expect(block).toContain(arg.type === 'positional' ? `<${flag}>` : `--${flag}`)
      }
    }
  })
})
