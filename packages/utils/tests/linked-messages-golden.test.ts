/**
 * Characterization of linked messages in merged chunks: every chunk is one `call → result` line in
 * `__golden__/linked-messages.md`. Without `linkedMessages` a chunk is the merge as written.
 */
import { expect, test } from 'vitest'
import { mergeSourceTranslations } from '../src/merge-source'

const files: Record<string, Record<string, unknown>> = {
  'en.json': {
    name: 'Ada',
    title: 'TITLE',
    word: 'world',
    greet: 'Hello @:name',
    upper: '@.upper:name',
    lower: '@.lower:title',
    capitalize: '@.capitalize:word',
    nested: { a: 'A', b: '@:nested.a and @:nested.c', c: '@:name' },
    'dotted.key': 'flat',
    literal: "@:{'dotted.key'}!",
    literalUpper: "@.upper:{'nested.a'}",
    chain: '@:chain1',
    chain1: '@:chain2',
    chain2: 'end',
    cycle1: '@:cycle2',
    cycle2: '@:cycle1',
    self: 'x @:self',
    missing: 'x @:nope y',
    object: '@:nested',
    number: 5,
    numberLink: 'n=@:number',
    proto: '@:__proto__',
    protoPath: '@:nested.__proto__',
    unknownModifier: '@.foo:name',
    param: 'Hi @:withParam',
    withParam: '{name}!',
    plural: 'no @:name | one | {count}',
    email: "foo{'@'}bar",
    plainAt: 'mail a@b.c or @ alone',
    v8Brackets: '@:(name)',
    dynamic: '@:{key}',
    trailingDot: 'See @:name.',
    array: ['@:name', 'x'],
  },
  'pages/about/en.json': { about: 'About @:name', fromPage: '@:pageOnly', pageOnly: 'page' },
  'fr.json': { title: 'Titre', greetFr: 'Salut @:name' },
  'pages/about/fr.json': { aboutFr: '@:about' },
  'tr.json': { i: 'i', upperI: '@.upper:i', capI: '@.capitalize:i' },
}

const locales = [{ code: 'en' }, { code: 'fr', fallbackLocale: 'en' }, { code: 'tr', iso: 'tr-TR' }]

async function chunk(locale: string, pageName: string, linkedMessages: boolean) {
  const warnings: string[] = []
  const data = await mergeSourceTranslations({
    locale,
    pageName,
    locales,
    readLocaleFile: (path) => files[path] ?? {},
    ...({ linkedMessages, warn: (message: string) => warnings.push(message) } as object),
  })
  return { data, warnings }
}

test('linked messages characterization', async () => {
  const lines: string[] = []
  for (const linkedMessages of [false, true]) {
    for (const [locale, page] of [
      ['en', 'index'],
      ['en', 'about'],
      ['fr', 'about'],
      ['tr', 'index'],
    ] as const) {
      lines.push(`- \`merge(${locale}, ${page}, linkedMessages=${linkedMessages})\` → ${JSON.stringify(await chunk(locale, page, linkedMessages))}`)
    }
  }
  await expect(`${lines.join('\n')}\n`).toMatchFileSnapshot('./__golden__/linked-messages.md')
})

test('the source files are not mutated', async () => {
  const before = JSON.stringify(files)
  await chunk('en', 'about', true)
  await chunk('fr', 'about', true)
  expect(JSON.stringify(files)).toBe(before)
})
