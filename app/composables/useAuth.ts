import type { CustomerProfile, AdminProfile } from '~/type'
import { customerService } from '~/services/customer.service'

export const useAuth = () => {
    // ===== CUSTOMER =====
    const token = useCookie<string | null>('ht_token', {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        secure: false,
        httpOnly: false,
    })

    const customerGlobal = useState<CustomerProfile | null>('customerGlobal', () => null)

    const router = useRouter()

    const isLoggedIn = computed(() => !!token.value || !!customerGlobal.value)
    const getCustomer = computed(() => customerGlobal.value)

    function setAuth(newToken: string, customer: CustomerProfile) {
        token.value = newToken
        customerGlobal.value = customer
    }

    function logOut() {
        customerGlobal.value = null
        token.value = null
        router.push('/')
    }

    async function syncMe() {
        if (!token.value) return
        try {
            const customer = await customerService.getMe(token.value)
            customerGlobal.value = customer
        } catch (error) {
            console.warn('syncMe failed, clearing auth:', error)
            logOut()
        }
    }

    // ===== ADMIN =====
    const adminToken = useCookie<string | null>('ht_admin_token', {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        secure: false,
        httpOnly: false,
    })

    const adminUser = useCookie<AdminProfile | null>('ht_admin_user', {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        secure: false,
        httpOnly: false,
    })

    function isJwtValid(tokenStr: string | null): boolean {
        if (!tokenStr || typeof tokenStr !== 'string') return false
        try {
            const parts = tokenStr.split('.')
            if (parts.length !== 3 || !parts[1]) return false

            // Thêm padding '=' cho Base64URL
            let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
            while (base64.length % 4 !== 0) {
                base64 += '='
            }

            // Decode base64
            let jsonStr = ''
            if (typeof atob === 'function') {
                const binaryStr = atob(base64)
                const bytes = new Uint8Array(binaryStr.length)
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i)
                }
                jsonStr = new TextDecoder().decode(bytes)
            } else if (typeof Buffer !== 'undefined') {
                jsonStr = Buffer.from(base64, 'base64').toString('utf-8')
            }

            if (!jsonStr) return Boolean(tokenStr && tokenStr.length > 20)

            const payload = JSON.parse(jsonStr)
            if (payload.exp && typeof payload.exp === 'number') {
                if (payload.exp * 1000 <= Date.now()) {
                    return false
                }
            }
            return true
        } catch {
            return Boolean(tokenStr && tokenStr.length > 20 && tokenStr.includes('.'))
        }
    }

    const isAdmin = computed(() => isJwtValid(adminToken.value))
    const getAdmin = computed(() => (isAdmin.value ? adminUser.value : null))

    function setAdminAuth(newToken: string, admin: AdminProfile) {
        adminToken.value = newToken
        adminUser.value = admin
    }

    function logOutAdmin() {
        adminToken.value = null
        adminUser.value = null
        router.push('/admin/login')
    }

    return {
        // customer
        token,
        getCustomer,
        isLoggedIn,
        setAuth,
        logOut,
        syncMe,
        // admin
        adminToken,
        getAdmin,
        isAdmin,
        setAdminAuth,
        logOutAdmin,
    }
}
