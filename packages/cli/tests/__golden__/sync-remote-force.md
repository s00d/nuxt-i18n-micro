# sync-remote-force

`i18n-micro sync-remote --force` -> exit 0

## Output

```
New:
  - de remote.only

Replaced:
  - de common.save
Pulled 1 new and 1 replaced values.
Global files only: 2 page scopes are not exchanged.
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
