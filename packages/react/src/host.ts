/**
 * The one file that names React. `@i18n-micro/preact` builds this package's source with `#host`
 * aliased to its own `src/host.ts`, which exports the same names.
 */
import type { AnchorHTMLAttributes, ComponentType, CSSProperties, HTMLAttributes, JSX, MouseEvent, ReactElement, ReactNode } from 'react'
import { createContext, createElement, Fragment, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { renderApi } from './render-api'

export { createContext, Fragment, useContext, useEffect, useMemo, useRef, useState }
export const h = createElement
export const API = renderApi

/** A store read that survives concurrent rendering. The server reads the same snapshot: `renderToString` throws without one. */
export function useStore<T>(subscribe: (listener: () => void) => () => void, read: () => T): T {
  return useSyncExternalStore(subscribe, read, read)
}

export type HostNode = ReactNode
export type HostElement = ReactElement | null
export type HostStyle = CSSProperties
export type HostTag = keyof JSX.IntrinsicElements
export type HostAttrs<E> = HTMLAttributes<E>
export type HostAnchorAttrs<E> = AnchorHTMLAttributes<E>
export type HostMouseEvent<E extends Element> = MouseEvent<E>
export type HostComponent<P> = ComponentType<P>
