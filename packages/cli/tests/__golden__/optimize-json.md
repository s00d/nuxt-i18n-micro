# optimize-json

`i18n-micro optimize --json --minSize 100` -> exit 0

## Output

```
{
  "totalFiles": 9,
  "totalSize": 1579,
  "thresholds": {
    "minSize": 100,
    "maxDepth": 3
  },
  "large": [
    {
      "file": "de.json",
      "size": 220,
      "depth": 2,
      "duplicatedKeys": []
    },
    {
      "file": "en.json",
      "size": 428,
      "depth": 2,
      "duplicatedKeys": []
    },
    {
      "file": "ru.json",
      "size": 529,
      "depth": 2,
      "duplicatedKeys": []
    }
  ],
  "deep": [],
  "duplicated": []
}
```

## Files

(no files changed)
