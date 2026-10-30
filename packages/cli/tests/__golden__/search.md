# search

`i18n-micro search Save` -> exit 0

## Output

```
info
== Match #1 ==
info Display key: global
info Scope: global
info Translation key path: common.save
info Used in source code: yes
info Missing locales: 0
info Definitions found: 3
info Translations by locale:
info   en: "Save"
info   de: "Speichern"
info   ru: "Сохранить"
info Translation file locations:
info   [de] <project>/locales/de.json:3
info   [en] <project>/locales/en.json:3
info   [ru] <project>/locales/ru.json:3
info Source usages:
info   <project>/pages/index.vue:4 -> <p>{{ $t('common.save') }}</p>
info
== Match #2 ==
info Display key: pages/index
info Scope: index
info Translation key path: footer
info Used in source code: no
info Missing locales: 1
info Definitions found: 2
info Translations by locale:
info   en: "Save"
info   ru: "Сохранить"
info Translation file locations:
info   [en] <project>/locales/pages/index/en.json:5
info   [ru] <project>/locales/pages/index/ru.json:5
info Source usages:
info
== Match #3 ==
info Display key: global
info Scope: global
info Translation key path: linked
info Used in source code: no
info Missing locales: 1
info Definitions found: 2
info Translations by locale:
info   en: "See @:common.save"
info   ru: "См. @:common.save"
info Translation file locations:
info   [en] <project>/locales/en.json:17
info   [ru] <project>/locales/ru.json:17
info Source usages:
info
== Hardcoded Text (Not localized) ==
success ✔ Search completed
warn   de: [Missing]
warn   Not used in scanned source files
warn   de: [Missing]
warn   Not used in scanned source files
warn <project>/plugins/notify.ts:2 -> const message = 'Saved successfully'
```

## Files

(no files changed)
