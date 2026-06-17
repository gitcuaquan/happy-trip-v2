import type { Article, PageListResponse, PagePayload, UploadResponse } from '~/type'

interface PageListParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    field?: string;
}

export class BlogService {
    private baseURL = 'https://sys.happytrip.vn/api';


    private authHeaders(token: string) {
        return { Authorization: `Bearer ${token}` }
    }

    // ===== PUBLIC =====
    async getPageList(params: PageListParams = {}): Promise<PageListResponse> {
        const {
            page = 1,
            limit = 12,
            sort_by = 'created_at',
            field = 'id,slug,name,thumbnail,title,created_at',
        } = params;
        const response = await $fetch(`${this.baseURL}/page/list`, {
            method: 'POST',
            query: { page, limit, sort_by, field },
            body: {},
        })
        return response as PageListResponse
    }

    // Lấy chi tiết page để hiển thị ở client (không cần token)
    async getPageDetail(idOrSlug: string): Promise<Article> {
        return await $fetch<Article>(`${this.baseURL}/page/${idOrSlug}`, {
            method: 'GET',
        })
    }

    // ===== ADMIN (cần token) =====
    // Tạo mới 
    async createPage(token: string, data: PagePayload): Promise<Article> {
        return await $fetch<Article>(`${this.baseURL}/page`, {
            method: 'POST',
            headers: this.authHeaders(token),
            body: data,
        })
    }

    // Cập nhật
    async updatePage(token: string, id: string, data: PagePayload): Promise<Article> {
        return await $fetch<Article>(`${this.baseURL}/page/${id}`, {
            method: 'PUT',
            headers: this.authHeaders(token),
            body: data,
        })
    }

    // Thay đổi trạng thái (public/private)
    async togglePageStatus(token: string, id: string, status: boolean): Promise<void> {
        await $fetch(`${this.baseURL}/page/${id}/status`, {
            method: 'PUT',
            headers: this.authHeaders(token),
            query: { status },
        })
    }

    // Xóa
    async deletePage(token: string, id: string): Promise<void> {
        await $fetch(`${this.baseURL}/page/${id}`, {
            method: 'DELETE',
            headers: this.authHeaders(token),
        })
    }

    // Upload file (ảnh)
    async uploadFile(token: string, file: File, category = 'page'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    
    const res = await $fetch<any>(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    
    return res?.url ?? res?.path ?? res?.data?.url ?? res?.data?.path ?? res?.[0] ?? ''
}
}

export const blogService = new BlogService()
