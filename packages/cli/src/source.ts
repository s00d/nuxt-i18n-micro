import { readFileSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import { babelParse, parse as parseSfc, walk } from '@vue/compiler-sfc'
import { walkFiles } from './fs'
import type { ProjectConfig } from './nuxt'

const SOURCE_EXTENSIONS = new Set(['.vue', '.js', '.ts', '.jsx', '.tsx'])
const GLOBAL_DIRS = ['components', 'layouts', 'plugins', 'composables', 'utils']
const NODE_TYPES = { ELEMENT: 1, ATTRIBUTE: 6, DIRECTIVE: 7, INTERPOLATION: 5 }

const TRANSLATION_CALLS = new Set(['$t', '$ts', '$tc', '$has'])
/** Plain `t()` is `useI18n()`'s; in a file without `useI18n` it is somebody else's function. */
const COMPOSABLE_CALLS = new Set(['t', 'ts', 'tc', 'has'])

export const isSourceFile = (path: string): boolean => SOURCE_EXTENSIONS.has(extname(path).toLowerCase())

const sourceRoots = (config: ProjectConfig): string[] => [...new Set([config.srcDir, config.rootDir])]

/** Files under `dirs` of the source root (Nuxt 4 `app/`) and of the project root. */
export function projectSources(config: ProjectConfig, dirs: string[]): string[] {
  const files = sourceRoots(config).flatMap((root) => dirs.flatMap((dir) => walkFiles(join(root, dir), isSourceFile)))
  return [...new Set(files)]
}

export const allProjectSources = (config: ProjectConfig): string[] => projectSources(config, ['pages', ...GLOBAL_DIRS])

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
  return String(object?.name ?? asNode(object?.property)?.name ?? '')
}

export function isTranslationCall(callee: AstNode | undefined, composableInFile: boolean): boolean {
  const name = calleeName(callee)
  if (!name) return false
  if (TRANSLATION_CALLS.has(name)) return true
  if (!COMPOSABLE_CALLS.has(name)) return false
  if (callee?.type === 'Identifier') return composableInFile
  return /i18n$/i.test(objectName(callee))
}

function collectArgument(argument: AstNode | undefined, code: string, file: string, usage: KeyUsage): void {
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
  const expression = code.slice(argument.start, argument.end)
  const quasis = argument.quasis as Array<{ value: { cooked: string } }> | undefined
  usage.dynamic.push({ file, expression, prefix: quasis?.[0]?.value.cooked ?? '' })
}

export function parseCode(code: string): unknown | null {
  try {
    return babelParse(code, { sourceType: 'module', errorRecovery: true, plugins: ['typescript', 'jsx'] })
  } catch {
    return null
  }
}

function collectFromCode(code: string, file: string, usage: KeyUsage, composableInFile: boolean): void {
  const ast = parseCode(code)
  if (!ast) return
  walk(ast as Parameters<typeof walk>[0], {
    enter(node: unknown) {
      const current = node as unknown as AstNode
      if (current.type !== 'CallExpression' && current.type !== 'OptionalCallExpression') return
      if (!isTranslationCall(asNode(current.callee), composableInFile)) return
      collectArgument((current.arguments as AstNode[])[0], code, file, usage)
    },
  })
}

function collectFromExpression(expression: string, file: string, usage: KeyUsage, composable: boolean): void {
  if (!/\b(?:\$?t[sc]?|\$has|has)\s*\(/.test(expression)) return
  // Parenthesized first so `{ a: $t('x') }` reads as an object, not as a block with a label.
  const ast = parseCode(`(${expression}\n)`)
  const isExpression = ast && !(ast as { errors?: unknown[] }).errors?.length
  collectFromCode(isExpression ? `(${expression}\n)` : expression, file, usage, composable)
}

function collectFromProp(prop: unknown, tag: string, file: string, usage: KeyUsage, composable: boolean): void {
  const current = prop as {
    type: number
    name: string
    value?: { content: string }
    exp?: { content?: string }
    forParseResult?: { source?: { content?: string } }
  }
  if (current.type === NODE_TYPES.ATTRIBUTE && current.name === 'keypath' && /^i18n-?t$/i.test(tag) && current.value) {
    usage.keys.add(current.value.content)
  }
  if (current.type !== NODE_TYPES.DIRECTIVE) return
  const expression = current.forParseResult?.source?.content ?? current.exp?.content
  if (expression) collectFromExpression(expression, file, usage, composable)
}

function collectFromTemplate(node: unknown, file: string, usage: KeyUsage, composable: boolean): void {
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
  const composable = content.includes('useI18n')
  if (!file.endsWith('.vue')) {
    collectFromCode(content, file, usage, composable)
    return usage
  }
  const { descriptor } = parseSfc(content, { filename: file })
  if (descriptor.template?.ast) collectFromTemplate(descriptor.template.ast, file, usage, composable)
  for (const block of [descriptor.script, descriptor.scriptSetup]) {
    if (block) collectFromCode(block.content, file, usage, composable)
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

  for (const root of sourceRoots(config)) {
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

  for (const file of projectSources(config, GLOBAL_DIRS)) {
    const found = collectKeys(readFileSync(file, 'utf8'), file)
    for (const key of found.keys) usage.global.add(key)
    usage.dynamic.push(...found.dynamic)
    usage.files += 1
  }
  return usage
}
