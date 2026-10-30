# split

`i18n-micro split --splitByPrefix --outputDir split-out` -> exit 0

## Output

```
success Split translations for locale en into 7 files
success Split translations for locale de into 3 files
success Split translations for locale ru into 7 files
```

## Files

added split-out/de/common.json

```
{
  "common.save": "Speichern",
  "common.cancel": "",
  "common.extra": "Nur auf Deutsch"
}
```

added split-out/de/home.json

```
{
  "home.title": "Willkommen {name}"
}
```

added split-out/de/limits.json

```
{
  "limits.max": 20,
  "limits.enabled": false,
  "limits.list": [
    "x"
  ]
}
```

added split-out/en/common.json

```
{
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.unused": "Unused value"
}
```

added split-out/en/greeting.json

```
{
  "greeting.hello": "Hello"
}
```

added split-out/en/home.json

```
{
  "home.title": "Welcome {name}",
  "home.tagline": "Fast i18n"
}
```

added split-out/en/limits.json

```
{
  "limits.max": 10,
  "limits.enabled": true,
  "limits.list": [
    "a",
    "b"
  ]
}
```

added split-out/en/linked.json

```
{
  "linked": "See @:common.save"
}
```

added split-out/en/plural.json

```
{
  "plural.apples": "no apples | one apple | {count} apples"
}
```

added split-out/en/spaced.json

```
{
  "spaced": "Trailing space "
}
```

added split-out/ru/common.json

```
{
  "common.save": "Сохранить",
  "common.cancel": "Отмена",
  "common.unused": "Не используется"
}
```

added split-out/ru/greeting.json

```
{
  "greeting.hello": "Привет"
}
```

added split-out/ru/home.json

```
{
  "home.title": "Добро пожаловать {name}",
  "home.tagline": "Быстрый i18n"
}
```

added split-out/ru/limits.json

```
{
  "limits.max": 10,
  "limits.enabled": true,
  "limits.list": [
    "a",
    "b"
  ]
}
```

added split-out/ru/linked.json

```
{
  "linked": "См. @:common.save"
}
```

added split-out/ru/plural.json

```
{
  "plural.apples": "нет яблок | одно яблоко | {count} яблок"
}
```

added split-out/ru/spaced.json

```
{
  "spaced": "Пробел"
}
```
