import type { Article, PageListResponse, PagePayload } from '~/type'

interface PageListParams {
  page?: number
  limit?: number
  keyword?: string
  category?: 'blog' | 'policy'
  status?: string
}

export class BlogService {
  private authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` }
  }

  // ===== PUBLIC =====
  // Lấy danh sách blog
  async getBlogList(params: PageListParams = {}): Promise<PageListResponse> {
    const { page = 1, limit = 9, keyword = '' } = params
    return await $fetch<PageListResponse>('/api/public/blog', {
      method: 'GET',
      query: { page, limit, keyword },
    })
  }

  // Lấy chi tiết blog
  async getBlogDetail(slug: string): Promise<Article> {
    const res = await $fetch<{ data: Article }>(`/api/public/blog/${slug}`, {
      method: 'GET',
    })
    return res.data
  }

  // Lấy danh sách chính sách
  async getPolicyList(params: PageListParams = {}): Promise<PageListResponse> {
    const { page = 1, limit = 20, keyword = '' } = params
    return await $fetch<PageListResponse>('/api/public/policy', {
      method: 'GET',
      query: { page, limit, keyword },
    })
  }

  // Lấy chi tiết chính sách
  async getPolicyDetail(slug: string): Promise<Article> {
    const res = await $fetch<{ data: Article }>(`/api/public/policy/${slug}`, {
      method: 'GET',
    })
    return res.data
  }

  // Tương thích ngược getPageList
  async getPageList(params: any = {}): Promise<PageListResponse> {
    const category = params.category
    if (category === 'policy') {
      return await this.getPolicyList(params)
    }
    return await this.getBlogList(params)
  }

  // Tương thích ngược getPageDetail
  async getPageDetail(idOrSlug: string): Promise<Article> {
    const res = await $fetch<{ data: Article }>(`/api/page/${idOrSlug}`, {
      method: 'GET',
    })
    return res.data
  }

  // ===== ADMIN (cần JWT token) =====
  // Lấy danh sách bài viết quản trị
  async getAdminArticles(token: string, params: PageListParams = {}): Promise<PageListResponse> {
    return await $fetch<PageListResponse>('/api/admin/articles', {
      method: 'GET',
      headers: this.authHeaders(token),
      query: params,
    })
  }

  // Lấy chi tiết bài viết quản trị
  async getAdminArticleDetail(token: string, id: string): Promise<Article> {
    return await $fetch<Article>(`/api/admin/articles/${id}`, {
      method: 'GET',
      headers: this.authHeaders(token),
    })
  }

  // Tạo mới
  async createPage(token: string, data: PagePayload): Promise<Article> {
    const res = await $fetch<{ data: Article }>('/api/admin/articles', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: data,
    })
    return res.data
  }

  // Cập nhật
  async updatePage(token: string, id: string, data: PagePayload): Promise<Article> {
    const res = await $fetch<{ data: Article }>(`/api/admin/articles/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: data,
    })
    return res.data
  }

  // Thay đổi trạng thái (public/private)
  async togglePageStatus(token: string, id: string, status?: boolean): Promise<void> {
    await $fetch(`/api/admin/articles/${id}/status`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: { status },
    })
  }

  // Xóa
  async deletePage(token: string, id: string): Promise<void> {
    await $fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    })
  }

  // Upload file (ảnh)
  async uploadFile(token: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)

    const res = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    })

    return res?.url || ''
  }
}

export const blogService = new BlogService()
