import routerFrom from '~~/data/routerFrom.json'
import routerTo from '~~/data/routerTo.json'

// Interface chung cho cả routerFrom và routerTo
export interface RouteEntry {
  name: string
  slug: string
  id?: string
  parentId?: string
  data?: string
  canonical?: string
}

// Cấu trúc Interface cho một Route kết quả
export interface CustomRoute {
  name: string
  slug: string
}

export const getFromRoute = (slug: string): RouteEntry | null => {
  if (!slug) return null
  // Ưu tiên tìm trong routerFrom trước
  const fromEntry = (routerFrom as RouteEntry[]).find(item => item.slug === slug)
  if (fromEntry) return fromEntry
  // Fallback: tìm trong routerTo (cho tuyến chiều về)
  const toEntry = (routerTo as RouteEntry[]).find(item => item.slug === slug)
  return toEntry ?? null
}

export const getToRoute = (slug: string): RouteEntry | null => {
  if (!slug) return null
  // Ưu tiên tìm trong routerTo trước
  const toEntry = (routerTo as RouteEntry[]).find(item => item.slug === slug)
  if (toEntry) return toEntry
  // Fallback: tìm trong routerFrom (cho tuyến chiều về)
  const fromEntry = (routerFrom as RouteEntry[]).find(item => item.slug === slug)
  return fromEntry ?? null
}

export const generateAllRoutes = (): CustomRoute[] => {
  const routes: CustomRoute[] = []
  routerFrom.forEach((fromItem) => {
    routerTo.forEach((toItem) => {
      // 1. Chiều đi: từ A đến B
      routes.push({
        name: `Xe riêng ${fromItem.name} đi ${toItem.name}`,
        slug: `xe-rieng-${fromItem.slug}-di-${toItem.slug}`
      })

      // 2. Chiều về: từ B về A
      routes.push({
        name: `Xe riêng ${toItem.name} đi ${fromItem.name}`,
        slug: `xe-rieng-${toItem.slug}-di-${fromItem.slug}`
      })
    })
  })
  return routes
}

export interface RoutePresetAddress {
  city: string
  district: string
  address: string
}

export const ROUTE_LOCATION_PRESETS: Record<string, RoutePresetAddress> = {
  'tphcm': {
    city: 'TP Hồ Chí Minh',
    district: 'Phường Bến Thành',
    address: 'Quận 1',
  },
  'sai-gon': {
    city: 'TP Hồ Chí Minh',
    district: 'Phường Bến Thành',
    address: 'Quận 1',
  },
  'san-bay-tan-son-nhat': {
    city: 'TP Hồ Chí Minh',
    district: 'Sân Bay Tân Sơn Nhất',
    address: 'Sân Bay Tân Sơn Nhất',
  },
  'vung-tau': {
    city: 'TP Hồ Chí Minh',
    district: 'Phường Vũng Tàu',
    address: 'Trung tâm Vũng Tàu',
  },
  'ho-tram': {
    city: 'TP Hồ Chí Minh',
    district: 'Xã Hồ Tràm',
    address: 'Hồ Tràm',
  },
  'long-hai': {
    city: 'TP Hồ Chí Minh',
    district: 'Xã Long Hải',
    address: 'Long Hải',
  },
  'phan-thiet': {
    city: 'Tỉnh Lâm Đồng',
    district: 'Phường Phan Thiết',
    address: 'Trung tâm TP Phan Thiết',
  },
  'dong-nai': {
    city: 'Tỉnh Đồng Nai',
    district: 'Phường Biên Hoà',
    address: 'Trung tâm Biên Hòa',
  },
  'tay-ninh': {
    city: 'Tỉnh Tây Ninh',
    district: 'Phường Tân Ninh',
    address: 'Trung tâm Tây Ninh',
  },
  'da-lat': {
    city: 'Tỉnh Lâm Đồng',
    district: 'Phường Cam Ly - Đà Lạt',
    address: 'Trung tâm Đà Lạt',
  },
  'lam-dong': {
    city: 'Tỉnh Lâm Đồng',
    district: 'Phường Cam Ly - Đà Lạt',
    address: 'Trung tâm Đà Lạt',
  },
  'nha-trang': {
    city: 'Tỉnh Khánh Hòa',
    district: 'Phường Nha Trang',
    address: 'Trung tâm Nha Trang',
  },
  'khanh-hoa': {
    city: 'Tỉnh Khánh Hòa',
    district: 'Phường Nha Trang',
    address: 'Trung tâm Nha Trang',
  },
  'can-tho': {
    city: 'TP Cần Thơ',
    district: 'Phường An Bình',
    address: 'Trung tâm Cần Thơ',
  },
  'an-giang': {
    city: 'Tỉnh An Giang',
    district: 'Phường Long Xuyên',
    address: 'Trung tâm Long Xuyên',
  },
  'dong-thap': {
    city: 'Tỉnh Đồng Tháp',
    district: 'Phường Cao Lãnh',
    address: 'Trung tâm Cao Lãnh',
  },
  'vinh-long': {
    city: 'Tỉnh Vĩnh Long',
    district: 'Phường Phú Khương',
    address: 'Trung tâm Vĩnh Long',
  },
  'ca-mau': {
    city: 'Tỉnh Cà Mau',
    district: 'Xã Châu Thới',
    address: 'Trung tâm Cà Mau',
  },
  'dak-lak': {
    city: 'Tỉnh Đắk Lắk',
    district: 'Phường Ea Kao',
    address: 'Trung tâm Buôn Ma Thuột',
  },
  'gia-lai': {
    city: 'Tỉnh Gia Lai',
    district: 'Phường Pleiku',
    address: 'Trung tâm Pleiku',
  },
}

export const getDefaultRouteEndpoints = (fromSlug?: string, toSlug?: string): {
  dep: RoutePresetAddress
  dest: RoutePresetAddress
} => {
  const defaultDeparture: RoutePresetAddress = {
    city: 'TP Hồ Chí Minh',
    district: 'Phường Bến Thành',
    address: 'Quận 1',
  }
  const defaultDestination: RoutePresetAddress = {
    city: 'TP Hồ Chí Minh',
    district: 'Phường Vũng Tàu',
    address: 'Trung tâm Vũng Tàu',
  }

  const dep = (fromSlug && ROUTE_LOCATION_PRESETS[fromSlug]) || defaultDeparture
  const dest = (toSlug && ROUTE_LOCATION_PRESETS[toSlug]) || defaultDestination

  return { dep, dest }
}