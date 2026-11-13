export interface AiVoiceStatusResponse {
  live: boolean
  hasOpenAIKey: boolean
  mode: 'live' | 'demo'
  model?: string
  message?: string
}

export interface AiVoiceCatalogService {
  id: string
  name: string
  type?: string
  seats?: number
  price?: number
  description?: string
  [key: string]: any
}

export interface AiVoiceCatalogLocation {
  code?: string
  name: string
  districts?: Array<{
    code?: string
    name: string
    wards?: Array<{
      code?: string
      name: string
    }>
  }>
  [key: string]: any
}

export interface AiVoiceCatalogResponse {
  services: AiVoiceCatalogService[]
  locations?: AiVoiceCatalogLocation[]
  cities?: any[]
  [key: string]: any
}

export interface AiVoiceCalculatePayload {
  pickupArea: string
  pickupWard?: string
  pickupDetail?: string
  dropoffArea: string
  dropoffWard?: string
  dropoffDetail?: string
  date?: string
  time?: string
  car?: string
  service_id?: string
  [key: string]: any
}

export interface AiVoiceCalculateResponse {
  distance?: number
  duration?: number
  price?: number
  original_price?: number
  discount_price?: number
  service_id?: string
  service_name?: string
  car_type?: string
  routes?: any[]
  previews?: Array<{
    id_service: string
    name_service?: string
    price: number
    distance?: number
    [key: string]: any
  }>
  [key: string]: any
}

export interface BookingFormFields {
  pickupArea: string
  pickupWard: string
  pickupDetail: string
  dropoffArea: string
  dropoffWard: string
  dropoffDetail: string
  date: string
  time: string
  car: string
  passengers: string
  notes: string
  customer_name?: string
  customer_phone?: string
  [key: string]: string | undefined
}

export interface AiVoiceExtractPayload {
  transcript: string
  draft?: Partial<BookingFormFields>
}

export interface AiVoiceExtractResponse {
  fields: BookingFormFields
  verified?: boolean
  demo?: boolean
  fallback?: boolean
  [key: string]: any
}

export interface AiVoiceCreateOrderPayload {
  customer_name: string
  customer_phone: string
  pickupArea: string
  pickupWard?: string
  pickupDetail?: string
  dropoffArea: string
  dropoffWard?: string
  dropoffDetail?: string
  date?: string
  time?: string
  car?: string
  passengers?: string
  notes?: string
  price?: number
  distance?: number
  service_id?: string
  partner_code?: string
  [key: string]: any
}

export interface AiVoiceCreateOrderResponse {
  success: boolean
  order_id?: string
  short_id?: string
  message?: string
  order?: any
  [key: string]: any
}

export interface AiVoiceSessionResponse {
  sdp?: string
  demo?: boolean
  error?: string
  message?: string
}

export class AiVoiceService {
  private baseUrl = '/api/ai-voice'

  /**
   * Lấy trạng thái hoạt động của server AI Voice (live hoặc demo)
   */
  async getStatus(): Promise<AiVoiceStatusResponse> {
    try {
      return await $fetch<AiVoiceStatusResponse>(`${this.baseUrl}/status`, {
        method: 'GET'
      })
    } catch (error) {
      console.warn('[AiVoiceService] getStatus error, falling back to demo mode:', error)
      return {
        live: false,
        hasOpenAIKey: false,
        mode: 'demo',
        model: 'demo-simulator',
        message: 'Chế độ Demo tương tác (Web Speech API / Fallback)'
      }
    }
  }

  /**
   * Lấy danh mục dịch vụ xe và tỉnh/phường
   */
  async getCatalog(): Promise<AiVoiceCatalogResponse> {
    try {
      return await $fetch<AiVoiceCatalogResponse>(`${this.baseUrl}/catalog`, {
        method: 'GET'
      })
    } catch (error) {
      console.warn('[AiVoiceService] getCatalog error:', error)
      return {
        services: [
          { id: '1', name: 'Xe riêng 5 chỗ', seats: 5, price: 900000 },
          { id: '2', name: 'Xe riêng 7 chỗ', seats: 7, price: 1100000 }
        ],
        locations: []
      }
    }
  }

  /**
   * Tính cước và khoảng cách lộ trình
   */
  async calculate(payload: AiVoiceCalculatePayload): Promise<AiVoiceCalculateResponse> {
    try {
      return await $fetch<AiVoiceCalculateResponse>(`${this.baseUrl}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      })
    } catch (error) {
      console.warn('[AiVoiceService] calculate error:', error)
      throw error
    }
  }

  /**
   * Tạo đơn đặt xe mới qua AI Voice
   */
  async createOrder(payload: AiVoiceCreateOrderPayload): Promise<AiVoiceCreateOrderResponse> {
    try {
      return await $fetch<AiVoiceCreateOrderResponse>(`${this.baseUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          ...payload,
          partner_code: payload.partner_code || 'ai_cs'
        }
      })
    } catch (error) {
      console.error('[AiVoiceService] createOrder error:', error)
      throw error
    }
  }

  /**
   * Trích xuất nội dung transcript thành cấu trúc dữ liệu booking form
   */
  async extract(payload: AiVoiceExtractPayload): Promise<AiVoiceExtractResponse> {
    try {
      return await $fetch<AiVoiceExtractResponse>(`${this.baseUrl}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      })
    } catch (error) {
      console.warn('[AiVoiceService] extract error:', error)
      throw error
    }
  }

  /**
   * Khởi tạo WebRTC session với OpenAI Live (gửi SDP offer, nhận SDP answer)
   */
  async createSession(sdpOffer: string): Promise<AiVoiceSessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'Accept': 'application/sdp, application/json, text/plain'
        },
        body: sdpOffer
      })

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const jsonData = await response.json()
        return jsonData as AiVoiceSessionResponse
      }

      const answerSdp = await response.text()
      return { sdp: answerSdp, demo: false }
    } catch (error: any) {
      console.warn('[AiVoiceService] createSession error:', error)
      return {
        demo: true,
        error: error?.message || 'Không thể kết nối Live session, chuyển sang chế độ Demo'
      }
    }
  }
}

export const aiVoiceService = new AiVoiceService()
