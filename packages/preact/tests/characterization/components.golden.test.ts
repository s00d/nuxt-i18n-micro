import { act, fireEvent, render } from '@testing-library/preact'
import { h } from 'preact'
import { LOCALES } from '../../../core/tests/characterization/component-cases'
import { goldenSuite } from '../../../react/tests/characterization/suite'
import * as lib from '../../src'
import { createBrowserHistoryAdapter } from '../../src'

goldenSuite({
  h,
  render,
  fireEvent,
  act,
  lib,
  adapter: () => {
    window.history.replaceState({}, '', '/de/about?q=1#h')
    return createBrowserHistoryAdapter(LOCALES, 'en')
  },
})
