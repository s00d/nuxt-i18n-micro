import { foldTemplate, type RenderSlot, type RenderSlots } from '@i18n-micro/core/render'
import { interpolate, resolveText, type ResolveTextOptions } from '@i18n-micro/core'
import { type Component, createMemo, createRoot, getOwner, type JSX, mergeProps, onCleanup, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useI18nContext } from '../injection'

/** What fills a `{name}` placeholder. A function may run per occurrence; one node can only stand in one place. */
export type I18nTComponent = JSX.Element | (() => JSX.Element)

export interface I18nTProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'>, ResolveTextOptions {
  tag?: string
  /** Elements for `{name}` placeholders. Beats a param of the same name. */
  components?: Record<string, I18nTComponent>
  /** Replaces the text. As a function it gets the translation, like Vue's default slot. */
  children?: JSX.Element | ((props: { translation: string }) => JSX.Element)
}

const OWN_PROPS = [
  'keypath',
  'params',
  'tag',
  'plural',
  'defaultValue',
  'html',
  'hideIfEmpty',
  'customPluralRule',
  'number',
  'date',
  'relativeDate',
  'components',
  'children',
] as const

/** Attributes that would set the content, and with it get past the `html` prop. */
const CONTENT_ATTRS = ['innerHTML', 'textContent', 'dangerouslySetInnerHTML', 'prop:innerHTML', 'prop:textContent'] as const

/** What JSX itself draws as nothing: no children, not empty ones. */
const isUnset = (children: unknown): boolean => children === undefined || children === null || typeof children === 'boolean'

function toSlots(components: I18nTProps['components']): RenderSlots {
  const slots: Record<string, RenderSlot> = Object.create(null)
  for (const name of Object.keys(components ?? {})) {
    const value = components![name]
    if (value !== undefined) slots[name] = typeof value === 'function' ? (value as RenderSlot) : () => value
  }
  return slots
}

export const I18nT: Component<I18nTProps> = (props): JSX.Element => {
  const i18n = useI18nContext()
  const [local, , attrs] = splitProps(props, OWN_PROPS, CONTENT_ATTRS as never)

  const resolved = createMemo(() => {
    // a custom rule may read only its `locale` argument, which core takes untracked
    i18n.localeAccessor()
    return resolveText(i18n, local)
  })
  const text = (): string => {
    const { template, params } = resolved()!
    return interpolate(template, params)
  }

  // A locale that reorders placeholders moves these nodes: each is built once, in a root of its own,
  // and disposed when the template drops it or new `components` replace the slots.
  const slotScope = createMemo(() => {
    const nodes = new Map<string, { node: unknown; dispose: () => void }>()
    onCleanup(() => {
      for (const built of nodes.values()) built.dispose()
    })
    return { slots: toSlots(local.components), nodes, owner: getOwner() }
  })
  const renderSlot = (slot: RenderSlot, key: string): unknown => {
    const { nodes, owner } = slotScope()
    if (!nodes.has(key))
      nodes.set(
        key,
        createRoot((dispose) => ({ node: slot({}), dispose }), owner),
      )
    return nodes.get(key)!.node
  }
  const foldSlots = (): unknown => {
    const { template, params } = resolved()!
    const { slots, nodes } = slotScope()
    const used = new Set<string>()
    const folded = foldTemplate(
      (slot, key) => {
        used.add(key)
        return renderSlot(slot, key)
      },
      template,
      params,
      slots,
    )
    for (const [key, built] of nodes) {
      if (used.has(key)) continue
      built.dispose()
      nodes.delete(key)
    }
    return folded
  }

  const content = (): JSX.Element => {
    const children = local.children
    if (typeof children === 'function') return children({ translation: text() })
    if (!isUnset(children)) return children
    return foldSlots() as JSX.Element
  }

  // a static tag skips `Dynamic`: one memo per element less
  const element = (body: object): JSX.Element => {
    const merged = mergeProps(attrs, body)
    return local.tag ? <Dynamic component={local.tag} {...merged} /> : <span {...(merged as JSX.HTMLAttributes<HTMLSpanElement>)} />
  }
  const markup = {
    get innerHTML() {
      return text()
    },
  }
  const body = {
    get children() {
      return content()
    },
  }

  return <>{resolved() === null ? local.defaultValue : local.html ? element(markup) : element(body)}</>
}
