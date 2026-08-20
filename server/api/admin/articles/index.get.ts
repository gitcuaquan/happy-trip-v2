import { Article } from '../../../models/Article'
import { requireAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string) || 10))
  const keyword = (query.keyword as string || '').trim()
  const category = query.category as string
  const status = query.status as string

  const filter: Record<string, any> = {}

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { slug: { $regex: keyword, $options: 'i' } },
      { excerpt: { $regex: keyword, $options: 'i' } },
    ]
  }

  if (category && (category === 'blog' || category === 'policy')) {
    filter.category = category
  }

  if (status === 'true') {
    filter.status = true
  } else if (status === 'false') {
    filter.status = false
  }

  const count = await Article.countDocuments(filter)
  const articles = await Article.find(filter)
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  const formattedData = articles.map((a: any) => ({
    id: a._id.toString(),
    ...a,
  }))

  return {
    pagination: {
      page,
      limit,
      count,
      total_page: Math.ceil(count / limit) || 1,
    },
    data: formattedData,
  }
})
