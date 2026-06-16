import type { Order } from '~/type'

export interface OrderFormData {
  departure_city: string
  departure_dictrict: string
  departure_address_1: string
  destination_city: string
  destination_dictrict: string
  destination_address_1: string
}

/**
 * Lưu trữ dữ liệu form đặt chuyến cho việc "Đặt lại chuyến"
 * Sử dụng useState để có thể persist qua navigation
 */
export const useOrderForm = () => {
  const orderFormData = useState<OrderFormData | null>('orderFormData', () => null)

  /**
   * Lấy dữ liệu từ order cũ để fill vào form mới
   */
  const setOrderFormFromPreviousOrder = (order: Order) => {
    orderFormData.value = {
      departure_city: order.departure?.city || '',
      departure_dictrict: order.departure?.district || '',
      departure_address_1: order.departure?.address_1 || '',
      destination_city: order.destination?.city || '',
      destination_dictrict: order.destination?.district || '',
      destination_address_1: order.destination?.address_1 || '',
    }
  }

  /**
   * Lấy dữ liệu từ order cũ, hoán đổi điểm đón ↔ điểm đến để đặt chiều về
   */
  const setOrderFormAsReturnTrip = (order: Order) => {
    orderFormData.value = {
      // Điểm đến cũ → điểm đón mới
      departure_city: order.destination?.city || '',
      departure_dictrict: order.destination?.district || '',
      departure_address_1: order.destination?.address_1 || '',
      // Điểm đón cũ → điểm đến mới
      destination_city: order.departure?.city || '',
      destination_dictrict: order.departure?.district || '',
      destination_address_1: order.departure?.address_1 || '',
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
