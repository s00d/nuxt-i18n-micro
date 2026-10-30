import type { Locale } from '@i18n-micro/types'
import { isPlainClick } from './link'
import { interpolate, resolveText, tokenize, type ResolveTextOptions, type TextHost } from './text'
import { ownValue } from './tree'

/**
 * Vue's own functions, handed in: `@i18n-micro/vue` and the Nuxt module render with one code path,
 * and neither core nor the module depends on the other's copy of anything.
 */
export interface RenderApi {
  // biome-ignore lint: `h` is heavily overloaded; a precise signature would reject it
  h: (type: any, props?: any, children?: any) => any
  Fragment: unknown
  /** The props putting trusted markup into an element. Vue's `innerHTML` when unset. */
  markup?: (html: string) => Record<string, unknown>
  /** The props telling hydration that clock-dependent text may differ. Vue's `data-allow-mismatch` when unset. */
  dated?: Record<string, unknown>
}

export type RenderSlot = (props?: Record<string, unknown>) => unknown
export type RenderSlots = Readonly<Record<string, RenderSlot | undefined>>

export interface I18nTRenderProps extends ResolveTextOptions {
  tag?: string
}

/** Attributes that would set the content, and with it get past the `html` prop. */
const CONTENT_ATTRS = ['innerHTML', 'textContent', '.innerHTML', '.textContent', 'dangerouslySetInnerHTML']
const VUE_DATED = { 'data-allow-mismatch': 'text' }

function elementAttrs(api: RenderApi, props: I18nTRenderProps, attrs: Record<string, unknown>): Record<string, unknown> {
  const dated = (props.date ?? props.relativeDate ?? null) !== null && (props.number ?? null) === null
  if (!dated && !CONTENT_ATTRS.some((name) => name in attrs)) return attrs
  // A clock or time zone differs between server and browser: their text may, and the renderer need not warn.
  const safe: Record<string, unknown> = dated ? { ...(api.dated ?? VUE_DATED), ...attrs } : { ...attrs }
  for (const name of CONTENT_ATTRS) delete safe[name]
  return safe
}

/**
 * The template as children, one pass over its raw tokens: a slot, else a param, else the token as
 * written. A slot's fragment is keyed by name and occurrence, so a locale that reorders placeholders
 * moves the slot's DOM instead of rebuilding it.
 */
export function foldTemplate(
  renderSlot: (slot: RenderSlot, key: string) => unknown,
  template: string,
  params: Record<string, unknown>,
  slots: RenderSlots,
): unknown {
  if (template.indexOf('{') === -1) return template
  const parts = tokenize(template)
  // only a template with a slot in it pays for these
  let children: unknown[] | undefined
  let seen: Map<string, number> | undefined
  let text = parts[0]!
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i]!
    const slot = ownValue(slots, name) as RenderSlot | undefined
    if (typeof slot !== 'function') {
      const value = ownValue(params, name)
      text += (value === undefined ? `{${name}}` : String(value)) + parts[i + 1]
      continue
    }
    children ??= []
    seen ??= new Map()
    const occurrence = (seen.get(name) ?? 0) + 1
    seen.set(name, occurrence)
    if (text) children.push(text)
    children.push(renderSlot(slot, `${name}:${occurrence}`))
    text = parts[i + 1]!
  }
  if (!children) return text
  if (text) children.push(text)
  return children
}

/** One `<i18n-t>`: `resolveText`, then markup, a default slot, or the folded template. */
export function renderI18nT(api: RenderApi, i18n: TextHost, props: I18nTRenderProps, slots: RenderSlots, attrs: Record<string, unknown>): unknown {
  const resolved = resolveText(i18n, props)
  if (resolved === null) return props.defaultValue ?? null
  const { template, params } = resolved
  const tag = props.tag ?? 'span'
  const element = elementAttrs(api, props, attrs)
  if (props.html) {
    const html = interpolate(template, params)
    return api.h(tag, { ...element, ...(api.markup ? api.markup(html) : { innerHTML: html }) })
  }
  if (slots.default) return api.h(tag, element, slots.default({ translation: interpolate(template, params) }))
  // called, not `h(slot)`: that makes the slot a component whose type changes with each slot object
  const renderSlot = (slot: RenderSlot, key: string) => api.h(api.Fragment, { key }, slot({}) as never)
  return api.h(tag, element, foldTemplate(renderSlot, template, params, slots))
}

type Style = object

/** The `custom*Style` props of the switcher, each merged over the part it names. */
export interface SwitcherProps {
  customLabels?: Record<string, string>
  customWrapperStyle?: Style
  customButtonStyle?: Style
  customDropdownStyle?: Style
  customItemStyle?: Style
  customLinkStyle?: Style
  customActiveLinkStyle?: Style
  customDisabledLinkStyle?: Style
  customIconStyle?: Style
}

/** What a side supplies: its locales, its URLs and its navigation. */
export interface SwitcherAdapter {
  /** Every locale, disabled ones too: a disabled current locale still labels the button. */
  locales(): Locale[]
  locale(): string
  /** The label of a current locale missing from {@link locales}. */
  localeName?(): string | null
  href(code: string): string
  /** The one navigation of a plain click; a modified click is left to the browser. */
  select(code: string): void
  /** Render the closed list too, so server HTML holds the links. */
  keepList?: boolean
  onMissingLabel?(code: string): void
}

export interface SwitcherVue extends RenderApi {
  ref<T>(value: T): { value: T }
  onMounted(hook: () => void): void
  onUnmounted(hook: () => void): void
}

const WRAPPER_STYLE: Style = { position: 'relative', display: 'inline-block', verticalAlign: 'middle' }
const BUTTON_STYLE: Style = {
  padding: '4px 12px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#fff',
  border: '1px solid #333',
  transition: 'background-color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}
// logical properties: the dropdown opens from the start edge under `dir="rtl"` too
const DROPDOWN_STYLE: Style = {
  position: 'absolute',
  top: '100%',
  insetInlineStart: '0',
  zIndex: 1000,
  backgroundColor: '#fff',
  border: '1px solid #333',
  listStyle: 'none',
  padding: '0',
  margin: '4px 0 0 0',
  minWidth: '150px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
}
const ITEM_STYLE: Style = { margin: '0', padding: '0' }
const LINK_STYLE: Style = {
  display: 'block',
  padding: '8px 12px',
  color: '#333',
  textDecoration: 'none',
  transition: 'background-color 0.3s ease',
  cursor: 'pointer',
}
// the current locale is not a meaningful switch target
const ACTIVE_LINK_STYLE: Style = { fontWeight: 'bold', color: '#007bff', cursor: 'not-allowed' }
const ICON_STYLE: Style = { marginInlineStart: '8px', display: 'inline-block', transition: 'transform 0.3s ease' }
const OPEN_ICON_STYLE: Style = { transform: 'rotate(180deg)' }

/** One look for every switcher; the React family spreads these, Solid converts the names. */
export const SWITCHER_STYLES = {
  wrapper: WRAPPER_STYLE,
  button: BUTTON_STYLE,
  dropdown: DROPDOWN_STYLE,
  item: ITEM_STYLE,
  link: LINK_STYLE,
  activeLink: ACTIVE_LINK_STYLE,
  icon: ICON_STYLE,
  openIcon: OPEN_ICON_STYLE,
}

const NO_STYLE: Style = {}
const HIDDEN_STYLE: Style = { display: 'none' }

/**
 * One locale switcher for both sides. Call it from `setup`: it owns the open state and the document
 * listeners, and returns the render function.
 */
export function createLocaleSwitcher(vue: SwitcherVue, adapter: SwitcherAdapter, props: SwitcherProps, slots: RenderSlots): () => unknown {
  const { h } = vue
  const open = vue.ref(false)
  const wrapper = vue.ref<HTMLElement | null>(null)

  const onDocumentClick = (event: MouseEvent) => {
    if (open.value && !wrapper.value?.contains(event.target as Node)) open.value = false
  }
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') open.value = false
  }
  vue.onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
  })
  vue.onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
  })

  const slotted = (name: string, scope?: Record<string, unknown>): unknown[] => [slots[name]?.(scope) ?? []].flat()

  const label = (locale: Locale): string => {
    const known = props.customLabels?.[locale.code] || locale.displayName
    if (!known) adapter.onMissingLabel?.(locale.code)
    return known || locale.code
  }

  const select = (event: MouseEvent, code: string) => {
    if (!isPlainClick(event)) return
    event.preventDefault()
    open.value = false
    adapter.select(code)
  }

  const renderItem = (locale: Locale, current: string) => {
    const active = locale.code === current
    const scope = { locale }
    const language = locale.iso || locale.code
    return h('li', { key: locale.code, style: { ...ITEM_STYLE, ...props.customItemStyle } }, [
      ...slotted('before-item', scope),
      h(
        'a',
        {
          class: `switcher-locale-${locale.code}`,
          href: adapter.href(locale.code),
          hreflang: language,
          lang: language,
          dir: locale.dir,
          style: {
            ...LINK_STYLE,
            ...(active ? ACTIVE_LINK_STYLE : NO_STYLE),
            ...props.customLinkStyle,
            ...(active ? props.customActiveLinkStyle : NO_STYLE),
          },
          onClick: (event: MouseEvent) => select(event, locale.code),
        },
        [...slotted('before-link-content', scope), label(locale), ...slotted('after-link-content', scope)],
      ),
      ...slotted('after-item', scope),
    ])
  }

  const renderList = (all: Locale[], current: string, isOpen: boolean) =>
    h('ul', { class: 'i18n-switcher-dropdown', style: { ...DROPDOWN_STYLE, ...props.customDropdownStyle, ...(isOpen ? NO_STYLE : HIDDEN_STYLE) } }, [
      ...slotted('before-dropdown-items'),
      ...all.filter((locale) => !locale.disabled).map((locale) => renderItem(locale, current)),
      ...slotted('after-dropdown-items'),
    ])

  return () => {
    const all = adapter.locales()
    const current = adapter.locale()
    const currentLocale = all.find((locale) => locale.code === current)
    const isOpen = open.value
    return h('div', { ref: wrapper, class: 'i18n-switcher-wrapper', style: { ...WRAPPER_STYLE, ...props.customWrapperStyle } }, [
      ...slotted('before-button'),
      h(
        'button',
        {
          class: 'i18n-switcher-button language-switcher',
          type: 'button',
          style: { ...BUTTON_STYLE, ...props.customButtonStyle, ...(currentLocale?.disabled ? props.customDisabledLinkStyle : NO_STYLE) },
          'aria-expanded': String(isOpen),
          onClick: () => {
            open.value = !isOpen
          },
        },
        [
          ...slotted('before-selected-locale'),
          h('span', label(currentLocale ?? { code: current, displayName: adapter.localeName?.() ?? undefined })),
          ' ',
          ...slotted('after-selected-locale'),
          h('span', { style: { ...ICON_STYLE, ...(isOpen ? OPEN_ICON_STYLE : NO_STYLE), ...props.customIconStyle } }, '▾'),
        ],
      ),
      ...slotted('before-dropdown'),
      ...(isOpen || adapter.keepList ? [renderList(all, current, isOpen)] : []),
      ...slotted('after-dropdown'),
    ])
  }
}

export type { ResolveTextOptions, TextHost } from './text'
