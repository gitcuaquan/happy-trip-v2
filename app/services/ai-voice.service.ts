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
   * Lấy trạng thái hoạt động của server AI Voice (live hoặc demo).
   * Ném lỗi khi không gọi được API để caller phân biệt "chưa cấu hình" vs "mất kết nối".
   */
  async getStatus(): Promise<AiVoiceStatusResponse> {
    return await $fetch<AiVoiceStatusResponse>(`${this.baseUrl}/status`, {
      method: 'GET'
    })
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
   * Tổng hợp giọng nữ tiếng Việt thành MP3 từ server
   * (OpenAI TTS nếu có key, ngược lại Google Translate TTS)
   */
  async synthesize(text: string, voice?: string): Promise<Blob | null> {
    const clean = (text || '').trim()
    if (!clean) return null

    try {
      const blob = await $fetch<Blob>(`${this.baseUrl}/tts`, {
        method: 'POST',
        body: voice ? { text: clean, voice } : { text: clean },
        responseType: 'blob',
        timeout: 20000,
        retry: 0
      })

      return blob instanceof Blob && blob.size > 0 ? blob : null
    } catch (error) {
      console.warn('[AiVoiceService] synthesize error:', error)
      return null
    }
  }

  /**
   * Khởi tạo WebRTC session với OpenAI Live (gửi SDP offer, nhận SDP answer).
   * Ném lỗi kèm statusCode + statusMessage khi server/OpenAI từ chối để UI báo rõ.
   */
  async createSession(sdpOffer: string): Promise<AiVoiceSessionResponse> {
    const response = await fetch(`${this.baseUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Accept': 'application/sdp, application/json, text/plain'
      },
      body: sdpOffer
    })

    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')

    if (!response.ok) {
      let statusMessage = ''
      if (isJson) {
        try {
          const data = await response.json()
          statusMessage = String(data?.statusMessage || data?.message || '')
        } catch {
          statusMessage = ''
        }
      } else {
        statusMessage = (await response.text().catch(() => '')).slice(0, 200)
      }

      throw Object.assign(
        new Error(statusMessage || `Không thể tạo phiên OpenAI Live (HTTP ${response.status}).`),
        { statusCode: response.status, statusMessage }
      )
    }

    if (isJson) {
      return await response.json() as AiVoiceSessionResponse
    }

    const answerSdp = await response.text()
    return { sdp: answerSdp, demo: false }
  }
}

export const aiVoiceService = new AiVoiceService()
