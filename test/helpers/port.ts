import net from 'node:net'

/**
 * Ask the OS for a free port.
 *
 * Binding port 0 and reading back the assigned port is race-free enough for
 * parallel test files: the kernel will not hand the same ephemeral port to two
 * listeners at once, unlike scanning a fixed base port (which two workers can
 * probe and claim simultaneously).
 *
 * Note: never kill "whatever owns this port" to free it — that can SIGKILL an
 * unrelated process, including a sibling test worker's server. Stop servers via
 * their ChildProcess handle with `stopChild()` from ./subprocess instead.
 */
export function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.once('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address()
      if (!address || typeof address === 'string') {
        srv.close(() => reject(new Error('could not determine a free port')))
        return
      }
      const { port } = address
      srv.close(() => resolve(port))
    })
  })
}
