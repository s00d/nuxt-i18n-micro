/** A warning about the app's files, once per server process: every request reads the same files. */
const warned = new Set<string>()

export function warnOnce(message: string): void {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(message)
}
