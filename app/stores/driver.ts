import { defineStore } from 'pinia'

interface Transport {
  name: string
  type: number
  type_name: string
  license_plate: string
  hang_xe: string
  ten_xe: string
}

interface DriverProfile {
  id: string
  full_name: string
  phone: string
  status_type: number
  status_name: string
  transport?: Transport
  wallet_id?: string
}

interface WalletDetail {
  balance: number
  wallet_id: string
}

interface Order {
  id: string
  short_id: string
  departure: { city: string; district: string; address_1: string }
  destination: { city: string; district: string; address_1: string }
  date_of_destination: string
  price_guest_after: number
  price_guest: number
  status_type: number
  status_name: string
  name_service: string
  time_label?: string
}

export const useDriverStore = defineStore('driver', () => {
  // State
  const token = useCookie<string | null>('driver_token', { default: () => null, maxAge: 60 * 60 * 24 * 7 })
  const profile = ref<DriverProfile | null>(null)
  const wallet = ref<WalletDetail | null>(null)
  const activeOrder = ref<Order | null>(null)
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const walletBalance = computed(() => wallet.value?.balance ?? 0)
  const driverName = computed(() => profile.value?.full_name ?? '')

  // Actions
  async function login(phone: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<{ token: string; data: DriverProfile }>(
        'https://sysdev.happytrip.vn/api/partner/login',
        {
          method: 'POST',
          body: { phone, password }
        }
      )
      token.value = res.token
      profile.value = res.data
      return true
    }
    catch (e: any) {
      error.value = e?.data?.message ?? 'Đăng nhập thất bại. Kiểm tra lại thông tin.'
      return false
    }
    finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const res = await $fetch<{ data: DriverProfile }>(
        'https://sysdev.happytrip.vn/api/partner/me',
        { headers: { Authorization: `Bearer ${token.value}` } }
      )
      profile.value = res.data
    }
    catch {}
  }

  async function fetchWallet() {
    if (!token.value) return
    try {
      const res = await $fetch<{ data: WalletDetail }>(
        'https://sysdev.happytrip.vn/api/wallet/detail',
        { headers: { Authorization: `Bearer ${token.value}` } }
      )
      wallet.value = res.data
    }
    catch {}
  }

  async function fetchActiveOrder() {
    if (!token.value) return
    try {
      const res = await $fetch<{ data: Order }>(
        'https://sysdev.happytrip.vn/api/order/active',
        { headers: { Authorization: `Bearer ${token.value}` } }
      )
      activeOrder.value = res.data ?? null
    }
    catch {
      activeOrder.value = null
    }
  }

  async function fetchOrders() {
    if (!token.value) return
    loading.value = true
    try {
      const res = await $fetch<{ data: Order[] }>(
        'https://sysdev.happytrip.vn/api/order/list',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` },
          body: { order_status: 0, limit: 20, page: 1 } // status pending
        }
      )
      orders.value = res.data ?? []
    }
    catch {}
    finally {
      loading.value = false
    }
  }

  async function acceptOrder(orderId: string) {
    if (!token.value) return false
    try {
      await $fetch(
        `https://sysdev.happytrip.vn/api/order/${orderId}/accept-v4`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token.value}` }
        }
      )
      orders.value = orders.value.filter(o => o.id !== orderId)
      await fetchActiveOrder()
      await fetchWallet()
      return true
    }
    catch {
      return false
    }
  }

  async function rejectOrder(orderId: string) {
    if (!token.value) return false
    try {
      await $fetch(
        `https://sysdev.happytrip.vn/api/order/${orderId}/reject`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token.value}` }
        }
      )
      orders.value = orders.value.filter(o => o.id !== orderId)
      return true
    }
    catch {
      return false
    }
  }

  async function completeOrder(orderId: string) {
    if (!token.value) return false
    try {
      await $fetch(
        `https://sysdev.happytrip.vn/api/order/${orderId}/complete`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token.value}` }
        }
      )
      activeOrder.value = null
      await fetchWallet()
      await fetchOrders()
      return true
    }
    catch {
      return false
    }
  }

  function logout() {
    token.value = null
    profile.value = null
    wallet.value = null
    activeOrder.value = null
    orders.value = []
    navigateTo('/driver/login')
  }

  return {
    token, profile, wallet, activeOrder, orders, loading, error,
    isLoggedIn, walletBalance, driverName,
    login, fetchProfile, fetchWallet, fetchActiveOrder, fetchOrders,
    acceptOrder, rejectOrder, completeOrder, logout
  }
})