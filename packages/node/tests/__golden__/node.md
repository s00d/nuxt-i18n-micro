## loader

- `root locales` → ["de","en","fr"]
- `root.en` → {"hello":"Hello","a":{"b":"AB"}}
- `root.de` → {"hello":"Hallo"}
- `root.fr` → {"hello":"Salut"}
- `route names` → ["about","constructor","user-profile"]
- `({}).polluted` → undefined
- `missing dir` → {"root":{},"routes":{}}

## instance

- `load` → "ok"
- `t` → ["Hello","AB","About"]
- `t de` → "Hallo"
- `has` → [true,true]
- `reload` → "ok"
- `after reload` → ["Changed","a.b"]
