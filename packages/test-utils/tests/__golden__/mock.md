## translate

- `t(hi, {"name":"Jo"}, undefined)` → "Hallo Jo"
- `ts(hi, {"name":"Jo"}, undefined)` → "Hallo Jo"
- `t(only, undefined, undefined)` → "en only"
- `ts(only, undefined, undefined)` → "en only"
- `t(root, undefined, undefined)` → "root"
- `ts(root, undefined, undefined)` → "root"
- `t(miss, undefined, undefined)` → "miss"
- `ts(miss, undefined, undefined)` → "miss"
- `t(miss, undefined, )` → ""
- `ts(miss, undefined, )` → ""
- `t(miss, undefined, D)` → "D"
- `ts(miss, undefined, D)` → "D"
- `t(o, undefined, undefined)` → {"p":"P"}
- `ts(o, undefined, undefined)` → "[object Object]"
- `t(o.p, undefined, undefined)` → "P"
- `ts(o.p, undefined, undefined)` → "P"
- `t(, undefined, D)` → "D"
- `ts(, undefined, D)` → "D"
- `has` → [true,false,false,false]
- `_t(other)` → "hi"
- `_t({name})` → "Hallo Jo"

## plural

- `tc(a, 0)` → "x"
- `tc(a, 1)` → "y"
- `tc(a, 2)` → "z"
- `tc(a, 5)` → "z"
- `tc(a, 1.5)` → "y"
- `tc(a, -1)` → "z"
- `tc(a, NaN)` → "z"
- `tc(a, {count: null})` → throws TypeError: Cannot read properties of null (reading 'toString')
- `tc(a, {})` → "a"
- `tc(miss, 1, D)` → "miss"

## format

- `tn` → "1.234,5"
- `tn currency` → "1,00 €"
- `td` → "15.6.2024"
- `td(nope)` → throws RangeError: Invalid time value
- `tdr +1 day` → "morgen"
- `tdr +1.6h` → "in 2 Stunden"
- `tdr -3 days` → "vor 3 Tagen"

## writes

- `resolveTranslations` → {"hi":"Hallo {name}","only":"en only","a":"x | y | z","o":{"p":"P"}}
- `after writes` → ["A","Q",{"hi":"Hallo {name}","only":"en only","a":"x | y | z","o":{"p":"P","q":"Q"},"added":"A"}]

## paths

- `localePath` → "/de/x"
- `localePath de` → "/de/y"
- `switchLocalePath` → "/en/y"
- `localeRoute` → {"path":"/de/home","name":"home"}
- `switchLocaleRoute` → {"path":"/de/home","name":"about"}
- `except default` → ["/x","/de/x"]
- `no prefix` → "/x"
- `strategy stub` → ["de",null,{"path":"/x","fullPath":"/x"}]

## state

- `fake keys` → ["$_t","$_ts","$defaultLocale","$getI18nConfig","$getLocale","$getLocaleName","$getLocales","$getRouteName","$has","$i18nStrategy","$loadPageTranslations","$localePath","$localeRoute","$mergeTranslations","$resolveTranslations","$setDefaultLocale","$setI18nRouteParams","$setLocale","$setLocaleName","$setLocales","$setMissingHandler","$setRouteName","$setTranslation","$setTranslationsFromJson","$settRouteName","$switchLocale","$switchLocalePath","$switchLocaleRoute","$switchRoute","$t","$tc","$td","$tdr","$tn","$ts","_t","_ts","defaultLocale","getI18nConfig","getLocale","getLocaleName","getLocales","getRouteName","has","helper","i18nStrategy","loadPageTranslations","localePath","localeRoute","mergeTranslations","resolveTranslations","setDefaultLocale","setI18nRouteParams","setLocale","setLocaleName","setLocales","setMissingHandler","setRouteName","setTranslation","setTranslationsFromJson","settRouteName","switchLocale","switchLocalePath","switchLocaleRoute","switchRoute","t","tc","td","tdr","tn","ts"]
- `getLocale` → ["en","en","en","about"]
- `missing handler` → ["en:nope:about"]
- `after reset` → ["de","Hallo Jo","root"]
