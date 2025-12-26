import { render, h } from 'preact'
import App from './App'

const appElement = document.getElementById('app')
if (appElement) {
  render(h(App, null), appElement)
}
