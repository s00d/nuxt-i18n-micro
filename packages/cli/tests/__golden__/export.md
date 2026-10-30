# export

`i18n-micro export --force` -> exit 0

## Output

```
Exported 9 PO files to <project>/pots
```

## Files

added pots/.i18n-export.json

```
{
  "en.po": "617a55317ea3c1595d0cc1d4dae510de55de40614dc749a5fa8179e07cf8cfb2",
  "pages/about/en.po": "fff4a788945c34e6a7c9dfab3221713f4ec6741af1f6c64eb309e9a6946a12f5",
  "pages/index/en.po": "2ab9e57226289e6c053d35648d24ea7de1a925345473bddcd9a3cb493c4997e4",
  "de.po": "7987a18136d4d96c48019086637efa88bf3c1a2ac9ca889d19267354bc96fe54",
  "pages/about/de.po": "d8eaf23d41e50df46951d057f261b3d6f7d9cb4f761a646a87d410d6906cf11f",
  "pages/index/de.po": "a859efb14d4056c032c53f712d81793ec9b1be527f8567da1b1b768b00609937",
  "ru.po": "11dae3279d1dc7861934cc4574fa21dd561c4c3af37684c6635e434987534a49",
  "pages/about/ru.po": "c6d694326b33bfd8978170e69743efbfe6e69eb013fbf19899cbcbbcb2c00c74",
  "pages/index/ru.po": "10a1546f283ea4a8d757224f850ebf9fdca255666a73724979b09fad6229f033"
}
```

changed pots/de.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. Save
msgid "common.save"
msgstr "Speichern"

#. Cancel
msgid "common.cancel"
msgstr ""

#. Unused value
msgid "common.unused"
msgstr ""

#. Welcome {name}
msgid "home.title"
msgstr "Willkommen {name}"

#. Fast i18n
msgid "home.tagline"
msgstr ""

#. Hello
msgid "greeting.hello"
msgstr ""

#. no apples | one apple | {count} apples
msgid "plural.apples"
msgstr ""

#. Trailing space
msgid "spaced"
msgstr ""

msgid "common.extra"
msgstr "Nur auf Deutsch"
```

added pots/en.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. Save
msgid "common.save"
msgstr "Save"

#. Cancel
msgid "common.cancel"
msgstr "Cancel"

#. Unused value
msgid "common.unused"
msgstr "Unused value"

#. Welcome {name}
msgid "home.title"
msgstr "Welcome {name}"

#. Fast i18n
msgid "home.tagline"
msgstr "Fast i18n"

#. Hello
msgid "greeting.hello"
msgstr "Hello"

#. no apples | one apple | {count} apples
msgid "plural.apples"
msgstr "no apples | one apple | {count} apples"

#. Trailing space
msgid "spaced"
msgstr "Trailing space "
```

added pots/pages/about/de.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. About us
msgid "about.title"
msgstr "Über uns"

#. Read more
msgid "about.more"
msgstr ""
```

added pots/pages/about/en.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. About us
msgid "about.title"
msgstr "About us"

#. Read more
msgid "about.more"
msgstr "Read more"
```

added pots/pages/about/ru.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. About us
msgid "about.title"
msgstr "О нас"

#. Read more
msgid "about.more"
msgstr "Подробнее"
```

added pots/pages/index/de.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. Start now
msgid "hero.cta"
msgstr "Jetzt starten"

#. Save
msgid "footer"
msgstr ""
```

added pots/pages/index/en.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. Start now
msgid "hero.cta"
msgstr "Start now"

#. Save
msgid "footer"
msgstr "Save"
```

added pots/pages/index/ru.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. Start now
msgid "hero.cta"
msgstr "Начать"

#. Save
msgid "footer"
msgstr "Сохранить"
```

added pots/ru.po

```
msgid ""
msgstr "Content-Type: text/plain; charset=utf-8\n"

#. Save
msgid "common.save"
msgstr "Сохранить"

#. Cancel
msgid "common.cancel"
msgstr "Отмена"

#. Unused value
msgid "common.unused"
msgstr "Не используется"

#. Welcome {name}
msgid "home.title"
msgstr "Добро пожаловать {name}"

#. Fast i18n
msgid "home.tagline"
msgstr "Быстрый i18n"

#. Hello
msgid "greeting.hello"
msgstr "Привет"

#. no apples | one apple | {count} apples
msgid "plural.apples"
msgstr "нет яблок | одно яблоко | {count} яблок"

#. Trailing space
msgid "spaced"
msgstr "Пробел"
```
