# rename

`i18n-micro rename --from common.save --to actions.save` -> exit 0

## Output

```
Key renamed: common.save -> actions.save
Locales: 3, linked messages: 2, source files: 1, source replacements: 1
```

## Files

changed locales/de.json

```
{
  "actions": {
    "save": "Speichern"
  },
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
  }
}
```

changed locales/en.json

```
{
  "actions": {
    "save": "Save"
  },
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
  "linked": "See @:actions.save",
  "spaced": "Trailing space ",
  "limits": {
    "max": 10,
    "enabled": true,
    "list": [
      "a",
      "b"
    ]
  }
}
```

changed locales/ru.json

```
{
  "actions": {
    "save": "Сохранить"
  },
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
  "linked": "См. @:actions.save",
  "spaced": "Пробел",
  "limits": {
    "max": 10,
    "enabled": true,
    "list": [
      "a",
      "b"
    ]
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
