export function numberToCurrency(value: number, locale: string = 'vi-VN', currency: string = 'VND'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

// Domain ảnh upload của hệ thống — nếu thumbnail là relative thì prepend
const IMAGE_BASE = 'https://sys.happytrip.vn'

// Trả về URL đầy đủ cho ảnh. Nếu input rỗng → ''.
// Nếu đã là http(s) hoặc data: → giữ nguyên.
// Nếu là path tương đối → prepend IMAGE_BASE.
export function resolveImageUrl(url?: string | null): string {
    if (!url) return ''
    const s = url.trim()
    if (!s) return ''
    if (/^(https?:|data:|blob:)/i.test(s)) return s
    if (s.startsWith('/')) return IMAGE_BASE + s
    return IMAGE_BASE + '/' + s
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
