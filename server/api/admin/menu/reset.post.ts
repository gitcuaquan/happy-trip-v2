import { MegaMenu } from '../../../models/MegaMenu'
import { requireAdminAuth } from '../../../utils/auth'
import { defaultRoutesMegaMenu } from '../../../utils/defaultMenu'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const body = await readBody(event).catch(() => ({}))
  const menuKey = body?.menu_key || 'routes'

  if (menuKey === 'routes') {
    const updated = await MegaMenu.findOneAndUpdate(
      { menu_key: 'routes' },
      { $set: { ...defaultRoutesMegaMenu, updated_at: new Date() } },
      { returnDocument: 'after', upsert: true }
    ).lean()

    return {
      success: true,
      message: 'Đã khôi phục Mega Menu về cấu trúc mặc định ban đầu',
      data: updated,
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: `Không có cấu hình mặc định cho menu '${menuKey}'`,
  })
})
