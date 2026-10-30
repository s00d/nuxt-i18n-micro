# clean-exclude

`i18n-micro clean --exclude ^common` -> exit 0

## Output

```
Removed 18 unused keys.
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
  }
}
```

changed locales/pages/index/de.json

```
{}
```

changed locales/pages/index/en.json

```
{
  "footer": "Save"
}
```

changed locales/pages/index/ru.json

```
{
  "footer": "Сохранить"
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
  }
}
```
