export function numberToCurrency(value: number, locale: string = 'vi-VN', currency: string = 'VND'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}