# sync-remote-force

`i18n-micro sync-remote --force` -> exit 0

## Output

```
Updated 1 locales: de
Conflict de common.save:
  local:  Speichern
  remote: Remote
```

## Files

changed locales/de.json

```
{
  "common": {
    "save": "Remote",
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
  "remote": {
    "only": "Neu"
  }
}
```

## Requests

```
GET /translations 
```
