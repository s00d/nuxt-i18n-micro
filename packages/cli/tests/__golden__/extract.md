# extract

`i18n-micro extract` -> exit 0

## Output

```
Scanned 7 files, updated 6 translation files.
Dynamic i18n key in <project>/pages/index.vue: `dynamic.${kind}`
```

## Files

changed locales/de.json

```
{
  "common": {
    "save": "Speichern",
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
  "header": {
    "brand": ""
  },
  "footer": {
    "copyright": ""
  },
  "greeting": {
    "hello": ""
  }
}
```

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
  "header": {
    "brand": ""
  },
  "footer": {
    "copyright": ""
  }
}
```

added locales/pages/blog-slug/de.json

```
{
  "post": {
    "heading": ""
  }
}
```

added locales/pages/blog-slug/en.json

```
{
  "post": {
    "heading": ""
  }
}
```

added locales/pages/blog-slug/ru.json

```
{
  "post": {
    "heading": ""
  }
}
```

changed locales/ru.json

```
{
  "common": {
    "save": "Сохранить",
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
  "linked": "См. @:common.save",
  "spaced": "Пробел",
  "limits": {
    "max": 10,
    "enabled": true,
    "list": [
      "a",
      "b"
    ]
  },
  "header": {
    "brand": ""
  },
  "footer": {
    "copyright": ""
  }
}
```
