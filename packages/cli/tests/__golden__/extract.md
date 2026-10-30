# extract

`i18n-micro extract` -> exit 0

## Output

```
Locale-specific translations have been saved to JSON files.
warn Dynamic i18n key detected in <project>/pages/index.vue: [TemplateLiteral]
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

added locales/pages/_about/de.json

```
{
  "about": {
    "title": "",
    "more": ""
  }
}
```

added locales/pages/_about/en.json

```
{
  "about": {
    "title": "",
    "more": ""
  }
}
```

added locales/pages/_about/ru.json

```
{
  "about": {
    "title": "",
    "more": ""
  }
}
```

added locales/pages/blog_/de.json

```
{
  "post": {
    "heading": ""
  }
}
```

added locales/pages/blog_/en.json

```
{
  "post": {
    "heading": ""
  }
}
```

added locales/pages/blog_/ru.json

```
{
  "post": {
    "heading": ""
  }
}
```

added locales/pages/de.json

```
{
  "home": {
    "title": "",
    "tagline": ""
  },
  "common": {
    "save": ""
  }
}
```

added locales/pages/en.json

```
{
  "home": {
    "title": "",
    "tagline": ""
  },
  "common": {
    "save": ""
  }
}
```

added locales/pages/ru.json

```
{
  "home": {
    "title": "",
    "tagline": ""
  },
  "common": {
    "save": ""
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
