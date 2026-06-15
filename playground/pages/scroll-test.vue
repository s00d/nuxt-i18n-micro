<template>
  <div class="scroll-test">
    <Navigation />

    <header class="scroll-test__header">
      <h1>{{ $t('title') }}</h1>
      <p>{{ $t('description') }}</p>
      <p class="scroll-test__meta-hint">{{ $t('meta_hint') }}</p>
      <p class="scroll-test__scroll-y">
        scrollY: <strong>{{ scrollY }}</strong> px
      </p>
    </header>

    <section
      v-for="section in sectionsBefore"
      :key="`before-${section}`"
      class="scroll-test__section"
      :class="`scroll-test__section--${currentLocale}`"
    >
      <h2>{{ $t('section', { n: section }) }}</h2>
      <p>{{ $t('filler') }}</p>
    </section>

    <SwitchLocalePreserve class="scroll-test__switcher">
      <h2>{{ $t('switcher_title') }}</h2>
      <p>{{ $t('switcher_hint') }}</p>
      <p>
        {{ $t('current_locale') }}: <strong>{{ currentLocale }}</strong>
      </p>
      <div class="scroll-test__buttons">
        <button
          v-for="locale in locales"
          :key="locale.code"
          type="button"
          :data-locale="locale.code"
          :disabled="locale.code === currentLocale"
        >
          {{ locale.code }}
        </button>
      </div>
    </SwitchLocalePreserve>

    <section
      v-for="section in sectionsAfter"
      :key="`after-${section}`"
      class="scroll-test__section"
      :class="`scroll-test__section--${currentLocale}`"
    >
      <h2>{{ $t('section', { n: section }) }}</h2>
      <p>{{ $t('filler') }}</p>
    </section>

    <footer class="scroll-test__footer">
      <p>{{ $t('footer') }}</p>
      <NuxtLink :to="$localeRoute({ name: 'index' })">{{ $t('back_home') }}</NuxtLink>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navigation from '~/components/navigation.vue'

definePageMeta({
  scrollToTop: false,
})

const { $getLocales, $getLocale, $localeRoute, $t } = useI18n()

const sectionsBefore = Array.from({ length: 10 }, (_, i) => i + 1)
const sectionsAfter = Array.from({ length: 10 }, (_, i) => i + 11)

const locales = computed(() => $getLocales())
const currentLocale = computed(() => $getLocale())
const scrollY = ref(0)

function updateScrollY() {
  scrollY.value = Math.round(window.scrollY)
}

onMounted(() => {
  updateScrollY()
  window.addEventListener('scroll', updateScrollY, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollY)
})
</script>

<style scoped>
.scroll-test {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1rem 1.5rem 4rem;
}

.scroll-test__header,
.scroll-test__footer {
  margin-bottom: 2rem;
}

.scroll-test__meta-hint {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  font-family: ui-monospace, monospace;
  font-size: 0.8125rem;
}

.scroll-test__scroll-y {
  position: sticky;
  top: 0;
  z-index: 1;
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.375rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
}

.scroll-test__section {
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.scroll-test__section--en,
.scroll-test__section--ch {
  min-height: 8rem;
}

.scroll-test__section--ru,
.scroll-test__section--es {
  min-height: 11rem;
}

.scroll-test__section--de,
.scroll-test__section--fr {
  min-height: 16rem;
}

.scroll-test__switcher {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 2px dashed #2563eb;
  border-radius: 0.75rem;
  background: #eff6ff;
}

.scroll-test__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.scroll-test__buttons button {
  padding: 0.4rem 0.75rem;
  border: 1px solid #93c5fd;
  border-radius: 0.375rem;
  background: #fff;
  cursor: pointer;
}

.scroll-test__buttons button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
