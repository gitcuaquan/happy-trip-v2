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

    const isAdmin = computed(() => !!adminToken.value)
    const getAdmin = computed(() => adminUser.value)

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
