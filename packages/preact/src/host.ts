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

/** Preact's own rule for a number without a unit. */
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i

/** What Preact's `setStyle` does for one entry: `cssText` is raw CSS, `--name` is a custom property and takes no unit. */
const declaration = ([name, value]: [string, unknown]): string => {
  if (name === 'cssText') return String(value)
  if (name[0] === '-') return `${name}:${value}`
  return `${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name) ? `${value}px` : value}`
}

const cssText = (style: CSSProperties | string): string =>
  typeof style === 'string'
    ? style
    : Object.entries(style)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(declaration)
        .join(';')

/** Later wins. Preact's `style` takes an object or a CSS string; a string among them makes the result one too. */
export function mergeStyles(...styles: (CSSProperties | string | null | undefined)[]): CSSProperties | string {
  const present = styles.filter((style) => style !== null && style !== undefined)
  if (present.some((style) => typeof style === 'string')) return present.map(cssText).filter(Boolean).join(';')
  return Object.assign({}, ...present)
}

export type HostNode = ComponentChildren
export type HostElement = VNode<any> | null
export type HostStyle = CSSProperties
export type HostTag = keyof JSX.IntrinsicElements
export type HostAttrs<E extends EventTarget> = HTMLAttributes<E>
export type HostAnchorAttrs<E extends EventTarget> = AnchorHTMLAttributes<E>
export type HostMouseEvent<E extends Element> = TargetedMouseEvent<E>
export type HostComponent<P> = ComponentType<P>
