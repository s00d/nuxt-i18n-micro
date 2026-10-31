const posts = [
  { en: 'hello-world', de: 'hallo-welt', fr: 'bonjour-monde', ru: 'privet-mir', ar: 'marhaba', pt: 'ola-mundo' },
  { en: 'second-post', de: 'zweiter-beitrag', fr: 'deuxieme', ru: 'vtoroy', ar: 'thani', pt: 'segundo' },
]

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const post = posts.find((candidate) => Object.values(candidate).includes(slug!))
  if (!post) throw createError({ statusCode: 404, statusMessage: 'No such post' })
  return post
})
