import type { AdminProfile, AdminLoginResponse } from '~/type'

export class AdminService {
    private baseURL = 'https://sys.happytrip.vn/api'


    // POST /api/partner/login — body { phone, password }
    // Swagger không document response shape → handle linh hoạt nhiều kiểu trả về
    async login(phone: string, password: string): Promise<{ token: string; admin: AdminProfile }> {
        const raw = await $fetch<AdminLoginResponse | Record<string, unknown>>(
            `${this.baseURL}/partner/login`,
            {
                method: 'POST',
                body: { phone, password },
            }
        )

        console.log('[adminService.login] raw response:', raw)

        const token =
            (raw as AdminLoginResponse).accessToken ??
            (raw as { token?: string }).token ??
            (raw as { access_token?: string }).access_token ??
            ''

        console.log('[adminService.login] token extracted:', token ? token.slice(0, 20) + '...' : '(EMPTY)')

        const admin = ((raw as AdminLoginResponse).user ??
            (raw as { admin?: AdminProfile }).admin ??
            (raw as { data?: AdminProfile }).data ??
            raw) as AdminProfile

        if (!token) throw new Error('Không nhận được token từ server')

        return { token, admin }
    }
}

export const adminService = new AdminService()
