import type { CustomerProfile } from '~/type'
import { customerService } from '~/services/customer.service'

export const useAuth = () => {
    // Cookie lưu vĩnh viễn: maxAge 365 ngày, path '/' để tất cả route có thể dùng
    const token = useCookie<string | null>('ht_token', {
        maxAge: 60 * 60 * 24 * 365, // 365 ngày (tính bằng giây)
        path: '/',
        secure: false, // Set true nếu dùng HTTPS
        httpOnly: false, // Client-side cookie
    })

    // Customer lưu trong ref (client-only, tránh SSR hydration issues)
    const customerGlobal = useState<CustomerProfile | null>('customerGlobal', () => null)


    const router = useRouter()

    // Chỉ cần có token là đã login, customer sẽ được fetch từ API
    const isLoggedIn = computed(() => !!token.value || !!customerGlobal.value)

    const getCustomer = computed(() => customerGlobal.value)

    // Set auth sau khi OTP thành công
    function setAuth(newToken: string, customer: CustomerProfile) {
        token.value = newToken
        customerGlobal.value = customer
    }

    // Logout
    function logOut() {
        customerGlobal.value = null
        token.value = null
        router.push('/')
    }

    // Sync user từ API khi có token (dùng trong plugin)
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

    return{
        token,
        getCustomer,
        isLoggedIn,
        setAuth,
        logOut,
        syncMe
    }
}