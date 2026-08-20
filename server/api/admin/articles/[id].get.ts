import { Article } from '../../../models/Article'
import { requireAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu ID bài viết',
    })
  }

  const article = await Article.findById(id).lean()
  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Không tìm thấy bài viết',
    })
  }

  return {
    id: (article as any)._id.toString(),
    ...article,
  }
})
