/**
 * Composable gửi custom events lên Meta (Facebook) Pixel
 * Sử dụng global window.fbq trực tiếp (traditional pixel code).
 * Mọi event call đều check fbq tồn tại để tránh lỗi runtime.
 */
export const useMetaPixelEvent = () => {
  const fbq = (...args: any[]) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq(...args)
    }
  }

  /**
   * Gửi event view_price — tương tự GA4 view_price
   */
  const trackPixelViewPrice = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    fbq('trackCustom', 'view_price', {
      route_from: params.route_from,
      route_to: params.route_to,
      service_name: params.service_name,
      value: params.price,
      currency: 'VND',
    })
  }

  /**
   * Gửi event booking_start — Sử dụng Standard Event `InitiateCheckout`
   */
  const trackPixelBookingStart = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    fbq('track', 'InitiateCheckout', {
      content_name: params.service_name,
      route_from: params.route_from,
      route_to: params.route_to,
      value: params.price,
      currency: 'VND',
    })
  }

  /**
   * Gửi event booking_submit — khi user gửi form OTP
   */
  const trackPixelBookingSubmit = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    fbq('trackCustom', 'booking_submit', {
      route_from: params.route_from,
      route_to: params.route_to,
      service_name: params.service_name,
      value: params.price,
      currency: 'VND',
    })
  }

  /**
   * Gửi event booking_success — Standard Event `Purchase` để tối ưu quảng cáo
   */
  const trackPixelBookingSuccess = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    fbq('track', 'Purchase', {
      content_name: params.service_name,
      route_from: params.route_from,
      route_to: params.route_to,
      value: params.price,
      currency: 'VND',
    })
  }

  return {
    trackPixelViewPrice,
    trackPixelBookingStart,
    trackPixelBookingSubmit,
    trackPixelBookingSuccess,
  }
}
