import type { AdminProfile } from '~/type'
import { adminService } from '~/services/admin.service'

export const useAdminAuth = () => {
    // Cookie admin riêng biệt với khách (ht_token)
    const adminToken = useCookie<string | null>('ht_admin_token', {
        maxAge: 60 * 60 * 24 * 7, // 7 ngày (phiên admin ngắn hơn cho an toàn)
        path: '/',
        secure: false,
        httpOnly: false
    })

    const adminGlobal = useState<AdminProfile | null>('adminGlobal', () => null)

    const router = useRouter()

    const isAdmin = computed(() => !!adminToken.value || !!adminGlobal.value)
    const getAdmin = computed(() => adminGlobal.value)

    function setAdminAuth(newToken: string, admin: AdminProfile) {
        adminToken.value = newToken
        adminGlobal.value = admin
    }

    function logOutAdmin() {
        adminGlobal.value = null
        adminToken.value = null
        router.push('/')
    }

    async function syncAdminMe() {
        if (!adminToken.value) return
        try {
            const admin = await adminService.getMe(adminToken.value)
            adminGlobal.value = admin
        } catch (error) {
            console.warn('syncAdminMe failed, clearing admin auth:', error)
            logOutAdmin()
        }
    }

    return {
        adminToken,
        getAdmin,
        isAdmin,
        setAdminAuth,
        logOutAdmin,
        syncAdminMe
    }
}
