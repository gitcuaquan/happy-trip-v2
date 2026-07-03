import type {
  OrderListQueryParams,
  OrderListBodyFilter,
  OrderListResponse,
  Order,
  ActionResponse,
  OrderDetail,
  OrderPreview,
  CustomerProfile,
} from '@/type';

interface CreateOrderHookPayload extends OrderPreview {
  full_name: string;
  phone: string;
  price_guest_after?: number;
  price_guest?: number;
  price?: number;
}

export class OrderService {
  private get baseURL() {
    return useRuntimeConfig().public.apiBase + '/api'
  }
  private hookSecret = '123';

 
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
  async cancelOrder(token: string, orderId: string, note?: string): Promise<ActionResponse> {
    try {
      return await $fetch<ActionResponse>(`${this.baseURL}/order/${orderId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        params: note ? { note } : undefined,
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * 5. Lấy báo giá preview cho 1 dịch vụ
   */
  async previewOrder(order: OrderPreview, idService: string): Promise<OrderDetail> {
    return await $fetch<OrderDetail>(`${this.baseURL}/order/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'https://happytrip.vn',
        referer: 'https://happytrip.vn/',
      },
      body: { ...order, id_service: idService },
    });
  }

  /**
   * 6. Gửi hook tạo đơn + gửi OTP (dùng cho cả send lần đầu + resend)
   */
  async createOrderHook(payload: CreateOrderHookPayload): Promise<void> {
    await $fetch(`${this.baseURL}/order/hook`, {
      method: 'POST',
      params: { secret: this.hookSecret },
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
  }

  /**
   * 7. Xác nhận OTP đặt xe → trả token + customer (login luôn)
   */
  async confirmOrderOtp(otp: string): Promise<{ token: string; customer: CustomerProfile }> {
    return await $fetch<{ token: string; customer: CustomerProfile }>(
      `${this.baseURL}/order/confirm-otp/${this.hookSecret}`,
      {
        method: 'POST',
        params: { otp },
      }
    );
  }
}

// Xuất ra 1 bản instance duy nhất để dùng chung cho toàn App
export const orderService = new OrderService();