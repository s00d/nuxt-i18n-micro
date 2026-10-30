/**
 * `#host` of the source shared with `@i18n-micro/react`: the same names over Preact itself, not
 * `preact/compat`, whose `useSyncExternalStore` alone costs more than the rest of this package.
 */
import type { RenderApi } from '@i18n-micro/core/render'
import type { AnchorHTMLAttributes, ComponentChildren, ComponentType, CSSProperties, HTMLAttributes, JSX, TargetedMouseEvent, VNode } from 'preact'
import { createContext, Fragment, h } from 'preact'
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'

export { createContext, Fragment, h, useContext, useEffect, useMemo, useRef, useState }

export const API: RenderApi = {
  h,
  Fragment,
  markup: (html) => ({ dangerouslySetInnerHTML: { __html: html } }),
  // Preact does not check text on hydration, and would print this as an attribute
  dated: {},
}

/**
 * A store read. Subscribing in a layout effect leaves a gap after render, where a child's effect or
 * a resolved load can change the store: the first check closes it.
 */
export function useStore<T>(subscribe: (listener: () => void) => () => void, read: () => T): T {
  const value = read()
  const [, update] = useState(0)
  const latest = useRef({ read, value })
  latest.current = { read, value }
  useLayoutEffect(() => {
    const check = () => {
      if (latest.current.read() !== latest.current.value) update((n) => n + 1)
    }
    check()
    return subscribe(check)
  }, [subscribe])
  return value
}

export type HostNode = ComponentChildren
export type HostElement = VNode<any> | null
export type HostStyle = CSSProperties
export type HostTag = keyof JSX.IntrinsicElements
export type HostAttrs<E extends EventTarget> = HTMLAttributes<E>
export type HostAnchorAttrs<E extends EventTarget> = AnchorHTMLAttributes<E>
export type HostMouseEvent<E extends Element> = TargetedMouseEvent<E>
export type HostComponent<P> = ComponentType<P>
