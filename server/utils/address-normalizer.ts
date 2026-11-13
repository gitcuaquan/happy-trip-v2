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

/**
 * Loại bỏ dấu tiếng Việt, chuyển về chữ thường và chuẩn hóa khoảng trắng
 */
export function normalizeVietnamese(s: string | null | undefined): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Chuẩn hóa tên thành phố / tỉnh để khớp với catalog hệ thống
 */
export function normalizeCityName(cityName: string | null | undefined): string {
  const norm = normalizeVietnamese(cityName)
  if (!norm) return ''

  if (/\b(hcm|ho chi minh|sai gon|tphcm|tp hcm|quan 3|q3|quan 1|q1)\b/.test(norm)) {
    return 'TP Hồ Chí Minh'
  }
  if (/\b(vung tau|brvt|ba ria|vungtau)\b/.test(norm)) {
    return 'TP Hồ Chí Minh' // Hệ thống catalog đặt Phường Vũng Tàu trong TP Hồ Chí Minh
  }
  if (/\b(lam dong|da lat)\b/.test(norm)) {
    return 'Tỉnh Lâm Đồng'
  }
  if (/\b(can tho)\b/.test(norm)) {
    return 'TP Cần Thơ'
  }
  if (/\b(tay ninh)\b/.test(norm)) {
    return 'Tỉnh Tây Ninh'
  }
  if (/\b(dong nai|bien hoa)\b/.test(norm)) {
    return 'Tỉnh Đồng Nai'
  }

  return cityName?.trim() || ''
}

/**
 * Danh sách map các phường phổ biến để chuẩn hóa có dấu đúng format
 */
const KNOWN_WARDS: Record<string, string> = {
  'ban co': 'Phường Bàn Cờ',
  'ben thanh': 'Phường Bến Thành',
  'xuan hoa': 'Phường Xuân Hòa',
  'nhieu loc': 'Phường Nhiêu Lộc',
  'vung tau': 'Phường Vũng Tàu',
  'ba ria': 'Phường Bà Rịa',
  'an dong': 'Phường An Đông',
  'an lac': 'Phường An Lạc',
  'an phu': 'Phường An Phú',
  'da kao': 'Phường Đa Kao',
  'ben nghe': 'Phường Bến Nghé',
  'thang tam': 'Phường Thắng Tam',
  'thang nhi': 'Phường Thắng Nhì',
  'thang nhat': 'Phường Thắng Nhất',
  'phuong 1': 'Phường 1',
  'phuong 2': 'Phường 2',
  'phuong 3': 'Phường 3',
  'phuong 4': 'Phường 4',
  'phuong 5': 'Phường 5'
}

/**
 * Chuẩn hóa tên Phường/Xã
 */
export function normalizeWardName(wardName: string | null | undefined): string {
  const norm = normalizeVietnamese(wardName)
  if (!norm) return ''

  const clean = norm.replace(/^(phuong|xa|thi tran|p\.|p)\s+/i, '').trim()

  for (const [key, formatted] of Object.entries(KNOWN_WARDS)) {
    if (clean === key || norm.includes(key)) {
      return formatted
    }
  }

  // Nếu đã có tiền tố Phường thì viết hoa chữ cái đầu
  if (/^phường/i.test(wardName?.trim() || '')) {
    return wardName!.trim()
  }

  // Mặc định thêm tiền tố Phường
  const original = wardName?.trim() || ''
  return original ? `Phường ${original.replace(/^(phường|phuong)\s+/i, '')}` : ''
}

/**
 * Lớp bảo vệ đặc thù: Chuẩn hóa và làm sạch dữ liệu đặt xe,
 * chống nhầm lẫn đón/đến Vũng Tàu, bảo toàn cơ cấu khách và loại xe.
 */
export function sanitizeBookingFields(fields: Partial<BookingFormFields>): BookingFormFields {
  const result: BookingFormFields = {
    pickupArea: fields.pickupArea?.trim() || '',
    pickupWard: fields.pickupWard?.trim() || '',
    pickupDetail: fields.pickupDetail?.trim() || '',
    dropoffArea: fields.dropoffArea?.trim() || '',
    dropoffWard: fields.dropoffWard?.trim() || '',
    dropoffDetail: fields.dropoffDetail?.trim() || '',
    date: fields.date?.trim() || '',
    time: fields.time?.trim() || '',
    car: fields.car?.trim() || '',
    passengers: fields.passengers?.trim() || '',
    notes: fields.notes?.trim() || '',
    customer_name: fields.customer_name?.trim() || '',
    customer_phone: fields.customer_phone?.trim() || ''
  }

  const normDropoffArea = normalizeVietnamese(result.dropoffArea)
  const normDropoffWard = normalizeVietnamese(result.dropoffWard)
  const normPickupWard = normalizeVietnamese(result.pickupWard)

  // 1. Quy tắc đặc thù Vũng Tàu:
  // Nếu điểm đến là Vũng Tàu
  const isToVungTau = /\bvung tau\b/.test(normDropoffArea) || /\bvung tau\b/.test(normDropoffWard)
  if (isToVungTau) {
    result.dropoffArea = result.dropoffArea || 'Vũng Tàu'

    // Chống nhầm: Nếu phường đến bị gán nhầm phường đón (ví dụ Phường Bàn Cờ, Bến Thành, Xuân Hòa)
    const isBadWard = normDropoffWard === normPickupWard ||
      /\b(ban co|ben thanh|xuan hoa|nhieu loc|an dong|an lac|da kao|ben nghe)\b/.test(normDropoffWard)

    if (isBadWard || !result.dropoffWard.trim()) {
      result.dropoffWard = 'Phường Vũng Tàu'
    }

    if (!result.dropoffDetail.trim() || result.dropoffDetail === 'Số 3 Nguyễn Thiện Thuật') {
      result.dropoffDetail = 'LH'
    }
  }

  // 2. Quy tắc Quận 3 cũ TP.HCM:
  const normPickupArea = normalizeVietnamese(result.pickupArea)
  if (/\bquan 3\b/.test(normPickupArea) && !result.pickupWard) {
    result.pickupArea = 'Quận 3 cũ, TP.HCM'
  }

  // 3. Chuẩn hóa tên Phường đón nếu có từ khóa chuẩn
  if (/\bban co\b/.test(normPickupWard)) {
    result.pickupWard = 'Phường Bàn Cờ'
    if (!result.pickupArea) result.pickupArea = 'TP.HCM'
  } else if (/\bben thanh\b/.test(normPickupWard)) {
    result.pickupWard = 'Phường Bến Thành'
    if (!result.pickupArea) result.pickupArea = 'TP.HCM'
  } else if (/\bxuan hoa\b/.test(normPickupWard)) {
    result.pickupWard = 'Phường Xuân Hòa'
    if (!result.pickupArea) result.pickupArea = 'TP.HCM'
  }

  // 4. Chuẩn hóa loại xe hợp lệ (5 chỗ hoặc 7 chỗ)
  if (result.car) {
    if (result.car.includes('7')) {
      result.car = '7 chỗ'
    } else if (result.car.includes('5')) {
      result.car = '5 chỗ'
    } else {
      result.car = ''
    }
  }

  // 5. Chuẩn hóa ngày (YYYY-MM-DD)
  if (result.date && !/^\d{4}-\d{2}-\d{2}$/.test(result.date)) {
    result.date = ''
  }

  // 6. Chuẩn hóa giờ (HH:MM 24h)
  if (result.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(result.time)) {
    const timeMatch = result.time.match(/(\d{1,2}):(\d{2})/)
    if (timeMatch && timeMatch[1] && timeMatch[2]) {
      result.time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
    } else {
      result.time = ''
    }
  }

  return result
}
