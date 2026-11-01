disablePageLocales → locale=de route=about shown="own_about" state=de loads=[de:index] cookies={} writes=[] head=1
disablePageLocales client → locale=de route=about shown="own_about" state=de loads=[de:index] cookies={"user-locale":"de"} writes=[user-locale=de]
preload on index → locale=de route=index shown="seeded" state=de loads=[] cookies={} writes=[] head=1
preload on a page → locale=de route=about shown="de about" state=de loads=[de:about] cookies={} writes=[] head=1
preload of another locale → locale=de route=index shown="de index" state=de loads=[de:index] cookies={} writes=[] head=1
empty preload → locale=de route=index shown="de index" state=de loads=[de:index] cookies={} writes=[] head=1
failed first load, server → locale=de route=about shown="own_about" state=de loads=[de:about,de:__root] cookies={} writes=[] head=1
failed first load, client → locale=de route=about shown="own_about" state=de loads=[de:about,de:__root] cookies={"user-locale":"de"} writes=[user-locale=de]
failed first load and root → locale=de route=about shown="own_about" state=de loads=[de:about,de:__root] cookies={"user-locale":"de"} writes=[user-locale=de]
hash, a detected shell → locale=fr route=index shown="fr index" state=fr loads=[fr:index] cookies={"hash-locale":"fr","user-locale":"fr"} writes=[hash-locale=fr,user-locale=fr]
hash, a shell with a cookie → locale=fr route=index shown="fr index" state=fr loads=[fr:index] cookies={"hash-locale":"fr","user-locale":"fr"} writes=[hash-locale=fr,user-locale=fr]
hash, the locale in the hash → locale=de route=index shown="de index" state=de loads=[en:index,de:index] cookies={"hash-locale":"de","user-locale":"de"} writes=[hash-locale=de,user-locale=de]
