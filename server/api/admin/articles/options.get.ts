import { Article } from '../../../models/Article'
import { requireAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const query = getQuery(event)
  const keyword = ((query.keyword as string) || '').trim()
  const limit = Math.max(1, Math.min(50, parseInt(query.limit as string) || 20))

  const filter: Record<string, any> = {
    status: true,
  }

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { slug: { $regex: keyword, $options: 'i' } },
    ]
  }

  const articles = await Article.find(filter)
    .select('_id title slug category thumbnail published_at created_at')
    .sort({ created_at: -1 })
    .limit(limit)
    .lean()

  return {
    success: true,
    data: articles.map((a: any) => ({
      id: a._id.toString(),
      title: a.title,
      slug: a.slug,
      category: a.category || 'blog',
      thumbnail: a.thumbnail || '',
      url: a.category === 'policy' ? `/policy/${a.slug}` : `/blog/${a.slug}`,
    })),
  }
})
