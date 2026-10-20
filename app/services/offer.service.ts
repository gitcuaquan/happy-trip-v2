import type { CustomerVoucher, ReferralCreditsResponse } from '@/type'

/**
 * Service cho trang "Ưu đãi của tôi" — chỉ để xem, gọi khi mở trang.
 * Số điện thoại luôn lấy từ customer token ở server, không gửi kèm.
 */
export class OfferService {
  private get baseURL() {
    return useRuntimeConfig().public.apiBase + '/api'
  }

  /**
   * GET /customer_app/vouchers — voucher còn dùng được (Available) hoặc đang giữ cho chuyến (Reserved)
   */
  async getVouchers(token: string): Promise<CustomerVoucher[]> {
    try {
      return await $fetch<CustomerVoucher[]>(`${this.baseURL}/customer_app/vouchers`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error('[OfferService] Lỗi lấy vouchers:', error)
      throw error
    }
  }

  /**
   * GET /customer_app/referral-credits — số dư giới thiệu: summary + từng lần nhận (sắp hết hạn trước)
   */
  async getReferralCredits(token: string): Promise<ReferralCreditsResponse> {
    try {
      return await $fetch<ReferralCreditsResponse>(`${this.baseURL}/customer_app/referral-credits`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error('[OfferService] Lỗi lấy referral-credits:', error)
      throw error
    }
  }
}

// Xuất ra 1 bản instance duy nhất để dùng chung cho toàn App
export const offerService = new OfferService()
