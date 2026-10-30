# search

`i18n-micro search Save` -> exit 0

## Output

```
== Match #1 ==
Scope:               global
Key:                 common.save
Used in source code: yes
Missing locales:     0

Translations:
  - en: "Save"
  - de: "Speichern"
  - ru: "Сохранить"

Defined in:
  - [de] <project>/locales/de.json:3
  - [en] <project>/locales/en.json:3
  - [ru] <project>/locales/ru.json:3

Used in:
  - <project>/pages/index.vue:4 -> <p>{{ $t('common.save') }}</p>

== Match #2 ==
Scope:               index
Key:                 footer
Used in source code: no
Missing locales:     1

Translations:
  - en: "Save"
  - de: [missing]
  - ru: "Сохранить"

Defined in:
  - [en] <project>/locales/pages/index/en.json:5
  - [ru] <project>/locales/pages/index/ru.json:5

== Match #3 ==
Scope:               global
Key:                 linked
Used in source code: no
Missing locales:     1

Translations:
  - en: "See @:common.save"
  - de: [missing]
  - ru: "См. @:common.save"

Defined in:
  - [en] <project>/locales/en.json:17
  - [ru] <project>/locales/ru.json:17

Hardcoded text:
  - <project>/plugins/notify.ts:2 -> const message = 'Saved successfully'
```

## Files

(no files changed)
