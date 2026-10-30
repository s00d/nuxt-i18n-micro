# optimize-json

`i18n-micro optimize --json --minSize 100` -> exit 0

## Output

```
{
  "analysis": {
    "totalFiles": 9,
    "totalSize": 1627,
    "averageSize": 180.77777777777777,
    "largeFiles": [
      {
        "path": "locales/de.json",
        "content": {
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
          }
        },
        "size": 232,
        "keys": [
          "common.save",
          "common.cancel",
          "common.extra",
          "home.title",
          "limits.max",
          "limits.enabled",
          "limits.list"
        ]
      },
      {
        "path": "locales/en.json",
        "content": {
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
          }
        },
        "size": 446,
        "keys": [
          "common.save",
          "common.cancel",
          "common.unused",
          "home.title",
          "home.tagline",
          "greeting.hello",
          "plural.apples",
          "linked",
          "spaced",
          "limits.max",
          "limits.enabled",
          "limits.list"
        ]
      },
      {
        "path": "locales/ru.json",
        "content": {
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
        },
        "size": 547,
        "keys": [
          "common.save",
          "common.cancel",
          "common.unused",
          "home.title",
          "home.tagline",
          "greeting.hello",
          "plural.apples",
          "linked",
          "spaced",
          "limits.max",
          "limits.enabled",
          "limits.list"
        ]
      }
    ],
    "deepNestingFiles": [],
    "duplicateKeysFiles": []
  },
  "thresholds": {
    "minSize": 100,
    "maxDepth": 3
  },
  "canOptimize": true
}
```

## Files

(no files changed)
