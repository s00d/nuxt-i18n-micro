export type DriverType = 'google' | 'yandex' | 'deepl' | 'openai' | 'deepseek' | 'google-free' | 'yandex-cloud'

interface TranslatorOptions {
  apiKey: string
  driver: DriverType
  options?: { [key: string]: string | number | boolean }
}

interface GoogleFreeTranslateResponse {
  0: Array<[string, string]> // First element — translated text, second — additional information
}

export class Translator {
  private apiKey: string
  private driver: DriverType
  private options: { [key: string]: string | number | boolean }
  private clearBuffer: string[] = [] // Buffer for storing replaced values

  constructor({ apiKey, driver, options = {} }: TranslatorOptions) {
    this.apiKey = apiKey
    this.driver = driver
    this.options = options

    // Check for folderId presence for Yandex Cloud
    if (driver === 'yandex-cloud' && !options.folderId) {
      throw new Error('Yandex Cloud Translator requires folderId in options.')
    }
  }

  /**
   * Translates text from one language to another.
   *
   * @param text - Text to translate.
   * @param fromLang - Source language (e.g., "en").
   * @param toLang - Target language (e.g., "ru").
   * @returns Translated text.
   */
  async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    console.debug('Translating text...', { text, fromLang, toLang })

    if (text === '') {
      return text
    }

    // Clean text before translation (for Google, Yandex, DeepL, Google Free, Yandex Cloud)
    const cleanedText = this.clearText(text)

    let translatedText: string
    switch (this.driver) {
      case 'google':
        translatedText = await this.googleTranslate(cleanedText, fromLang, toLang)
        break
      case 'yandex':
        translatedText = await this.yandexTranslate(cleanedText, fromLang, toLang)
        break
      case 'deepl':
        translatedText = await this.deeplTranslate(cleanedText, fromLang, toLang)
        break
      case 'openai':
        translatedText = await this.openaiTranslate(text, fromLang, toLang) // Original text for OpenAI
        break
      case 'deepseek':
        translatedText = await this.deepseekTranslate(text, fromLang, toLang) // Original text for DeepSeek
        break
      case 'google-free':
        translatedText = await this.googleFreeTranslate(cleanedText, fromLang, toLang)
        break
      case 'yandex-cloud':
        translatedText = await this.yandexCloudTranslate(cleanedText, fromLang, toLang)
        break
      default:
        throw new Error(`Unsupported driver: ${this.driver}`)
    }

    // Restore text after translation (for Google, Yandex, DeepL, Google Free, Yandex Cloud)
    const finalText = this.revertText(translatedText)

    console.debug('Text was translated', { finalText })

    return finalText
  }

  /**
   * Cleans text before translation.
   * Replaces special constructs with temporary markers.
   */
  private clearText(text: string): string {
    const regex = /:[a-zA-Z0-9]+|<[^>]*>|\{['"][@$|{}]['"]\}/gu
    const matches = text.match(regex) || []
    this.clearBuffer = matches

    return matches.reduce((acc, match, index) => {
      return acc.replace(match, ` _r${index}_`)
    }, text)
  }

  /**
   * Restores text after translation.
   * Replaces temporary markers with original values.
   */
  private revertText(text: string): string {
    const restoredText = this.clearBuffer.reduce((acc, match, index) => {
      return acc.replace(`_r${index}_`, match)
    }, text)

    // Remove extra spaces and non-breaking spaces
    return restoredText.replace(/ {2,}|^ |^\xA0|\xA0{2,}|\xA0$/gmu, '').replace(/&nbsp;/g, ' ')
  }

  /**
   * Google Translator (paid API).
   */
  private async googleTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
    const url = 'https://translation.googleapis.com/language/translate/v2'
    const params = new URLSearchParams({
      q: text,
      target: toLang,
      key: this.apiKey,
      format: 'text',
      source: fromLang,
    })

    const response = await fetch(`${url}?${params.toString()}`)
    const data = await response.json()

    if (data.error) {
      throw new Error(`Google Translate error: ${data.error.message}`)
    }

    return data.data.translations[0].translatedText
  }

  /**
   * Yandex Translator (paid API).
   */
  private async yandexTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
    const url = 'https://translate.api.cloud.yandex.net/translate/v2/translate'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Api-Key ${this.apiKey}`,
    }
    const body = JSON.stringify({
      folderId: this.options.folderId as string,
      texts: [text],
      sourceLanguageCode: fromLang,
      targetLanguageCode: toLang,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })
    const data = await response.json()

    if (data.message) {
      throw new Error(`Yandex Translate error: ${data.message}`)
    }

    return data.translations[0].text
  }

  /**
   * DeepL Translator (paid API).
   */
  private async deeplTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
    const url = 'https://api.deepl.com/v2/translate'
    const params = new URLSearchParams({
      auth_key: this.apiKey,
      text,
      target_lang: toLang.toUpperCase(),
      source_lang: fromLang.toUpperCase(),
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const data = await response.json()

    if (data.message) {
      throw new Error(`DeepL Translate error: ${data.message}`)
    }

    return data.translations[0].text
  }

  /**
   * OpenAI Translator (GPT).
   */
  private async openaiTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    }
    const body = JSON.stringify({
      model: this.options.model as string,
      messages: [
        {
          role: 'system',
          content: `Translate the following text from ${fromLang} to ${toLang}. Do not modify or translate placeholders like :placeholder, <tag>, or {special}.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })
    const data = await response.json()

    if (data.error) {
      throw new Error(`OpenAI Translate error: ${data.error.message}`)
    }

    return data.choices[0].message.content
  }

  /**
   * DeepSeek Translator.
   */
  private async deepseekTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
    const url = 'https://api.deepseek.com/chat/completions'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    }
    const body = JSON.stringify({
      model: this.options.model as string,
      messages: [
        {
          role: 'system',
          content: `Translate the following text from ${fromLang} to ${toLang}. Do not modify or translate placeholders like :placeholder, <tag>, or {special}.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      stream: false,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })
    const data = await response.json()

    if (data.error) {
      throw new Error(`DeepSeek Translate error: ${data.error.message}`)
    }

    return data.choices[0].message.content
  }

  /**
   * Google Free Translator (unofficial API).
   */
  private async googleFreeTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
    const url = 'https://translate.google.com/translate_a/single'
    const params = new URLSearchParams({
      client: 'gtx',
      sl: fromLang,
      tl: toLang,
      hl: 'en',
      dt: 't',
      ie: 'UTF-8',
      oe: 'UTF-8',
      q: text,
      tk: this.generateToken(text),
    })

    const response = await fetch(`${url}?${params.toString()}`)
    const data: GoogleFreeTranslateResponse = await response.json()

    if (!data || !Array.isArray(data[0])) {
      throw new Error('Invalid response from Google Free Translate')
    }

    // Extract translated text from response
    return data[0].map((item) => (item[0] ? item[0] : '')).join('')
  }

  /**
   * Yandex Cloud Translator.
   */
  private async yandexCloudTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
    const url = 'https://translate.api.cloud.yandex.net/translate/v2/translate'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Api-Key ${this.apiKey}`,
    }
    const body = JSON.stringify({
      folderId: this.options.folderId as string,
      texts: [text],
      sourceLanguageCode: fromLang,
      targetLanguageCode: toLang,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })
    const data = await response.json()

    if (data.message) {
      throw new Error(`Yandex Cloud Translate error: ${data.message}`)
    }

    return data.translations[0].text
  }

  /**
   * Token generation for Google Free Translate.
   */
  private generateToken(text: string): string {
    // Simplified token generation implementation
    const tkk = 0
    const e: number[] = []
    for (let f = 0; f < text.length; f++) {
      const g = text.charCodeAt(f)
      if (g < 128) {
        e.push(g)
      } else if (g < 2048) {
        e.push((g >> 6) | 192)
      } else {
        e.push((g >> 12) | 224)
        e.push(((g >> 6) & 63) | 128)
      }
      e.push((g & 63) | 128)
    }
    let a = tkk
    for (let h = 0; h < e.length; h++) {
      const value = e[h]
      if (value !== undefined) {
        a += value
        a = this.tokenTransform(a, '+-a^+6')
      }
    }
    a = this.tokenTransform(a, '+-3^+b+-f')
    a ^= tkk
    if (a < 0) {
      a = (a & 2147483647) + 2147483648
    }
    a %= 1e6
    return `${a.toString()}.${a ^ tkk}`
  }

  private tokenTransform(value: number, seed: string): number {
    for (let d = 0; d < seed.length - 2; d += 3) {
      const c = seed.charCodeAt(d + 2) >= 97 ? seed.charCodeAt(d + 2) - 87 : Number(seed.charAt(d + 2))
      if (seed.charAt(d + 1) === '+') {
        value = value >>> c
      } else {
        value = value << c
      }
      if (seed.charAt(d) === '+') {
        value = (value + c) & 4294967295
      } else {
        value = value ^ c
      }
    }
    return value
  }
}
