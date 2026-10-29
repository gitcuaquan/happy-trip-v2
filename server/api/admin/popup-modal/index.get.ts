import { PopupModal } from '../../../models/PopupModal'
import { requireAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  try {
    const modal = await PopupModal.findOne()
      .sort({ updated_at: -1 })
      .populate('article_id', 'title slug thumbnail category')
      .lean()

    if (!modal) {
      return {
        success: true,
        data: null,
      }
    }

    return {
      success: true,
      data: {
        id: modal._id.toString(),
        title: modal.title,
        image: modal.image,
        link: modal.link || '',
        article_id: modal.article_id ? (modal.article_id as any)._id?.toString() || modal.article_id.toString() : null,
        article_slug: modal.article_slug || '',
        article_title: modal.article_title || '',
        article: modal.article_id || null,
        button_text: modal.button_text || 'Xem chi tiết',
        is_active: modal.is_active,
        display_frequency: modal.display_frequency || 'new_only',
        created_at: modal.created_at,
        updated_at: modal.updated_at,
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Lỗi khi tải cấu hình modal thông báo',
    })
  }
})
