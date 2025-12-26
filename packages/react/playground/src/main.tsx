import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const appElement = document.getElementById('app')
if (appElement) {
  ReactDOM.createRoot(appElement).render(
    // @ts-expect-error - React StrictMode type compatibility
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
