import { Article } from '../../models/Article'

export default defineEventHandler(async (event) => {
  const idOrSlug = getRouterParam(event, 'id')

  if (!idOrSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu ID hoặc slug',
    })
  }

  const article = await Article.findOneAndUpdate(
    {
      $or: [
        { slug: idOrSlug },
        { _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null },
      ],
      status: true,
    },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).lean()

  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Không tìm thấy bài viết',
    })
  }

  return {
    data: {
      id: (article as any)._id.toString(),
      ...article,
      name: (article as any).title,
    },
  }
})
