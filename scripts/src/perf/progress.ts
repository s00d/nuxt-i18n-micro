/** Rough wall-time hints for progress lines (not measured). */
export const AUTOCANNON_SECONDS = 10
/** Artillery phases: warm-up 6s + main 60s (+ a few seconds of teardown). */
export const ARTILLERY_SECONDS = 66
export const BUILD_HINT_SECONDS = 15
export const COOLDOWN_SECONDS = 5

export function formatEta(seconds: number): string {
  if (seconds < 60) return `~${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return s > 0 ? `~${m}m ${s}s` : `~${m}m`
}

export function estimateWallSeconds(opts: { runs: number; fixtures: number; skipStress: boolean }): number {
  const perFixture = BUILD_HINT_SECONDS + (opts.skipStress ? 0 : AUTOCANNON_SECONDS + ARTILLERY_SECONDS + COOLDOWN_SECONDS)
  return opts.runs * opts.fixtures * perFixture + 30 // generate + report
}

/**
 * Sequential step counter: `[3/12] build i18n-micro (run 1/3)`.
 * Call `start` once per long phase; optional `heartbeat` while waiting.
 */
export class PerfProgress {
  private done = 0
  readonly total: number
  private startedAt = Date.now()

  constructor(total: number) {
    this.total = Math.max(1, total)
  }

  /** Print overall plan before work starts. */
  static printPlan(opts: { runs: number; fixtures: number; labels: string[]; skipStress: boolean }): PerfProgress {
    const perRunSteps = opts.fixtures * (opts.skipStress ? 1 : 3) // build | build+ac+artillery
    const total = 1 + opts.runs * perRunSteps + 1 // generate + work + report
    const eta = estimateWallSeconds(opts)
    console.log(`\n── Performance plan ──`)
    console.log(`  order: each fixture × ${opts.runs} consecutive run(s) (not interleaved)`)
    console.log(`  fixtures: ${opts.labels.join(' → ')}`)
    console.log(
      `  stress: ${opts.skipStress ? 'skipped' : `autocannon ${AUTOCANNON_SECONDS}s + artillery ${ARTILLERY_SECONDS}s (6s warm-up + 60s main)`}`,
    )
    console.log(`  steps: ${total} · rough wall ETA ${formatEta(eta)}`)
    console.log(`──────────────────────\n`)
    return new PerfProgress(total)
  }

  start(label: string, hintSeconds?: number): void {
    this.done++
    const eta = hintSeconds !== undefined ? ` · ${formatEta(hintSeconds)}` : ''
    const elapsed = formatEta((Date.now() - this.startedAt) / 1000)
    console.log(`\n[${this.done}/${this.total}] ${label}${eta}  (elapsed ${elapsed})`)
  }

  note(message: string): void {
    console.log(`  → ${message}`)
  }

  /** Log elapsed/remaining while a fixed-duration tool runs. */
  heartbeat(label: string, totalSeconds: number, intervalMs = 5000): () => void {
    const began = Date.now()
    const timer = setInterval(() => {
      const elapsed = (Date.now() - began) / 1000
      const left = Math.max(0, totalSeconds - elapsed)
      const pct = Math.min(100, Math.round((elapsed / totalSeconds) * 100))
      console.log(`  → ${label}: ${pct}% · ${formatEta(elapsed)} elapsed · ${formatEta(left)} left (of ~${totalSeconds}s)`)
    }, intervalMs)
    return () => clearInterval(timer)
  }
}
