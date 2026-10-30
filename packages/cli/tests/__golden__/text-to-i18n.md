# text-to-i18n

`i18n-micro text-to-i18n` -> exit 0

## Output

```
info Found 6 files to process.
info Found 6 new translations.
success Updated translation file.
```

## Files

changed locales/en.json

```
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "unused": "Unused value"
  },
  "home": {
    "title": "Welcome {name}",
    "tagline": "Fast i18n"
  },
  "greeting": {
    "hello": "Hello"
  },
  "plural": {
    "apples": "no apples | one apple | {count} apples"
  },
  "linked": "See @:common.save",
  "spaced": "Trailing space ",
  "limits": {
    "max": 10,
    "enabled": true,
    "list": [
      "a",
      "b"
    ]
  },
  "pages": {
    "about": {
      "read-more": "Read more"
    },
    "index": {
      "hardcoded-landing-text": "Hardcoded landing text",
      "company-logo": "Company logo",
      "company-logo_1": "\"Company logo\"",
      "logo-png": "\"/logo.png\""
    }
  },
  "plugins": {
    "notify": {
      "saved-successfully": "Saved successfully"
    }
  }
}
```

changed pages/about.vue

```
<template>
  <section>
    <h1>{{ $t('about.title') }}</h1>
    <button :title="$t('about.more')">{{ $t('pages.about.read-more') }}</button>
  </section>
</template>
```

changed pages/index.vue

```
<template>
  <main>
    <h1>{{ $t('home.title') }}</h1>
    <p>{{ $t('common.save') }}</p>
    <p>{{ $t(`dynamic.${kind}`) }}</p>
    <p>{{ $t('pages.index.hardcoded-landing-text') }}</p>
    <SiteHeader />
    <img :alt="$t('pages.index.company-logo')" src={{ $t('pages.index.logo-png') }} />
  </main>
</template>

<script setup lang="ts">
const { $t } = useNuxtApp()
const kind = 'a'
const tagline = $t('home.tagline')
</script>
```
