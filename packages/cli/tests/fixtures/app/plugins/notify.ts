export default defineNuxtPlugin(() => {
  const message = 'Saved successfully'
  return { provide: { message } }
})
