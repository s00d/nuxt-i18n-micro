/**
 * jsdom reports a followed link as `Not implemented`, and tests of a modified click leave the link to the browser on purpose.
 * Set up here, on jsdom's own console: it writes to the process, past Vitest's `onConsoleLog` and the `console` environment option.
 */
const virtualConsole = (globalThis as unknown as { jsdom?: { virtualConsole: NodeJS.EventEmitter } }).jsdom?.virtualConsole

// a test file can ask for the node environment
if (virtualConsole) {
  const listeners = virtualConsole.listeners('jsdomError') as Array<(error: Error) => void>
  virtualConsole.removeAllListeners('jsdomError')
  virtualConsole.on('jsdomError', (error: Error) => {
    if (!error.message.includes('Not implemented: navigation')) for (const listener of listeners) listener(error)
  })
}
