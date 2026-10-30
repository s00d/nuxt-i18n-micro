import { renderI18nT, type I18nTRenderProps, type RenderApi, type RenderSlot, type RenderSlots, type TextHost } from '@i18n-micro/core/render'
import type { HostAttrs, HostElement, HostNode, HostTag } from '#host'

/** What fills a `{name}` placeholder: a node, or a function returning one (it may use hooks). */
export type I18nTComponent = HostNode | (() => HostNode)

export interface I18nTProps extends Omit<HostAttrs<HTMLElement>, 'children' | 'defaultValue'>, Omit<I18nTRenderProps, 'tag'> {
  tag?: HostTag
  /** Elements for `{name}` placeholders. Beats a param of the same name. */
  components?: Record<string, I18nTComponent>
  /** Replaces the text. As a function it gets the translation, like Vue's default slot. */
  children?: HostNode | ((props: { translation: string }) => HostNode)
}

const NO_SLOTS: RenderSlots = {}

/** What JSX itself draws as nothing, `{cond && <b />}` among them: no children, not empty ones. */
const isUnset = (children: I18nTProps['children']): boolean => children === undefined || children === null || typeof children === 'boolean'

/** A stable type around a slot function: called directly it would run its hooks in `<I18nT>`, in any order. */
const Slot = ({ render }: { render: () => HostNode }) => render()

function toSlots({ h }: RenderApi, components: I18nTProps['components'], children: I18nTProps['children']): RenderSlots {
  if (!components && isUnset(children)) return NO_SLOTS
  const slots: Record<string, RenderSlot> = Object.create(null)
  for (const name of Object.keys(components ?? {})) {
    const value = components![name]
    if (value !== undefined) slots[name] = typeof value === 'function' ? () => h(Slot, { render: value }) : () => value
  }
  if (!isUnset(children)) slots.default = typeof children === 'function' ? (children as RenderSlot) : () => children
  return slots
}

/** Props to element: no hooks, so it serves both the client component and the server one. */
export function renderText(api: RenderApi, i18n: TextHost, props: I18nTProps): HostElement {
  const {
    keypath,
    params,
    tag,
    plural,
    defaultValue,
    html,
    hideIfEmpty,
    customPluralRule,
    number,
    date,
    relativeDate,
    components,
    children,
    ...attrs
  } = props
  return renderI18nT(api, i18n, props, toSlots(api, components, children), attrs) as HostElement
}
