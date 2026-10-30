# extract-app-dir

`i18n-micro extract` -> exit 0

## Output

```
Locale-specific translations have been saved to JSON files.
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
  "footer": {
    "copyright": ""
  },
  "header": {
    "brand": ""
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
  "footer": {
    "copyright": ""
  },
  "header": {
    "brand": ""
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
  "footer": {
    "copyright": ""
  },
  "header": {
    "brand": ""
  }
}
```
