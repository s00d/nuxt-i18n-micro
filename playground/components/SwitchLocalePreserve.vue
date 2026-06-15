<template>
  <div :id="rootId" ref="rootRef" @click.capture="onClick">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface ScrollPreservePointer {
  rootId: string
  index: number
  clientY: number
  offsetY: number
  scrollY: number
}

const POINTER_STATE_KEY = 'playground:scroll-preserve-pointer'
const LOCALE_TARGET_SELECTOR = '[data-locale]'

let scrollBehaviorPatched = false

const props = withDefaults(
  defineProps<{
    rootId?: string
  }>(),
  {
    rootId: 'scroll-test-switcher',
  },
)

const rootRef = ref<HTMLElement | null>(null)
const { $getLocale, $switchLocale } = useI18n()
const currentLocale = computed(() => $getLocale())
const pointerState = useState<ScrollPreservePointer | null>(POINTER_STATE_KEY, () => null)

ensureScrollBehavior()

function applyPointerScroll(pointer: ScrollPreservePointer): void {
  const root = document.getElementById(pointer.rootId)
  const el = root?.querySelectorAll(LOCALE_TARGET_SELECTOR)[pointer.index]
  if (!el) {
    return
  }

  const top = window.scrollY + el.getBoundingClientRect().top + pointer.offsetY - pointer.clientY
  window.scrollTo({ top, left: 0, behavior: 'instant' })
}

function scheduleRefine(pointer: ScrollPreservePointer): void {
  requestAnimationFrame(() => {
    applyPointerScroll(pointer)
    requestAnimationFrame(() => {
      applyPointerScroll(pointer)
      requestAnimationFrame(() => applyPointerScroll(pointer))
    })
  })
}

function ensureScrollBehavior(): void {
  if (scrollBehaviorPatched || typeof window === 'undefined') {
    return
  }

  scrollBehaviorPatched = true
  const router = useRouter()
  const previousScrollBehavior = router.options.scrollBehavior

  router.options.scrollBehavior = (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    }

    const pointer = pointerState.value
    if (pointer) {
      scheduleRefine(pointer)
      return { top: pointer.scrollY, left: 0, behavior: 'instant' }
    }

    if (previousScrollBehavior) {
      return previousScrollBehavior(to, from, savedPosition)
    }

    if (to.hash) {
      return { el: to.hash, behavior: 'instant' }
    }

    return { top: 0, left: 0 }
  }
}

function capturePointer(event: MouseEvent, root: HTMLElement): ScrollPreservePointer | null {
  const target = (event.target as Element).closest(LOCALE_TARGET_SELECTOR)
  if (!target || !root.contains(target)) {
    return null
  }

  const targets = [...root.querySelectorAll(LOCALE_TARGET_SELECTOR)]
  const index = targets.indexOf(target)
  if (index < 0 || !root.id) {
    return null
  }

  const rect = target.getBoundingClientRect()
  return {
    rootId: root.id,
    index,
    clientY: event.clientY,
    offsetY: event.clientY - rect.top,
    scrollY: window.scrollY,
  }
}

async function waitForPageSettled(): Promise<void> {
  const nuxtApp = useNuxtApp()
  await nextTick()

  await new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) {
        return
      }
      settled = true
      resolve()
    }

    const timeout = window.setTimeout(finish, 100)
    const stop = nuxtApp.hook('page:finish', () => {
      window.clearTimeout(timeout)
      stop()
      finish()
    })
  })

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function restoreUntilStable(pointer: ScrollPreservePointer): Promise<void> {
  applyPointerScroll(pointer)
  scheduleRefine(pointer)

  return new Promise((resolve) => {
    let timer: number | undefined

    const settle = () => {
      applyPointerScroll(pointer)
      observer.disconnect()
      if (timer) {
        window.clearTimeout(timer)
      }
      resolve()
    }

    const onResize = () => {
      applyPointerScroll(pointer)
      if (timer) {
        window.clearTimeout(timer)
      }
      timer = window.setTimeout(settle, 100)
    }

    const observer = new ResizeObserver(onResize)
    observer.observe(document.documentElement)

    timer = window.setTimeout(settle, 500)
  })
}

async function switchLocale(code: string, event: MouseEvent, root: HTMLElement) {
  const pointer = capturePointer(event, root)
  const scrollY = window.scrollY

  pointerState.value = pointer

  try {
    await $switchLocale(code)
    await waitForPageSettled()

    if (pointer) {
      await restoreUntilStable(pointer)
    } else {
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' })
    }
  } finally {
    pointerState.value = null
  }
}

function onClick(event: MouseEvent) {
  const root = rootRef.value
  if (!root) {
    return
  }

  const target = (event.target as Element).closest(LOCALE_TARGET_SELECTOR)
  if (!target || !root.contains(target)) {
    return
  }

  const locale = target.getAttribute('data-locale')
  if (!locale || locale === currentLocale.value) {
    return
  }

  if (target instanceof HTMLAnchorElement) {
    event.preventDefault()
  }

  switchLocale(locale, event, root)
}
</script>
