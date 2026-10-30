# export-csv

`i18n-micro export --format csv` -> exit 0

## Output

```
Exported 3 CSV files to <project>/csv_exports
```

## Files

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
