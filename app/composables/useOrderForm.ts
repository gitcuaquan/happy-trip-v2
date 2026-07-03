import type { Order } from '~/type'

export interface OrderFormData {
  departure_city: string
  departure_dictrict: string
  departure_address_1: string
  destination_city: string
  destination_dictrict: string
  destination_address_1: string
  date_of_destination?: Date | null
  customer_name?: string
  customer_phone?: string
}

/**
 * Lưu trữ dữ liệu form đặt chuyến cho việc "Đặt lại chuyến"
 * Sử dụng useState để có thể persist qua navigation
 */
export const useOrderForm = () => {
  const orderFormData = useState<OrderFormData | null>('orderFormData', () => null)

  /**
   * Lấy dữ liệu từ order cũ để fill vào form mới (Đặt lại chuyến)
   * Tự động khởi tạo thời gian mới nếu thời gian cũ đã qua
   */
  const setOrderFormFromPreviousOrder = (order: Order) => {
    const rawDate = order.date_of_destination || order.created
    let targetDate: Date
    if (rawDate) {
      const parsed = new Date(rawDate)
      if (!isNaN(parsed.getTime()) && parsed > new Date()) {
        targetDate = parsed
      } else {
        targetDate = new Date()
        targetDate.setHours(targetDate.getHours() + 1)
      }
    } else {
      targetDate = new Date()
      targetDate.setHours(targetDate.getHours() + 1)
    }

    orderFormData.value = {
      departure_city: order.departure?.city || '',
      departure_dictrict: order.departure?.district || '',
      departure_address_1: order.departure?.address_1 || '',
      destination_city: order.destination?.city || '',
      destination_dictrict: order.destination?.district || '',
      destination_address_1: order.destination?.address_1 || '',
      date_of_destination: targetDate,
      customer_name: order.customer?.full_name || '',
      customer_phone: order.customer?.phone || '',
    }
  }

  /**
   * Lấy dữ liệu từ order cũ, hoán đổi điểm đón ↔ điểm đến để đặt chiều về
   * Đồng thời tự động cộng thêm 1 ngày + 1 giờ từ ngày/giờ của chuyến gốc
   */
  const setOrderFormAsReturnTrip = (order: Order) => {
    const rawDate = order.date_of_destination || order.created
    let returnDate: Date
    if (rawDate) {
      const parsed = new Date(rawDate)
      returnDate = !isNaN(parsed.getTime()) ? parsed : new Date()
    } else {
      returnDate = new Date()
    }

    // Cộng 1 ngày + 1 giờ từ ngày gốc
    returnDate.setDate(returnDate.getDate() + 1)
    returnDate.setHours(returnDate.getHours() + 1)

    orderFormData.value = {
      // Điểm đến cũ → điểm đón mới
      departure_city: order.destination?.city || '',
      departure_dictrict: order.destination?.district || '',
      departure_address_1: order.destination?.address_1 || '',
      // Điểm đón cũ → điểm đến mới
      destination_city: order.departure?.city || '',
      destination_dictrict: order.departure?.district || '',
      destination_address_1: order.departure?.address_1 || '',
      date_of_destination: returnDate,
      customer_name: order.customer?.full_name || '',
      customer_phone: order.customer?.phone || '',
    }
  }

  /**
   * Lấy dữ liệu đã lưu
   */
  const getOrderFormData = () => {
    return orderFormData.value
  }

  /**
   * Xóa dữ liệu đã lưu
   */
  const clearOrderFormData = () => {
    orderFormData.value = null
  }

  return {
    orderFormData,
    setOrderFormFromPreviousOrder,
    setOrderFormAsReturnTrip,
    getOrderFormData,
    clearOrderFormData,
  }
}
