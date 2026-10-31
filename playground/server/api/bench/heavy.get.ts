export default defineEventHandler((event) => {
  const rows = Number(getQuery(event).rows ?? 5000)
  return Array.from({ length: rows }, (_, id) => ({ id, title: `Row ${id}`, body: 'x'.repeat(200) }))
})
