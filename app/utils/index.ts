export function numberToCurrency(value: number, locale: string = 'vi-VN', currency: string = 'VND'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
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
