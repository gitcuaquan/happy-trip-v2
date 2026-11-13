import {
  getPartnerServices,
  getPartnerCities,
  getPartnerDistricts,
  type PartnerServiceItem,
  type PartnerCity,
  type PartnerDistrict
} from '../../utils/partner-api'

interface CatalogCache {
  data: {
    services: PartnerServiceItem[]
    cities: PartnerCity[]
    locations: Array<{
      id: string
      name: string
      districts: Array<{ name: string; status?: boolean }>
    }>
  }
  timestamp: number
}

let catalogCache: CatalogCache | null = null
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 phút

export default defineEventHandler(async () => {
  const now = Date.now()
  if (catalogCache && (now - catalogCache.timestamp < CACHE_TTL_MS)) {
    return catalogCache.data
  }

  try {
    const [services, cities] = await Promise.all([
      getPartnerServices(),
      getPartnerCities()
    ])

    // Lấy districts cho các thành phố chính
    const locations = await Promise.all(
      cities.map(async (city: PartnerCity) => {
        try {
          const districts = await getPartnerDistricts(city.id)
          return {
            id: city.id,
            name: city.name,
            districts: districts.map((d: PartnerDistrict) => ({ name: d.name, status: d.status }))
          }
        } catch {
          return {
            id: city.id,
            name: city.name,
            districts: []
          }
        }
      })
    )

    const result = {
      services,
      cities,
      locations
    }

    catalogCache = {
      data: result,
      timestamp: now
    }

    return result
  } catch (error: any) {
    console.warn('[CatalogAPI] Error fetching catalog, returning fallback:', error.message)
    return {
      services: [
        {
          id: '66947d0917482239472b9807',
          name: 'Bao chuyến 5 chỗ (1 chiều)',
          service_code: 'SEAT_5_ONE_WAY',
          seats: 5,
          price: 750000,
          description: 'Tối đa 4 hành khách'
        },
        {
          id: '66947cea17482239472b88e8',
          name: 'Bao chuyến 7 chỗ (1 chiều)',
          service_code: 'SEAT_7_ONE_WAY',
          seats: 7,
          price: 850000,
          description: 'Tối đa 6 hành khách'
        }
      ],
      cities: [
        { id: '69d85c7e0d4befc8e55b1ead', name: 'TP Hồ Chí Minh' },
        { id: '6789c242a67233093ddb723e', name: 'BRVT - Vũng Tàu' }
      ],
      locations: [
        {
          id: '69d85c7e0d4befc8e55b1ead',
          name: 'TP Hồ Chí Minh',
          districts: [
            { name: 'Phường Bàn Cờ', status: true },
            { name: 'Phường Bến Thành', status: true },
            { name: 'Phường Vũng Tàu', status: true }
          ]
        }
      ]
    }
  }
})
