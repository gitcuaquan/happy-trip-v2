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

  const deleted = await Article.findByIdAndDelete(id)
  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Không tìm thấy bài viết để xóa',
    })
  }

  return {
    success: true,
    message: 'Xóa bài viết thành công',
  }
})
