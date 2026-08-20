import type { AdminProfile, AdminLoginResponse } from '~/type'

export class AdminService {
  // POST /api/admin/auth/login
  async login(phoneOrUsername: string, password: string): Promise<{ token: string; admin: AdminProfile }> {
    const raw = await $fetch<AdminLoginResponse>(
      '/api/admin/auth/login',
      {
        method: 'POST',
        body: { username: phoneOrUsername, password },
      }
    )

    const token = raw.accessToken || ''
    const admin = raw.user as AdminProfile

    if (!token) throw new Error('Không nhận được token xác thực từ server')

    return { token, admin }
  }

  // GET /api/admin/auth/me
  async getProfile(token: string): Promise<AdminProfile> {
    return await $fetch<AdminProfile>('/api/admin/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  }
}

export const adminService = new AdminService()
