// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineEventHandler(async (_event) => {
  const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))
  await delay(2000)
  return {
    hello: 'world',
  }
})
