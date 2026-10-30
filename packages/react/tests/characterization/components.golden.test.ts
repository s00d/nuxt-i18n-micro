import { act, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { LOCALES } from '../../../core/tests/characterization/component-cases'
import * as lib from '../../src'
import { createReactRouterAdapter } from '../../src/router'
import { goldenSuite } from './suite'

const location = { pathname: '/de/about', search: '?q=1', hash: '#h' } as never

goldenSuite({ h: createElement, render, fireEvent, act, lib, adapter: () => createReactRouterAdapter(LOCALES, 'en', location, (() => {}) as never) })
