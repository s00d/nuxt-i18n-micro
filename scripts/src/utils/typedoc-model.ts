/**
 * Documented symbols, via TypeDoc.
 *
 * TypeDoc already resolves what a hand-written AST walk gets wrong — inherited members,
 * overload sets, `@param`/`@returns`/`@example` tags, links between symbols — so the work
 * here is reducing its model to the few fields a reference page renders, not parsing.
 *
 * The entry points come from `tsconfig.docs.json` rather than the build config: these are
 * runtime sources that import Nuxt's virtual `#imports`, which type checking resolves and
 * a standalone TypeDoc run does not. `skipErrorChecking` is what makes that survivable.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import {
  Application,
  type Comment,
  type CommentDisplayPart,
  type DeclarationReflection,
  ReflectionKind,
  type SignatureReflection,
  TSConfigReader,
} from 'typedoc'
import { repoRoot } from './workspace'

export interface DocParam {
  name: string
  type: string
  description: string
  optional: boolean
}

export interface DocSymbol {
  name: string
  /** `function`, `variable`, `method`, … */
  kind: string
  signature: string
  description: string
  params: DocParam[]
  returns: string
  examples: string[]
  deprecated: string | null
}

export interface DocModule {
  /** Module name, which for an expanded entry point is the file stem. */
  name: string
  symbols: DocSymbol[]
}

const flat = (text: string): string => text.replace(/\s+/g, ' ').trim()

/** Comment parts back to Markdown; TypeDoc splits inline code into its own parts. */
function partsToText(parts: readonly CommentDisplayPart[] | undefined, keepNewlines = false): string {
  const text = (parts ?? []).map((part) => part.text).join('')
  return keepNewlines ? text.trim() : flat(text)
}

function summaryOf(comment: Comment | undefined, keepNewlines = false): string {
  return partsToText(comment?.summary, keepNewlines)
}

function tagContent(comment: Comment | undefined, tag: `@${string}`): string[] {
  return (comment?.blockTags ?? []).filter((block) => block.tag === tag).map((block) => partsToText(block.content, true))
}

/** The `@deprecated` reason, not the symbol's summary — those are different sentences. */
function deprecationOf(comment: Comment | undefined): string | null {
  const tag = comment?.getTag('@deprecated')
  if (!tag) return null
  return partsToText(tag.content) || 'deprecated'
}

function typeText(reflection: { type?: { toString(): string } } | undefined): string {
  return reflection?.type ? flat(String(reflection.type)) : 'unknown'
}

/**
 * TypeScript's internal name for a destructured parameter. Showing it to a reader as
 * `useLocaleHead(__namedParameters: UseLocaleHeadOptions)` explains nothing.
 */
const DESTRUCTURED = /^__(?:namedParameters|object)\d*$/

const parameterName = (name: string): string => (DESTRUCTURED.test(name) ? 'options' : name)

function signatureText(name: string, signature: SignatureReflection): string {
  const parameters = (signature.parameters ?? [])
    .map((parameter) => `${parameterName(parameter.name)}${parameter.flags.isOptional ? '?' : ''}: ${typeText(parameter)}`)
    .join(', ')
  return `${name}(${parameters}): ${typeText(signature)}`
}

function fromSignature(name: string, kind: string, signature: SignatureReflection): DocSymbol {
  const comment = signature.comment
  return {
    name,
    kind,
    signature: signatureText(name, signature),
    description: summaryOf(comment, true),
    params: (signature.parameters ?? []).map((parameter) => ({
      name: parameterName(parameter.name),
      type: typeText(parameter),
      description: summaryOf(parameter.comment),
      optional: parameter.flags.isOptional,
    })),
    returns: tagContent(comment, '@returns')[0] ?? '',
    examples: tagContent(comment, '@example'),
    deprecated: deprecationOf(comment),
  }
}

function fromDeclaration(reflection: DeclarationReflection): DocSymbol[] {
  const kind = ReflectionKind.singularString(reflection.kind).toLowerCase()

  if (reflection.signatures && reflection.signatures.length > 0) {
    return reflection.signatures.map((signature) => fromSignature(reflection.name, kind, signature))
  }

  const comment = reflection.comment
  return [
    {
      name: reflection.name,
      kind,
      signature: typeText(reflection),
      description: summaryOf(comment, true),
      params: [],
      returns: '',
      examples: tagContent(comment, '@example'),
      deprecated: deprecationOf(comment),
    },
  ]
}

async function convert(entryPoints: string[], expand: boolean) {
  const app = await Application.bootstrapWithPlugins(
    {
      entryPoints,
      entryPointStrategy: expand ? 'expand' : 'resolve',
      tsconfig: join(repoRoot, 'tsconfig.docs.json'),
      skipErrorChecking: true,
      excludeExternals: true,
      logLevel: 'Error',
    },
    [new TSConfigReader()],
  )

  const project = await app.convert()
  if (!project) throw new Error(`TypeDoc could not read ${entryPoints.join(', ')}`)
  return project
}

/** Exported symbols of every file in a directory, one module each. */
export async function readModules(directory: string): Promise<DocModule[]> {
  const project = await convert([join(repoRoot, directory)], true)

  return (project.children ?? [])
    .map((module) => ({
      name: module.name,
      symbols: (module.children ?? []).filter((child) => child.kind !== ReflectionKind.TypeAlias).flatMap(fromDeclaration),
    }))
    .filter((module) => module.symbols.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Types exactly as written in the source, keyed by member name.
 *
 * TypeDoc normalises what it reports and, without `strictNullChecks` reaching its program
 * — which it does not from a `tsconfig` passed this way — renders `string | null` as
 * `string`. The written text is both more faithful and what a reader recognises.
 */
function writtenMemberTypes(file: string, interfaceName: string): Map<string, string> {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ESNext, true)
  const written = new Map<string, string>()

  source.forEachChild((node) => {
    if (!ts.isInterfaceDeclaration(node) || node.name.text !== interfaceName) return
    for (const member of node.members) {
      if (!ts.isPropertySignature(member) || !member.name || !member.type) continue
      const name = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) ? member.name.text : null
      if (name) written.set(name, flat(member.type.getText(source)))
    }
  })

  return written
}

/** Members of one interface — used for the helpers injected into every component. */
export async function readInterface(file: string, interfaceName: string): Promise<DocSymbol[]> {
  const project = await convert([join(repoRoot, file)], false)

  const search = (reflection: DeclarationReflection): DeclarationReflection | null => {
    if (reflection.name === interfaceName && reflection.kind === ReflectionKind.Interface) return reflection
    for (const child of reflection.children ?? []) {
      const found = search(child)
      if (found) return found
    }
    return null
  }

  const written = writtenMemberTypes(join(repoRoot, file), interfaceName)

  for (const child of project.children ?? []) {
    const found = search(child)
    if (found) {
      const symbols = (found.children ?? []).flatMap(fromDeclaration)
      for (const symbol of symbols) {
        const source = written.get(symbol.name)
        if (source) symbol.signature = source
      }
      return symbols
    }
  }
  return []
}
