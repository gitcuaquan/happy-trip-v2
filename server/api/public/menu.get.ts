import { MegaMenu } from '../../models/MegaMenu'
import { defaultRoutesMegaMenu } from '../../utils/defaultMenu'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const menuKey = (query.key as string) || 'routes'

  try {
    let menu = await MegaMenu.findOne({ menu_key: menuKey, is_active: true }).lean()

    if (!menu) {
      if (menuKey === 'routes') {
        return { data: defaultRoutesMegaMenu }
      }
      return { data: null }
    }

    // Lọc các item active và sắp xếp order
    const formattedColumns = (menu.columns || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((col) => ({
        ...col,
        items: (col.items || [])
          .filter((item) => item.is_active !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }))

    return {
      data: {
        ...menu,
        columns: formattedColumns,
      },
    }
  } catch (error: any) {
    console.error('Lỗi khi lấy MegaMenu public:', error)
    if (menuKey === 'routes') {
      return { data: defaultRoutesMegaMenu }
    }
    return { data: null }
  }
})
