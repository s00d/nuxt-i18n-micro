/**
 * Runs a click and answers whether it stays with the browser. The default action is cancelled last,
 * on window, once the answer is read: jsdom cannot load another page.
 */
export function leftToBrowser(click: () => unknown): boolean {
  let left = false
  window.addEventListener(
    'click',
    (event) => {
      left = !event.defaultPrevented
      event.preventDefault()
    },
    { once: true },
  )
  click()
  return left
}
