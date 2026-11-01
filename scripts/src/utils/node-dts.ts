/**
 * Makes emitted declarations resolve under TypeScript's `node16` / `nodenext`.
 *
 * `tsc` copies the specifiers of the source, and the source uses the bundler style `./text`. In a
 * `type: module` package NodeNext rejects that, and the export behind it silently becomes missing
 * (`TS2305`), even with `skipLibCheck`. So every `.d.ts` gets `./text.js`.
 *
 * A `.d.cts` needs more: pointing it at a `.d.ts` crosses from CommonJS into an ES module (`TS1479`). The
 * build writes `.d.cts` only for entries, so each file an entry reaches gets its own `.d.cts` as well.
 *
 * Every package's `vite-plugin-dts` calls this from `afterBuild`, once all files are written. Run again
 * on its own output it changes nothing.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const RELATIVE_SPECIFIER = /(\bfrom\s+|\bimport\s+|\bimport\(\s*|\bdeclare module\s+)(['"])(\.{1,2}(?:\/[^'"\n]*)?)\2/g

/** The declaration a specifier means, as a path without its `.d.ts`. */
function declarationStem(fromDir: string, specifier: string): string | undefined {
  const base = resolve(fromDir, specifier.replace(/\.[cm]?js$/, ''))
  return [base, join(base, 'index')].find((stem) => existsSync(`${stem}.d.ts`))
}

function rewriteSpecifiers(file: string, content: string, extension: string, onTarget?: (stem: string) => void): string {
  const dir = dirname(file)
  return content.replace(RELATIVE_SPECIFIER, (match, lead: string, quote: string, specifier: string) => {
    const stem = declarationStem(dir, specifier)
    if (!stem) return match
    onTarget?.(stem)
    const path = relative(dir, stem)
    return `${lead}${quote}${path.startsWith('.') ? path : `./${path}`}${extension}${quote}`
  })
}

export function writeNodeDeclarations(outDir: string): void {
  const files = readdirSync(outDir, { recursive: true, encoding: 'utf8' }).map((file) => join(outDir, file))

  for (const file of files.filter((name) => name.endsWith('.d.ts'))) {
    writeFileSync(file, rewriteSpecifiers(file, readFileSync(file, 'utf8'), '.js'))
  }

  const pending = files.filter((name) => name.endsWith('.d.cts'))
  const seen = new Set(pending)
  for (const file of pending) {
    const source = existsSync(file) ? file : file.replace(/\.d\.cts$/, '.d.ts')
    const content = rewriteSpecifiers(file, readFileSync(source, 'utf8'), '.cjs', (stem) => {
      const reached = `${stem}.d.cts`
      if (seen.has(reached)) return
      seen.add(reached)
      pending.push(reached)
    })
    writeFileSync(file, content)
  }
}
