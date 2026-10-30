# sync-remote-force

`i18n-micro sync-remote --force` -> exit 0

## Output

```
success Updated 1 locales: de
warn Found 1 conflicts
warn   de.common.save:
warn     Local:  "Speichern"
warn     Remote: "Remote"
```

## Files

changed locales/de.json

```
{
  "common": {
    "save": "Remote"
  },
  "remote": {
    "only": "Neu"
  }
}
```

## Requests

```
GET /translations 
```
