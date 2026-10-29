export interface PopupModalData {
  id?: string
  title: string
  image: string
  link?: string
  article_id?: string | null
  article_slug?: string
  article_title?: string
  button_text?: string
  is_active: boolean
  display_frequency: 'new_only' | 'daily' | 'session' | 'always'
  created_at?: string
  updated_at?: string
}

export interface ArticleOption {
  id: string
  title: string
  slug: string
  category: 'blog' | 'policy'
  thumbnail?: string
  url: string
}

export const popupService = {
  // Public - Lấy modal thông báo đang active cho khách truy cập
  async getPublicPopupModal(): Promise<PopupModalData | null> {
    try {
      const res = await $fetch<{ success: boolean; data: PopupModalData | null }>('/api/public/popup-modal', {
        method: 'GET',
      })
      return res?.data || null
    } catch {
      return null
    }
  },

  // Admin - Lấy cấu hình modal thông báo
  async getAdminPopupModal(token: string): Promise<PopupModalData | null> {
    const res = await $fetch<{ success: boolean; data: PopupModalData | null }>('/api/admin/popup-modal', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    return res?.data || null
  },

  // Admin - Lưu / Cập nhật cấu hình modal thông báo
  async saveAdminPopupModal(token: string, payload: Partial<PopupModalData>): Promise<PopupModalData> {
    const res = await $fetch<{ success: boolean; message?: string; data: PopupModalData }>('/api/admin/popup-modal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    })
    return res.data
  },

  // Admin - Tìm kiếm bài viết để gán link
  async searchArticleOptions(token: string, keyword: string = ''): Promise<ArticleOption[]> {
    const res = await $fetch<{ success: boolean; data: ArticleOption[] }>('/api/admin/articles/options', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      query: { keyword },
    })
    return res?.data || []
  },
}
