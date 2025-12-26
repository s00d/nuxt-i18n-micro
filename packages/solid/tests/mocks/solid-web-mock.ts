import type { JSX, Component } from 'solid-js'

interface PortalProps {
  mount?: HTMLElement
  children?: JSX.Element
}

interface DynamicProps {
  component?: string | Component<Record<string, unknown>>
  children?: JSX.Element
  [key: string]: unknown
}

export const Portal = (props: PortalProps) => props.children
export const Dynamic = (props: DynamicProps) => {
  const Tag = props.component || 'div'
  return { ...props, component: Tag }
}
