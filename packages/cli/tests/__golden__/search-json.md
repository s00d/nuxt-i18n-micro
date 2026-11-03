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
      "translations": {
        "en": "Welcome {name}",
        "de": "Willkommen {name}",
        "ru": "Добро пожаловать {name}"
      },
      "missingLocales": [],
      "isUsed": true,
      "usages": [
        "pages/index.vue:3"
      ]
    }
  ]
}
```

## Files

(no files changed)
