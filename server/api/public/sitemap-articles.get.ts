import { Article } from '../../models/Article'

export default defineEventHandler(async () => {
  const articles = await Article.find({
    status: true,
    noindex: false,
  })
    .select('slug category updated_at')
    .lean()

  return articles.map((a: any) => ({
    loc: `/${a.category === 'policy' ? 'policy' : 'blog'}/${a.slug}`,
    lastmod: a.updated_at ? new Date(a.updated_at).toISOString() : new Date().toISOString(),
    changefreq: 'weekly',
    priority: a.category === 'blog' ? 0.8 : 0.6,
  }))
})
