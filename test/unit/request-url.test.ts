import { createEvent } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { expect, test } from 'vitest'
import { requestURL } from '../../src/runtime/utils/request-url'

function eventFor(url: string, host: string) {
  const req = new IncomingMessage(new Socket())
  req.url = url
  req.headers.host = host
  return createEvent(req, new ServerResponse(req))
}

test.each([
  ['example.com', '/de/about?x=1', '/de/about'],
  ['a b', '/de/about?x=1', '/de/about'],
  ['[', '//de', '/de'],
  ['', '/', '/'],
])('Host %j, %s', (host, url, pathname) => {
  expect(requestURL(eventFor(url, host)).pathname).toBe(pathname)
})
