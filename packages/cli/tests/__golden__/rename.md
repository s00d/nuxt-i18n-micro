# rename

`i18n-micro rename --from common.save --to actions.save` -> exit 0

## Output

```
Key renamed: common.save -> actions.save
Locales: 3, source files: 1, source replacements: 1
```

## Files

changed locales/de.json

```
{
  "common": {
    "cancel": "",
    "extra": "Nur auf Deutsch"
  },
  "home": {
    "title": "Willkommen {name}"
  },
  "limits": {
    "max": 20,
    "enabled": false,
    "list": [
      "x"
    ]
  },
  "actions": {
    "save": "Speichern"
  }
}
```

changed locales/en.json

```
{
  "common": {
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
  "spaced": "Trailing space ",
  "limits": {
    "max": 10,
    "enabled": true,
    "list": [
      "a",
      "b"
    ]
  },
  "actions": {
    "save": "Save"
  }
}
```

changed locales/ru.json

```
{
  "common": {
    "cancel": "Отмена",
    "unused": "Не используется"
  },
  "home": {
    "title": "Добро пожаловать {name}",
    "tagline": "Быстрый i18n"
  },
  "greeting": {
    "hello": "Привет"
  },
  "plural": {
    "apples": "нет яблок | одно яблоко | {count} яблок"
  },
  "spaced": "Пробел",
  "limits": {
    "max": 10,
    "enabled": true,
    "list": [
      "a",
      "b"
    ]
  },
  "actions": {
    "save": "Сохранить"
  }
}
```

changed pages/index.vue

```
<template>
  <main>
    <h1>{{ $t('home.title') }}</h1>
    <p>{{ $t('actions.save') }}</p>
    <p>{{ $t(`dynamic.${kind}`) }}</p>
    <p>Hardcoded landing text</p>
    <SiteHeader />
    <img alt="Company logo" src="/logo.png" />
  </main>
</template>

<script setup lang="ts">
const { $t } = useNuxtApp()
const kind = 'a'
const tagline = $t('home.tagline')
</script>
```
