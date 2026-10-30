# format

`i18n-micro format` -> exit 0

## Output

```
Formatted translation files: 8 changed.
```

## Files

changed locales/de.json

```
{
  "common": {
    "cancel": "",
    "extra": "Nur auf Deutsch",
    "save": "Speichern"
  },
  "home": {
    "title": "Willkommen {name}"
  },
  "limits": {
    "enabled": false,
    "list": [
      "x"
    ],
    "max": 20
  }
}
```

changed locales/en.json

```
{
  "common": {
    "cancel": "Cancel",
    "save": "Save",
    "unused": "Unused value"
  },
  "greeting": {
    "hello": "Hello"
  },
  "home": {
    "tagline": "Fast i18n",
    "title": "Welcome {name}"
  },
  "limits": {
    "enabled": true,
    "list": [
      "a",
      "b"
    ],
    "max": 10
  },
  "linked": "See @:common.save",
  "plural": {
    "apples": "no apples | one apple | {count} apples"
  },
  "spaced": "Trailing space "
}
```

changed locales/pages/about/de.json

```
{
  "about": {
    "more": "",
    "title": "Über uns"
  }
}
```

changed locales/pages/about/en.json

```
{
  "about": {
    "more": "Read more",
    "title": "About us"
  }
}
```

changed locales/pages/about/ru.json

```
{
  "about": {
    "more": "Подробнее",
    "title": "О нас"
  }
}
```

changed locales/pages/index/en.json

```
{
  "footer": "Save",
  "hero": {
    "cta": "Start now"
  }
}
```

changed locales/pages/index/ru.json

```
{
  "footer": "Сохранить",
  "hero": {
    "cta": "Начать"
  }
}
```

changed locales/ru.json

```
{
  "common": {
    "cancel": "Отмена",
    "save": "Сохранить",
    "unused": "Не используется"
  },
  "greeting": {
    "hello": "Привет"
  },
  "home": {
    "tagline": "Быстрый i18n",
    "title": "Добро пожаловать {name}"
  },
  "limits": {
    "enabled": true,
    "list": [
      "a",
      "b"
    ],
    "max": 10
  },
  "linked": "См. @:common.save",
  "plural": {
    "apples": "нет яблок | одно яблоко | {count} яблок"
  },
  "spaced": "Пробел"
}
```
