## loader

- `root locales` → ["en","list","null"]
- `root.en` → {"hello":"Hello","a":{"b":"AB"}}
- `root.de` → undefined
- `root.fr` → undefined
- `route names` → ["about","constructor","user-profile"]
- `({}).polluted` → undefined
- `missing dir` → {"root":{},"routes":{}}

## instance

- `load` → "Invalid value used as weak map key"
- `t` → ["Hello","AB","title"]
- `t de` → "Hello"
- `has` → [false,false]
- `reload` → "Invalid value used as weak map key"
- `after reload` → ["Changed","a.b"]
