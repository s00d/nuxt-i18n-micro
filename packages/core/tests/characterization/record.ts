/**
 * Tiny recorder for the characterization goldens: every call is written as one line,
 * `call → result`, so a behaviour change shows up as a one-line diff.
 */

function show(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value)
  if (typeof value === 'function') return '[function]'
  if (typeof value === 'symbol') return value.toString()
  if (value instanceof Map) return `Map(${show([...value.entries()])})`
  if (value instanceof Set) return `Set(${show([...value])})`
  return JSON.stringify(value, (_key, v) => (v === undefined ? '«undefined»' : typeof v === 'number' && !Number.isFinite(v) ? String(v) : v))
}

export class Recorder {
  private lines: string[] = []

  section(title: string): void {
    this.lines.push('', `## ${title}`, '')
  }

  note(text: string): void {
    this.lines.push(`> ${text}`)
  }

  /** Records `label → fn()`; a throw is recorded as such instead of failing the test. */
  run(label: string, fn: () => unknown): unknown {
    let out: string
    let value: unknown
    try {
      value = fn()
      out = show(value)
    } catch (error) {
      out = `throws ${(error as Error).name}: ${(error as Error).message}`
    }
    this.lines.push(`- \`${label}\` → ${out}`)
    return value
  }

  value(label: string, value: unknown): void {
    this.lines.push(`- \`${label}\` → ${show(value)}`)
  }

  toString(): string {
    return `${this.lines.join('\n').trim()}\n`
  }
}

export { show }
