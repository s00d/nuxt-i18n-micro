import path from 'node:path'
import fs from 'node:fs'
import { mountSuspended, renderSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/vue'
import { setTranslationsFromJson } from '../../tests/unit-setup'

import TestComponent from './TestComponent.vue'

describe('TestComponent component', () => {
  beforeEach(async () => {
    const fileContent = fs.readFileSync(path.join(__dirname, '../../locales/en-GB.json')).toString()
    await setTranslationsFromJson('en', JSON.parse(fileContent))
  })
  it('renders correctly', async () => {
    const result = await mountSuspended(TestComponent)

    const html = result.html()

    expect(html).toMatchSnapshot()
  })

  it('renders the prop message', async () => {
    const component = await mountSuspended(TestComponent, {
      props: {
        message: 'Test message',
      },
    })

    expect(component.html()).toContain('Test message')
  })

  it('shows the default message if no message prop is passed', async () => {
    await renderSuspended(TestComponent)

    const component = screen.getByTestId('message')

    // This should be "The default message" but we are mocking $t to render the key only
    expect(component.textContent).toContain('The default message')
  })
})
