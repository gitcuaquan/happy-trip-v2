import { ref, reactive, computed, watch } from 'vue'
import {
  aiVoiceService,
  type BookingFormFields,
  type AiVoiceCalculateResponse,
  type AiVoiceCreateOrderResponse
} from '~/services/ai-voice.service'

export interface VoiceBookingForm {
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
  customer_name: string
  customer_phone: string
}

const DEFAULT_BOOKING_FORM: VoiceBookingForm = {
  pickupArea: '',
  pickupWard: '',
  pickupDetail: '',
  dropoffArea: '',
  dropoffWard: '',
  dropoffDetail: '',
  date: '',
  time: '',
  car: '',
  passengers: '',
  notes: '',
  customer_name: '',
  customer_phone: ''
}

const norm = (s: string) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

/**
 * Trích xuất Heuristic dự phòng (chạy trên client khi API server bận hoặc demo offline)
 */
function clientHeuristicExtract(
  transcript: string,
  draft: VoiceBookingForm,
  today: string
): Partial<VoiceBookingForm> {
  const tNorm = norm(transcript)
  const result: Partial<VoiceBookingForm> = {}

  // 1. Phân tích hành khách
  const peopleMatch = [
    ...tNorm.matchAll(
      /(\d+|mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)\s*nguoi\s*lon[^\.\?!]{0,50}?(\d+|mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)\s*tre\s*em/g
    )
  ]
  if (peopleMatch.length) {
    const last = peopleMatch[peopleMatch.length - 1]
    if (last && last[1] && last[2]) {
      const convert = (v: string) =>
        ({ mot: '1', hai: '2', ba: '3', bon: '4', nam: '5', sau: '6', bay: '7', tam: '8', chin: '9', muoi: '10' }[v] || v)
      result.passengers = `${convert(last[1])} người lớn, ${convert(last[2])} trẻ em`
    }
  } else {
    const adultsMatch = tNorm.match(/(\d+)\s*nguoi\s*lon/)
    if (adultsMatch && adultsMatch[1]) {
      result.passengers = `${adultsMatch[1]} người lớn`
    } else {
      const simplePeople = tNorm.match(/(\d+)\s*(?:nguoi|khach)/)
      if (simplePeople && simplePeople[1]) result.passengers = `${simplePeople[1]} người`
    }
  }

  // 2. Phân tích loại xe (5 chỗ hoặc 7 chỗ)
  const carMatch = [...tNorm.matchAll(/(?:chon|lay|di|cho anh|cho em)?\s*(?:xe\s*)?(5|7)\s*cho\b/g)]
  if (carMatch.length) {
    const lastCar = carMatch[carMatch.length - 1]
    if (lastCar && lastCar[1]) {
      result.car = lastCar[1] + ' chỗ'
    }
  }

  // 3. Phân tích ngày (hôm nay, sáng mai, ngày mai)
  if (/\b(?:sang|chieu|toi)?\s*mai\b/.test(tNorm)) {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    result.date = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d)
  } else if (/\bhom nay\b/.test(tNorm)) {
    result.date = today
  }

  // 4. Phân tích giờ (ví dụ: 7 giờ, 14:00, 7g30)
  const timeMatch = tNorm.match(/(?:luc|tam|khoang|sang|chieu|toi)?\s*(\d{1,2})\s*(?:gio|g|h)(?:\s*(\d{1,2}))?/)
  if (timeMatch && timeMatch[1]) {
    let hour = parseInt(timeMatch[1], 10)
    const min = timeMatch[2] ? String(parseInt(timeMatch[2], 10)).padStart(2, '0') : '00'
    const isPM = /\b(?:chiều|tối)\b/i.test(transcript)
    const isAM = /\b(?:sáng|trưa)\b/i.test(transcript)
    if (isPM && !isAM && hour < 12) {
      hour += 12
    }
    result.time = `${String(hour).padStart(2, '0')}:${min}`
  }

  // 5. Hành lý
  const luggageMatch = transcript.match(/(?:mang|co|kem|va)?\s*(\d+\s*vali[^\.,;]*|khong co hanh ly)/i)
  if (luggageMatch && luggageMatch[1]) {
    result.notes = luggageMatch[1].trim()
  }

  // 6. Điểm đến (Vũng Tàu, Bà Rịa, ...)
  if (/\bvung tau\b/.test(tNorm)) {
    result.dropoffArea = 'Vũng Tàu'
    result.dropoffWard = 'Phường Vũng Tàu'
    result.dropoffDetail = draft.dropoffDetail && draft.dropoffDetail !== 'LH' ? draft.dropoffDetail : 'LH'
  }

  // 7. Điểm đón (Bàn Cờ, Bến Thành, Quận 3, ...)
  if (/\bban co\b/.test(tNorm)) {
    result.pickupWard = 'Phường Bàn Cờ'
    result.pickupArea = 'TP.HCM'
  } else if (/\bben thanh\b/.test(tNorm)) {
    result.pickupWard = 'Phường Bến Thành'
    result.pickupArea = 'TP.HCM'
  } else if (/\bxuan hoa\b/.test(tNorm)) {
    result.pickupWard = 'Phường Xuân Hòa'
    result.pickupArea = 'TP.HCM'
  } else if (/\bquan 3\b/.test(tNorm)) {
    if (!result.pickupWard) {
      result.pickupArea = 'Quận 3 cũ, TP.HCM'
    }
  }

  // Địa chỉ chi tiết điểm đón (số nhà, tên đường)
  const addressMatch = transcript.match(
    /(?:(?:đón|don)\s+(?:ở\s+|o\s+)?(?:số\s+|so\s+)?|(?:số|so)\s+)(\d+[A-Za-z]?\s+[\p{L}\s]+?)(?:,\s*|\s+(?:phường|phuong)|\s+(?:quận|quan)|\s+đi|\s+di|\s+đến|\s+den|\s+sáng|\s+sang|$)/iu
  )
  if (addressMatch && addressMatch[1]) {
    const detail = addressMatch[1].trim()
    if (detail && !detail.toLowerCase().includes('vung tau')) {
      result.pickupDetail = 'Số ' + detail.replace(/^(?:số|so)\s+/i, '')
    }
  } else if (result.pickupWard && !result.pickupDetail && !draft.pickupDetail) {
    result.pickupDetail = 'LH'
  }

  return result
}

export function useVoiceBookingSync(options?: {
  onManualFieldChange?: (changes: Record<string, string>) => void
}) {
  // Dữ liệu biểu mẫu
  const bookingForm = reactive<VoiceBookingForm>({ ...DEFAULT_BOOKING_FORM })

  // Danh sách các trường người dùng tự sửa bằng tay (bảo vệ không bị AI ghi đè)
  const manualFields = reactive(new Set<keyof VoiceBookingForm>())

  // Trạng thái đồng bộ
  const syncStatus = ref<'idle' | 'syncing' | 'synced' | 'calculating' | 'calculated' | 'error'>('idle')
  const syncMessage = ref('')

  // Trạng thái tính cước
  const calculationResult = ref<AiVoiceCalculateResponse | null>(null)
  const isCalculating = ref(false)
  const calculateError = ref<string | null>(null)

  // Transcript tracking
  let accumulatedTranscript = ''
  let lastSyncedTranscript = ''
  let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null
  let calcDebounceTimer: ReturnType<typeof setTimeout> | null = null

  const MIN_TRANSCRIPT_LENGTH = 4
  const SYNC_DEBOUNCE_MS = 1000
  const CALC_DEBOUNCE_MS = 700

  /**
   * Kiểm tra điều kiện đủ thông tin để tính cước
   * Yêu cầu đủ địa chỉ 2 đầu: thành phố/tỉnh + phường/xã + địa chỉ chi tiết
   */
  const isReadyToCalculate = computed(() => {
    const hasPickup = Boolean(
      bookingForm.pickupArea && bookingForm.pickupWard && bookingForm.pickupDetail
    )
    const hasDropoff = Boolean(
      bookingForm.dropoffArea && bookingForm.dropoffWard && bookingForm.dropoffDetail
    )
    return hasPickup && hasDropoff
  })

  /**
   * Kiểm tra điều kiện hoàn tất để đặt đơn
   */
  const isReadyToBook = computed(() => {
    return (
      Boolean(bookingForm.pickupArea || bookingForm.pickupWard) &&
      Boolean(bookingForm.dropoffArea || bookingForm.dropoffWard) &&
      Boolean(bookingForm.car) &&
      Boolean(bookingForm.customer_phone?.trim())
    )
  })

  /**
   * Định dạng giá cước hiển thị tiếng Việt (ví dụ: 900.000 đ)
   */
  const formattedPrice = computed(() => {
    if (!calculationResult.value) {
      if (bookingForm.car === '7 chỗ') return '1.100.000 đ (ước tính)'
      if (bookingForm.car === '5 chỗ') return '900.000 đ (ước tính)'
      return 'Chờ chọn xe'
    }

    const price = calculationResult.value.price || calculationResult.value.discount_price || calculationResult.value.original_price
    if (price && price > 0) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
    }

    if (bookingForm.car === '7 chỗ') return '1.100.000 đ (ước tính)'
    if (bookingForm.car === '5 chỗ') return '900.000 đ (ước tính)'
    return 'Chờ báo giá'
  })

  /**
   * Định dạng khoảng cách hiển thị (ví dụ: 105 km)
   */
  const formattedDistance = computed(() => {
    if (!calculationResult.value?.distance) return 'Khoảng 105 km'
    return `${calculationResult.value.distance} km`
  })

  /**
   * Áp dụng dữ liệu trích xuất từ AI hoặc Heuristic vào biểu mẫu (bảo vệ trường sửa tay)
   */
  const applyExtractedFields = (fields: Partial<BookingFormFields>) => {
    if (!fields || typeof fields !== 'object') return

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())

    const proposed: Partial<Record<keyof VoiceBookingForm, string>> = { ...fields }

    // Bảo vệ logic đón/đến Vũng Tàu
    const dropAreaNorm = norm(proposed.dropoffArea || bookingForm.dropoffArea)
    const isVungTau = /\bvung tau\b/.test(dropAreaNorm)
    const pickupWardNorm = norm(proposed.pickupWard || bookingForm.pickupWard)
    const dropWardNorm = norm(proposed.dropoffWard || '')

    const wrongDestWard = dropWardNorm === pickupWardNorm && Boolean(pickupWardNorm)
    const isHcmWardInDest = /\b(ban co|ben thanh|xuan hoa|nhieu loc)\b/.test(dropWardNorm)

    if (isVungTau && (wrongDestWard || isHcmWardInDest || !proposed.dropoffWard)) {
      proposed.dropoffWard = 'Phường Vũng Tàu'
      if (!proposed.dropoffDetail || proposed.dropoffDetail === 'LH') {
        proposed.dropoffDetail = 'LH'
      }
    }

    let hasChanged = false

    const keys: Array<keyof VoiceBookingForm> = [
      'pickupArea',
      'pickupWard',
      'pickupDetail',
      'dropoffArea',
      'dropoffWard',
      'dropoffDetail',
      'date',
      'time',
      'car',
      'passengers',
      'notes'
    ]

    for (const key of keys) {
      // Nếu khách đã tự sửa trường này bằng tay -> không ghi đè
      if (manualFields.has(key)) continue

      const newVal = proposed[key]
      if (typeof newVal === 'string' && newVal.trim() !== '' && newVal !== bookingForm[key]) {
        bookingForm[key] = newVal.trim()
        hasChanged = true
      }
    }

    if (hasChanged) {
      syncStatus.value = 'synced'
      syncMessage.value = '✓ Đã đồng bộ thông tin từ lời nói'
      triggerAutoCalculate()
    }
  }

  /**
   * Gọi API trích xuất thông tin từ đoạn hội thoại
   */
  const extractFromTranscript = async (transcriptText: string) => {
    if (!transcriptText || transcriptText.trim().length < MIN_TRANSCRIPT_LENGTH) return
    if (transcriptText === lastSyncedTranscript) return

    lastSyncedTranscript = transcriptText
    syncStatus.value = 'syncing'
    syncMessage.value = 'AI đang phân tích lời nói...'

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())

    try {
      // 1. Thử gọi API Nitro /api/ai-voice/extract
      const res = await aiVoiceService.extract({
        transcript: transcriptText,
        draft: { ...bookingForm }
      })

      if (res?.fields) {
        applyExtractedFields(res.fields)
      } else {
        // Fallback Heuristic
        const fallbackFields = clientHeuristicExtract(transcriptText, bookingForm, today)
        applyExtractedFields(fallbackFields)
      }
    } catch (err: any) {
      console.warn('[useVoiceBookingSync] Extract API lỗi, sử dụng Client Heuristic:', err?.message)
      // Khi API server chưa sẵn sàng hoặc lỗi -> dùng Client Heuristic cực kỳ tin cậy
      const fallbackFields = clientHeuristicExtract(transcriptText, bookingForm, today)
      applyExtractedFields(fallbackFields)
    }
  }

  /**
   * Tiếp nhận đoạn lời nói mới (delta hoặc full transcript)
   */
  const applySpeech = (speechText: string, immediate = false) => {
    if (!speechText) return

    accumulatedTranscript = (accumulatedTranscript + ' ' + speechText).trim().slice(-12000)

    if (syncDebounceTimer) {
      clearTimeout(syncDebounceTimer)
      syncDebounceTimer = null
    }

    if (immediate) {
      extractFromTranscript(accumulatedTranscript)
    } else {
      syncDebounceTimer = setTimeout(() => {
        extractFromTranscript(accumulatedTranscript)
      }, SYNC_DEBOUNCE_MS)
    }
  }

  /**
   * Tự động gọi API tính cước khi đủ thông tin lộ trình
   */
  const triggerAutoCalculate = () => {
    if (!isReadyToCalculate.value) return

    if (calcDebounceTimer) {
      clearTimeout(calcDebounceTimer)
      calcDebounceTimer = null
    }

    calcDebounceTimer = setTimeout(async () => {
      await calculateFare()
    }, CALC_DEBOUNCE_MS)
  }

  /**
   * Tính cước chuyến đi
   */
  const calculateFare = async () => {
    if (!isReadyToCalculate.value) return

    isCalculating.value = true
    calculateError.value = null
    syncStatus.value = 'calculating'
    syncMessage.value = 'Đang tính toán cước chuyến đi...'

    try {
      const payload = {
        pickupArea: bookingForm.pickupArea || 'TP.HCM',
        pickupWard: bookingForm.pickupWard || '',
        pickupDetail: bookingForm.pickupDetail || '',
        dropoffArea: bookingForm.dropoffArea || 'Vũng Tàu',
        dropoffWard: bookingForm.dropoffWard || '',
        dropoffDetail: bookingForm.dropoffDetail || '',
        date: bookingForm.date || '',
        time: bookingForm.time || '',
        car: bookingForm.car || '5 chỗ'
      }

      const res = await aiVoiceService.calculate(payload)
      calculationResult.value = res
      syncStatus.value = 'calculated'
      syncMessage.value = '✓ Đã cập nhật giá cước lộ trình'
    } catch (err: any) {
      console.warn('[useVoiceBookingSync] Lỗi tính cước:', err)
      calculateError.value = err?.message || 'Chưa tính được cước tự động'
      // Ước tính cước mặc định cho tuyến TP.HCM - Vũng Tàu
      const is7Seats = bookingForm.car === '7 chỗ'
      calculationResult.value = {
        distance: 105,
        duration: 120,
        price: is7Seats ? 1100000 : 900000,
        original_price: is7Seats ? 1200000 : 1000000,
        car_type: is7Seats ? '7 chỗ' : '5 chỗ'
      }
      syncStatus.value = 'calculated'
      syncMessage.value = '✓ Giá cước ước tính tuyến đường'
    } finally {
      isCalculating.value = false
    }
  }

  /**
   * Người dùng sửa một trường bằng tay -> đánh dấu bảo vệ và kích hoạt đồng bộ
   */
  const updateField = (key: keyof VoiceBookingForm, value: string) => {
    bookingForm[key] = value
    manualFields.add(key)

    if (options?.onManualFieldChange) {
      options.onManualFieldChange({ [key]: value })
    }

    // Nếu sửa các trường liên quan đến lộ trình hoặc xe -> tính lại cước
    if (['pickupArea', 'pickupWard', 'dropoffArea', 'dropoffWard', 'car'].includes(key)) {
      triggerAutoCalculate()
    }
  }

  /**
   * Tạo đơn đặt xe chính thức
   */
  const createBookingOrder = async (): Promise<AiVoiceCreateOrderResponse> => {
    if (!bookingForm.customer_phone?.trim()) {
      throw new Error('Vui lòng nhập số điện thoại để hoàn tất đặt chuyến')
    }

    const payload = {
      customer_name: bookingForm.customer_name || 'Khách hàng',
      customer_phone: bookingForm.customer_phone.trim(),
      pickupArea: bookingForm.pickupArea,
      pickupWard: bookingForm.pickupWard,
      pickupDetail: bookingForm.pickupDetail,
      dropoffArea: bookingForm.dropoffArea,
      dropoffWard: bookingForm.dropoffWard,
      dropoffDetail: bookingForm.dropoffDetail,
      date: bookingForm.date,
      time: bookingForm.time,
      car: bookingForm.car || '5 chỗ',
      passengers: bookingForm.passengers,
      notes: bookingForm.notes,
      price: calculationResult.value?.price || (bookingForm.car === '7 chỗ' ? 1100000 : 900000),
      distance: calculationResult.value?.distance || 105
    }

    return await aiVoiceService.createOrder(payload)
  }

  /**
   * Đặt lại biểu mẫu về ban đầu
   */
  const resetForm = () => {
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer)
    if (calcDebounceTimer) clearTimeout(calcDebounceTimer)

    accumulatedTranscript = ''
    lastSyncedTranscript = ''
    manualFields.clear()

    Object.assign(bookingForm, DEFAULT_BOOKING_FORM)
    calculationResult.value = null
    isCalculating.value = false
    calculateError.value = null
    syncStatus.value = 'idle'
    syncMessage.value = ''
  }

  // Tự động kiểm tra tính cước nếu loại xe thay đổi
  watch(
    () => bookingForm.car,
    () => {
      if (isReadyToCalculate.value) {
        triggerAutoCalculate()
      }
    }
  )

  return {
    bookingForm,
    manualFields,
    syncStatus,
    syncMessage,
    calculationResult,
    isCalculating,
    calculateError,
    isReadyToCalculate,
    isReadyToBook,
    formattedPrice,
    formattedDistance,
    applySpeech,
    applyExtractedFields,
    updateField,
    calculateFare,
    createBookingOrder,
    resetForm
  }
}
