// Type definitions for use-sync-external-store/shim
// This is a fallback for React 17 compatibility

declare module 'use-sync-external-store/shim' {
  import type { useSyncExternalStore as ReactUseSyncExternalStore } from 'react'

  export const useSyncExternalStore: typeof ReactUseSyncExternalStore
}
