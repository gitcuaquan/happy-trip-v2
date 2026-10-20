export function numberToCurrency(value: number, locale: string = 'vi-VN', currency: string = 'VND'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return ''
  const s = url.trim()
  if (!s) return ''
  if (/^(https?:|data:|blob:)/i.test(s)) return s
  return s.startsWith('/') ? s : `/${s}`
}

// Sinh slug từ tiêu đề: bỏ dấu tiếng Việt → kebab-case
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// === NGÀY THÁNG (API trả UTC, website hiển thị giờ Việt Nam GMT+7) ===

// Hiển thị ngày theo giờ Việt Nam: 20/03/2027
export function formatDateVN(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// HSD voucher: expires_at = 00:00 giờ VN của ngày SAU ngày cuối dùng được → trừ 1 giây rồi mới hiển thị
export function formatVoucherExpiryVN(expiresAt: string | null | undefined): string {
  if (!expiresAt) return ''
  const date = new Date(expiresAt)
  if (Number.isNaN(date.getTime())) return ''
  return formatDateVN(new Date(date.getTime() - 1000))
}

// Số ngày còn lại tính từ bây giờ (âm nếu đã qua); dùng để tô màu cảnh báo sắp hết hạn
export function daysUntil(value: string | Date | null | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000)
}
