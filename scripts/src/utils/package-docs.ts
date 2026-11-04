/**
 * The reference model of a package: what each export is, what its JSDoc says, and which
 * workspace package declares it.
 *
 * Read through the same TypeScript program as the api-surface snapshot, so the pages and
 * the snapshot see one set of exports. The snapshot stays a flat, diffable contract; the
 * reader-facing details — JSDoc, own members only, the declaring package — come from here,
 * because a line format that also carried prose would make every reworded comment a
 * "breaking change" in the surface check.
 *
 * Signatures prefer the type as written in the source: `options?: UseI18nOptions` explains
 * more than the expanded object the checker would print. The checker fills in only what
 * the source does not write (inferred return types, types a library declares).
 */
import { join, relative } from 'node:path'
import ts from 'typescript'
import { createSurfaceProgram, entryPoints, resolveAlias } from './api-surface'
import type { PackageManifest } from './manifest'
import { repoRoot } from './workspace'

export type ExportGroup = 'component' | 'composable' | 'function' | 'class' | 'constant' | 'type'

/** The order a page lists its exports in: what a reader reaches for first comes first. */
export const GROUP_ORDER: ExportGroup[] = ['component', 'composable', 'function', 'class', 'constant', 'type']

export interface MemberDoc {
  /** With modifiers and the optional mark, e.g. `protected cache?`. */
  name: string
  type: string
  default: string | null
  description: string
  deprecated: string | null
}

export interface ExportDoc {
  name: string
  group: ExportGroup
  /** TypeScript, possibly several lines. */
  signature: string
  description: string
  params: { name: string; description: string; type?: string; optional?: boolean }[]
  returns: string
  examples: string[]
  deprecated: string | null
  members: MemberDoc[]
  /** Workspace package that declares it, or '' for a type from outside the workspace. */
  owner: string
  /**
   * `owner#declared name`: the same declaration reached through any package or entry point.
   * By package, not file: another package reaches it through its built `dist` typings.
   */
  key: string
  /** `file#declared name`: tells apart two declarations of one name in one package (`useAstroI18n` per framework). */
  id: string
}

export interface EntryDoc {
  /** As written in `exports`, e.g. `.` or `./client`. */
  subpath: string
  /** What a consumer imports, e.g. `@i18n-micro/react/client`. */
  specifier: string
  exports: ExportDoc[]
}

interface JsDoc {
  description: string
  params: { name: string; description: string }[]
  returns: string
  default: string | null
  deprecated: string | null
  examples: string[]
}

/** Above this a signature breaks its parameters onto lines of their own. */
const LINE_WIDTH = 88

const NODE_FLAGS =
  ts.NodeBuilderFlags.NoTruncation |
  ts.NodeBuilderFlags.MultilineObjectLiterals |
  ts.NodeBuilderFlags.UseAliasDefinedOutsideCurrentScope |
  ts.NodeBuilderFlags.IgnoreErrors

const printer = ts.createPrinter({ removeComments: true })

/* ---------------------------------------------------------------------------------- text */

const flat = (text: string): string => text.replace(/\s+/g, ' ').trim()

/** A reader knows `Ref` and `Params` by name; `import("vue").` in front of them is noise. */
const withoutImports = (text: string): string => text.replace(/import\("[^"]*"\)\./g, '')

/** The printer indents by four; the site's code blocks and the sources use two. */
const twoSpaces = (text: string): string => text.replace(/^((?: {4})+)/gm, (indent) => ' '.repeat(indent.length / 2))

/** A source node through the printer: comments dropped, object types one member per line. */
const printed = (node: ts.Node): string => twoSpaces(withoutImports(printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile())))

/**
 * A node as the source writes it, on one line. Through the printer rather than `getText`:
 * a multi-line object type separates its members by newlines alone, which flattening
 * would run together.
 */
const written = (node: ts.Node): string => flat(printed(node))

/** `{@link Foo}` and `{@link Foo | the foo}` read as code or as their label. */
const unlink = (text: string): string =>
  text.replace(/\{@link(?:code|plain)?\s+([^}|\s]+)\s*(?:\|\s*([^}]+))?\}/g, (_, target: string, label?: string) => label?.trim() ?? `\`${target}\``)

const indentRest = (text: string): string => text.replace(/\n/g, '\n  ')

function printType(type: ts.Type, at: ts.Node, checker: ts.TypeChecker): string {
  const node = checker.typeToTypeNode(type, at, NODE_FLAGS)
  if (!node) return withoutImports(checker.typeToString(type, at, ts.TypeFormatFlags.NoTruncation))
  return twoSpaces(withoutImports(printer.printNode(ts.EmitHint.Unspecified, node, at.getSourceFile())))
}

/** `head(a, b): R` on one line, or one parameter per line when that does not fit. */
function layout(head: string, params: string[], returns: string | null): string {
  const tail = returns === null ? '' : `: ${returns}`
  const one = `${head}(${params.join(', ')})${tail}`
  if (one.length <= LINE_WIDTH && !one.includes('\n')) return one
  if (params.length === 0) return one
  return `${head}(\n${params.map((param) => `  ${indentRest(param)},`).join('\n')}\n)${tail}`
}

/* -------------------------------------------------------------------------------- JSDoc */

function tagText(tag: ts.JSDocTagInfo): string {
  return unlink(ts.displayPartsToString(tag.text)).trim()
}

/** `@param name - text`, `@param name text`: the name, then the sentence. */
function paramTag(text: string): { name: string; description: string } {
  const match = /^(\S+)\s*(?:-\s*)?([\s\S]*)$/.exec(text)
  return { name: match?.[1] ?? text, description: (match?.[2] ?? '').trim() }
}

const fence = (text: string): string =>
  text
    .replace(/^```\w*\n?/, '')
    .replace(/\n?```$/, '')
    .trim()

/** `ponytail:` lines record a known limit for maintainers (see the rewrite playbook); a reader of the API does not need them. */
const withoutMaintainerNotes = (text: string): string =>
  text
    .split('\n')
    .filter((line) => !/^\s*ponytail:/.test(line))
    .join('\n')
    .trim()

function docOf(symbol: ts.Symbol | undefined, checker: ts.TypeChecker): JsDoc {
  if (!symbol) return { description: '', params: [], returns: '', default: null, deprecated: null, examples: [] }
  const tags = symbol.getJsDocTags(checker)
  const first = (name: string): ts.JSDocTagInfo | undefined => tags.find((tag) => tag.name === name)
  const deprecated = first('deprecated')

  return {
    description: withoutMaintainerNotes(unlink(ts.displayPartsToString(symbol.getDocumentationComment(checker)))),
    params: tags.filter((tag) => tag.name === 'param').map((tag) => paramTag(tagText(tag))),
    returns: tagText(first('returns') ?? first('return') ?? { name: '', text: [] }),
    default: first('default') ? tagText(first('default')!) || null : null,
    // an empty `@deprecated` still marks the export
    deprecated: deprecated ? tagText(deprecated) || 'deprecated' : null,
    examples: tags
      .filter((tag) => tag.name === 'example')
      .map((tag) => fence(tagText(tag)))
      .filter(Boolean),
  }
}

/* ----------------------------------------------------------------------------- grouping */

function isCallable(type: ts.Type): boolean {
  return type.getCallSignatures().length > 0 || type.getConstructSignatures().length > 0
}

function groupOf(name: string, symbol: ts.Symbol, type: ts.Type | null): ExportGroup {
  if (symbol.flags & ts.SymbolFlags.Class) return 'class'
  if (symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Enum)) return 'type'
  if (/^use[A-Z]/.test(name)) return 'composable'
  // A React context is callable too (it renders as its own provider), but nobody calls it.
  if (!type || !isCallable(type) || name.endsWith('Context')) return 'constant'
  return /^[A-Z]/.test(name) ? 'component' : 'function'
}

/* ---------------------------------------------------------------------------- functions */

/** Is `node` part of `owner`, i.e. written in this export's own declaration? */
const within = (node: ts.Node, owner: ts.Node): boolean =>
  node.getSourceFile() === owner.getSourceFile() && node.pos >= owner.pos && node.end <= owner.end

function parameterText(param: ts.Symbol, own: ts.SignatureDeclaration | undefined, at: ts.Node, checker: ts.TypeChecker, group: ExportGroup): string {
  const declaration = param.valueDeclaration && ts.isParameter(param.valueDeclaration) ? param.valueDeclaration : undefined
  // TypeScript names a destructured parameter `__0`; a reader knows it as the props or the options.
  const fallback = group === 'component' ? 'props' : 'options'
  const name = declaration && ts.isIdentifier(declaration.name) ? declaration.name.text : param.name.startsWith('__') ? fallback : param.name
  const rest = declaration?.dotDotDotToken ? '...' : ''
  const optional = declaration && (declaration.questionToken || declaration.initializer) ? '?' : ''

  if (own && declaration?.type) {
    const head = `${rest}${name}${optional}: `
    const short = written(declaration.type)
    // an inline object type that does not fit one line gets one member per line
    return `${head}${head.length + short.length > LINE_WIDTH ? printed(declaration.type) : short}`
  }
  const type = printType(checker.getTypeOfSymbolAtLocation(param, at), at, checker)
  return `${rest}${name}${optional}: ${optional ? type.replace(/ \| undefined$/, '') : type}`
}

const ownDeclaration = (signature: ts.Signature, at: ts.Node): ts.SignatureDeclaration | undefined =>
  signature.declaration && within(signature.declaration, at) ? (signature.declaration as ts.SignatureDeclaration) : undefined

/**
 * The object a function returns without naming its type — `useI18n()` of Vue gives back
 * thirty helpers. Printed in full it is a wall of nested types; as a table of its
 * properties it reads like an interface.
 */
function inferredObject(signature: ts.Signature, at: ts.Node): ts.Type | null {
  if (ownDeclaration(signature, at)?.type) return null
  const returns = signature.getReturnType()
  const anonymous =
    returns.flags & ts.TypeFlags.Object && (returns as ts.ObjectType).objectFlags & (ts.ObjectFlags.Anonymous | ts.ObjectFlags.ObjectLiteral)
  if (!anonymous || returns.aliasSymbol || returns.getCallSignatures().length > 0) return null
  return returns.getProperties().length > 0 ? returns : null
}

function signatureText(name: string, signature: ts.Signature, at: ts.Node, checker: ts.TypeChecker, group: ExportGroup, folded: boolean): string {
  const own = ownDeclaration(signature, at)
  const typeParameters = own?.typeParameters?.length ? `<${own.typeParameters.map(written).join(', ')}>` : ''
  // A component's contract is its props; the second argument a framework passes is not the user's to write.
  const parameters = group === 'component' ? signature.parameters.slice(0, 1) : signature.parameters
  const params = parameters.map((param) => parameterText(param, own, at, checker, group))
  const returns = folded ? '{ … }' : own?.type ? written(own.type) : printType(signature.getReturnType(), at, checker)
  // `FunctionalComponent<P>` takes `P & {}`: an artefact of the framework's typing, not of the props.
  return layout(`function ${name}${typeParameters}`, params, returns).replaceAll(' & {})', ')')
}

const oneLine = (type: ts.Type, at: ts.Node, checker: ts.TypeChecker): string =>
  flat(withoutImports(checker.typeToString(type, at, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope)))

function propertyDocs(type: ts.Type, at: ts.Node, checker: ts.TypeChecker): MemberDoc[] {
  return type.getProperties().map((property) => {
    const doc = docOf(property, checker)
    const optional = property.flags & ts.SymbolFlags.Optional ? '?' : ''
    return {
      name: `${property.getName()}${optional}`,
      type: oneLine(checker.getTypeOfSymbolAtLocation(property, at), at, checker),
      default: doc.default,
      description: doc.description,
      deprecated: doc.deprecated,
    }
  })
}

/**
 * A component a framework builds from an options object (`defineComponent`) has no call
 * signature to read props from; its runtime `props` object is the contract.
 */
function runtimeProps(declaration: ts.Node, checker: ts.TypeChecker): MemberDoc[] {
  const props = findPropsObject(declaration)
  if (!props) return []
  return props.properties.filter(ts.isPropertyAssignment).map((property) => runtimeProp(property, checker))
}

function findPropsObject(node: ts.Node): ts.ObjectLiteralExpression | undefined {
  if (ts.isPropertyAssignment(node) && node.name.getText() === 'props' && ts.isObjectLiteralExpression(node.initializer)) return node.initializer
  return ts.forEachChild(node, findPropsObject)
}

const CONSTRUCTOR_TYPES: Record<string, string> = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Object: 'object',
  Array: 'unknown[]',
  Function: 'Function',
}

function runtimeProp(property: ts.PropertyAssignment, checker: ts.TypeChecker): MemberDoc {
  const doc = docOf(checker.getSymbolAtLocation(property.name), checker)
  const options = propOptions(property.initializer, checker)
  const field = (key: string): ts.Expression | undefined =>
    options?.properties.find((entry): entry is ts.PropertyAssignment => ts.isPropertyAssignment(entry) && entry.name.getText() === key)?.initializer

  const type = field('type') ?? (options ? undefined : property.initializer)
  const required = field('required')?.kind === ts.SyntaxKind.TrueKeyword
  const fallback = field('default')

  return {
    name: `${property.name.getText()}${required ? '' : '?'}`,
    type: type ? runtimePropType(type) : 'unknown',
    // `default: undefined` is what an absent default already means
    default: fallback && fallback.getText() !== 'undefined' ? defaultText(fallback) : doc.default,
    description: doc.description,
    deprecated: doc.deprecated,
  }
}

/** The options object of a prop, also when several props share one constant (`customItemStyle: styleProp`). */
function propOptions(node: ts.Expression, checker: ts.TypeChecker): ts.ObjectLiteralExpression | undefined {
  if (ts.isObjectLiteralExpression(node)) return node
  if (!ts.isIdentifier(node)) return undefined
  const declaration = checker.getSymbolAtLocation(node)?.valueDeclaration
  const initializer = declaration && ts.isVariableDeclaration(declaration) ? declaration.initializer : undefined
  const value = initializer && ts.isAsExpression(initializer) ? initializer.expression : initializer
  return value && ts.isObjectLiteralExpression(value) ? value : undefined
}

/** `String as PropType<X>` is `X`; a bare constructor is its primitive. */
function runtimePropType(node: ts.Expression): string {
  if (ts.isAsExpression(node) && ts.isTypeReferenceNode(node.type) && node.type.typeArguments?.[0]) return written(node.type.typeArguments[0])
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((element) => runtimePropType(element)).join(' | ')
  return CONSTRUCTOR_TYPES[node.getText()] ?? written(node)
}

/** `() => ({})` defaults to `{}`: the factory is a Vue detail, the value is what the reader wants. */
function defaultText(node: ts.Expression): string {
  if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
    const body = ts.isParenthesizedExpression(node.body) ? node.body.expression : node.body
    return written(body)
  }
  return written(node)
}

function valueShape(name: string, declaration: ts.Node, type: ts.Type, checker: ts.TypeChecker, group: ExportGroup): Shape {
  const calls = type.getCallSignatures()
  if (group !== 'constant' && calls.length > 0) {
    const returned = calls.length === 1 ? inferredObject(calls[0]!, declaration) : null
    return {
      signature: calls.map((signature) => signatureText(name, signature, declaration, checker, group, returned !== null)).join('\n'),
      members: returned ? propertyDocs(returned, declaration, checker) : [],
      parameters: calls.length === 1 ? parameterTypes(calls[0]!, declaration, checker) : undefined,
    }
  }

  // `defineComponent(…)` and friends: the full type is pages of generics; its name says enough,
  // and the runtime `props` object lists what a reader passes.
  const named = type.aliasSymbol?.name ?? type.getSymbol()?.name
  if (group === 'component' && named) return { signature: `const ${name}: ${named}`, members: runtimeProps(declaration, checker) }
  return { signature: `const ${name}: ${printType(type, declaration, checker)}`, members: [] }
}

/* ------------------------------------------------------------------------------ members */

const hasModifier = (node: ts.Node, kind: ts.SyntaxKind): boolean =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === kind)

const MODIFIER_WORDS: [ts.SyntaxKind, string][] = [
  [ts.SyntaxKind.StaticKeyword, 'static'],
  [ts.SyntaxKind.ProtectedKeyword, 'protected'],
  [ts.SyntaxKind.AbstractKeyword, 'abstract'],
  [ts.SyntaxKind.ReadonlyKeyword, 'readonly'],
]

const modifierPrefix = (node: ts.Node): string =>
  MODIFIER_WORDS.filter(([kind]) => hasModifier(node, kind))
    .map(([, word]) => `${word} `)
    .join('')

/** Private members are not part of anything a reader can use. */
const isHidden = (member: ts.ClassElement | ts.TypeElement): boolean =>
  hasModifier(member, ts.SyntaxKind.PrivateKeyword) || (member.name !== undefined && ts.isPrivateIdentifier(member.name))

function functionType(node: ts.SignatureDeclaration, checker: ts.TypeChecker): string {
  const params = node.parameters.map((param) => written(param)).join(', ')
  const signature = checker.getSignatureFromDeclaration(node)
  const returns = node.type ? written(node.type) : signature ? oneLine(signature.getReturnType(), node, checker) : 'void'
  return `${typeParametersText(node)}(${params}) => ${returns}`
}

function memberType(member: ts.ClassElement | ts.TypeElement, checker: ts.TypeChecker): string {
  if (
    ts.isMethodDeclaration(member) ||
    ts.isMethodSignature(member) ||
    ts.isCallSignatureDeclaration(member) ||
    ts.isConstructSignatureDeclaration(member)
  ) {
    return functionType(member, checker)
  }
  if (ts.isGetAccessorDeclaration(member)) return member.type ? written(member.type) : 'unknown'
  if (ts.isIndexSignatureDeclaration(member)) return member.type ? written(member.type) : 'unknown'

  const typed = member as { type?: ts.TypeNode }
  if (typed.type) return written(typed.type)
  const symbol = member.name ? checker.getSymbolAtLocation(member.name) : undefined
  return symbol ? oneLine(checker.getTypeOfSymbolAtLocation(symbol, member), member, checker) : 'unknown'
}

function memberName(member: ts.ClassElement | ts.TypeElement): string {
  if (ts.isIndexSignatureDeclaration(member)) return `[${member.parameters.map(written).join(', ')}]`
  if (ts.isCallSignatureDeclaration(member)) return '(call)'
  if (ts.isConstructSignatureDeclaration(member)) return 'new'
  const optional = (member as { questionToken?: ts.Node }).questionToken ? '?' : ''
  return `${modifierPrefix(member)}${member.name?.getText() ?? ''}${optional}`
}

function memberDoc(member: ts.ClassElement | ts.TypeElement, checker: ts.TypeChecker): MemberDoc {
  const doc = docOf(member.name ? checker.getSymbolAtLocation(member.name) : undefined, checker)
  return {
    name: memberName(member),
    type: memberType(member, checker),
    default: doc.default,
    description: doc.description,
    deprecated: doc.deprecated,
  }
}

const DOCUMENTED_MEMBER = (member: ts.ClassElement | ts.TypeElement): boolean =>
  !ts.isConstructorDeclaration(member) &&
  !ts.isSemicolonClassElement(member) &&
  !ts.isClassStaticBlockDeclaration(member) &&
  !ts.isSetAccessorDeclaration(member) &&
  !isHidden(member)

/**
 * Members as declared: an overload set is listed by its overloads, not again by the
 * implementation that follows them.
 */
function ownMembers(members: readonly (ts.ClassElement | ts.TypeElement)[], checker: ts.TypeChecker): MemberDoc[] {
  const overloaded = new Set(members.filter((member) => ts.isMethodDeclaration(member) && !member.body).map((member) => member.name?.getText()))
  return members
    .filter(DOCUMENTED_MEMBER)
    .filter((member) => !(ts.isMethodDeclaration(member) && member.body && overloaded.has(member.name.getText())))
    .map((member) => memberDoc(member, checker))
}

/* -------------------------------------------------------------------------------- kinds */

const heritageText = (node: ts.ClassLikeDeclaration | ts.InterfaceDeclaration): string =>
  (node.heritageClauses ?? []).map((clause) => ` ${written(clause)}`).join('')

const typeParametersText = (node: { typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration> }): string =>
  node.typeParameters?.length ? `<${node.typeParameters.map(written).join(', ')}>` : ''

function classSignature(name: string, node: ts.ClassDeclaration): string {
  const head = `${modifierPrefix(node)}class ${name}${typeParametersText(node)}${heritageText(node)}`
  const constructors = node.members.filter(ts.isConstructorDeclaration).filter((member) => member.parameters.length > 0 && !isHidden(member))
  if (constructors.length === 0) return head
  const lines = constructors.map((member) => `  ${indentRest(layout('constructor', member.parameters.map(written), null))}`)
  return `${head} {\n${lines.join('\n')}\n}`
}

/**
 * The declarations an interface's page section is about: the package's own, not a module
 * augmentation some other file adds to it.
 */
function ownInterfaceDeclarations(symbol: ts.Symbol): ts.InterfaceDeclaration[] {
  const declarations = (symbol.declarations ?? []).filter(ts.isInterfaceDeclaration)
  const home = declarations[0]?.getSourceFile().fileName
  return declarations.filter((declaration) => declaration.getSourceFile().fileName === home)
}

/** Object-literal parts of an alias (`A & { to: X }`) carry members a reader looks up one by one. */
function literalParts(node: ts.TypeNode): ts.TypeLiteralNode[] {
  if (ts.isTypeLiteralNode(node)) return [node]
  if (ts.isIntersectionTypeNode(node)) return node.types.filter(ts.isTypeLiteralNode)
  return []
}

/** A long conditional or union on one line is unreadable; break it the way a formatter would. */
function aliasBody(node: ts.TypeNode, head: string): string {
  const text = printed(node)
  if (head.length + text.length <= LINE_WIDTH || text.includes('\n')) return text
  if (ts.isConditionalTypeNode(node)) {
    return `${printed(node.checkType)} extends ${printed(node.extendsType)}\n  ? ${printed(node.trueType)}\n  : ${printed(node.falseType)}`
  }
  if (ts.isUnionTypeNode(node)) return `\n${node.types.map((part) => `  | ${printed(part)}`).join('\n')}`
  return text
}

function aliasSignature(name: string, node: ts.TypeAliasDeclaration, folded: boolean): string {
  const head = `type ${name}${typeParametersText(node)} = `
  if (!folded) return `${head}${aliasBody(node.type, head)}`.replace(/= \n/, '=\n')
  // The members are listed in the table below; the alias says how they combine.
  const parts = ts.isIntersectionTypeNode(node.type) ? node.type.types : [node.type]
  return `${head}${parts.map((part) => (ts.isTypeLiteralNode(part) ? '{ … }' : printed(part))).join(' & ')}`
}

interface Shape {
  signature: string
  members: MemberDoc[]
  /** Type and optionality of each parameter of a single-signature function, for its `@param` fields. */
  parameters?: Map<string, { type: string; optional: boolean }>
}

function parameterTypes(signature: ts.Signature, at: ts.Node, checker: ts.TypeChecker): Map<string, { type: string; optional: boolean }> {
  const own = ownDeclaration(signature, at)
  const types = new Map<string, { type: string; optional: boolean }>()
  for (const param of signature.parameters) {
    const declaration = param.valueDeclaration && ts.isParameter(param.valueDeclaration) ? param.valueDeclaration : undefined
    const optional = Boolean(declaration && (declaration.questionToken || declaration.initializer))
    const type = own && declaration?.type ? written(declaration.type) : oneLine(checker.getTypeOfSymbolAtLocation(param, at), at, checker)
    types.set(param.name, { type: optional ? type.replace(/ \| undefined$/, '') : type, optional })
  }
  return types
}

function typeShape(name: string, symbol: ts.Symbol, checker: ts.TypeChecker): Shape {
  const declaration = symbol.declarations?.[0]
  if (declaration && ts.isTypeAliasDeclaration(declaration)) {
    const members = literalParts(declaration.type).flatMap((part) => ownMembers(part.members, checker))
    return { signature: aliasSignature(name, declaration, members.length > 0), members }
  }
  if (declaration && ts.isEnumDeclaration(declaration)) {
    return { signature: printed(declaration).replace(/^export (?:declare )?/, ''), members: [] }
  }
  const interfaces = ownInterfaceDeclarations(symbol)
  const first = interfaces[0]
  if (!first) return { signature: `type ${name}`, members: [] }
  return {
    signature: `interface ${name}${typeParametersText(first)}${heritageText(first)}`,
    members: interfaces.flatMap((node) => ownMembers(node.members, checker)),
  }
}

function shapeOf(name: string, symbol: ts.Symbol, group: ExportGroup, checker: ts.TypeChecker): Shape {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0]
  if (!declaration) return { signature: name, members: [] }
  if (group === 'type') return typeShape(name, symbol, checker)
  if (group === 'class' && ts.isClassDeclaration(declaration))
    return { signature: classSignature(name, declaration), members: ownMembers(declaration.members, checker) }

  return valueShape(name, declaration, checker.getTypeOfSymbolAtLocation(symbol, declaration), checker, group)
}

/* ------------------------------------------------------------------------------- package */

/** The workspace package whose directory holds `file`, by `packages/<dir>`. */
function ownerOf(file: string, owners: Map<string, string>): string {
  const match = /^packages\/([^/]+)\//.exec(relative(repoRoot, file).replaceAll('\\', '/'))
  return match ? (owners.get(match[1]!) ?? '') : ''
}

function exportDoc(name: string, symbol: ts.Symbol, checker: ts.TypeChecker, owners: Map<string, string>): ExportDoc {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0]
  const valueType = symbol.flags & ts.SymbolFlags.Value && declaration ? checker.getTypeOfSymbolAtLocation(symbol, declaration) : null
  const group = groupOf(name, symbol, valueType)
  const doc = docOf(symbol, checker)
  const shape = shapeOf(name, symbol, group, checker)
  const owner = declaration ? ownerOf(declaration.getSourceFile().fileName, owners) : ''

  return {
    name,
    group,
    signature: shape.signature,
    description: doc.description,
    params: doc.params.map((param) => ({ ...param, ...shape.parameters?.get(param.name) })),
    returns: doc.returns,
    examples: doc.examples,
    deprecated: doc.deprecated,
    members: shape.members,
    owner,
    key: `${owner}#${symbol.getName()}`,
    id: `${declaration ? relative(repoRoot, declaration.getSourceFile().fileName) : ''}#${symbol.getName()}`,
  }
}

/**
 * Every entry point of one package, its exports in reader order.
 *
 * @param owners `packages/<dir>` name → package name, to tell an own export from a re-export
 */
export function readPackageDocs(pkgDir: string, pkg: PackageManifest, owners: Map<string, string>): EntryDoc[] {
  const entryFiles = [...entryPoints(pkgDir, pkg)].sort(([a], [b]) => a.localeCompare(b))
  if (entryFiles.length === 0) return []

  const program = createSurfaceProgram(
    pkgDir,
    entryFiles.map(([, file]) => file),
  )
  const checker = program.getTypeChecker()

  return entryFiles.map(([subpath, file]) => {
    const source = program.getSourceFile(join(pkgDir, file))
    const moduleSymbol = source ? checker.getSymbolAtLocation(source) : undefined
    const exported = moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []

    return {
      subpath,
      specifier: `${pkg.name}${subpath === '.' ? '' : subpath.slice(1)}`,
      exports: exported
        .map((symbol) => exportDoc(symbol.getName(), resolveAlias(symbol, checker), checker, owners))
        .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name)),
    }
  })
}
