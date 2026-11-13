import OpenAI from 'openai'
import {
  BOOKING_KEYS,
  BOOKING_SCHEMA,
  getExtractSystemPrompt,
  type BookingKey
} from '../../utils/trip-prompt'
import {
  normalizeVietnamese,
  sanitizeBookingFields,
  type BookingFormFields
} from '../../utils/address-normalizer'

const extractCalls: number[] = []
const EXTRACT_PER_HOUR = 120

/**
 * Bộ trích xuất thông minh Heuristic Regex tiếng Việt
 * Hoạt động độc lập không phụ thuộc vào OpenAI API Key
 */
function heuristicExtract(
  transcript: string,
  draft: Partial<BookingFormFields>,
  today: string
): BookingFormFields {
  const tNorm = normalizeVietnamese(transcript)
  const result: BookingFormFields = {
    pickupArea: draft.pickupArea || '',
    pickupWard: draft.pickupWard || '',
    pickupDetail: draft.pickupDetail || '',
    dropoffArea: draft.dropoffArea || '',
    dropoffWard: draft.dropoffWard || '',
    dropoffDetail: draft.dropoffDetail || '',
    date: draft.date || '',
    time: draft.time || '',
    car: draft.car || '',
    passengers: draft.passengers || '',
    notes: draft.notes || '',
    customer_name: draft.customer_name || '',
    customer_phone: draft.customer_phone || ''
  }

  // 1. Phân tích hành khách (passengers)
  const peopleMatch = [
    ...tNorm.matchAll(
      /(\d+|mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)\s*nguoi\s*lon[^\.\?!]{0,50}?(\d+|mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)\s*tre\s*em/g
    )
  ]
  if (peopleMatch.length) {
    const last = peopleMatch[peopleMatch.length - 1]
    const convert = (v: string) =>
      ({
        mot: '1',
        hai: '2',
        ba: '3',
        bon: '4',
        nam: '5',
        sau: '6',
        bay: '7',
        tam: '8',
        chin: '9',
        muoi: '10'
      }[v] || v)
    if (last && last[1] && last[2]) {
      result.passengers = `${convert(last[1])} người lớn, ${convert(last[2])} trẻ em`
    }
  } else {
    const adultsMatch = tNorm.match(/(\d+)\s*nguoi\s*lon/)
    if (adultsMatch && adultsMatch[1]) {
      result.passengers = `${adultsMatch[1]} người lớn`
    } else {
      const simplePeople = tNorm.match(/(\d+)\s*(?:nguoi|khach)/)
      if (simplePeople && simplePeople[1]) {
        result.passengers = `${simplePeople[1]} người`
      }
    }
  }

  // 2. Phân tích loại xe (car)
  const carMatch = [
    ...tNorm.matchAll(/(?:chon|lay|di|cho anh|cho em)?\s*(?:xe\s*)?(5|7)\s*cho\b/g)
  ]
  if (carMatch.length) {
    const lastCar = carMatch[carMatch.length - 1]
    if (lastCar && lastCar[1]) {
      result.car = lastCar[1] + ' chỗ'
    }
  }

  // 3. Phân tích ngày (date)
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

  // 4. Phân tích giờ (time)
  const timeMatch = tNorm.match(
    /(?:luc|tam|khoang|sang|chieu|toi)?\s*(\d{1,2})\s*(?:gio|g|h)(?:\s*(\d{1,2}))?/
  )
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

  // 5. Phân tích hành lý (notes)
  const luggageMatch = transcript.match(
    /(?:mang|co|kem|va)?\s*(\d+\s*vali[^\.,;]*|khong co hanh ly)/i
  )
  if (luggageMatch && luggageMatch[1]) {
    result.notes = luggageMatch[1].trim()
  }

  // 6. Điểm đến (dropoff)
  if (/\bvung tau\b/.test(tNorm)) {
    result.dropoffArea = 'Vũng Tàu'
    result.dropoffWard = 'Phường Vũng Tàu'
    result.dropoffDetail = result.dropoffDetail && result.dropoffDetail !== 'LH' ? result.dropoffDetail : 'LH'
  }

  // 7. Điểm đón (pickup)
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

  // Chi tiết địa chỉ đón (số nhà, tên đường)
  const addressMatch = transcript.match(
    /(?:(?:đón|don)\s+(?:ở\s+|o\s+)?(?:số\s+|so\s+)?|(?:số|so)\s+)(\d+[A-Za-z]?\s+[\p{L}\s]+?)(?:,\s*|\s+(?:phường|phuong)|\s+(?:quận|quan)|\s+đi|\s+di|\s+đến|\s+den|\s+sáng|\s+sang|$)/iu
  )
  if (addressMatch && addressMatch[1]) {
    const detail = addressMatch[1].trim()
    if (detail && !detail.toLowerCase().includes('vung tau')) {
      result.pickupDetail = 'Số ' + detail.replace(/^(?:số|so)\s+/i, '')
    }
  } else if (result.pickupWard && !result.pickupDetail) {
    result.pickupDetail = 'LH'
  }

  return sanitizeBookingFields(result)
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const transcript = body.transcript

  if (typeof transcript !== 'string' || transcript.trim().length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nội dung transcript không hợp lệ.'
    })
  }

  const draft: Partial<BookingFormFields> = {}
  if (body.draft && typeof body.draft === 'object') {
    for (const key of BOOKING_KEYS as readonly BookingKey[]) {
      if (typeof body.draft[key] === 'string') {
        draft[key] = body.draft[key].slice(0, 250)
      }
    }
  }

  // Rate-limiting bộ nhớ đơn giản
  const now = Date.now()
  while (extractCalls.length && (extractCalls[0] ?? 0) < now - 3600000) {
    extractCalls.shift()
  }
  if (extractCalls.length >= EXTRACT_PER_HOUR) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Vượt quá giới hạn gọi trích xuất biểu mẫu trong giờ này.'
    })
  }
  extractCalls.push(now)

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())

  const config = useRuntimeConfig(event)
  const apiKey = (config.openaiApiKey || process.env.NUXT_OPENAI_API_KEY || '').trim()

  // Chế độ Heuristic Demo khi không có OpenAI key
  if (!apiKey || apiKey.length < 5) {
    const extracted = heuristicExtract(transcript, draft, today)
    return {
      fields: extracted,
      verified: false,
      demo: true,
      fallback: false
    }
  }

  // Chế độ Live: Gọi OpenAI Structured Output (model gpt-4.1-mini)
  try {
    const client = new OpenAI({ apiKey })
    const instructions = getExtractSystemPrompt(today)

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      store: false,
      instructions,
      input: JSON.stringify({ transcript, draft }),
      text: {
        format: {
          type: 'json_schema',
          name: 'booking_form',
          strict: true,
          schema: BOOKING_SCHEMA
        }
      },
      max_output_tokens: 500
    })

    const parsed = JSON.parse(response.output_text || '{}')

    // Gộp: chỉ ghi đè draft bằng giá trị KHÁC RỖNG để model bỏ trống không xoá dữ liệu đã có
    const merged: Partial<BookingFormFields> = { ...draft }
    for (const key of BOOKING_KEYS as readonly BookingKey[]) {
      const value = parsed?.[key]
      if (typeof value === 'string' && value.trim() !== '') {
        merged[key] = value
      }
    }

    const fields = sanitizeBookingFields(merged)

    return {
      fields,
      verified: false,
      demo: false
    }
  } catch (err: any) {
    console.warn('[ExtractAPI] OpenAI error, fallback sang Heuristic:', err.message)
    const fallbackFields = heuristicExtract(transcript, draft, today)
    return {
      fields: fallbackFields,
      verified: false,
      demo: true,
      fallback: true
    }
  }
})
