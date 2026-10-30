import { foldTemplate, type RenderSlot, type RenderSlots } from '@i18n-micro/core/render'
import { interpolate, resolveText, type ResolveTextOptions } from '@i18n-micro/core'
import { type Component, createMemo, getOwner, type JSX, mergeProps, runWithOwner, splitProps, untrack } from 'solid-js'
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
  const owner = getOwner()
  const [local, , attrs] = splitProps(props, OWN_PROPS, CONTENT_ATTRS as never)

  const resolved = createMemo(() => resolveText(i18n, local))
  const text = (): string => {
    const { template, params } = resolved()!
    return interpolate(template, params)
  }

  // A locale that reorders placeholders moves these nodes: each is built once, outside the memo that reruns.
  const slotNodes = new Map<string, unknown>()
  let builtFrom: I18nTProps['components']
  const renderSlot = (slot: RenderSlot, key: string): unknown => {
    if (!slotNodes.has(key)) slotNodes.set(key, runWithOwner(owner, () => untrack(() => slot({}))))
    return slotNodes.get(key)
  }

  const components = createMemo(() => local.components)
  const content = (): JSX.Element => {
    const children = local.children
    if (typeof children === 'function') return children({ translation: text() })
    if (children !== undefined) return children
    const { template, params } = resolved()!
    if (components() !== builtFrom) {
      builtFrom = components()
      slotNodes.clear()
    }
    return foldTemplate(renderSlot, template, params, toSlots(components())) as JSX.Element
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
