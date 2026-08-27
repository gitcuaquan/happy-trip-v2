import { MegaMenu } from '../../../models/MegaMenu'
import { requireAdminAuth } from '../../../utils/auth'
import { defaultRoutesMegaMenu } from '../../../utils/defaultMenu'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const query = getQuery(event)
  const menuKey = (query.key as string) || 'routes'

  let menu = await MegaMenu.findOne({ menu_key: menuKey }).lean()

  if (!menu && menuKey === 'routes') {
    // Khởi tạo nếu chưa có
    const created = await MegaMenu.create(defaultRoutesMegaMenu)
    menu = created.toObject()
  }

  if (!menu) {
    throw createError({
      statusCode: 404,
      statusMessage: `Không tìm thấy cấu hình menu cho mã '${menuKey}'`,
    })
  }

  // Sắp xếp thứ tự cột và item
  const formattedColumns = (menu.columns || [])
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((col) => ({
      ...col,
      items: (col.items || []).sort((a, b) => (a.order || 0) - (b.order || 0)),
    }))

  return {
    data: {
      id: (menu as any)._id?.toString(),
      ...menu,
      columns: formattedColumns,
    },
  }
})
