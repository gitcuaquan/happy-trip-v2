import { Article } from '../../../models/Article'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.max(1, Math.min(50, parseInt(query.limit as string) || 9))
  const keyword = (query.keyword as string || '').trim()

  const filter: Record<string, any> = {
    category: 'blog',
    status: true,
  }

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { excerpt: { $regex: keyword, $options: 'i' } },
      { focus_keyword: { $regex: keyword, $options: 'i' } },
    ]
  }

  const count = await Article.countDocuments(filter)
  const articles = await Article.find(filter)
    .sort({ published_at: -1, created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-content')
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
