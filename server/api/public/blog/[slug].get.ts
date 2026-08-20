import { Article } from '../../../models/Article'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu slug bài viết',
    })
  }

  const article = await Article.findOneAndUpdate(
    {
      $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
      category: 'blog',
      status: true,
    },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).lean()

  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Bài viết không tồn tại hoặc đã bị ẩn',
    })
  }

  const relatedArticles = await Article.find({
    category: 'blog',
    status: true,
    _id: { $ne: (article as any)._id },
  })
    .sort({ published_at: -1 })
    .limit(3)
    .select('title slug thumbnail excerpt reading_time published_at created_at')
    .lean()

  return {
    data: {
      id: (article as any)._id.toString(),
      ...article,
      related: relatedArticles.map((r: any) => ({ id: r._id.toString(), ...r })),
    },
  }
})
