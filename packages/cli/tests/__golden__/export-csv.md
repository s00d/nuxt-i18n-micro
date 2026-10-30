# export-csv

`i18n-micro export --format csv --force` -> exit 0

## Output

```
Exported 3 CSV files to <project>/csv_exports
```

## Files

added csv_exports/.i18n-export.json

```
{
  "en.csv": "dbbcdcb339bf554c97aadd33e87c078b876c4e518ad3597ce28b83144f04b77a",
  "de.csv": "a149dbad49a721ad21a2531f0d35854c7236345cd025c9fdc8f79f29d830efaa",
  "ru.csv": "1f7421ba1b880811f2020d6e9609f40cd3058ff9d6b1ba897f152630704b3144"
}
```

changed csv_exports/de.csv

```
File,Key,Source,Translation
de.json,common.save,Save,Speichern
de.json,common.cancel,Cancel,
de.json,common.unused,Unused value,
de.json,home.title,Welcome {name},Willkommen {name}
de.json,home.tagline,Fast i18n,
de.json,greeting.hello,Hello,
de.json,plural.apples,no apples | one apple | {count} apples,
de.json,spaced,Trailing space ,
de.json,common.extra,,Nur auf Deutsch
pages/about/de.json,about.title,About us,Über uns
pages/about/de.json,about.more,Read more,
pages/index/de.json,hero.cta,Start now,Jetzt starten
pages/index/de.json,footer,Save,
```

added csv_exports/en.csv

```
File,Key,Source,Translation
en.json,common.save,Save,Save
en.json,common.cancel,Cancel,Cancel
en.json,common.unused,Unused value,Unused value
en.json,home.title,Welcome {name},Welcome {name}
en.json,home.tagline,Fast i18n,Fast i18n
en.json,greeting.hello,Hello,Hello
en.json,plural.apples,no apples | one apple | {count} apples,no apples | one apple | {count} apples
en.json,spaced,Trailing space ,Trailing space
pages/about/en.json,about.title,About us,About us
pages/about/en.json,about.more,Read more,Read more
pages/index/en.json,hero.cta,Start now,Start now
pages/index/en.json,footer,Save,Save
```

added csv_exports/ru.csv

```
File,Key,Source,Translation
ru.json,common.save,Save,Сохранить
ru.json,common.cancel,Cancel,Отмена
ru.json,common.unused,Unused value,Не используется
ru.json,home.title,Welcome {name},Добро пожаловать {name}
ru.json,home.tagline,Fast i18n,Быстрый i18n
ru.json,greeting.hello,Hello,Привет
ru.json,plural.apples,no apples | one apple | {count} apples,нет яблок | одно яблоко | {count} яблок
ru.json,spaced,Trailing space ,Пробел
pages/about/ru.json,about.title,About us,О нас
pages/about/ru.json,about.more,Read more,Подробнее
pages/index/ru.json,hero.cta,Start now,Начать
pages/index/ru.json,footer,Save,Сохранить
```
