import type { 
  OrderListQueryParams, 
  OrderListBodyFilter, 
  OrderListResponse, 
  Order, 
  ActionResponse 
} from '@/type'; 

export class OrderService {
  private baseURL = 'https://sysdev.happytrip.vn/api';

 
  async getActiveRide(token: string): Promise<Order | null> {
    try {
      return await $fetch<Order | null>(`${this.baseURL}/order/active`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Lỗi khi lấy chuyến đi đang hoạt động:', error);
      throw error;
    }
  }

  /**
   * 2. Lấy lịch sử chuyến xe của khách
   */
  async getOrderList(
    token: string, 
    queryParams?: OrderListQueryParams, 
    bodyFilter?: OrderListBodyFilter
  ): Promise<OrderListResponse> {
    try {
      return await $fetch<OrderListResponse>(`${this.baseURL}/order/list`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        query: queryParams,
        body: bodyFilter || {}
      });
    } catch (error) {
      console.error('[OrderService] Lỗi /order/list:', error);
      throw error;
    }
  }

  /**
   * 3. Lấy chi tiết 1 chuyến xe
   */
  async getOrderDetail(token: string, orderId: string): Promise<Order> {
    try {
      return await $fetch<Order>(`${this.baseURL}/order/${orderId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Lỗi lấy chi tiết chuyến xe:', error);
      throw error;
    }
  }

  /**
   * 4. Hủy chuyến xe (Khi tài xế chưa đón)
   */
  async cancelOrder(token: string, orderId: string): Promise<ActionResponse> {
    try {
      return await $fetch<ActionResponse>(`${this.baseURL}/order/${orderId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
}

// Xuất ra 1 bản instance duy nhất để dùng chung cho toàn App
export const orderService = new OrderService();