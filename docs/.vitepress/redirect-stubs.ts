import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { redirects } from './redirects'
import { SITE } from './seo'

/** A page at an old URL that sends crawlers and external links to its new route. */
export function redirectStub(target: string): string {
  const canonical = new URL(target.split('#')[0]!, SITE.url).href
  const keepHash = !target.includes('#')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${canonical}">
<meta http-equiv="refresh" content="0; url=${target}">
<script>location.replace(${JSON.stringify(target)}${keepHash ? ' + location.hash' : ''})</script>
</head>
<body><p>This page has moved to <a href="${target}">${target}</a>.</p></body>
</html>
`
}

/** `buildEnd`: one stub per old route. Kept out of `redirects.ts`, which the browser loads. */
export function writeRedirectStubs(outDir: string, base: string, map: Record<string, string> = redirects): void {
  for (const [from, to] of Object.entries(map)) {
    const file = join(outDir, from.endsWith('/') ? `${from}index.html` : `${from}.html`)
    // A page rendered at the old route means the map is stale; a stub would hide it.
    if (existsSync(file)) throw new Error(`redirects.ts: ${from} is still a page; remove the entry or the page.`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, redirectStub(`${base}${to.slice(1)}`))
  }
}
