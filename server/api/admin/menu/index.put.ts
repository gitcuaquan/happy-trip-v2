import { MegaMenu } from '../../../models/MegaMenu'
import { requireAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const body = await readBody(event)
  const menuKey = body.menu_key || 'routes'

  if (!body.columns || !Array.isArray(body.columns)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dữ liệu cột (columns) không hợp lệ',
    })
  }

  // Chuẩn hóa và gán thứ tự cho các cột và mục con
  const sanitizedColumns = body.columns.map((col: any, colIdx: number) => ({
    column_id: col.column_id || `col-${colIdx + 1}`,
    title: (col.title || '').trim(),
    icon: (col.icon || 'i-lucide-route').trim(),
    order: colIdx + 1,
    items: (col.items || []).map((item: any, itemIdx: number) => ({
      title: (item.title || '').trim(),
      description: (item.description || '').trim(),
      link: (item.link || '').trim(),
      item_type: item.item_type || 'custom',
      article_id: item.article_id || null,
      badge: (item.badge || '').trim(),
      order: itemIdx + 1,
      is_active: item.is_active !== false,
    })),
  }))

  const updateData: Record<string, any> = {
    columns: sanitizedColumns,
    updated_at: new Date(),
  }

  if (body.title) updateData.title = body.title.trim()
  if (body.banner_top) {
    updateData.banner_top = {
      title: (body.banner_top.title || '').trim(),
      subtitle: (body.banner_top.subtitle || '').trim(),
      cta_text: (body.banner_top.cta_text || '').trim(),
      cta_link: (body.banner_top.cta_link || '').trim(),
    }
  }
  if (body.footer_bar) {
    updateData.footer_bar = {
      items: Array.isArray(body.footer_bar.items)
        ? body.footer_bar.items.map((i: string) => i.trim()).filter(Boolean)
        : [],
      hotline: (body.footer_bar.hotline || '0972 97 0000').trim(),
    }
  }
  if (typeof body.is_active === 'boolean') {
    updateData.is_active = body.is_active
  }

  const updated = await MegaMenu.findOneAndUpdate(
    { menu_key: menuKey },
    { $set: updateData },
    { returnDocument: 'after', upsert: true, runValidators: true }
  ).lean()

  return {
    success: true,
    message: 'Cập nhật cấu hình Mega Menu thành công',
    data: {
      id: (updated as any)?._id?.toString(),
      ...updated,
    },
  }
})
