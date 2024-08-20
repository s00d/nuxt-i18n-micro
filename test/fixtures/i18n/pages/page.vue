<template>
  <div>
    <p>{{ $t('key2.key2.key2.key2.key2') }}</p>
    <p>Current Locale: {{ currentLocale }}</p>

    <div>
      {{ $t('welcome', { username: 'Alice', unreadCount: 5 }) }}
    </div>
    <div>
      <i18n-t
        keypath="apples"
        :plural="10"
        tag="div"
        scope="global"
      >
        <template #count>
          10
        </template>
      </i18n-t>
    </div>

    <!-- Links for switching locales -->
    <div>
      <button
        v-for="value in locales"
        :key="value"
        :disabled="value === currentLocale"
        @click="switchLocale(value)"
      >
        Switch to {{ value }}
      </button>
    </div>

    <div>
      <NuxtLink :to="localeRoute('index')">
        Go to Index
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { locale, availableLocales, setLocale } = useI18n()

const router = useRouter()
const localeRoute = useLocalePath()

const currentLocale = locale.value
const locales = availableLocales

const switchLocale = async (newLocale) => {
  if (newLocale !== currentLocale) {
    await setLocale(newLocale)
    const path = useSwitchLocalePath(newLocale)
    router.push(path)
  }
}
</script>
