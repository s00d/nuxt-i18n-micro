import { basename, dirname, extname, parse as parsePath, relative, sep } from 'node:path'
import { MagicString, parse as parseSfc, walk } from '@vue/compiler-sfc'
import { type AstNode, isTranslationCall, parseCode, staticString } from './source'

const NODE_TEXT = 2
const NODE_ELEMENT = 1
const NODE_ATTRIBUTE = 6
const NODE_INTERPOLATION = 5

const TEXT_ATTRIBUTES = new Set(['title', 'label', 'placeholder', 'alt', 'aria-label'])
const NON_TEXT_CALLS = new Set([
  'emit',
  '$emit',
  'useFetch',
  '$fetch',
  'useAsyncData',
  'definePageMeta',
  'defineProps',
  'defineEmits',
  'navigateTo',
  'useRoute',
  'import',
  'require',
])
const SKIPPED_PARENTS = new Set([
  'ImportDeclaration',
  'ExportNamedDeclaration',
  'ExportAllDeclaration',
  'TSLiteralType',
  'TSEnumMember',
  'TSExternalModuleReference',
])
const NON_DISPLAY_TAGS = new Set(['script', 'style', 'code', 'pre'])
const KEY_ROOTS = ['pages', 'components', 'plugins', 'layouts']

const CYRILLIC: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

export function toSlug(text: string): string {
  return text
    .replace(/\p{Script=Cyrillic}/gu, (letter) => CYRILLIC[letter.toLowerCase()] ?? letter)
    .replace(/&/g, ' and ')
    .replace(/\$/g, ' dollar ')
    .replace(/%/g, ' percent ')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const keywordsOf = (text: string): string[] =>
  text
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2)
    .slice(0, 3)

/** `pages/blog/index.vue` -> `pages.blog.index`: keys say where their text came from. */
function filePrefix(file: string): string {
  const { dir, name } = parsePath(file)
  const segments = dir.split(sep)
  const rootIndex = segments.findIndex((segment) => KEY_ROOTS.includes(segment))
  if (rootIndex === -1) return 'common'
  return [...segments.slice(rootIndex), name].map(toSlug).join('.')
}

export interface NewTranslation {
  key: string
  value: string
  file: string
  line: number
}

export interface ConvertOptions {
  context?: string
  keyOverrides?: Record<string, string>
  skippedKeys?: string[]
}

/** Shared across files: known text reuses its key, generated keys stay unique. */
export class KeyRegistry {
  readonly created = new Map<string, NewTranslation>()
  private readonly byText = new Map<string, string>()
  private readonly used: Set<string>

  constructor(
    existing: Record<string, string>,
    private readonly options: ConvertOptions = {},
  ) {
    this.used = new Set(Object.keys(existing))
    for (const [key, value] of Object.entries(existing)) this.byText.set(value, key)
  }

  private generate(text: string, file: string): string {
    const slug = toSlug(keywordsOf(text).join(' ')) || toSlug(text.slice(0, 40)) || `key-${this.used.size + 1}`
    const base = [filePrefix(file), this.options.context, slug].filter(Boolean).join('.')
    let key = base
    for (let counter = 1; this.used.has(key); counter += 1) key = `${base}_${counter}`
    this.used.add(key)
    return key
  }

  /** Key for `text`, or `null` when the user skipped it. */
  keyFor(text: string, file: string, content: string): string | null {
    const known = this.byText.get(text)
    if (known) return known
    const generated = this.generate(text, file)
    if (this.options.skippedKeys?.includes(generated)) return null
    const key = this.options.keyOverrides?.[generated] ?? generated
    const index = content.indexOf(text)
    this.created.set(key, { key, value: text, file, line: index < 0 ? 0 : content.slice(0, index).split('\n').length })
    this.byText.set(text, key)
    return key
  }
}

const hasInterpolation = (text: string): boolean => /\{\{[^}]*\}\}|\$\{/.test(text)

const isTranslatable = (text: string): boolean => /\p{L}/u.test(text) && !hasInterpolation(text)

/** Identifiers, paths, URLs: data that happens to be a string. */
function isTechnical(value: string): boolean {
  const text = value.trim()
  if (text.includes('://')) return true
  if (/\s/.test(text)) return false
  return /^[./]/.test(text) || /^[a-z0-9_.:-]+$/.test(text) || /^[A-Z0-9_.-]+$/.test(text)
}

interface TemplateNode {
  type: number
  tag?: string
  name?: string
  value?: { content: string }
  content?: string
  loc: { source: string; start: { offset: number }; end: { offset: number } }
  props?: TemplateNode[]
  children?: TemplateNode[]
}

function convertTextNode(node: TemplateNode, magic: MagicString, keys: KeyRegistry, file: string, content: string): void {
  const source = node.loc.source
  const text = source.trim()
  if (!isTranslatable(text)) return
  const key = keys.keyFor(text, file, content)
  if (!key) return
  const start = node.loc.start.offset + (source.length - source.trimStart().length)
  magic.overwrite(start, start + text.length, `{{ $t('${key}') }}`)
}

function convertAttribute(prop: TemplateNode, magic: MagicString, keys: KeyRegistry, file: string, content: string): void {
  const text = prop.value?.content
  if (prop.type !== NODE_ATTRIBUTE || !text || !TEXT_ATTRIBUTES.has(prop.name ?? '') || !isTranslatable(text)) return
  const key = keys.keyFor(text, file, content)
  if (key) magic.overwrite(prop.loc.start.offset, prop.loc.end.offset, `:${prop.name}="$t('${key}')"`)
}

function convertTemplate(node: TemplateNode, magic: MagicString, keys: KeyRegistry, file: string, content: string): void {
  if (node.type === NODE_ELEMENT) {
    if (NON_DISPLAY_TAGS.has(node.tag ?? '')) return
    for (const prop of node.props ?? []) convertAttribute(prop, magic, keys, file, content)
  }
  const children = node.children ?? []
  // Text around an interpolation is half a sentence: a key for each half cannot be translated.
  const mixed = children.some((child) => child.type === NODE_INTERPOLATION)
  for (const child of children) {
    if (child.type !== NODE_TEXT) convertTemplate(child, magic, keys, file, content)
    else if (!mixed) convertTextNode(child, magic, keys, file, content)
  }
}

function calleeName(call: AstNode): string {
  const callee = call.callee as AstNode
  return String(callee.name ?? (callee.property as AstNode | undefined)?.name ?? callee.type)
}

function isDataLiteral(node: AstNode, parent: AstNode | null, key: unknown): boolean {
  if (!parent) return false
  if (SKIPPED_PARENTS.has(parent.type)) return true
  if (parent.type === 'ObjectProperty' && key === 'key' && !parent.computed) return true
  if (parent.type === 'MemberExpression' && key === 'property') return true
  if (parent.type === 'BinaryExpression') return true
  if (parent.type === 'JSXAttribute') return true
  if (parent.type !== 'CallExpression' && parent.type !== 'OptionalCallExpression' && parent.type !== 'NewExpression') return false
  return NON_TEXT_CALLS.has(calleeName(parent)) || isTranslationCall(parent.callee as AstNode, true) || node === parent.callee
}

function convertCode(content: string, file: string, keys: KeyRegistry, extractOnly: boolean): string {
  const ast = parseCode(content)
  if (!ast) throw new Error('parse failed')
  const magic = new MagicString(content)

  walk(ast as Parameters<typeof walk>[0], {
    enter(raw: unknown, parent: unknown, key: unknown) {
      const node = raw as unknown as AstNode
      if (node.type === 'JSXText') {
        const source = node.value as string
        const text = source.trim()
        if (!isTranslatable(text)) return
        const translation = keys.keyFor(text, file, content)
        const start = node.start! + (source.length - source.trimStart().length)
        if (translation && !extractOnly) magic.overwrite(start, start + text.length, `{ $t('${translation}') }`)
        return
      }
      const value = staticString(node)
      if (value === null || !isTranslatable(value) || isTechnical(value)) return
      if (isDataLiteral(node, parent as unknown as AstNode | null, key)) return
      const translation = keys.keyFor(value, file, content)
      if (translation && !extractOnly) magic.overwrite(node.start!, node.end!, `$t('${translation}')`)
    },
  })
  return magic.toString()
}

function convertVue(content: string, file: string, keys: KeyRegistry): string {
  const { descriptor } = parseSfc(content, { filename: file })
  const ast = descriptor.template?.ast as unknown as TemplateNode | undefined
  if (!ast) return content
  const magic = new MagicString(content)
  for (const child of ast.children ?? []) convertTemplate(child, magic, keys, file, content)
  return magic.toString()
}

/** The new content of one source file, registering the texts it found in `keys`. */
export function convertSource(content: string, file: string, keys: KeyRegistry, extractOnly = false): string {
  if (extname(file) === '.vue') return convertVue(content, file, keys)
  return convertCode(content, file, keys, extractOnly)
}

const globToRegExp = (glob: string): RegExp => {
  const source = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '\u0000')
    .replace(/\*\*/g, '\u0001')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replaceAll('\u0000', '(?:.*/)?')
    .replaceAll('\u0001', '.*')
  return new RegExp(`^${source}$`)
}

export interface ExtractOnlyRules {
  dirs: string[]
  patterns: string[]
}

/** Files where code runs before an app context exists: their text is collected, the code stays. */
export function extractOnlyMatcher(root: string, rules: ExtractOnlyRules): (file: string) => boolean {
  const include = rules.patterns.filter((pattern) => !pattern.startsWith('!')).map(globToRegExp)
  const exclude = rules.patterns.filter((pattern) => pattern.startsWith('!')).map((pattern) => globToRegExp(pattern.slice(1)))
  const dirs = new Set(rules.dirs.map((dir) => dir.toLowerCase()))

  return (file) => {
    const rel = relative(root, file).split(sep).join('/')
    if (exclude.some((pattern) => pattern.test(rel))) return false
    if (include.some((pattern) => pattern.test(rel))) return true
    if (
      dirname(rel)
        .toLowerCase()
        .split('/')
        .some((part) => dirs.has(part))
    )
      return true
    return basename(file).toLowerCase().includes('plugin.')
  }
}
