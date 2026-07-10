/**
 * Composable gửi custom events lên Google Analytics 4
 * Sử dụng proxy từ @nuxt/scripts để đảm bảo events được queue
 * ngay cả khi GA chưa load xong.
 *
 * Events:
 * - view_price: Khi user xem được bảng giá (previews loaded)
 * - booking_start: Khi user bấm "Đặt chuyến ngay" (mở modal contact)
 * - booking_submit: Khi user gửi OTP xác nhận đặt chuyến
 * - booking_success: Khi OTP xác nhận thành công → conversion event
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
   * Gửi event booking_success — khi đặt chuyến thành công (conversion)
   * Event này cần được đánh dấu là conversion trong GA4 Admin
   */
  const trackBookingSuccess = (params: {
    route_from?: string
    route_to?: string
    service_name?: string
    price?: number
  }) => {
    proxy.gtag('event', 'booking_success', {
      route_from: params.route_from,
      route_to: params.route_to,
      service_name: params.service_name,
      value: params.price,
      currency: 'VND',
    })
  }

  return {
    trackViewPrice,
    trackBookingStart,
    trackBookingSubmit,
    trackBookingSuccess,
  }
}
