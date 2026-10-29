import mongoose from 'mongoose'
import { PopupModal } from '../../../models/PopupModal'
import { Article } from '../../../models/Article'
import { requireAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const body = await readBody(event)

  const {
    title = 'Thông báo',
    image = '',
    link = '',
    article_id = null,
    button_text = 'Xem chi tiết',
    is_active = false,
    display_frequency = 'new_only',
  } = body || {}

  // Nếu không có ảnh thì mặc định tắt hiển thị
  const finalImage = (image || '').trim()
  const finalIsActive = finalImage ? Boolean(is_active) : false

  let finalLink = (link || '').trim()
  let articleSlug = ''
  let articleTitle = ''
  let validArticleId = null

  if (article_id && mongoose.Types.ObjectId.isValid(article_id)) {
    validArticleId = new mongoose.Types.ObjectId(article_id)
    const article = await Article.findById(validArticleId).lean()
    if (article) {
      articleSlug = article.slug
      articleTitle = article.title
      // If user did not manually enter a link, automatically generate article route
      if (!finalLink) {
        finalLink = article.category === 'policy' ? `/policy/${article.slug}` : `/blog/${article.slug}`
      }
    }
  }

  try {
    let modal = await PopupModal.findOne().sort({ updated_at: -1 })

    if (modal) {
      modal.title = (title || '').trim()
      modal.image = finalImage
      modal.link = finalLink
      modal.article_id = validArticleId as any
      modal.article_slug = articleSlug
      modal.article_title = articleTitle
      modal.button_text = (button_text || '').trim() || 'Xem chi tiết'
      modal.is_active = finalIsActive
      modal.display_frequency = display_frequency || 'new_only'
      await modal.save()
    } else {
      modal = await PopupModal.create({
        title: (title || '').trim(),
        image: finalImage,
        link: finalLink,
        article_id: validArticleId,
        article_slug: articleSlug,
        article_title: articleTitle,
        button_text: (button_text || '').trim() || 'Xem chi tiết',
        is_active: finalIsActive,
        display_frequency: display_frequency || 'new_only',
      })
    }

    return {
      success: true,
      message: 'Lưu cấu hình modal thông báo thành công',
      data: {
        id: modal._id.toString(),
        title: modal.title,
        image: modal.image,
        link: modal.link,
        article_id: modal.article_id ? modal.article_id.toString() : null,
        article_slug: modal.article_slug,
        article_title: modal.article_title,
        button_text: modal.button_text,
        is_active: modal.is_active,
        display_frequency: modal.display_frequency,
        updated_at: modal.updated_at,
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Lỗi khi lưu cấu hình modal thông báo',
    })
  }
})
