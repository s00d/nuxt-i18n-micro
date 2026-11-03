import { type ComponentChildren, createContext, createElement, type PreactContext, type VNode } from 'preact'
import { useCallback, useContext, useMemo, useState } from 'preact/hooks'
import { createIslandBinding, type I18nContextValue } from './core'

export const { I18nProvider, useAstroI18n } = /*#__PURE__*/ createIslandBinding<ComponentChildren, VNode, PreactContext<I18nContextValue | null>>({
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
})
