import { act, fireEvent, render } from '@testing-library/preact'
import { h, hydrate } from 'preact'
import { useEffect, useLayoutEffect, useState } from 'preact/hooks'
import { renderToString } from 'preact-render-to-string'
import { vi } from 'vitest'
import { behaviourSuite } from '../../react/tests/shared/behaviour'
import * as lib from '../src'

behaviourSuite({
  h,
  useEffect,
  useLayoutEffect,
  useState: useState as never,
  render,
  act,
  fireEvent,
  renderToString,
  async hydrate(node, container) {
    const errors: unknown[] = []
    const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => void errors.push(args[0]))
    await act(async () => hydrate(node, container))
    consoleError.mockRestore()
    return errors
  },
  lib,
})
