import type { AdminLoginResponse, AdminProfile } from '~/type'

export class AdminService {
    private baseURL = 'https://sys.happytrip.vn/api'


    // Đăng nhập admin bằng SĐT + mật khẩu
    async login(phone: string, password: string): Promise<AdminLoginResponse> {
        return await $fetch<AdminLoginResponse>(`${this.baseURL}/partner/login`, {
            method: 'POST',
            body: { phone, password }
        })
    }


    // Lấy thông tin admin hiện tại từ token
    async getMe(token: string): Promise<AdminProfile> {
        return await $fetch<AdminProfile>(
            `${this.baseURL}/admin`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
    }

}
export const adminService = new AdminService()
