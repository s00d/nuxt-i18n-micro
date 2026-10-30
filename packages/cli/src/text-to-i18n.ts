import { extname, parse as parsePath, sep } from 'node:path'
import { MagicString, parse as parseSfc, walk } from '@vue/compiler-sfc'
import { type JsonObject, isWritableKey, pathConflict, setPath } from './json'
import { type AstNode, NODE_TYPES, lineOf, parseCode, scanFile, staticString } from './source'

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

export interface Hardcoded {
  file: string
  line: number
  text: string
}

export interface ConvertOptions {
  context?: string
  keyOverrides?: Record<string, string>
  skippedKeys?: string[]
}

/** Shared across files: known text reuses its key, generated keys stay unique. */
export class KeyRegistry {
  readonly created = new Map<string, NewTranslation>()
  /** Text left alone because its key would overwrite a value of the translation file. */
  readonly blocked: Hardcoded[] = []
  private readonly byText = new Map<string, string>()
  private readonly used: Set<string>
  /** The file with this run's keys in it: `pages.user` and `pages.user.save` cannot both be text. */
  private readonly planned: JsonObject

  constructor(
    existing: Record<string, string>,
    tree: JsonObject = {},
    private readonly options: ConvertOptions = {},
  ) {
    this.planned = structuredClone(tree)
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

  private block(text: string, file: string, line: number): null {
    this.byText.set(text, '')
    this.blocked.push({ file, line, text })
    return null
  }

  /** Key for `text`, or `null` when it stays as it is. */
  keyFor(text: string, file: string, line: number): string | null {
    const known = this.byText.get(text)
    if (known === '') return null
    // A natural-language key such as `Don't save` cannot go between the quotes of a template.
    if (known !== undefined) return isWritableKey(known) ? known : this.block(text, file, line)
    const generated = this.generate(text, file)
    if (this.options.skippedKeys?.includes(generated)) {
      this.byText.set(text, '') // every occurrence of the text is skipped, not only the first
      return null
    }
    const key = this.options.keyOverrides?.[generated] ?? generated
    if (pathConflict(this.planned, key)) return this.block(text, file, line)
    setPath(this.planned, key, text)
    this.created.set(key, { key, value: text, file, line })
    this.byText.set(text, key)
    return key
  }

  /** Take back keys of a conversion that was thrown away. */
  forget(keep: ReadonlySet<string>): void {
    for (const [key, { value }] of this.created) {
      if (keep.has(key)) continue
      this.created.delete(key)
      this.byText.delete(value)
    }
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
  arg?: { content?: string }
  content?: string
  loc: { source: string; start: { offset: number }; end: { offset: number } }
  props?: TemplateNode[]
  children?: TemplateNode[]
}

export interface Conversion {
  /** The new file content. */
  content: string
  /** Text that is half a sentence: a key per fragment cannot be translated. */
  mixed: Hardcoded[]
  /** Text in code. `$t` is not in scope everywhere, so it is reported and never rewritten. */
  code: Hardcoded[]
}

interface VueRun {
  magic: MagicString
  keys: KeyRegistry
  file: string
  content: string
  out: Conversion
}

/** The compiler's text: entities decoded, so `&amp;` does not reach the locale file as five characters. */
const displayText = (node: TemplateNode): string => (node.content ?? '').replace(/\s+/g, ' ').trim()

function convertTextNode(node: TemplateNode, run: VueRun): void {
  const text = displayText(node)
  if (!isTranslatable(text)) return
  const source = node.loc.source
  const start = node.loc.start.offset + (source.length - source.trimStart().length)
  const key = run.keys.keyFor(text, run.file, lineOf(run.content, start))
  if (key) run.magic.overwrite(start, start + source.trim().length, `{{ $t('${key}') }}`)
}

/** `title="x" :title="y"`: binding the first would make the attribute a duplicate. */
const isBound = (element: TemplateNode, name: string | undefined): boolean =>
  Boolean(element.props?.some((prop) => prop.type === NODE_TYPES.DIRECTIVE && prop.arg?.content === name))

function convertAttribute(prop: TemplateNode, element: TemplateNode, run: VueRun): void {
  const text = prop.value?.content
  if (prop.type !== NODE_TYPES.ATTRIBUTE || !text || !TEXT_ATTRIBUTES.has(prop.name ?? '') || !isTranslatable(text)) return
  if (isBound(element, prop.name)) return
  const key = run.keys.keyFor(text, run.file, lineOf(run.content, prop.loc.start.offset))
  if (key) run.magic.overwrite(prop.loc.start.offset, prop.loc.end.offset, `:${prop.name}="$t('${key}')"`)
}

const isBlank = (node: TemplateNode): boolean => node.type === NODE_TYPES.COMMENT || (node.type === NODE_TYPES.TEXT && displayText(node) === '')

/** Text next to markup or an interpolation: `<p>Hello <b>world</b> today</p>`. */
const isMixed = (children: TemplateNode[]): boolean => {
  const present = children.filter((child) => !isBlank(child))
  return present.some((child) => child.type === NODE_TYPES.TEXT) && present.some((child) => child.type !== NODE_TYPES.TEXT)
}

const isSkippedElement = (node: TemplateNode): boolean =>
  NON_DISPLAY_TAGS.has(node.tag ?? '') ||
  /^i18n-?t$/i.test(node.tag ?? '') ||
  // The compiler drops `v-pre` from the props.
  /^<[^>]*\sv-pre[\s/>]/.test(node.loc.source)

function reportMixed(node: TemplateNode, run: VueRun): void {
  const text = displayText({ ...node, content: node.loc.source.replace(/<[^>]*>/g, ' ') })
  if (isTranslatable(text.replace(/\{\{[^}]*\}\}/g, '')))
    run.out.mixed.push({ file: run.file, line: lineOf(run.content, node.loc.start.offset), text })
}

function convertTemplate(node: TemplateNode, run: VueRun, textAllowed = true): void {
  if (node.type === NODE_TYPES.ELEMENT) {
    if (isSkippedElement(node)) return
    for (const prop of node.props ?? []) convertAttribute(prop, node, run)
  }
  const children = node.children ?? []
  const mixed = isMixed(children)
  if (mixed && textAllowed) reportMixed(node, run)
  for (const child of children) {
    if (child.type !== NODE_TYPES.TEXT) convertTemplate(child, run, textAllowed && !mixed)
    else if (textAllowed && !mixed) convertTextNode(child, run)
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
  if (parent.type === 'BinaryExpression' || parent.type === 'TaggedTemplateExpression') return true
  if (parent.type === 'JSXAttribute') return true
  if (parent.type !== 'CallExpression' && parent.type !== 'OptionalCallExpression' && parent.type !== 'NewExpression') return false
  return NON_TEXT_CALLS.has(calleeName(parent)) || node === parent.callee
}

/** Text a person would read, in code. The strings the scanner took for keys or arguments of `$t` are not. */
function reportCode(content: string, file: string, lang = extname(file).slice(1), firstLine = 1): Hardcoded[] {
  const ast = parseCode(content, lang)
  if (!ast) return []
  const found: Hardcoded[] = []
  // Named by `lang`: this may be a script block of a `.vue`, which is not a whole SFC.
  const keyArguments = new Set(scanFile(content, `${file}.${lang}`).refs.map((ref) => ref.start - 1))
  walk(ast as Parameters<typeof walk>[0], {
    enter(raw: unknown, parent: unknown, key: unknown) {
      const node = raw as unknown as AstNode
      const text = node.type === 'JSXText' ? (node.value as string).trim() : staticString(node)
      if (!text || !isTranslatable(text) || isTechnical(text) || keyArguments.has(node.start!)) return
      if (!isDataLiteral(node, parent as unknown as AstNode | null, key))
        found.push({ file, line: lineOf(content, node.start!) + firstLine - 1, text })
    },
  })
  return found
}

function convertVue(content: string, file: string, keys: KeyRegistry): Conversion {
  const out: Conversion = { content, mixed: [], code: [] }
  if (content.trim() === '') return out
  const { descriptor, errors } = parseSfc(content, { filename: file })
  if (errors.length > 0) throw new Error(`it does not parse: ${String((errors[0] as Error).message)}`)
  out.code = [descriptor.script, descriptor.scriptSetup].flatMap((block) =>
    block ? reportCode(block.content, file, block.lang ?? 'js', block.loc.start.line) : [],
  )
  const ast = descriptor.template?.ast as unknown as TemplateNode | undefined
  if (!ast) return out
  const before = new Set(keys.created.keys())
  const run: VueRun = { magic: new MagicString(content), keys, file, content, out }
  // The root is a node like any other, but only the block knows where it sits.
  convertTemplate({ ...ast, loc: descriptor.template!.loc as TemplateNode['loc'] }, run)
  const converted = run.magic.toString()
  // A file that parsed before has to parse after, whatever a template held that this code did not foresee.
  if (parseSfc(converted, { filename: file }).errors.length > 0) {
    keys.forget(before)
    throw new Error('the rewritten file would not parse')
  }
  out.content = converted
  return out
}

/** One source file: `.vue` templates are rewritten, anything else is only read. */
export function convertSource(content: string, file: string, keys: KeyRegistry): Conversion {
  if (extname(file).toLowerCase() === '.vue') return convertVue(content, file, keys)
  return { content, mixed: [], code: reportCode(content, file) }
}
