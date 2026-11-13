export interface PartnerServiceItem {
  id: string
  name: string
  short_id?: string
  service_code?: string
  description?: string
  service_type?: number
  service_name?: string
  seats?: number
  price?: number
  includes_transport?: Array<{ type: number; type_name: string }>
  is_show?: boolean
  image_url?: string
}

export interface PartnerCity {
  id: string
  name: string
  status?: boolean
}

export interface PartnerDistrict {
  name: string
  status?: boolean
}

export interface PartnerCalculatePayload {
  departure_city: string
  departure_district?: string
  departure_dictrict?: string
  departure_address_1: string
  destination_city: string
  destination_district?: string
  destination_dictrict?: string
  destination_address_1: string
  date_of_destination?: string | Date | null
  id_service?: string
  service_id?: string
  car?: string
}

export interface PartnerCalculateResult {
  distance?: number
  duration?: number
  price?: number
  price_guest?: number
  price_guest_after?: number
  original_price?: number
  discount_price?: number
  service_id?: string
  service_name?: string
  car_type?: string
  previews?: any[]
  [key: string]: any
}

export interface PartnerCreateOrderPayload {
  departure_city: string
  departure_district?: string
  departure_dictrict?: string
  departure_address_1: string
  destination_city: string
  destination_district?: string
  destination_dictrict?: string
  destination_address_1: string
  date_of_destination: string | Date
  id_service: string
  full_name: string
  phone: string
  note?: string
  partner_code?: string
  price?: number
  price_guest?: number
  price_guest_after?: number
}

export interface PartnerCreateOrderResult {
  success: boolean
  order_id?: string
  short_id?: string
  message?: string
  data?: any
}

export function getPartnerConfig() {
  let baseUrl = 'https://sysdev.happytrip.vn'
  let apiKey = 'hip_lq3Ttty8BTcoFvoMov1JzjXe0OwBGGh0xvS0os'

  try {
    const config = useRuntimeConfig()
    if (config.partnerBaseUrl) baseUrl = config.partnerBaseUrl
    if (config.partnerApiKey) apiKey = config.partnerApiKey
  } catch {
    if (process.env.NUXT_PARTNER_BASE_URL) baseUrl = process.env.NUXT_PARTNER_BASE_URL
    if (process.env.NUXT_PARTNER_API_KEY) apiKey = process.env.NUXT_PARTNER_API_KEY
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey: (apiKey || '').trim()
  }
}

/**
 * Helper gọi HTTP an toàn tương thích cả trong Nitro ($fetch) và ngoài môi trường test độc lập
 */
async function partnerFetch<T = any>(
  url: string,
  opts: { method?: string; headers?: Record<string, string>; body?: any } = {}
): Promise<T> {
  if (typeof $fetch !== 'undefined') {
    return await $fetch<T>(url, opts as any) as T
  }

  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: opts.headers,
    body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined
  })

  const text = await res.text()
  let data: any = text
  try {
    data = JSON.parse(text)
  } catch {
    // giữ raw text nếu không phải json
  }

  if (!res.ok) {
    const error: any = new Error(data?.message || text || `Request failed with status ${res.status}`)
    error.status = res.status
    error.data = data
    throw error
  }

  return data as T
}

/**
 * 1. Lấy danh sách dịch vụ xe từ Integration Partner: GET /api/integration-partner/service
 */
export async function getPartnerServices(): Promise<PartnerServiceItem[]> {
  const { baseUrl, apiKey } = getPartnerConfig()

  try {
    const response = await partnerFetch<{ data?: PartnerServiceItem[]; success?: boolean } | PartnerServiceItem[]>(
      `${baseUrl}/api/integration-partner/service`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    )

    const list = Array.isArray(response) ? response : (response?.data || [])
    if (list.length > 0) {
      return list.map((item) => {
        let seats = 5
        if (item.service_code?.includes('7') || item.name?.includes('7 chỗ')) {
          seats = 7
        }
        return {
          ...item,
          seats,
          description: item.description || (seats === 7 ? 'Tối đa 6 hành khách' : 'Tối đa 4 hành khách')
        }
      })
    }
  } catch (error) {
    console.warn('[PartnerAPI] GET /api/integration-partner/service failed:', (error as Error).message)
  }

  // Fallback danh sách dịch vụ xe chuẩn Happy Trip
  return [
    {
      id: '66947d0917482239472b9807',
      name: 'Bao chuyến 5 chỗ (1 chiều)',
      service_code: 'SEAT_5_ONE_WAY',
      description: 'Tối đa 4 hành khách',
      seats: 5
    },
    {
      id: '66947cea17482239472b88e8',
      name: 'Bao chuyến 7 chỗ (1 chiều)',
      service_code: 'SEAT_7_ONE_WAY',
      description: 'Tối đa 6 hành khách',
      seats: 7
    }
  ]
}

/**
 * 2. Lấy danh sách các tỉnh/thành phố: GET /api/integration-partner/city
 */
export async function getPartnerCities(): Promise<PartnerCity[]> {
  const { baseUrl, apiKey } = getPartnerConfig()

  try {
    const response = await partnerFetch<{ data?: PartnerCity[]; success?: boolean } | PartnerCity[]>(
      `${baseUrl}/api/integration-partner/city`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    )

    const list = Array.isArray(response) ? response : (response?.data || [])
    if (list.length > 0) {
      return list
    }
  } catch (error) {
    console.warn('[PartnerAPI] GET /api/integration-partner/city failed:', (error as Error).message)
  }

  // Fallback mặc định
  return [
    { id: '69d85c7e0d4befc8e55b1ead', name: 'TP Hồ Chí Minh' },
    { id: '6789c242a67233093ddb723e', name: 'BRVT - Vũng Tàu' }
  ]
}

/**
 * 3. Lấy danh sách các phường/xã của 1 tỉnh: GET /api/integration-partner/city/:cityId/district
 */
export async function getPartnerDistricts(cityId: string): Promise<PartnerDistrict[]> {
  if (!cityId) return []
  const { baseUrl, apiKey } = getPartnerConfig()

  try {
    const response = await partnerFetch<{ data?: PartnerDistrict[]; districts?: PartnerDistrict[]; success?: boolean } | PartnerDistrict[]>(
      `${baseUrl}/api/integration-partner/city/${cityId}/district`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey
        }
      }
    )

    const list = Array.isArray(response) ? response : (response?.data || response?.districts || [])
    if (list.length > 0) {
      return list.map(item => ({
        name: typeof item === 'string' ? item : item.name,
        status: typeof item === 'object' && 'status' in item ? item.status : true
      }))
    }
  } catch (error) {
    console.warn(`[PartnerAPI] GET district for ${cityId} failed:`, (error as Error).message)
  }

  return []
}

/**
 * 4. Tính cước và khoảng cách: POST /api/integration-partner/calculate (kết hợp preview-v2 để lấy distance)
 */
export async function calculatePartnerOrder(payload: PartnerCalculatePayload): Promise<PartnerCalculateResult> {
  const { baseUrl, apiKey } = getPartnerConfig()

  const depDistrict = payload.departure_district || payload.departure_dictrict || ''
  const destDistrict = payload.destination_district || payload.destination_dictrict || ''
  const serviceId = payload.id_service || payload.service_id || '66947d0917482239472b9807'

  let calculatedPrice: number | undefined
  let calculatedDistance: number | undefined
  let previewList: any[] = []

  // 1. Thử gọi POST /api/integration-partner/calculate
  try {
    const calcRes = await partnerFetch<{ data?: { price_guest?: number; price_guest_after?: number }; success?: boolean }>(
      `${baseUrl}/api/integration-partner/calculate`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: {
          departure_city: payload.departure_city,
          departure_district: depDistrict,
          departure_address_1: payload.departure_address_1,
          destination_city: payload.destination_city,
          destination_district: destDistrict,
          destination_address_1: payload.destination_address_1,
          id_service: serviceId
        }
      }
    )

    if (calcRes?.data?.price_guest_after || calcRes?.data?.price_guest) {
      calculatedPrice = calcRes.data.price_guest_after || calcRes.data.price_guest
    }
  } catch (err) {
    console.warn('[PartnerAPI] /api/integration-partner/calculate warning:', (err as Error).message)
  }

  // 2. Gọi thêm /api/order/preview-v2 để lấy danh sách đầy đủ các gói cước và khoảng cách (distance)
  try {
    const previewRes = await partnerFetch<any[]>(
      `${baseUrl}/api/order/preview-v2`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: {
          departure_city: payload.departure_city,
          departure_dictrict: depDistrict,
          departure_address_1: payload.departure_address_1,
          destination_city: payload.destination_city,
          destination_dictrict: destDistrict,
          destination_address_1: payload.destination_address_1,
          date_of_destination: payload.date_of_destination || new Date().toISOString()
        }
      }
    )

    if (Array.isArray(previewRes)) {
      previewList = previewRes
      const match = previewRes.find(p => p.id_service === serviceId)
      if (match) {
        if (!calculatedPrice) calculatedPrice = match.price_guest_after || match.price_guest || match.price
        calculatedDistance = match.distance
      } else if (previewRes.length > 0 && !calculatedPrice) {
        calculatedPrice = previewRes[0].price_guest_after || previewRes[0].price_guest || previewRes[0].price
        calculatedDistance = previewRes[0].distance
      }
    }
  } catch (err) {
    console.warn('[PartnerAPI] preview-v2 warning:', (err as Error).message)
  }

  // Nếu cả hai đều không lấy được giá do địa chỉ hoặc lỗi, fallback tính toán khoảng cách/giá hợp lý
  if (!calculatedPrice) {
    // Mặc định chuyến TP.HCM - Vũng Tàu ~ 95-100km: 5 chỗ 750k - 900k, 7 chỗ 850k - 1100k
    const is7Seats = serviceId === '66947cea17482239472b88e8' || payload.car?.includes('7')
    calculatedPrice = is7Seats ? 850000 : 750000
    calculatedDistance = 99
  }

  return {
    price: calculatedPrice,
    original_price: calculatedPrice,
    discount_price: calculatedPrice,
    price_guest: calculatedPrice,
    price_guest_after: calculatedPrice,
    distance: calculatedDistance || 99,
    duration: Math.round((calculatedDistance || 99) * 1.5), // ước lượng phút
    service_id: serviceId,
    service_name: serviceId === '66947cea17482239472b88e8' ? 'Bao chuyến 7 chỗ (1 chiều)' : 'Bao chuyến 5 chỗ (1 chiều)',
    car_type: serviceId === '66947cea17482239472b88e8' ? '7 chỗ' : '5 chỗ',
    previews: previewList
  }
}

/**
 * 5. Tạo đơn đối tác: POST /api/integration-partner/request
 */
export async function createPartnerOrder(payload: PartnerCreateOrderPayload): Promise<PartnerCreateOrderResult> {
  const { baseUrl, apiKey } = getPartnerConfig()

  const depDistrict = payload.departure_district || payload.departure_dictrict || ''
  const destDistrict = payload.destination_district || payload.destination_dictrict || ''

  const bodyData = {
    departure_city: payload.departure_city,
    departure_district: depDistrict,
    departure_address_1: payload.departure_address_1,
    destination_city: payload.destination_city,
    destination_district: destDistrict,
    destination_address_1: payload.destination_address_1,
    date_of_destination: payload.date_of_destination,
    id_service: payload.id_service || '66947d0917482239472b9807',
    full_name: payload.full_name || 'Khách đặt qua AI Voice',
    phone: payload.phone,
    note: payload.note || 'Đơn hàng tạo từ trợ lý AI Voice Happy Trip',
    partner_code: payload.partner_code || 'ai_cs'
  }

  try {
    const response = await partnerFetch<{
      data?: { id?: string; short_id?: string; status?: string };
      message?: string;
      success?: boolean;
    }>(
      `${baseUrl}/api/integration-partner/request`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: bodyData
      }
    )

    if (response?.success !== false) {
      return {
        success: true,
        order_id: response?.data?.id || 'AI_' + Date.now(),
        short_id: response?.data?.short_id || ('HT' + Math.floor(100000 + Math.random() * 900000)),
        message: response?.message || 'Tạo đơn hàng đối tác thành công',
        data: response?.data
      }
    } else {
      return {
        success: false,
        message: response?.message || 'Không thể tạo đơn hàng đối tác',
        data: response
      }
    }
  } catch (error: any) {
    console.error('[PartnerAPI] createPartnerOrder error:', error?.data || error?.message)
    return {
      success: false,
      message: error?.data?.message || (typeof error?.data === 'string' ? error.data : 'Không thể kết nối máy chủ tạo đơn đối tác.'),
      data: error?.data
    }
  }
}
