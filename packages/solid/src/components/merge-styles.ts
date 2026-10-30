import type { JSX } from 'solid-js'

type Style = JSX.CSSProperties | string | undefined

const cssText = (style: Style): string =>
  typeof style === 'string'
    ? style
    : Object.entries(style ?? {})
        .map(([name, value]) => `${name}:${value}`)
        .join(';')

/** Later wins. Solid's `style` takes an object or a CSS string; a string among them makes the result one too. */
export function mergeStyles(...styles: Style[]): JSX.CSSProperties | string {
  if (styles.some((style) => typeof style === 'string')) return styles.map(cssText).filter(Boolean).join(';')
  return Object.assign({}, ...styles)
}
