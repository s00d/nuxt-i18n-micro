# pseudo

`i18n-micro pseudo --targetLocale de --replace` -> exit 0

## Output

```
Pseudo locale generated: en -> de
Updated keys: 13, skipped keys: 0
```

## Files

changed locales/de.json

```
{
  "common": {
    "save": "[SSaavvee]",
    "cancel": "[CCaanncceell]",
    "extra": "Nur auf Deutsch",
    "unused": "[UUnnuusseedd vvaalluuee]"
  },
  "home": {
    "title": "[WWeellccoommee {name}]",
    "tagline": "[FFaasstt ii18nn]"
  },
  "limits": {
    "max": 20,
    "enabled": false,
    "list": [
      "x"
    ]
  },
  "greeting": {
    "hello": "[HHeelllloo]"
  },
  "plural": {
    "apples": "[nnoo aapppplleess | oonnee aappppllee | {count} aapppplleess]"
  },
  "linked": "[SSeeee @:common.save]",
  "spaced": "[TTrraaiilliinngg ssppaaccee ]"
}
```

changed locales/pages/about/de.json

```
{
  "about": {
    "title": "[AAbboouutt uuss]",
    "more": "[RReeaadd mmoorree]"
  }
}
```

changed locales/pages/index/de.json

```
{
  "hero": {
    "cta": "[SSttaarrtt nnooww]"
  },
  "footer": "[SSaavvee]"
}
```
