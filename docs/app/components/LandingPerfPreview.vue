<script setup lang="ts">
import { tv } from '~/utils/tv'

/**
 * Landing benchmark preview: the same fixture app built and load-tested with three setups.
 * req/s and p95 from the PR #308 production load rounds (87.0, 88.4 · 242.1, 238.6 · 414.0, 394.5
 * → ~88 / ~240 / ~404); build times are the fixture means in guide/performance-results.md.
 */
const fixtures = [
  { id: 'plain', label: 'Plain Nuxt', note: 'no i18n', build: 4.59, rps: 88, latency: 292, win: false },
  { id: 'nuxtjs', label: '@nuxtjs/i18n', note: 'v10', build: 5.48, rps: 240, latency: 58, win: false },
  { id: 'micro', label: 'nuxt-i18n-micro', note: 'v4', build: 4.99, rps: 404, latency: 31, win: true },
] as const

const maxBuild = Math.max(...fixtures.map((f) => f.build))
const maxRps = Math.max(...fixtures.map((f) => f.rps))

/** Packets per lane scale with throughput; faster setups also move them faster. */
function packetsFor(rps: number) {
  const share = rps / maxRps
  const count = Math.max(2, Math.round(share * 8))
  const duration = 1 + (1 - share) * 1.6
  const lanes = ['30%', '50%', '70%']
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: lanes[i % lanes.length]!,
    delay: `${((i * duration) / count).toFixed(2)}s`,
    duration: `${(duration * (0.85 + (i % 3) * 0.1)).toFixed(2)}s`,
  }))
}

const sceneTv = tv({
  slots: {
    root: 'relative w-full overflow-hidden rounded-xl border border-default bg-default shadow-sm',
    header: 'flex min-h-14 items-center justify-between gap-3 border-b border-default px-4 py-2.5',
    title: 'text-sm font-semibold text-highlighted',
    subtitle: 'text-xs text-muted',
    rows: 'divide-y divide-default',
    row: 'grid grid-cols-[minmax(0,7.5rem)_1fr_5rem] items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,9.5rem)_1fr_5.5rem]',
    label: 'min-w-0',
    name: 'truncate text-sm font-medium text-highlighted',
    nameWin: 'truncate text-sm font-semibold text-primary',
    meta: 'truncate text-xs text-muted tabular-nums',
    lane: '@container relative h-8 overflow-hidden rounded-md bg-elevated',
    laneWin: '@container relative h-8 overflow-hidden rounded-md bg-primary/10',
    fill: 'absolute inset-y-0 start-0 bg-accented',
    fillWin: 'absolute inset-y-0 start-0 bg-primary/30',
    packet: 'landing-packet absolute h-1 w-3 rounded-full bg-(--ui-text-dimmed)',
    packetWin: 'landing-packet absolute h-1 w-4 rounded-full bg-primary',
    value: 'min-w-0 text-end',
    rps: 'text-base font-semibold tabular-nums text-toned',
    rpsWin: 'text-base font-semibold tabular-nums text-primary',
    unit: 'text-xs font-normal text-muted',
    footer: 'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-default bg-elevated/40 px-4 py-2.5 text-xs text-muted',
    link: 'inline-flex items-center gap-1 rounded-sm font-medium text-primary hover:underline focus-visible:outline-2 outline-primary',
    linkIcon: 'size-3.5',
  },
})

const ui = sceneTv()
const phase = ref<'build' | 'load' | 'done'>('build')
const buildPct = ref(fixtures.map(() => 0))
const displayRps = ref(fixtures.map(() => 0))
const packetsByFixture = fixtures.map((f) => packetsFor(f.rps))
let raf = 0
let timer = 0
let run = 0

/** Calls `step(t)` with t from 0 to 1 over `duration` ms; stops early when a newer run starts. */
function animate(duration: number, step: (t: number) => void): Promise<boolean> {
  const id = run
  return new Promise((resolve) => {
    const t0 = performance.now()
    const tick = (now: number) => {
      if (id !== run) return resolve(false)
      const t = Math.min(1, (now - t0) / duration)
      step(t)
      if (t < 1) raf = requestAnimationFrame(tick)
      else resolve(true)
    }
    raf = requestAnimationFrame(tick)
  })
}

async function play() {
  cancelAnimationFrame(raf)
  run++
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    buildPct.value = fixtures.map(() => 100)
    displayRps.value = fixtures.map((f) => f.rps)
    phase.value = 'done'
    return
  }
  phase.value = 'build'
  buildPct.value = fixtures.map(() => 0)
  displayRps.value = fixtures.map(() => 0)
  // Build bars race in proportion to the measured build times.
  const built = await animate(2200, (t) => {
    buildPct.value = fixtures.map((f) => Math.min(100, ((t * maxBuild) / f.build) * 100))
  })
  if (!built) return
  phase.value = 'load'
  const loaded = await animate(1200, (t) => {
    const eased = 1 - (1 - t) ** 3
    displayRps.value = fixtures.map((f) => Math.round(f.rps * eased))
  })
  if (loaded) phase.value = 'done'
}

onMounted(() => {
  // After first paint: the hero text never waits for the animation.
  timer = window.setTimeout(play, 300)
})

onBeforeUnmount(() => {
  run++
  cancelAnimationFrame(raf)
  clearTimeout(timer)
})

const phaseLabel = computed(() => (phase.value === 'build' ? 'Building…' : 'Load test…'))
</script>

<template>
  <figure :class="ui.root()">
    <div :class="ui.header()">
      <div>
        <p :class="ui.title()">One app, three setups</p>
        <p :class="ui.subtitle()">nuxi build, then the same load test</p>
      </div>
      <UBadge v-if="phase !== 'done'" color="neutral" variant="subtle" size="sm" :label="phaseLabel" />
      <UButton v-else icon="i-lucide-rotate-ccw" color="neutral" variant="ghost" size="xs" label="Replay" @click="play" />
    </div>

    <div :class="ui.rows()">
      <div v-for="(f, i) in fixtures" :key="f.id" :class="ui.row()">
        <div :class="ui.label()">
          <p :class="f.win ? ui.nameWin() : ui.name()">{{ f.label }}</p>
          <p :class="ui.meta()">{{ f.note }} · build {{ f.build.toFixed(2) }}s</p>
        </div>

        <div :class="f.win ? ui.laneWin() : ui.lane()" aria-hidden="true">
          <div v-if="phase === 'build'" :class="f.win ? ui.fillWin() : ui.fill()" :style="{ width: `${buildPct[i]}%` }" />
          <template v-else>
            <!-- Throughput share stays visible as a bar; packets add the motion (none with reduced motion). -->
            <div :class="f.win ? ui.fillWin() : ui.fill()" :style="{ width: `${(displayRps[i]! / maxRps) * 100}%` }" />
            <span
              v-for="pkt in packetsByFixture[i]"
              :key="pkt.id"
              :class="f.win ? ui.packetWin() : ui.packet()"
              :style="{ top: pkt.top, animationDuration: pkt.duration, animationDelay: pkt.delay }"
            />
          </template>
        </div>

        <div :class="ui.value()">
          <p :class="f.win ? ui.rpsWin() : ui.rps()">{{ phase === 'build' ? '—' : displayRps[i] }} <span :class="ui.unit()">req/s</span></p>
          <p :class="ui.meta()">p95 {{ f.latency }} ms</p>
        </div>
      </div>
    </div>

    <figcaption :class="ui.footer()">
      <span>Artillery, mean of three runs. Higher req/s is better.</span>
      <NuxtLink to="/guide/performance-results" :class="ui.link()">
        Benchmark report
        <UIcon name="i-lucide-arrow-right" :class="ui.linkIcon()" />
      </NuxtLink>
    </figcaption>
  </figure>
</template>

<style scoped>
/* Packets move with `transform` only (compositor), across the lane width (`cqi`: the lane is a container). */
@keyframes landing-packet {
  from {
    transform: translate3d(-2rem, -50%, 0);
    opacity: 0;
  }
  15%,
  85% {
    opacity: 1;
  }
  to {
    transform: translate3d(100cqi, -50%, 0);
    opacity: 0;
  }
}

.landing-packet {
  left: 0;
  transform: translate3d(-2rem, -50%, 0);
  animation-name: landing-packet;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@media (prefers-reduced-motion: reduce) {
  .landing-packet {
    display: none;
  }
}
</style>
