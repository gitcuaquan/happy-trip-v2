import { Article } from '../../../../models/Article'
import { requireAdminAuth } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu ID bài viết',
    })
  }

  const article = await Article.findById(id)
  if (!article) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Không tìm thấy bài viết',
    })
  }

  article.status = body.status !== undefined ? Boolean(body.status) : !article.status
  await article.save()

  return {
    success: true,
    message: `Đã ${article.status ? 'công khai' : 'chuyển thành bản nháp'} bài viết`,
    status: article.status,
  }
})
