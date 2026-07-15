/**
 * Composable gửi custom events lên Google Analytics 4
 * Sử dụng proxy từ @nuxt/scripts để đảm bảo events được queue
 * ngay cả khi GA chưa load xong.
 *
 * Events:
 * - view_price: Khi user xem được bảng giá (previews loaded)
 * - booking_start: Khi user bấm "Đặt chuyến ngay" (mở modal contact)
 * - booking_submit: Khi user gửi OTP xác nhận đặt chuyến
 * - purchase: Khi OTP xác nhận thành công → standard conversion event
 */
export const useGtagEvent = () => {
  const { proxy } = useScriptGoogleAnalytics()

  /**
   * Gửi event view_price — khi user xem được giá xe
   */
  const trackViewPrice = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    proxy.gtag('event', 'view_price', {
      route_from: params.route_from,
      route_to: params.route_to,
      service_name: params.service_name,
      price: params.price,
      currency: 'VND',
    })
  }

  /**
   * Gửi event booking_start — khi user bấm "Đặt chuyến ngay"
   */
  const trackBookingStart = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    proxy.gtag('event', 'booking_start', {
      route_from: params.route_from,
      route_to: params.route_to,
      service_name: params.service_name,
      price: params.price,
      currency: 'VND',
    })
  }

  /**
   * Gửi event booking_submit — khi user gửi form OTP
   */
  const trackBookingSubmit = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    proxy.gtag('event', 'booking_submit', {
      route_from: params.route_from,
      route_to: params.route_to,
      service_name: params.service_name,
      price: params.price,
      currency: 'VND',
    })
  }

  /**
   * Gửi event purchase (standard GA4 event) — khi đặt chuyến thành công (conversion)
   */
  const trackPurchase = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    proxy.gtag('event', 'purchase', {
      transaction_id: `HT_${Date.now()}`,
      value: params.price,
      currency: 'VND',
      items: [{
        item_name: params.service_name,
        price: params.price,
        quantity: 1,
      }],
      route_from: params.route_from,
      route_to: params.route_to,
    })
  }

  return {
    trackViewPrice,
    trackBookingStart,
    trackBookingSubmit,
    trackPurchase,
  }
}
