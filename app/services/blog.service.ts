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

    async getPageDetail(idOrSlug: string): Promise<Article> {
        return await $fetch<Article>(`${this.baseURL}/page/${idOrSlug}`, {
            method: 'GET',
        })
    }

    // ===== ADMIN =====
    // BE từ chối Partner token với lỗi "signature key not found" → không gửi Authorization,
    // để BE xử lý ẩn danh giống /api/upload (tương tự cách production happytrip.vn làm).
    async createPage(_token: string, data: PagePayload): Promise<Article> {
        return await $fetch<Article>(`${this.baseURL}/page`, {
            method: 'POST',
            body: data,
        })
    }

    async updatePage(_token: string, id: string, data: PagePayload): Promise<Article> {
        return await $fetch<Article>(`${this.baseURL}/page/${id}`, {
            method: 'PUT',
            body: data,
        })
    }

    async togglePageStatus(_token: string, id: string, status: boolean): Promise<void> {
        await $fetch(`${this.baseURL}/page/${id}/status`, {
            method: 'PUT',
            query: { status },
        })
    }

    async deletePage(_token: string, id: string): Promise<void> {
        await $fetch(`${this.baseURL}/page/${id}`, {
            method: 'DELETE',
        })
    }

    async uploadFile(_token: string, file: File, category = 'page'): Promise<string> {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)
        const res = await $fetch<UploadResponse | string | string[]>(`${this.baseURL}/upload`, {
            method: 'POST',
            body: formData,
        })
        console.log('[uploadFile] response:', res)

        if (Array.isArray(res)) {
            return typeof res[0] === 'string' ? res[0] : ''
        }
        if (typeof res === 'string') return res
        return res?.url ?? res?.path ?? res?.data?.url ?? res?.data?.path ?? ''
    }
}

export const blogService = new BlogService()
