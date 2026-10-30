import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative, sep } from 'node:path'
import { babelParse, parse as parseSfc, walk } from '@vue/compiler-sfc'
import { walkFiles } from './fs'
import type { ProjectConfig } from './nuxt'

const SOURCE_EXTENSIONS = new Set(['.vue', '.js', '.ts', '.jsx', '.tsx'])
const GLOBAL_DIRS = ['components', 'layouts', 'plugins', 'composables', 'utils', 'middleware', 'stores', 'store', 'server']
const ROOT_FILES = ['app.vue', 'error.vue', 'app.config.ts']
const REWRITABLE_DIRS = ['pages', 'components', 'plugins', 'layouts']
const NODE_TYPES = { ELEMENT: 1, ATTRIBUTE: 6, DIRECTIVE: 7, INTERPOLATION: 5 }

const TRANSLATION_CALLS = new Set(['$t', '$ts', '$tc', '$has'])
/** Plain `t()` is `useI18n()`'s; in a file without `useI18n` it is somebody else's function. */
const COMPOSABLE_CALLS = ['t', 'ts', 'tc', 'has']
const NO_NAMES: ReadonlySet<string> = new Set()
const DESTRUCTURED_I18N = /\{([^{}]*)\}\s*=\s*useI18n\s*\(/g

/** Names that translate in this file, aliases included: `const { t: tr } = useI18n()`. */
export function composableNames(content: string): ReadonlySet<string> {
  if (!/useI18n|i18n-?group/i.test(content)) return NO_NAMES
  const names = new Set(COMPOSABLE_CALLS)
  for (const match of content.matchAll(DESTRUCTURED_I18N)) {
    for (const part of match[1]!.split(',')) {
      const [original, alias] = part.split(':').map((text) => text.trim())
      if (alias && COMPOSABLE_CALLS.includes(original!)) names.add(alias)
    }
  }
  return names
}

export const ALL_COMPOSABLE_NAMES: ReadonlySet<string> = new Set(COMPOSABLE_CALLS)

export const isSourceFile = (path: string): boolean => SOURCE_EXTENSIONS.has(extname(path).toLowerCase())

const sourceRoots = (config: ProjectConfig): string[] => [...new Set([config.srcDir, config.rootDir])]

/** A layer's pages count too: an app key may be used only there. */
const scanRoots = (config: ProjectConfig): string[] => {
  const layers = config.translationDirs.flatMap((dir) => [dirname(dir), join(dirname(dir), 'app')])
  return [...new Set([...sourceRoots(config), ...layers])]
}

const sourcesIn = (roots: string[], dirs: string[]): string[] => [
  ...new Set(roots.flatMap((root) => dirs.flatMap((dir) => walkFiles(join(root, dir), isSourceFile)))),
]

const rootFilesIn = (roots: string[]): string[] =>
  roots.flatMap((root) => ROOT_FILES.map((name) => join(root, name))).filter((file) => existsSync(file))

/** Everything of the app itself that can use a key. */
export const allProjectSources = (config: ProjectConfig): string[] => {
  const roots = sourceRoots(config)
  return [...sourcesIn(roots, ['pages', ...GLOBAL_DIRS]), ...rootFilesIn(roots)]
}

/** What `text-to-i18n` may rewrite: places where `$t` is in scope, not composables or server code. */
export const rewritableSources = (config: ProjectConfig): string[] => sourcesIn(sourceRoots(config), REWRITABLE_DIRS)

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

export interface DynamicKey {
  file: string
  expression: string
  /** Static text before the first interpolation: every key under it may be in use. */
  prefix: string
}

export interface KeyUsage {
  keys: Set<string>
  dynamic: DynamicKey[]
}

export interface AstNode {
  type: string
  start?: number
  end?: number
  [key: string]: unknown
}

const asNode = (value: unknown): AstNode | undefined => value as AstNode | undefined

export function staticString(node: AstNode | undefined): string | null {
  if (node?.type === 'StringLiteral') return node.value as string
  const quasis = node?.quasis as Array<{ value: { cooked: string } }> | undefined
  if (node?.type === 'TemplateLiteral' && quasis?.length === 1) return quasis[0]!.value.cooked
  return null
}

function calleeName(callee: AstNode | undefined): string | null {
  if (callee?.type === 'Identifier') return callee.name as string
  if ((callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') && !callee.computed) {
    return asNode(callee.property)?.name as string
  }
  return null
}

function objectName(callee: AstNode | undefined): string {
  const object = asNode(callee?.object)
  return String(object?.name ?? asNode(object?.property)?.name ?? asNode(object?.callee)?.name ?? '')
}

export function isTranslationCall(callee: AstNode | undefined, names: ReadonlySet<string>): boolean {
  const name = calleeName(callee)
  if (!name) return false
  if (TRANSLATION_CALLS.has(name)) return true
  if (callee?.type === 'Identifier') return names.has(name)
  return ALL_COMPOSABLE_NAMES.has(name) && /i18n$/i.test(objectName(callee))
}

const TYPE_WRAPPERS = new Set(['TSAsExpression', 'TSTypeAssertion', 'TSNonNullExpression', 'TSSatisfiesExpression', 'ParenthesizedExpression'])

/** `$t('a' as string)` is still the key `a`. */
const unwrap = (node: AstNode | undefined): AstNode | undefined => (node && TYPE_WRAPPERS.has(node.type) ? unwrap(asNode(node.expression)) : node)

function collectArgument(wrapped: AstNode | undefined, code: string, file: string, usage: KeyUsage): void {
  const argument = unwrap(wrapped)
  const literal = staticString(argument)
  if (literal !== null) {
    usage.keys.add(literal)
    return
  }
  if (argument?.type === 'ConditionalExpression') {
    collectArgument(asNode(argument.consequent), code, file, usage)
    collectArgument(asNode(argument.alternate), code, file, usage)
    return
  }
  if (!argument) return
  usage.dynamic.push({ file, expression: code.slice(argument.start, argument.end), prefix: staticPrefix(argument) })
}

/** `\`a.${x}\`` and `'a.' + x` both pin down `a.`. */
function staticPrefix(node: AstNode | undefined): string {
  if (node?.type === 'BinaryExpression') return staticPrefix(asNode(node.left))
  const quasis = node?.quasis as Array<{ value: { cooked: string } }> | undefined
  return quasis?.[0]?.value.cooked ?? staticString(node) ?? ''
}

/** JSX only where the file allows it: in plain TypeScript `<string>x` is a cast. */
export function parseCode(code: string, lang = 'ts'): unknown | null {
  const plugins: Array<'typescript' | 'jsx' | 'decorators'> = ['typescript', 'decorators']
  if (/x$/.test(lang)) plugins.push('jsx')
  try {
    return babelParse(code, { sourceType: 'module', errorRecovery: true, plugins })
  } catch {
    return null
  }
}

const CALL_TEXT = /(?:\$t|\$ts|\$tc|\$has|\bt|\bts|\btc)\s*\(\s*['"`]([^'"`$]+)['"`]/g

/** For what no parser here reads, such as Pug templates: finding a key too many is the safe mistake. */
function collectFromText(code: string, usage: KeyUsage): void {
  for (const match of code.matchAll(CALL_TEXT)) usage.keys.add(match[1]!)
}

function collectFromCode(code: string, file: string, usage: KeyUsage, composable: ReadonlySet<string>, lang = 'ts'): void {
  const ast = parseCode(code, lang)
  if (!ast) {
    collectFromText(code, usage)
    return
  }
  walk(ast as Parameters<typeof walk>[0], {
    enter(node: unknown) {
      const current = node as unknown as AstNode
      if (current.type !== 'CallExpression' && current.type !== 'OptionalCallExpression') return
      if (!isTranslationCall(asNode(current.callee), composable)) return
      collectArgument((current.arguments as AstNode[])[0], code, file, usage)
    },
  })
}

function collectFromExpression(expression: string, file: string, usage: KeyUsage, composable: ReadonlySet<string>): void {
  if (!expression.includes('(')) return
  // Parenthesized first so `{ a: $t('x') }` reads as an object, not as a block with a label.
  const ast = parseCode(`(${expression}\n)`)
  const isExpression = ast && !(ast as { errors?: unknown[] }).errors?.length
  collectFromCode(isExpression ? `(${expression}\n)` : expression, file, usage, composable)
}

function collectFromProp(prop: unknown, tag: string, file: string, usage: KeyUsage, composable: ReadonlySet<string>): void {
  const current = prop as {
    type: number
    name: string
    value?: { content: string }
    exp?: { content?: string }
    arg?: { content?: string }
    forParseResult?: { source?: { content?: string } }
  }
  if (current.type === NODE_TYPES.ATTRIBUTE && current.name === 'keypath' && /^i18n-?t$/i.test(tag) && current.value) {
    usage.keys.add(current.value.content)
  }
  if (current.type === NODE_TYPES.ATTRIBUTE && current.name === 'prefix' && /^i18n-?group$/i.test(tag) && current.value) {
    usage.dynamic.push({ file, expression: `<${tag} prefix="${current.value.content}">`, prefix: current.value.content })
  }
  if (current.type !== NODE_TYPES.DIRECTIVE) return
  const expression = current.forParseResult?.source?.content ?? current.exp?.content
  if (expression && current.arg?.content === 'keypath' && /^i18n-?t$/i.test(tag)) {
    collectFromCode(`$t(${expression}\n)`, file, usage, composable)
    return
  }
  if (expression) collectFromExpression(expression, file, usage, composable)
}

function collectFromTemplate(node: unknown, file: string, usage: KeyUsage, composable: ReadonlySet<string>): void {
  const current = node as { type?: number; tag?: string; content?: { content?: string }; props?: unknown[]; children?: unknown[] }
  if (current.type === NODE_TYPES.INTERPOLATION && current.content?.content) {
    collectFromExpression(current.content.content, file, usage, composable)
  }
  if (current.type === NODE_TYPES.ELEMENT) {
    for (const prop of current.props ?? []) collectFromProp(prop, current.tag ?? '', file, usage, composable)
  }
  for (const child of current.children ?? []) collectFromTemplate(child, file, usage, composable)
}

/** Translation keys a source file uses. Parses instead of matching text, so comments and strings do not count. */
export function collectKeys(content: string, file: string): KeyUsage {
  const usage: KeyUsage = { keys: new Set(), dynamic: [] }
  const composable = composableNames(content)
  if (!file.endsWith('.vue')) {
    collectFromCode(content, file, usage, composable, extname(file).slice(1))
    return usage
  }
  const { descriptor } = parseSfc(content, { filename: file })
  const { template } = descriptor
  if (template?.ast && (!template.lang || template.lang === 'html')) collectFromTemplate(template.ast, file, usage, composable)
  else if (template) collectFromText(template.content, usage)
  for (const block of [descriptor.script, descriptor.scriptSetup]) {
    if (block) collectFromCode(block.content, file, usage, composable, block.lang ?? 'ts')
  }
  return usage
}

export interface ProjectUsage {
  global: Set<string>
  pages: Record<string, Set<string>>
  dynamic: DynamicKey[]
  files: number
}

/** Keys per page, and keys of everything rendered on any page. */
export function scanProject(config: ProjectConfig): ProjectUsage {
  const usage: ProjectUsage = { global: new Set(), pages: {}, dynamic: [], files: 0 }

  const roots = scanRoots(config)
  for (const root of roots) {
    const pagesRoot = join(root, 'pages')
    for (const file of walkFiles(pagesRoot, isSourceFile)) {
      const content = readFileSync(file, 'utf8')
      const found = collectKeys(content, file)
      const scope = pageScopeOf(file, pagesRoot, content)
      usage.pages[scope] = new Set([...(usage.pages[scope] ?? []), ...found.keys])
      usage.dynamic.push(...found.dynamic)
      usage.files += 1
    }
  }

  for (const file of [...sourcesIn(roots, GLOBAL_DIRS), ...rootFilesIn(roots)]) {
    const found = collectKeys(readFileSync(file, 'utf8'), file)
    for (const key of found.keys) usage.global.add(key)
    usage.dynamic.push(...found.dynamic)
    usage.files += 1
  }
  return usage
}
