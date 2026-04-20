import type { Article, PageListResponse } from '~/type'

interface PageListParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    field?: string;
}

export class BlogService {
    private baseURL = 'https://sys.happytrip.vn/api';

    async getPageList(params: PageListParams = {}): Promise<PageListResponse> {
        const {
            page = 1,
            limit = 12,
            sort_by = 'created_at',
            field = 'id,slug,name,thumbnail,title,created_at'
        } = params;

        try {
            const response = await $fetch(`${this.baseURL}/page/list`, {
                method: 'POST',
                query: {
                    page,
                    limit,
                    sort_by,
                    field
                },
                body: {}
            });

            return response as PageListResponse;
        } catch (error) {
            console.error('Error fetching page list:', error);
            throw error;
        }
    }
}