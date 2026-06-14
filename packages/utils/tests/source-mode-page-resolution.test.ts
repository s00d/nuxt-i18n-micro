import { mergeSourceTranslations } from '../src/merge-source'

describe('source mode page resolution', () => {
  it('loads linked page files when pageName is already resolved', async () => {
    const readLocaleFile = jest.fn((relativePath: string) => {
      if (relativePath === 'en.json') return { shared: 'Root' }
      if (relativePath === 'pages/contact/en.json') return { title: 'Contact' }
      return {}
    })

    const result = await mergeSourceTranslations({
      locale: 'en',
      pageName: 'contact',
      locales: [{ code: 'en' }],
      readLocaleFile,
    })

    expect(result).toEqual({ shared: 'Root', title: 'Contact' })
    expect(readLocaleFile).toHaveBeenCalledWith('pages/contact/en.json')
    expect(readLocaleFile).not.toHaveBeenCalledWith('pages/alias-page/en.json')
  })
})
