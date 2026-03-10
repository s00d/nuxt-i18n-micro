import { setResponseHeader } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (_response, { event }) => {
    setResponseHeader(event, 'x-security-test', '1')
  })
})
