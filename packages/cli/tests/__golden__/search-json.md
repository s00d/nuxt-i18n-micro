# search-json

`i18n-micro search Welcome --json` -> exit 0

## Output

```
{
  "query": "Welcome",
  "totalMatches": 1,
  "matches": [
    {
      "scope": "global",
      "key": "home.title",
      "fullKey": "home.title",
      "translations": {
        "en": "Welcome {name}",
        "de": "Willkommen {name}",
        "ru": "Добро пожаловать {name}"
      },
      "translationLocations": [
        {
          "locale": "de",
          "scope": "global",
          "file": "<project>/locales/de.json",
          "line": 8,
          "content": "home.title",
          "value": "Willkommen {name}"
        },
        {
          "locale": "en",
          "scope": "global",
          "file": "<project>/locales/en.json",
          "line": 8,
          "content": "home.title",
          "value": "Welcome {name}"
        },
        {
          "locale": "ru",
          "scope": "global",
          "file": "<project>/locales/ru.json",
          "line": 8,
          "content": "home.title",
          "value": "Добро пожаловать {name}"
        }
      ],
      "usages": [
        {
          "file": "<project>/pages/index.vue",
          "line": 3,
          "content": "<h1>{{ $t('home.title') }}</h1>"
        }
      ],
      "missingLocales": [],
      "isUsed": true
    }
  ],
  "hardcoded": [],
  "scannedSourceFiles": 8
}
```

## Files

(no files changed)
