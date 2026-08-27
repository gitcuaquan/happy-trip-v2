import type { MegaMenuData, MegaMenuPayload } from '~/type'

export class MenuService {
  private authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` }
  }

  // ===== PUBLIC =====
  // Lấy dữ liệu Mega Menu công khai
  async getPublicMenu(menuKey: string = 'routes'): Promise<MegaMenuData | null> {
    const res = await $fetch<{ data: MegaMenuData }>(`/api/public/menu?key=${menuKey}`, {
      method: 'GET',
    })
    return res?.data || null
  }

  // ===== ADMIN (cần JWT token) =====
  // Lấy cấu hình menu cho trang quản trị
  async getAdminMenu(token: string, menuKey: string = 'routes'): Promise<MegaMenuData> {
    const res = await $fetch<{ data: MegaMenuData }>(`/api/admin/menu?key=${menuKey}`, {
      method: 'GET',
      headers: this.authHeaders(token),
    })
    return res.data
  }

  // Cập nhật cấu hình menu
  async updateAdminMenu(token: string, payload: MegaMenuPayload): Promise<MegaMenuData> {
    const res = await $fetch<{ data: MegaMenuData; message?: string }>('/api/admin/menu', {
      method: 'PUT',
      headers: this.authHeaders(token),
      body: payload,
    })
    return res.data
  }

  // Khôi phục menu về mặc định
  async resetAdminMenu(token: string, menuKey: string = 'routes'): Promise<MegaMenuData> {
    const res = await $fetch<{ data: MegaMenuData; message?: string }>('/api/admin/menu/reset', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: { menu_key: menuKey },
    })
    return res.data
  }
}

export const menuService = new MenuService()
