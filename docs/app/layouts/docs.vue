<script setup lang="ts">
const route = useRoute()
const sectionNav = useSectionNavigation()
const aside = useTemplateRef<{ $el: HTMLElement }>('aside')

/**
 * UPageAside is sticky under the header with its own scroll when the nav is longer than the
 * viewport. Bring the current page's link into view inside it, without moving the window.
 */
function revealActiveLink() {
  const root = aside.value?.$el
  // UContentNavigation marks the active link by class only; match it by URL.
  const links = root ? [...root.querySelectorAll<HTMLAnchorElement>('a[data-slot="link"]')] : []
  const link = links.find((anchor) => anchor.pathname === window.location.pathname)
  if (!root || !link) return
  const top = link.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
  if (top < root.scrollTop || top + link.offsetHeight > root.scrollTop + root.clientHeight) {
    root.scrollTop = top - root.clientHeight / 2 + link.offsetHeight / 2
  }
}

onMounted(() => nextTick(revealActiveLink))
// After client navigation, once the new page's link is rendered.
watch(
  () => route.path,
  () => nextTick(revealActiveLink),
  { flush: 'post' },
)
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside ref="aside">
          <!-- Groups open on the current page's branch, so the sidebar stays short. -->
          <UContentNavigation highlight default-open :navigation="sectionNav" />
        </UPageAside>
      </template>
      <slot />
    </UPage>
  </UContainer>
</template>
