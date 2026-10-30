import type { H3Event } from 'h3'
import { setResponseHeader } from 'h3'

interface NitroLike {
  hooks: {
    hook: (name: 'render:response', callback: (_response: unknown, context: { event: H3Event }) => void) => void
  }
}

export default function securityHeaderPlugin(nitroApp: NitroLike) {
  nitroApp.hooks.hook('render:response', (_response, { event }) => {
    setResponseHeader(event, 'x-security-test', '1')
  })
}
