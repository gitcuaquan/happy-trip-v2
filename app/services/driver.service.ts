import type { DriverProfile, WalletDetail, Order } from '~/type'

interface RegisterDto {
  full_name: string
  phone: string
  password: string
  transport: {
    name: string
    type: number
    type_name: string
    license_plate: string
    hang_xe: string
    ten_xe: string
    created_year?: string
  }
  bank_info?: {
    name: string
    bank_card: string
    bank_name: string
  }
}

interface Announcement {
  id: string
  title: string
  file?: string
  created_at: string
}

export class DriverService {
  private baseURL = 'https://sysdev.happytrip.vn/api'

  //  Register partner/driver
  async register(data: RegisterDto) {
    try {
      const response = await $fetch(`${this.baseURL}/partner/register`, {
        method: 'POST',
        body: data
      })
      return response
    } catch (error) {
      console.error('Error registering partner:', error)
      throw error
    }
  }

  //  Login
  async login(phone: string, password: string) {
    try {
      const response = await $fetch<{ token: string; data: DriverProfile }>(
        `${this.baseURL}/partner/login`,
        {
          method: 'POST',
          body: { phone, password }
        }
      )
      return response
    } catch (error) {
      console.error('Error login:', error)
      throw error
    }
  }

  //  Get announcements (non-critical, fail silently)
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await $fetch<{ data: Announcement[] }>(
        `${this.baseURL}/announcements`,
        {
          method: 'GET',
          query: {
            page: 1,
            limit: 5,
            sort_by: 'created_desc'
          }
        }
      )
      return response.data || []
    } catch (error) {
      // Fail silently - không throw error
      console.warn('Could not fetch announcements:', error)
      return []
    }
  }

  //  Get cities for dropdown
  async getCities() {
    try {
      const response = await $fetch(`${this.baseURL}/city/list`, {
        method: 'POST',
        body: {}
      })
      return response
    } catch (error) {
      console.error('Error fetching cities:', error)
      throw error
    }
  }

  //  Get profile (requires auth)
  async getProfile(token: string) {
    try {
      const response = await $fetch<{ data: DriverProfile }>(
        `${this.baseURL}/partner/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  //  Get wallet (requires auth)
  async getWallet(token: string) {
    try {
      const response = await $fetch<{ data: WalletDetail }>(
        `${this.baseURL}/wallet/detail`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching wallet:', error)
      throw error
    }
  }

  
}

export const useDriverService = () => new DriverService()
