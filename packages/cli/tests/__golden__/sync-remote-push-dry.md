# sync-remote-push-dry

`i18n-micro sync-remote --no-pull --push --dryRun` -> exit 0

## Output

```
info Dry run completed. No changes were made.
```

## Files

(no files changed)

## Requests

```
PUT /translations {"en":{"common":{"save":"Save","cancel":"Cancel","unused":"Unused value"},"home":{"title":"Welcome {name}","tagline":"Fast i18n"},"greeting":{"hello":"Hello"},"plural":{"apples":"no apples | one apple | {count} apples"},"linked":"See @:common.save","spaced":"Trailing space ","limits":{"max":10,"enabled":true,"list":["a","b"]}},"de":{"common":{"save":"Speichern","cancel":"","extra":"Nur auf Deutsch"},"home":{"title":"Willkommen {name}"},"limits":{"max":20,"enabled":false,"list":["x"]}},"ru":{"common":{"save":"Сохранить","cancel":"Отмена","unused":"Не используется"},"home":{"title":"Добро пожаловать {name}","tagline":"Быстрый i18n"},"greeting":{"hello":"Привет"},"plural":{"apples":"нет яблок | одно яблоко | {count} яблок"},"linked":"См. @:common.save","spaced":"Пробел","limits":{"max":10,"enabled":true,"list":["a","b"]}}}
```
