# stats-json

`i18n-micro stats --json` -> exit 0

## Output

```
{
  "locales": [
    {
      "code": "en",
      "global": {
        "totalKeys": 9,
        "translatedKeys": 9,
        "completion": 100,
        "averageKeyLength": 10.88888888888889,
        "averageValueLength": 13.333333333333334,
        "specialCharsCount": 8,
        "emptyValues": 0,
        "duplicateValues": [],
        "longestKeys": [
          {
            "key": "greeting.hello",
            "length": 14
          },
          {
            "key": "common.cancel",
            "length": 13
          },
          {
            "key": "common.unused",
            "length": 13
          },
          {
            "key": "plural.apples",
            "length": 13
          },
          {
            "key": "home.tagline",
            "length": 12
          }
        ],
        "longestValues": [
          {
            "key": "plural.apples",
            "value": "no apples | one apple | {count} apples",
            "length": 38
          },
          {
            "key": "linked",
            "value": "See @:common.save",
            "length": 17
          },
          {
            "key": "spaced",
            "value": "Trailing space ",
            "length": 15
          },
          {
            "key": "home.title",
            "value": "Welcome {name}",
            "length": 14
          },
          {
            "key": "common.unused",
            "value": "Unused value",
            "length": 12
          }
        ],
        "formattingIssues": [
          {
            "key": "spaced",
            "issue": "Contains leading/trailing spaces"
          }
        ],
        "valueTypes": {
          "strings": 9,
          "numbers": 0,
          "booleans": 0,
          "arrays": 0,
          "objects": 0
        },
        "stringLengths": {
          "short": 4,
          "medium": 5,
          "long": 0,
          "veryLong": 0
        },
        "htmlTags": {
          "count": 0,
          "tags": []
        },
        "variables": {
          "count": 2,
          "examples": [
            {
              "key": "home.title",
              "variables": [
                "name"
              ]
            },
            {
              "key": "plural.apples",
              "variables": [
                "count"
              ]
            }
          ]
        },
        "specialChars": {
          "punctuation": 2,
          "emoji": 2,
          "currency": 0,
          "other": 7
        },
        "wordStats": {
          "totalWords": 20,
          "uniqueWords": 18,
          "repeatedWords": [
            {
              "word": "save",
              "count": 2
            },
            {
              "word": "apples",
              "count": 2
            }
          ],
          "averageWordLength": 4.9
        },
        "caseStats": {
          "upperCase": 0,
          "lowerCase": 1,
          "titleCase": 8,
          "mixedCase": 0
        }
      },
      "pages": {
        "about": {
          "totalKeys": 2,
          "translatedKeys": 2,
          "completion": 100,
          "averageKeyLength": 10.5,
          "averageValueLength": 8.5,
          "specialCharsCount": 0,
          "emptyValues": 0,
          "duplicateValues": [],
          "longestKeys": [
            {
              "key": "about.title",
              "length": 11
            },
            {
              "key": "about.more",
              "length": 10
            }
          ],
          "longestValues": [
            {
              "key": "about.more",
              "value": "Read more",
              "length": 9
            },
            {
              "key": "about.title",
              "value": "About us",
              "length": 8
            }
          ],
          "formattingIssues": [],
          "valueTypes": {
            "strings": 2,
            "numbers": 0,
            "booleans": 0,
            "arrays": 0,
            "objects": 0
          },
          "stringLengths": {
            "short": 2,
            "medium": 0,
            "long": 0,
            "veryLong": 0
          },
          "htmlTags": {
            "count": 0,
            "tags": []
          },
          "variables": {
            "count": 0,
            "examples": []
          },
          "specialChars": {
            "punctuation": 0,
            "emoji": 0,
            "currency": 0,
            "other": 0
          },
          "wordStats": {
            "totalWords": 4,
            "uniqueWords": 4,
            "repeatedWords": [],
            "averageWordLength": 3.75
          },
          "caseStats": {
            "upperCase": 0,
            "lowerCase": 0,
            "titleCase": 2,
            "mixedCase": 0
          }
        },
        "index": {
          "totalKeys": 2,
          "translatedKeys": 2,
          "completion": 100,
          "averageKeyLength": 7,
          "averageValueLength": 6.5,
          "specialCharsCount": 0,
          "emptyValues": 0,
          "duplicateValues": [],
          "longestKeys": [
            {
              "key": "hero.cta",
              "length": 8
            },
            {
              "key": "footer",
              "length": 6
            }
          ],
          "longestValues": [
            {
              "key": "hero.cta",
              "value": "Start now",
              "length": 9
            },
            {
              "key": "footer",
              "value": "Save",
              "length": 4
            }
          ],
          "formattingIssues": [],
          "valueTypes": {
            "strings": 2,
            "numbers": 0,
            "booleans": 0,
            "arrays": 0,
            "objects": 0
          },
          "stringLengths": {
            "short": 2,
            "medium": 0,
            "long": 0,
            "veryLong": 0
          },
          "htmlTags": {
            "count": 0,
            "tags": []
          },
          "variables": {
            "count": 0,
            "examples": []
          },
          "specialChars": {
            "punctuation": 0,
            "emoji": 0,
            "currency": 0,
            "other": 0
          },
          "wordStats": {
            "totalWords": 3,
            "uniqueWords": 3,
            "repeatedWords": [],
            "averageWordLength": 4
          },
          "caseStats": {
            "upperCase": 0,
            "lowerCase": 0,
            "titleCase": 2,
            "mixedCase": 0
          }
        }
      },
      "combined": {
        "totalKeys": 13,
        "translatedKeys": 13,
        "completion": 100,
        "averageKeyLength": 14.23076923076923,
        "averageValueLength": 11.538461538461538,
        "specialCharsCount": 8,
        "emptyValues": 0,
        "duplicateValues": [
          "common.save, $pages.index.footer: \"Save\""
        ],
        "longestKeys": [
          {
            "key": "$pages.about.about.title",
            "length": 24
          },
          {
            "key": "$pages.about.about.more",
            "length": 23
          },
          {
            "key": "$pages.index.hero.cta",
            "length": 21
          },
          {
            "key": "$pages.index.footer",
            "length": 19
          },
          {
            "key": "greeting.hello",
            "length": 14
          }
        ],
        "longestValues": [
          {
            "key": "plural.apples",
            "value": "no apples | one apple | {count} apples",
            "length": 38
          },
          {
            "key": "linked",
            "value": "See @:common.save",
            "length": 17
          },
          {
            "key": "spaced",
            "value": "Trailing space ",
            "length": 15
          },
          {
            "key": "home.title",
            "value": "Welcome {name}",
            "length": 14
          },
          {
            "key": "common.unused",
            "value": "Unused value",
            "length": 12
          }
        ],
        "formattingIssues": [
          {
            "key": "spaced",
            "issue": "Contains leading/trailing spaces"
          }
        ],
        "valueTypes": {
          "strings": 13,
          "numbers": 0,
          "booleans": 0,
          "arrays": 0,
          "objects": 0
        },
        "stringLengths": {
          "short": 8,
          "medium": 5,
          "long": 0,
          "veryLong": 0
        },
        "htmlTags": {
          "count": 0,
          "tags": []
        },
        "variables": {
          "count": 2,
          "examples": [
            {
              "key": "home.title",
              "variables": [
                "name"
              ]
            },
            {
              "key": "plural.apples",
              "variables": [
                "count"
              ]
            }
          ]
        },
        "specialChars": {
          "punctuation": 2,
          "emoji": 2,
          "currency": 0,
          "other": 7
        },
        "wordStats": {
          "totalWords": 27,
          "uniqueWords": 24,
          "repeatedWords": [
            {
              "word": "save",
              "count": 3
            },
            {
              "word": "apples",
              "count": 2
            }
          ],
          "averageWordLength": 4.62962962962963
        },
        "caseStats": {
          "upperCase": 0,
          "lowerCase": 1,
          "titleCase": 12,
          "mixedCase": 0
        }
      }
    },
    {
      "code": "de",
      "global": {
        "totalKeys": 9,
        "translatedKeys": 3,
        "completion": 22.22222222222222,
        "averageKeyLength": 11.5,
        "averageValueLength": 10.25,
        "specialCharsCount": 2,
        "emptyValues": 1,
        "duplicateValues": [],
        "longestKeys": [
          {
            "key": "common.cancel",
            "length": 13
          },
          {
            "key": "common.extra",
            "length": 12
          },
          {
            "key": "common.save",
            "length": 11
          },
          {
            "key": "home.title",
            "length": 10
          }
        ],
        "longestValues": [
          {
            "key": "home.title",
            "value": "Willkommen {name}",
            "length": 17
          },
          {
            "key": "common.extra",
            "value": "Nur auf Deutsch",
            "length": 15
          },
          {
            "key": "common.save",
            "value": "Speichern",
            "length": 9
          },
          {
            "key": "common.cancel",
            "value": "",
            "length": 0
          }
        ],
        "formattingIssues": [],
        "valueTypes": {
          "strings": 4,
          "numbers": 0,
          "booleans": 0,
          "arrays": 0,
          "objects": 0
        },
        "stringLengths": {
          "short": 2,
          "medium": 2,
          "long": 0,
          "veryLong": 0
        },
        "htmlTags": {
          "count": 0,
          "tags": []
        },
        "variables": {
          "count": 1,
          "examples": [
            {
              "key": "home.title",
              "variables": [
                "name"
              ]
            }
          ]
        },
        "specialChars": {
          "punctuation": 0,
          "emoji": 0,
          "currency": 0,
          "other": 2
        },
        "wordStats": {
          "totalWords": 6,
          "uniqueWords": 6,
          "repeatedWords": [],
          "averageWordLength": 6
        },
        "caseStats": {
          "upperCase": 1,
          "lowerCase": 0,
          "titleCase": 2,
          "mixedCase": 1
        }
      },
      "pages": {
        "about": {
          "totalKeys": 2,
          "translatedKeys": 1,
          "completion": 50,
          "averageKeyLength": 10.5,
          "averageValueLength": 4,
          "specialCharsCount": 1,
          "emptyValues": 1,
          "duplicateValues": [],
          "longestKeys": [
            {
              "key": "about.title",
              "length": 11
            },
            {
              "key": "about.more",
              "length": 10
            }
          ],
          "longestValues": [
            {
              "key": "about.title",
              "value": "Über uns",
              "length": 8
            },
            {
              "key": "about.more",
              "value": "",
              "length": 0
            }
          ],
          "formattingIssues": [],
          "valueTypes": {
            "strings": 2,
            "numbers": 0,
            "booleans": 0,
            "arrays": 0,
            "objects": 0
          },
          "stringLengths": {
            "short": 2,
            "medium": 0,
            "long": 0,
            "veryLong": 0
          },
          "htmlTags": {
            "count": 0,
            "tags": []
          },
          "variables": {
            "count": 0,
            "examples": []
          },
          "specialChars": {
            "punctuation": 0,
            "emoji": 0,
            "currency": 0,
            "other": 1
          },
          "wordStats": {
            "totalWords": 2,
            "uniqueWords": 2,
            "repeatedWords": [],
            "averageWordLength": 3
          },
          "caseStats": {
            "upperCase": 1,
            "lowerCase": 0,
            "titleCase": 1,
            "mixedCase": 0
          }
        },
        "index": {
          "totalKeys": 2,
          "translatedKeys": 1,
          "completion": 50,
          "averageKeyLength": 8,
          "averageValueLength": 13,
          "specialCharsCount": 0,
          "emptyValues": 0,
          "duplicateValues": [],
          "longestKeys": [
            {
              "key": "hero.cta",
              "length": 8
            }
          ],
          "longestValues": [
            {
              "key": "hero.cta",
              "value": "Jetzt starten",
              "length": 13
            }
          ],
          "formattingIssues": [],
          "valueTypes": {
            "strings": 1,
            "numbers": 0,
            "booleans": 0,
            "arrays": 0,
            "objects": 0
          },
          "stringLengths": {
            "short": 0,
            "medium": 1,
            "long": 0,
            "veryLong": 0
          },
          "htmlTags": {
            "count": 0,
            "tags": []
          },
          "variables": {
            "count": 0,
            "examples": []
          },
          "specialChars": {
            "punctuation": 0,
            "emoji": 0,
            "currency": 0,
            "other": 0
          },
          "wordStats": {
            "totalWords": 2,
            "uniqueWords": 2,
            "repeatedWords": [],
            "averageWordLength": 6
          },
          "caseStats": {
            "upperCase": 0,
            "lowerCase": 0,
            "titleCase": 1,
            "mixedCase": 0
          }
        }
      },
      "combined": {
        "totalKeys": 13,
        "translatedKeys": 5,
        "completion": 30.76923076923077,
        "averageKeyLength": 16.285714285714285,
        "averageValueLength": 8.857142857142858,
        "specialCharsCount": 3,
        "emptyValues": 2,
        "duplicateValues": [
          "common.cancel, $pages.about.about.more: \"\""
        ],
        "longestKeys": [
          {
            "key": "$pages.about.about.title",
            "length": 24
          },
          {
            "key": "$pages.about.about.more",
            "length": 23
          },
          {
            "key": "$pages.index.hero.cta",
            "length": 21
          },
          {
            "key": "common.cancel",
            "length": 13
          },
          {
            "key": "common.extra",
            "length": 12
          }
        ],
        "longestValues": [
          {
            "key": "home.title",
            "value": "Willkommen {name}",
            "length": 17
          },
          {
            "key": "common.extra",
            "value": "Nur auf Deutsch",
            "length": 15
          },
          {
            "key": "$pages.index.hero.cta",
            "value": "Jetzt starten",
            "length": 13
          },
          {
            "key": "common.save",
            "value": "Speichern",
            "length": 9
          },
          {
            "key": "$pages.about.about.title",
            "value": "Über uns",
            "length": 8
          }
        ],
        "formattingIssues": [],
        "valueTypes": {
          "strings": 7,
          "numbers": 0,
          "booleans": 0,
          "arrays": 0,
          "objects": 0
        },
        "stringLengths": {
          "short": 4,
          "medium": 3,
          "long": 0,
          "veryLong": 0
        },
        "htmlTags": {
          "count": 0,
          "tags": []
        },
        "variables": {
          "count": 1,
          "examples": [
            {
              "key": "home.title",
              "variables": [
                "name"
              ]
            }
          ]
        },
        "specialChars": {
          "punctuation": 0,
          "emoji": 0,
          "currency": 0,
          "other": 3
        },
        "wordStats": {
          "totalWords": 10,
          "uniqueWords": 10,
          "repeatedWords": [],
          "averageWordLength": 5.4
        },
        "caseStats": {
          "upperCase": 2,
          "lowerCase": 0,
          "titleCase": 4,
          "mixedCase": 1
        }
      }
    },
    {
      "code": "ru",
      "global": {
        "totalKeys": 9,
        "translatedKeys": 9,
        "completion": 100,
        "averageKeyLength": 10.88888888888889,
        "averageValueLength": 14.777777777777779,
        "specialCharsCount": 96,
        "emptyValues": 0,
        "duplicateValues": [],
        "longestKeys": [
          {
            "key": "greeting.hello",
            "length": 14
          },
          {
            "key": "common.cancel",
            "length": 13
          },
          {
            "key": "common.unused",
            "length": 13
          },
          {
            "key": "plural.apples",
            "length": 13
          },
          {
            "key": "home.tagline",
            "length": 12
          }
        ],
        "longestValues": [
          {
            "key": "plural.apples",
            "value": "нет яблок | одно яблоко | {count} яблок",
            "length": 39
          },
          {
            "key": "home.title",
            "value": "Добро пожаловать {name}",
            "length": 23
          },
          {
            "key": "linked",
            "value": "См. @:common.save",
            "length": 17
          },
          {
            "key": "common.unused",
            "value": "Не используется",
            "length": 15
          },
          {
            "key": "home.tagline",
            "value": "Быстрый i18n",
            "length": 12
          }
        ],
        "formattingIssues": [],
        "valueTypes": {
          "strings": 9,
          "numbers": 0,
          "booleans": 0,
          "arrays": 0,
          "objects": 0
        },
        "stringLengths": {
          "short": 4,
          "medium": 5,
          "long": 0,
          "veryLong": 0
        },
        "htmlTags": {
          "count": 0,
          "tags": []
        },
        "variables": {
          "count": 2,
          "examples": [
            {
              "key": "home.title",
              "variables": [
                "name"
              ]
            },
            {
              "key": "plural.apples",
              "variables": [
                "count"
              ]
            }
          ]
        },
        "specialChars": {
          "punctuation": 3,
          "emoji": 2,
          "currency": 0,
          "other": 95
        },
        "wordStats": {
          "totalWords": 5,
          "uniqueWords": 5,
          "repeatedWords": [],
          "averageWordLength": 4.6
        },
        "caseStats": {
          "upperCase": 0,
          "lowerCase": 1,
          "titleCase": 8,
          "mixedCase": 0
        }
      },
      "pages": {
        "about": {
          "totalKeys": 2,
          "translatedKeys": 2,
          "completion": 100,
          "averageKeyLength": 10.5,
          "averageValueLength": 7,
          "specialCharsCount": 13,
          "emptyValues": 0,
          "duplicateValues": [],
          "longestKeys": [
            {
              "key": "about.title",
              "length": 11
            },
            {
              "key": "about.more",
              "length": 10
            }
          ],
          "longestValues": [
            {
              "key": "about.more",
              "value": "Подробнее",
              "length": 9
            },
            {
              "key": "about.title",
              "value": "О нас",
              "length": 5
            }
          ],
          "formattingIssues": [],
          "valueTypes": {
            "strings": 2,
            "numbers": 0,
            "booleans": 0,
            "arrays": 0,
            "objects": 0
          },
          "stringLengths": {
            "short": 2,
            "medium": 0,
            "long": 0,
            "veryLong": 0
          },
          "htmlTags": {
            "count": 0,
            "tags": []
          },
          "variables": {
            "count": 0,
            "examples": []
          },
          "specialChars": {
            "punctuation": 0,
            "emoji": 0,
            "currency": 0,
            "other": 13
          },
          "wordStats": {
            "totalWords": 0,
            "uniqueWords": 0,
            "repeatedWords": [],
            "averageWordLength": 0
          },
          "caseStats": {
            "upperCase": 0,
            "lowerCase": 0,
            "titleCase": 2,
            "mixedCase": 0
          }
        },
        "index": {
          "totalKeys": 2,
          "translatedKeys": 2,
          "completion": 100,
          "averageKeyLength": 7,
          "averageValueLength": 7.5,
          "specialCharsCount": 15,
          "emptyValues": 0,
          "duplicateValues": [],
          "longestKeys": [
            {
              "key": "hero.cta",
              "length": 8
            },
            {
              "key": "footer",
              "length": 6
            }
          ],
          "longestValues": [
            {
              "key": "footer",
              "value": "Сохранить",
              "length": 9
            },
            {
              "key": "hero.cta",
              "value": "Начать",
              "length": 6
            }
          ],
          "formattingIssues": [],
          "valueTypes": {
            "strings": 2,
            "numbers": 0,
            "booleans": 0,
            "arrays": 0,
            "objects": 0
          },
          "stringLengths": {
            "short": 2,
            "medium": 0,
            "long": 0,
            "veryLong": 0
          },
          "htmlTags": {
            "count": 0,
            "tags": []
          },
          "variables": {
            "count": 0,
            "examples": []
          },
          "specialChars": {
            "punctuation": 0,
            "emoji": 0,
            "currency": 0,
            "other": 15
          },
          "wordStats": {
            "totalWords": 0,
            "uniqueWords": 0,
            "repeatedWords": [],
            "averageWordLength": 0
          },
          "caseStats": {
            "upperCase": 0,
            "lowerCase": 0,
            "titleCase": 2,
            "mixedCase": 0
          }
        }
      },
      "combined": {
        "totalKeys": 13,
        "translatedKeys": 13,
        "completion": 100,
        "averageKeyLength": 14.23076923076923,
        "averageValueLength": 12.461538461538462,
        "specialCharsCount": 124,
        "emptyValues": 0,
        "duplicateValues": [
          "common.save, $pages.index.footer: \"Сохранить\""
        ],
        "longestKeys": [
          {
            "key": "$pages.about.about.title",
            "length": 24
          },
          {
            "key": "$pages.about.about.more",
            "length": 23
          },
          {
            "key": "$pages.index.hero.cta",
            "length": 21
          },
          {
            "key": "$pages.index.footer",
            "length": 19
          },
          {
            "key": "greeting.hello",
            "length": 14
          }
        ],
        "longestValues": [
          {
            "key": "plural.apples",
            "value": "нет яблок | одно яблоко | {count} яблок",
            "length": 39
          },
          {
            "key": "home.title",
            "value": "Добро пожаловать {name}",
            "length": 23
          },
          {
            "key": "linked",
            "value": "См. @:common.save",
            "length": 17
          },
          {
            "key": "common.unused",
            "value": "Не используется",
            "length": 15
          },
          {
            "key": "home.tagline",
            "value": "Быстрый i18n",
            "length": 12
          }
        ],
        "formattingIssues": [],
        "valueTypes": {
          "strings": 13,
          "numbers": 0,
          "booleans": 0,
          "arrays": 0,
          "objects": 0
        },
        "stringLengths": {
          "short": 8,
          "medium": 5,
          "long": 0,
          "veryLong": 0
        },
        "htmlTags": {
          "count": 0,
          "tags": []
        },
        "variables": {
          "count": 2,
          "examples": [
            {
              "key": "home.title",
              "variables": [
                "name"
              ]
            },
            {
              "key": "plural.apples",
              "variables": [
                "count"
              ]
            }
          ]
        },
        "specialChars": {
          "punctuation": 3,
          "emoji": 2,
          "currency": 0,
          "other": 123
        },
        "wordStats": {
          "totalWords": 5,
          "uniqueWords": 5,
          "repeatedWords": [],
          "averageWordLength": 4.6
        },
        "caseStats": {
          "upperCase": 0,
          "lowerCase": 1,
          "titleCase": 12,
          "mixedCase": 0
        }
      }
    }
  ],
  "summary": {
    "totalLocales": 3,
    "totalFiles": 9,
    "totalKeys": 39,
    "averageCompletion": 76.92307692307692,
    "localesByCompletion": [
      {
        "code": "en",
        "completion": 100
      },
      {
        "code": "ru",
        "completion": 100
      },
      {
        "code": "de",
        "completion": 30.76923076923077
      }
    ],
    "mostTranslatedLocale": "en",
    "leastTranslatedLocale": "de"
  }
}
```

## Files

(no files changed)
