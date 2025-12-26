// Type definitions for React package

// Extend Window interface for SSR hydration state
declare global {
  interface Window {
    __INITIAL_STATE__?: {
      locale: string
      route: string
      // Add other SSR state fields as needed
    }
  }
}

export {}
