import { type Context, createContext, createElement, type ReactElement, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { createIslandBinding, type I18nContextValue } from './core'

export const { I18nProvider, useAstroI18n } = /*#__PURE__*/ createIslandBinding<ReactNode, ReactElement, Context<I18nContextValue | null>>({
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
})
