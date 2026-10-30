# sync

`i18n-micro sync` -> exit 0

## Output

```
Translations have been synchronized.
```

## Files

changed locales/de.json

```
{
  "common": {
    "save": "Speichern",
    "cancel": "",
    "unused": ""
  },
  "home": {
    "title": "Willkommen {name}",
    "tagline": ""
  },
  "greeting": {
    "hello": ""
  },
  "plural": {
    "apples": ""
  },
  "linked": "",
  "spaced": "",
  "limits": {
    "max": 20,
    "enabled": false,
    "list": [
      "x"
    ]
  }
}
```

changed locales/pages/index/de.json

```
{
  "hero": {
    "cta": "Jetzt starten"
  },
  "footer": ""
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
  }
}
```
