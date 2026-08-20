import { Article } from '../../models/Article'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const page = Math.max(1, parseInt(body.page) || 1)
  const limit = Math.max(1, Math.min(50, parseInt(body.limit) || 10))
  const category = body.category

  const filter: Record<string, any> = {
    status: true,
  }

  if (category) {
    filter.category = category
  }

  const count = await Article.countDocuments(filter)
  const articles = await Article.find(filter)
    .sort({ published_at: -1, created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  const formattedData = articles.map((a: any) => ({
    id: a._id.toString(),
    ...a,
    name: a.title,
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
