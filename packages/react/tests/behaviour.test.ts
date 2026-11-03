import { act, fireEvent, render } from '@testing-library/react'
import { createElement, useEffect, useLayoutEffect, useState } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { vi } from 'vitest'
import * as lib from '../src'
import { behaviourSuite } from './shared/behaviour'

behaviourSuite({
  h: createElement,
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
    await act(async () => {
      hydrateRoot(container, node, { onRecoverableError: (error) => errors.push(error) })
    })
    consoleError.mockRestore()
    return errors
  },
  lib,
})
