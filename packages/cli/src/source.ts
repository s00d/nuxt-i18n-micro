import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { basename, dirname, extname, relative, sep } from 'node:path'
import { babelParse, parse as parseSfc, walk } from '@vue/compiler-sfc'
import { globToRegExp, readText, walkFiles } from './fs'
import type { ProjectConfig } from './nuxt'

const CODE_EXTENSIONS = new Set(['.vue', '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.mts', '.cts'])
/** Text no parser here reads. Keys in it still count as evidence of use. */
const TEMPLATE_EXTENSIONS = new Set(['.html', '.pug'])
const DATA_EXTENSIONS = new Set(['.json', '.yaml', '.yml', '.md', '.mdx'])
const SKIPPED_DIRS = new Set(['node_modules', '.git', '.nuxt', '.output', '.data', '.cache', '.vercel', '.netlify', '.idea', '.vscode'])
/** Build output by these names only at a root: `pages/dist/` is a page. */
const OUTPUT_DIRS = new Set(['dist', 'coverage'])
const SKIPPED_DATA = /^(package(-lock)?\.json|pnpm-lock\.yaml|yarn\.lock|tsconfig.*\.json)$/
/** Test code by location, relative to the project root. `pages/tests/` is a route. */
const TEST_DIR = /^(tests?|__tests__|e2e|cypress|playwright)\//
/** Test code by name. Only code: `Latest.spec.vue` renders. */
const TEST_NAME = /\.(test|spec)\.[cm]?[jt]sx?$/
export const NODE_TYPES = { ELEMENT: 1, TEXT: 2, COMMENT: 3, INTERPOLATION: 5, ATTRIBUTE: 6, DIRECTIVE: 7 }

export const isCodeFile = (path: string): boolean => CODE_EXTENSIONS.has(extname(path).toLowerCase())

type Family = 'key' | 'guard' | 'bound'

/** The translation API by name. `bound` returns a key function for a route: `$_t(route)('key')`. */
const DOLLAR_NAMES: ReadonlyArray<[string, Family]> = [
  ['$t', 'key'],
  ['$ts', 'key'],
  ['$tc', 'key'],
  ['$has', 'guard'],
  ['$_t', 'bound'],
  ['$_ts', 'bound'],
]
/** `useI18n()` also returns these. In a file without `useI18n` a plain `t()` is somebody else's function. */
const BARE_NAMES: ReadonlyArray<[string, Family]> = [
  ['t', 'key'],
  ['ts', 'key'],
  ['tc', 'key'],
  ['has', 'guard'],
  ['_t', 'bound'],
  ['_ts', 'bound'],
]
const API_NAMES = new Map<string, Family>([...DOLLAR_NAMES, ...BARE_NAMES])
const I18N_SOURCES = new Set(['useI18n', 'useNuxtApp'])
/** Resolves to the `t` function itself. */
const SERVER_T = 'useTranslationServerMiddleware'
const KEY_LIKE = /^[^\s'"`<>{}()]{1,200}$/

export interface KeyRef {
  key: string
  file: string
  line: number
  /** The key's text in the file, without quotes. -1 when it came from text no parser read. */
  start: number
  end: number
  /** `$has` asks whether a key exists: it does not need one to exist. */
  guard: boolean
  /** Text after `$t(key, params, 'text')`. */
  defaultText?: string
  /** Inside `<i18n-group>` the code holds only the part after this. */
  keyPrefix?: string
}

export interface DynamicKey {
  file: string
  line: number
  expression: string
  /** Static text before the first interpolation: every key under it may be in use. */
  prefix: string
  /** `<i18n-group prefix>`: a known prefix, not a key computed at runtime. */
  group?: boolean
}

export interface FileScan {
  refs: KeyRef[]
  dynamic: DynamicKey[]
  /** Strings that look like a key, and where each one is: a key can travel through a variable. */
  literals: Map<string, string[]>
  /** Strings ending in a dot: `'errors.' + code`. */
  prefixes: Set<string>
  /** Why this file could not be read completely. */
  unproven: string[]
}

interface Names {
  families: Map<string, Family>
  /** Names that hold the function itself: used as a value, the keys it receives cannot be seen. */
  values: Set<string>
  /** `const i18n = useI18n()`. */
  objects: Set<string>
}

export interface AstNode {
  type: string
  start?: number
  end?: number
  [key: string]: unknown
}

interface Context {
  content: string
  file: string
  scan: FileScan
  names: Names
  /** What `node.start` is added to, to be an offset in the file. */
  base: number
  group: Group | null
  /** String nodes that are the argument of a call: keys, not plain strings. */
  keyNodes: WeakSet<object>
}

interface Group {
  prefix: string
  names: Set<string>
}

const asNode = (value: unknown): AstNode | undefined => value as AstNode | undefined

export const lineOf = (content: string, offset: number): number => content.slice(0, Math.max(0, offset)).split('\n').length

export function staticString(node: AstNode | undefined): string | null {
  if (node?.type === 'StringLiteral') return node.value as string
  const quasis = node?.quasis as Array<{ value: { cooked: string } }> | undefined
  if (node?.type === 'TemplateLiteral' && quasis?.length === 1) return quasis[0]!.value.cooked
  return null
}

const propertyName = (callee: AstNode | undefined): string | null => {
  const isMember = callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression'
  return isMember && !callee.computed ? ((asNode(callee.property)?.name as string | undefined) ?? null) : null
}

/** `i18n`, `this.$i18n`, `useI18n()`: the name a member call hangs off. */
function objectName(callee: AstNode | undefined): string {
  const object = asNode(callee?.object)
  return String(object?.name ?? asNode(object?.property)?.name ?? asNode(object?.callee)?.name ?? '')
}

const isI18nObject = (name: string, names: Names): boolean => /i18n$/i.test(name) || names.objects.has(name) || I18N_SOURCES.has(name)

function familyOf(callee: AstNode | undefined, names: Names): Family | null {
  if (callee?.type === 'Identifier') return names.families.get(callee.name as string) ?? null
  if (callee?.type === 'CallExpression' || callee?.type === 'OptionalCallExpression') {
    return familyOf(asNode(callee.callee), names) === 'bound' ? 'key' : null
  }
  const name = propertyName(callee)
  if (!name) return null
  const family = API_NAMES.get(name) ?? null
  return family && (name.startsWith('$') || isI18nObject(objectName(callee), names)) ? family : null
}

const unawaited = (node: AstNode | undefined): AstNode | undefined => (node?.type === 'AwaitExpression' ? asNode(node.argument) : node)

const isServerT = (node: AstNode | undefined): boolean => {
  const call = unawaited(node)
  return call?.type === 'CallExpression' && asNode(call.callee)?.name === SERVER_T
}

function isI18nSource(node: AstNode | undefined, names: Names): boolean {
  if (node?.type === 'AwaitExpression') return isI18nSource(asNode(node.argument), names)
  if (node?.type === 'Identifier') return isI18nObject(node.name as string, names)
  return node?.type === 'CallExpression' && I18N_SOURCES.has(asNode(node.callee)?.name as string)
}

/** `useTranslationServerMiddleware(event).then((tr) => ...)`. */
function readServerThen(node: AstNode, names: Names): void {
  const callee = asNode(node.callee)
  if (propertyName(callee) !== 'then' || !isServerT(asNode(callee?.object))) return
  const params = asNode((node.arguments as AstNode[])[0])?.params as AstNode[] | undefined
  if (params?.[0]) addAlias(params[0], 't', names)
}

function addAlias(local: AstNode | undefined, original: string, names: Names): void {
  const family = API_NAMES.get(original)
  const target = local?.type === 'AssignmentPattern' ? asNode(local.left) : local
  if (!family || target?.type !== 'Identifier') return
  names.families.set(target.name as string, family)
  names.values.add(target.name as string)
}

function readDeclarator(node: AstNode, names: Names): void {
  const id = asNode(node.id)
  const init = asNode(node.init)
  if (id?.type === 'ObjectPattern' && isI18nSource(init, names)) {
    for (const prop of id.properties as AstNode[]) addAlias(asNode(prop.value), asNode(prop.key)?.name as string, names)
    return
  }
  if (id?.type !== 'Identifier') return
  if (isServerT(init)) {
    addAlias(id, 't', names)
    return
  }
  if (isI18nSource(init, names)) {
    names.objects.add(id.name as string)
    return
  }
  const family = init?.type === 'CallExpression' ? (familyOf(asNode(init.callee), names) === 'bound' ? 'key' : null) : familyOf(init, names)
  if (!family) return
  names.families.set(id.name as string, family)
  names.values.add(id.name as string)
}

/** Aliases first: a template or a later function uses what the script declares. */
function readNames(ast: unknown, names: Names): void {
  walk(ast as Parameters<typeof walk>[0], {
    enter(raw: unknown) {
      const node = raw as unknown as AstNode
      if (node.type === 'VariableDeclarator') readDeclarator(node, names)
      if (node.type === 'CallExpression') readServerThen(node, names)
    },
  })
}

function newNames(content: string): Names {
  const bare = /useI18n|useTranslationServerMiddleware|i18n-?group/i.test(content)
  return {
    families: new Map([...DOLLAR_NAMES, ...(bare ? BARE_NAMES : [])]),
    values: new Set(DOLLAR_NAMES.map(([name]) => name)),
    objects: new Set(),
  }
}

const TYPE_WRAPPERS = new Set(['TSAsExpression', 'TSTypeAssertion', 'TSNonNullExpression', 'TSSatisfiesExpression', 'ParenthesizedExpression'])

/** `$t('a' as string)` is still the key `a`. */
const unwrap = (node: AstNode | undefined): AstNode | undefined => (node && TYPE_WRAPPERS.has(node.type) ? unwrap(asNode(node.expression)) : node)

/** `\`a.${x}\`` and `'a.' + x` both pin down `a.`. */
function staticPrefix(node: AstNode | undefined): string {
  if (node?.type === 'BinaryExpression') return staticPrefix(asNode(node.left))
  const quasis = node?.quasis as Array<{ value: { cooked: string } }> | undefined
  return quasis?.[0]?.value.cooked ?? staticString(node) ?? ''
}

function addRef(literal: string, node: AstNode, context: Context, extra: Pick<KeyRef, 'guard' | 'defaultText'>, inGroup: boolean): void {
  const { base, content, file, group, keyNodes, scan } = context
  keyNodes.add(node)
  const start = base + node.start! + 1
  const keyPrefix = inGroup ? `${group!.prefix}.` : undefined
  scan.refs.push({ key: `${keyPrefix ?? ''}${literal}`, file, line: lineOf(content, start), start, end: start + literal.length, keyPrefix, ...extra })
}

function addArgument(wrapped: AstNode | undefined, context: Context, extra: Pick<KeyRef, 'guard' | 'defaultText'>, inGroup: boolean): void {
  const argument = unwrap(wrapped)
  if (!argument) return
  const literal = staticString(argument)
  if (literal !== null) {
    addRef(literal, argument, context, extra, inGroup)
    return
  }
  if (argument.type === 'ConditionalExpression') {
    addArgument(asNode(argument.consequent), context, extra, inGroup)
    addArgument(asNode(argument.alternate), context, extra, inGroup)
    return
  }
  if (argument.type === 'LogicalExpression') {
    addArgument(asNode(argument.left), context, extra, inGroup)
    addArgument(asNode(argument.right), context, extra, inGroup)
    return
  }
  const { base, content, file, scan, group } = context
  const start = base + argument.start!
  const prefix = `${inGroup ? `${group!.prefix}.` : ''}${staticPrefix(argument)}`
  scan.dynamic.push({ file, line: lineOf(content, start), expression: content.slice(start, base + argument.end!), prefix })
}

function addLiteral(text: string, scan: FileScan, location: string): void {
  if (!KEY_LIKE.test(text)) return
  if (text.endsWith('.')) scan.prefixes.add(text)
  else scan.literals.set(text, [...(scan.literals.get(text) ?? []), location])
}

const NOT_A_GUARD = { guard: false }

function addOpaque(expression: string, node: AstNode, context: Context): void {
  const { base, content, file, scan } = context
  scan.dynamic.push({ file, line: lineOf(content, base + node.start!), expression, prefix: '' })
}

/** `<i18n-t keypath={x} />` and `<i18n-t {...x} />` in JSX. */
function visitJsx(node: AstNode, context: Context): void {
  const tag = String(asNode(node.name)?.name ?? '')
  if (!/^i18n-?(t|group)$/i.test(tag)) return
  const attributes = node.attributes as AstNode[]
  for (const attribute of attributes) {
    if (attribute.type === 'JSXSpreadAttribute') addOpaque(`<${tag} {...}>`, attribute, context)
    if (attribute.type !== 'JSXAttribute') continue
    const name = asNode(attribute.name)?.name
    const value = asNode(attribute.value)
    if (name === 'keypath' || name === 'prefix')
      addArgument(value?.type === 'JSXExpressionContainer' ? asNode(value.expression) : value, context, NOT_A_GUARD, false)
  }
}

/** A `keypath` in an object is a key on its way to `<i18n-t>`: `h(I18nT, { keypath })`, `v-bind="{ keypath }"`. */
function visitProperty(node: AstNode, context: Context): void {
  if (asNode(node.key)?.name === 'keypath' && !node.computed) addArgument(asNode(node.value), context, NOT_A_GUARD, false)
}

/** `t(name)` with `t` from who knows where: a wrapper composable, most likely. It may be a translation. */
const BARE_KEY_CALL = new Set(BARE_NAMES.filter(([, family]) => family === 'key').map(([name]) => name))

function visitUnknownCall(callee: AstNode | undefined, argument: AstNode | undefined, context: Context): void {
  const target = unwrap(argument)
  if (callee?.type !== 'Identifier' || !BARE_KEY_CALL.has(callee.name as string) || !target || staticString(target) !== null) return
  addOpaque(`${callee.name as string}(...) of unknown origin`, target, context)
}

function visitCall(node: AstNode, context: Context): void {
  const callee = asNode(node.callee)
  const inGroup = callee?.type === 'Identifier' && Boolean(context.group?.names.has(callee.name as string))
  const family = inGroup ? 'key' : familyOf(callee, context.names)
  if (family === null) visitUnknownCall(callee, (node.arguments as AstNode[])[0], context)
  if (family !== 'key' && family !== 'guard') return
  const [key, , fallback] = node.arguments as AstNode[]
  addArgument(key, context, { guard: family === 'guard', defaultText: staticString(fallback) ?? undefined }, inGroup)
}

/** Where a name only stands for itself: a declaration, a parameter, a property, a type. */
function isValueUse(parent: AstNode | null, key: unknown, declared: WeakSet<object>, node: AstNode): boolean {
  if (!parent || declared.has(node) || key === 'callee' || key === 'params' || key === 'object' || key === 'id') return false
  if ((key === 'key' || key === 'property') && !parent.computed) return false
  if (parent.type.startsWith('Import') || parent.type.startsWith('Export')) return false
  if (parent.type === 'UnaryExpression' && parent.operator === 'typeof') return false
  return !parent.type.startsWith('TS') || key === 'expression'
}

function declare(node: AstNode | undefined, declared: WeakSet<object>): void {
  if (!node) return
  declared.add(node)
  if (node.type === 'ObjectPattern') for (const prop of node.properties as AstNode[]) declare(asNode(prop.value) ?? prop, declared)
  if (node.type === 'ArrayPattern') for (const element of node.elements as AstNode[]) declare(element ?? undefined, declared)
  if (node.type === 'AssignmentPattern') declare(asNode(node.left), declared)
  if (node.type === 'RestElement') declare(asNode(node.argument), declared)
}

function visitNode(node: AstNode, parent: AstNode | null, key: unknown, context: Context, declared: WeakSet<object>): void {
  const { base, content, file, names, scan } = context
  if (node.type === 'VariableDeclarator') declare(asNode(node.id), declared)
  if (Array.isArray(node.params)) for (const param of node.params as AstNode[]) declare(param, declared)
  if (node.type === 'CallExpression' || node.type === 'OptionalCallExpression') visitCall(node, context)
  if (node.type === 'JSXOpeningElement') visitJsx(node, context)
  if (node.type === 'ObjectProperty') visitProperty(node, context)
  const literal = staticString(node)
  if (literal !== null && !context.keyNodes.has(node)) addLiteral(literal, scan, `${file}:${lineOf(content, base + node.start!)}`)
  if (node.type === 'TemplateLiteral' && literal === null) addLiteral(staticPrefix(node), scan, file)
  if (node.type !== 'Identifier' || !names.values.has(node.name as string) || !isValueUse(parent, key, declared, node)) return
  const start = base + node.start!
  scan.dynamic.push({ file, line: lineOf(content, start), expression: `${node.name as string} passed as a value`, prefix: '' })
}

function visitCode(ast: unknown, context: Context): void {
  const declared = new WeakSet<object>()
  walk(ast as Parameters<typeof walk>[0], {
    enter(raw: unknown, parent: unknown, key: unknown) {
      visitNode(raw as unknown as AstNode, parent as unknown as AstNode | null, key, context, declared)
    },
  })
}

/** JSX only where the file allows it: in plain TypeScript `<string>x` is a cast. */
function tryParse(code: string, plugins: Array<'typescript' | 'jsx' | 'decorators'>): { errors?: unknown[] } | null {
  try {
    return babelParse(code, { sourceType: 'module', errorRecovery: true, plugins }) as unknown as { errors?: unknown[] }
  } catch {
    return null
  }
}

const isClean = (ast: { errors?: unknown[] } | null): boolean => Boolean(ast) && !ast!.errors?.length

/**
 * The syntax tree, or `null` when the code does not parse. A file with a recoverable error
 * (a duplicate declaration, say) still gives a whole tree; `strict` refuses it, for telling
 * an expression from a statement.
 */
export function parseCode(code: string, lang = 'ts', strict = false): unknown | null {
  const first = tryParse(code, /x$/.test(lang) ? ['typescript', 'jsx', 'decorators'] : ['typescript', 'decorators'])
  if (isClean(first)) return first
  const retry = /^[cm]?js$/.test(lang) ? tryParse(code, ['jsx', 'decorators']) : null
  if (isClean(retry)) return retry
  return strict ? null : (first ?? retry)
}

const TEXT_CALL = /(?:\$tc?s?|\$has|\btc?s?)\s*\(\s*(?:['"`]([^'"`$]+)['"`]|([^'"`)\s][^)]*))/g
const DOLLAR_CALL = /^\$/
const QUOTED = /['"`]([^'"`\n]+)['"`]/g

/** For what no parser here reads, such as Pug templates: finding a key too many is the safe mistake. */
function collectFromText(text: string, context: Context, base: number, bareCalls = true): void {
  const { content, file, scan } = context
  for (const match of text.matchAll(TEXT_CALL)) {
    const line = lineOf(content, base + match.index)
    if (match[1]) scan.refs.push({ key: match[1], file, line, start: -1, end: -1, guard: false })
    // Minified code in a stray .html is full of `t(e)` that means nothing here.
    else if (bareCalls || DOLLAR_CALL.test(match[0])) scan.dynamic.push({ file, line, expression: match[2]!.trim(), prefix: '' })
  }
  for (const match of text.matchAll(QUOTED)) addLiteral(match[1]!, scan, `${file}:${lineOf(content, base + match.index)}`)
}

function unproven(context: Context, text: string, base: number, reason: string): void {
  context.scan.unproven.push(reason)
  collectFromText(text, context, base)
}

function scanExpression(expression: string, offset: number, context: Context): void {
  // Parenthesized first so `{ a: $t('x') }` reads as an object, not as a block with a label.
  const wrapped = parseCode(`(${expression}\n)`, 'ts', true)
  const ast = wrapped ?? parseCode(expression)
  if (!ast) {
    unproven(context, expression, offset, `unparsed template expression at line ${lineOf(context.content, offset)}`)
    return
  }
  visitCode(ast, { ...context, base: wrapped ? offset - 1 : offset })
}

interface TemplateProp {
  type: number
  name: string
  value?: { content: string; loc: { source: string; start: { offset: number } } }
  exp?: { content?: string; loc: { start: { offset: number } } }
  arg?: { content?: string }
  loc: { source: string; start: { offset: number } }
  forParseResult?: { source?: { content?: string; loc: { start: { offset: number } } } }
}

interface TemplateElement {
  type?: number
  tag?: string
  content?: { content?: string; loc: { start: { offset: number } } }
  props?: TemplateProp[]
  children?: TemplateElement[]
}

function addKeypathAttribute(prop: TemplateProp, context: Context): void {
  const { file, content, scan } = context
  const { value } = prop
  const quote = /^['"]/.test(value!.loc.source) ? 1 : 0
  const start = value!.loc.start.offset + quote
  scan.refs.push({ key: value!.content, file, line: lineOf(content, start), start, end: start + value!.content.length, guard: false })
}

function addGroupPrefix(prop: TemplateProp, tag: string, context: Context): void {
  const { file, content, scan } = context
  const line = lineOf(content, prop.value!.loc.start.offset)
  scan.dynamic.push({ file, line, expression: `<${tag} prefix="${prop.value!.content}">`, prefix: prop.value!.content, group: true })
}

function readAttribute(prop: TemplateProp, tag: string, context: Context): void {
  if (!prop.value) return
  if (prop.name === 'keypath' && /^i18n-?t$/i.test(tag)) addKeypathAttribute(prop, context)
  else if (prop.name === 'prefix' && /^i18n-?group$/i.test(tag)) addGroupPrefix(prop, tag, context)
  else addLiteral(prop.value.content, context.scan, `${context.file}:${lineOf(context.content, prop.value.loc.start.offset)}`)
}

/** `v-slot="{ t: tr }"` of an `<i18n-group>`: what the block calls the scoped `t`. */
function readSlotNames(expression: string, group: Group): void {
  const ast = parseCode(`(${expression}\n)=>0`)
  if (!ast) return
  walk(ast as Parameters<typeof walk>[0], {
    enter(raw: unknown) {
      const node = raw as unknown as AstNode
      if (node.type !== 'ObjectProperty' || asNode(node.key)?.name !== 't') return
      const local = asNode(node.value)
      if (local?.type === 'Identifier') group.names.add(local.name as string)
    },
  })
}

/** `<i18n-t :keypath />` and `<i18n-t v-bind="p" />`: the key is somewhere the template does not show. */
function readHiddenKey(prop: TemplateProp, tag: string, context: Context): void {
  const translates = /^i18n-?(t|group)$/i.test(tag)
  const target = prop.arg?.content
  const hidden = prop.name === 'bind' && (target === undefined || (!prop.exp?.content && (target === 'keypath' || target === 'prefix')))
  if (!translates || !hidden) return
  const { content, file, scan } = context
  const line = lineOf(content, prop.loc.start.offset)
  scan.dynamic.push({ file, line, expression: `<${tag} ${prop.loc.source}>`, prefix: '' })
}

function readDirective(prop: TemplateProp, tag: string, context: Context): void {
  readHiddenKey(prop, tag, context)
  const expression = prop.forParseResult?.source ?? prop.exp
  if (!expression?.content) return
  const start = expression.loc.start.offset
  if (prop.name === 'slot') {
    if (context.group) readSlotNames(expression.content, context.group)
    return
  }
  const argument = prop.arg?.content
  if (argument === 'keypath' && /^i18n-?t$/i.test(tag)) {
    const ast = parseCode(`$t(${expression.content}\n)`)
    if (ast) visitCode(ast, { ...context, base: start - 3 })
    else unproven(context, expression.content, start, `unparsed :keypath at line ${lineOf(context.content, start)}`)
    return
  }
  if (argument === 'prefix' && /^i18n-?group$/i.test(tag)) {
    const line = lineOf(context.content, start)
    context.scan.dynamic.push({ file: context.file, line, expression: expression.content, prefix: '' })
  }
  scanExpression(expression.content, start, context)
}

function groupOf(node: TemplateElement, context: Context): Context {
  if (!/^i18n-?group$/i.test(node.tag ?? '')) return context
  const prefix = node.props?.find((prop) => prop.type === NODE_TYPES.ATTRIBUTE && prop.name === 'prefix')?.value?.content
  return prefix ? { ...context, group: { prefix, names: new Set() } } : context
}

function visitTemplate(node: TemplateElement, outer: Context): void {
  if (node.type === NODE_TYPES.INTERPOLATION && node.content?.content) scanExpression(node.content.content, node.content.loc.start.offset, outer)
  const context = node.type === NODE_TYPES.ELEMENT ? groupOf(node, outer) : outer
  if (node.type === NODE_TYPES.ELEMENT) {
    for (const prop of node.props ?? []) {
      if (prop.type === NODE_TYPES.ATTRIBUTE) readAttribute(prop, node.tag ?? '', context)
      if (prop.type === NODE_TYPES.DIRECTIVE) readDirective(prop, node.tag ?? '', context)
    }
  }
  for (const child of node.children ?? []) visitTemplate(child, context)
}

function scanVue(content: string, context: Context): void {
  const { descriptor, errors } = parseSfc(content, { filename: context.file })
  const { template, script, scriptSetup } = descriptor
  if (errors.length > 0) context.scan.unproven.push(`SFC parse error: ${String((errors[0] as Error).message)}`)

  const blocks = [script, scriptSetup].flatMap((block) => (block ? [{ block, ast: parseCode(block.content, block.lang ?? 'ts') }] : []))
  for (const { ast } of blocks) if (ast) readNames(ast, context.names)
  for (const { block, ast } of blocks) {
    if (ast) visitCode(ast, { ...context, base: block.loc.start.offset })
    else unproven(context, block.content, block.loc.start.offset, `unparsed <script> in ${basename(context.file)}`)
  }

  if (template?.ast && (!template.lang || template.lang === 'html')) visitTemplate(template.ast as unknown as TemplateElement, context)
  else if (template) collectFromText(template.content, context, template.loc.start.offset)
}

function scanCode(content: string, context: Context): void {
  const ast = parseCode(content, extname(context.file).slice(1).toLowerCase())
  if (!ast) {
    unproven(context, content, 0, `parse error in ${basename(context.file)}`)
    return
  }
  readNames(ast, context.names)
  visitCode(ast, context)
}

/** Every use of a translation key in one file, with positions. Comments do not count. */
export function scanFile(content: string, file: string): FileScan {
  const scan: FileScan = { refs: [], dynamic: [], literals: new Map(), prefixes: new Set(), unproven: [] }
  const context: Context = { content, file, scan, names: newNames(content), base: 0, group: null, keyNodes: new WeakSet() }
  const extension = extname(file).toLowerCase()
  if (content.trim() === '') return scan
  if (extension === '.vue') scanVue(content, context)
  else if (CODE_EXTENSIONS.has(extension)) scanCode(content, context)
  else collectFromText(content, context, 0, false)
  return scan
}

const SEGMENT_TOKEN = /\[{1,2}(?:\.\.\.)?([^\]]+)\]{1,2}/g

/** Route name Nuxt gives a page file: the name of its `locales/pages/<name>/` directory. */
export function pageNameOf(relativePath: string): string {
  const withoutExt = relativePath
    .split(sep)
    .join('/')
    .replace(/\.[^./]+$/, '')
    .replace(/\.(client|server)$/, '')
  const segments = withoutExt
    .split('/')
    .filter((segment) => !/^\(.*\)$/.test(segment))
    .map((segment) => segment.replace(SEGMENT_TOKEN, '$1'))
  if (segments.at(-1) === 'index' && segments.length > 1) segments.pop()
  return segments.join('-') || 'index'
}

const PAGE_META_NAME = /definePageMeta\(\s*\{[^}]*?\bname:\s*['"`]([^'"`]+)['"`]/

export function pageScopeOf(file: string, pagesRoot: string, content: string): string {
  return content.match(PAGE_META_NAME)?.[1] ?? pageNameOf(relative(pagesRoot, file))
}

export interface ScopedRef extends KeyRef {
  /** Route name when the file is a page. */
  page: string | null
  /** A test or a fixture: proof of use, but no reason to add a key. */
  test: boolean
}

export interface ProjectScan {
  refs: ScopedRef[]
  dynamic: DynamicKey[]
  literals: Map<string, string[]>
  prefixes: Set<string>
  /** Words of JSON and YAML files: keys can live in data that code feeds to `$t`. */
  dataTokens: Set<string>
  unproven: Array<{ file: string; reason: string }>
  files: number
}

export interface ScanOptions {
  /** Globs relative to the project root. */
  ignore?: string[]
}

const DATA_TOKEN = /[\p{L}\p{N}_$-]+(?:\.[\p{L}\p{N}_$-]+)*/gu

function collectData(path: string, scan: ProjectScan): void {
  for (const match of readText(path).matchAll(DATA_TOKEN)) scan.dataTokens.add(match[0])
}

/** Everything of the project a key can hide in, once each, whatever folder it lives in. */
export function projectFiles(config: ProjectConfig, options: ScanOptions = {}): string[] {
  const excluded = new Set(config.translationDirs)
  const ignored = (options.ignore ?? []).map(globToRegExp)
  const isIgnored = (path: string): boolean => {
    const rel = relative(config.rootDir, path).split(sep).join('/')
    return ignored.some((pattern) => pattern.test(rel))
  }
  const accept = (path: string): boolean => {
    const extension = extname(path).toLowerCase()
    const known = CODE_EXTENSIONS.has(extension) || TEMPLATE_EXTENSIONS.has(extension) || DATA_EXTENSIONS.has(extension)
    return known && !path.endsWith('.d.ts') && !SKIPPED_DATA.test(basename(path)) && !isIgnored(path)
  }
  const roots = [...new Set([config.rootDir, config.srcDir, ...config.layerRoots, ...config.extraSourceDirs])]
  const skipDir = (path: string): boolean =>
    SKIPPED_DIRS.has(basename(path)) || (OUTPUT_DIRS.has(basename(path)) && roots.includes(dirname(path))) || excluded.has(path) || isIgnored(path)
  // Through a symlink a locale file can sit anywhere. Read as data, every key in it would look used.
  const seen = new Set(config.translationDirs.flatMap((dir) => walkFiles(dir, (path) => path.endsWith('.json')).map((file) => realpathSync(file))))
  return roots
    .flatMap((root) => walkFiles(root, accept, skipDir))
    .filter((file) => {
      const real = realpathSync(file)
      return seen.has(real) ? false : Boolean(seen.add(real))
    })
}

const inTestDir = (config: ProjectConfig, file: string): boolean => TEST_DIR.test(relative(config.rootDir, file).split(sep).join('/'))

export const isTestFile = (config: ProjectConfig, file: string): boolean => inTestDir(config, file) || TEST_NAME.test(file)

function addFile(file: string, config: ProjectConfig, out: ProjectScan): void {
  const content = readFileSync(file, 'utf8')
  const found = scanFile(content, file)
  const pagesRoot = config.pagesDirs.find((dir) => !relative(dir, file).startsWith('..'))
  const page = pagesRoot && isCodeFile(file) ? pageScopeOf(file, pagesRoot, content) : null
  const test = !page && isTestFile(config, file)
  for (const ref of found.refs) out.refs.push({ ...ref, page, test })
  for (const [text, locations] of found.literals) out.literals.set(text, [...(out.literals.get(text) ?? []), ...locations])
  for (const prefix of found.prefixes) out.prefixes.add(prefix)
  out.files += 1
  // A broken fixture says nothing about what the app reads. Anywhere else, a doubt counts.
  if (!page && inTestDir(config, file)) return
  out.dynamic.push(...found.dynamic)
  for (const reason of found.unproven) out.unproven.push({ file, reason })
}

/**
 * Whether a write may touch this source. The scan reads layers and alias targets to prove use;
 * they belong to whoever else builds on them, and their locale files stay as they are.
 */
export function isOwnSource(config: ProjectConfig, file: string): boolean {
  const real = realpathSync(file)
  const inside = (root: string): boolean => !relative(realpathSync(root), real).startsWith('..')
  const layers = config.layerRoots.filter((root) => root !== config.rootDir && existsSync(root))
  return inside(config.rootDir) && !real.includes('/node_modules/') && !layers.some(inside)
}

export function scanProject(config: ProjectConfig, options: ScanOptions = {}): ProjectScan {
  const out: ProjectScan = { refs: [], dynamic: [], literals: new Map(), prefixes: new Set(), dataTokens: new Set(), unproven: [], files: 0 }
  for (const file of projectFiles(config, options)) {
    if (DATA_EXTENSIONS.has(extname(file).toLowerCase())) collectData(file, out)
    else addFile(file, config, out)
  }
  return out
}

const parentsOf = (key: string): string[] => {
  const parts = key.split('.')
  return parts.slice(1).map((_part, index) => parts.slice(0, index + 1).join('.'))
}

/**
 * Whether a key may be read. One answer for `clean`, `check` and `search`.
 *
 * Any trace counts, not only a call: a string equal to the key can reach `$t` through a
 * variable, a prop or a data file. A dead key that stays is a line of noise; a live key that
 * goes is a broken page.
 */
export function usageIndex(scan: ProjectScan): (key: string) => boolean {
  const called = new Set(scan.refs.map((ref) => ref.key))
  // `$t('a.b')` with `{ "a": "x", "a.b": "y" }`: the walk passes through `a`.
  const passedThrough = new Set(scan.refs.flatMap((ref) => parentsOf(ref.key)))
  const prefixes = [...scan.prefixes, ...scan.dynamic.map((entry) => entry.prefix).filter(Boolean)]
  return (key) =>
    called.has(key) ||
    passedThrough.has(key) ||
    scan.literals.has(key) ||
    scan.dataTokens.has(key) ||
    // `$t('a')` reads everything under `a`.
    parentsOf(key).some((parent) => called.has(parent)) ||
    prefixes.some((prefix) => key.startsWith(prefix))
}

/** Why "no source file uses this key" cannot be trusted in this project. Empty when it can. */
export function usageDoubts(scan: ProjectScan): string[] {
  const opaque = scan.dynamic.filter((entry) => !entry.prefix)
  return [
    ...opaque.map(({ file, line, expression }) => `Key computed at runtime in ${file}:${line}: ${expression}`),
    ...scan.unproven.map(({ file, reason }) => `Could not read ${file}: ${reason}`),
    ...(scan.refs.length === 0 ? ['No source file uses any key: the scan is probably looking in the wrong place.'] : []),
  ]
}
