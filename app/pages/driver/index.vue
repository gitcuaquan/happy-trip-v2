<template>
    <div class="min-h-dvh bg-slate-100 flex">

        <!-- ── SIDEBAR DESKTOP ── -->
        <aside class="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-30">
            <!-- Brand -->
            <div class="p-6 border-b border-slate-100 space-y-2">
                <AppLogo class="h-7 w-auto" />
                <UBadge color="primary" variant="soft" icon="i-lucide-radio" size="sm">Portal Tài xế</UBadge>
            </div>

            <!-- Driver info -->
            <div class="p-5 border-b border-slate-100 flex items-center gap-3">
                <UAvatar icon="i-lucide-user-round" size="md" color="primary" variant="soft" />
                <div class="min-w-0">
                    <p class="text-xs text-slate-400">Đối tác</p>
                    <p class="font-bold text-slate-800 text-sm truncate">{{ store.driverName || 'HappyTrip Driver' }}
                    </p>
                </div>
            </div>

            <!-- Wallet -->
            <div class="p-5 border-b border-slate-100 space-y-3">
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số dư ví</p>
                    <p class="text-2xl font-black text-primary">{{ numberToCurrency(store.walletBalance) }}</p>
                </div>
                <UButton size="sm" color="primary" variant="soft" icon="i-lucide-plus" block @click="showTopup = true">
                    Nạp tiền
                </UButton>
            </div>

            <!-- Online toggle -->
            <div class="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-600">Trạng thái</span>
                <div class="flex items-center gap-2">
                    <UToggle v-model="isOnline" color="success" size="sm" />
                    <span class="text-xs font-bold" :class="isOnline ? 'text-green-600' : 'text-slate-400'">
                        {{ isOnline ? 'Online' : 'Offline' }}
                    </span>
                </div>
            </div>

            <!-- Nav -->
            <nav class="flex-1 p-4 space-y-1">
                <UButton v-for="tab in tabs" :key="tab.id" :color="activeTab === tab.id ? 'primary' : 'neutral'"
                    :variant="activeTab === tab.id ? 'solid' : 'ghost'" :icon="tab.icon" block
                    class="justify-start font-semibold" @click="activeTab = tab.id">
                    {{ tab.label }}
                </UButton>
            </nav>

            <div class="p-4 border-t border-slate-100">
                <UButton variant="ghost" color="neutral" icon="i-lucide-log-out" block @click="store.logout()">
                    Đăng xuất
                </UButton>
            </div>
        </aside>

        <!-- ── MAIN ── -->
        <div class="flex-1 flex flex-col lg:ml-64 min-h-dvh">

            <!-- Mobile header -->
            <div class="lg:hidden bg-primary px-5 pt-12 pb-8 relative overflow-hidden shrink-0 rounded-b-4xl">
                <div class="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/15 pointer-events-none" />
                <div class="absolute top-8 -right-2 w-20 h-20 rounded-full bg-white/15 pointer-events-none" />
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <UAvatar icon="i-lucide-user-round" size="md"
                            class="bg-white/20 border-2 border-white/30 text-white" />
                        <div>
                            <p class="text-white/75 text-xs">Xin chào,</p>
                            <p class="text-white font-extrabold text-sm">{{ store.driverName || 'Đối tác HappyTrip' }}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1.5">
                        <span class="text-yellow-300 text-sm">★</span>
                        <span class="text-white text-sm font-extrabold">4.9</span>
                    </div>
                </div>
            </div>

            <!-- Mobile wallet card -->
            <div class="lg:hidden mx-4 -mt-5 z-10 relative mb-1">
                <UCard :ui="{ body: 'p-0' }">
                    <div class="px-4 py-3 flex items-center justify-between">
                        <div>
                            <p class="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Số dư
                                ví</p>
                            <p class="text-xl font-black text-primary leading-none">{{
                                numberToCurrency(store.walletBalance) }}</p>
                        </div>
                        <UButton color="primary" variant="soft" icon="i-lucide-wallet" size="lg" square
                            @click="showTopup = true" />
                    </div>
                </UCard>
            </div>

            <!-- Desktop topbar -->
            <div
                class="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
                <div>
                    <h1 class="text-xl font-bold text-slate-900">{{tabs.find(t => t.id === activeTab)?.label}}</h1>
                    <p class="text-xs text-slate-400">{{ todayLabel }}</p>
                </div>
                <div class="flex items-center gap-3">
                    <UButton variant="outline" color="neutral" icon="i-lucide-refresh-cw" :loading="store.loading"
                        size="sm" @click="refresh">
                        Làm mới
                    </UButton>
                    <UBadge :color="isOnline ? 'success' : 'neutral'" variant="soft" size="lg"
                        :icon="isOnline ? 'i-lucide-radio' : 'i-lucide-radio-tower'">
                        {{ isOnline ? 'Đang online' : 'Offline' }}
                    </UBadge>
                </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto pb-28 lg:pb-8 px-4 lg:px-8 pt-4 lg:pt-6 space-y-4">

                <!-- Desktop stats -->
                <div class="hidden lg:grid grid-cols-4 gap-4">
                    <UCard v-for="stat in stats" :key="stat.label" class="hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between mb-2">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ stat.label }}
                            </p>
                            <UIcon :name="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
                        </div>
                        <p class="font-black leading-tight" :class="stat.valueClass">{{ stat.value }}</p>
                    </UCard>
                </div>

                <!-- Active order -->
                <UAlert v-if="store.activeOrder" color="success" variant="solid" icon="i-lucide-radio"
                    :ui="{ root: 'rounded-2xl' }">
                    <template #title>
                        <div class="flex items-center justify-between w-full">
                            <span class="font-bold">Đang chạy cuốc</span>
                            <UBadge color="neutral" variant="solid" class="bg-white/20 text-white border-0">
                                {{ store.activeOrder.short_id }}
                            </UBadge>
                        </div>
                    </template>
                    <template #description>
                        <div class="space-y-1.5 mt-1 mb-3">
                            <div class="flex items-center gap-2 text-sm text-white/90">
                                <UIcon name="i-lucide-map-pin" class="w-4 h-4 shrink-0" />
                                {{ store.activeOrder.departure.district }}, {{ store.activeOrder.departure.city }}
                            </div>
                            <div class="flex items-center gap-2 text-sm text-white/90">
                                <UIcon name="i-lucide-navigation" class="w-4 h-4 shrink-0" />
                                {{ store.activeOrder.destination.district }}, {{ store.activeOrder.destination.city }}
                            </div>
                        </div>
                        <UButton color="neutral" variant="solid" icon="i-lucide-check-circle" :loading="completingOrder"
                            class="bg-white text-green-600 hover:bg-green-50 font-bold lg:max-w-xs w-full justify-center"
                            @click="handleComplete">
                            Hoàn thành chuyến
                        </UButton>
                    </template>
                </UAlert>

                <!-- Orders list -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <h2 class="font-bold text-slate-900 text-base lg:text-lg">Cuốc xe chờ nhận</h2>
                            <span v-if="store.orders.length" class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <UButton variant="ghost" color="neutral" size="xs" icon="i-lucide-refresh-cw"
                            :loading="store.loading" class="lg:hidden" @click="refresh" />
                    </div>

                    <!-- Skeleton -->
                    <div v-if="store.loading && !store.orders.length"
                        class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        <UCard v-for="i in 3" :key="i" class="space-y-3">
                            <div class="flex justify-between">
                                <USkeleton class="h-5 w-20 rounded-lg" />
                                <USkeleton class="h-5 w-24 rounded-lg" />
                            </div>
                            <USkeleton class="h-4 w-full rounded" />
                            <USkeleton class="h-4 w-3/4 rounded" />
                            <div class="flex gap-2">
                                <USkeleton class="h-9 flex-1 rounded-xl" />
                                <USkeleton class="h-9 flex-1 rounded-xl" />
                            </div>
                        </UCard>
                    </div>

                    <!-- Empty -->
                    <UCard v-else-if="!store.loading && !store.orders.length" class="py-16 text-center">
                        <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                            <UIcon name="i-lucide-car" class="w-8 h-8 text-slate-300" />
                        </div>
                        <p class="text-slate-500 font-semibold text-sm">Chưa có cuốc mới</p>
                        <p class="text-slate-300 text-xs mt-1">Hệ thống sẽ thông báo khi có chuyến</p>
                    </UCard>

                    <!-- Cards -->
                    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        <UCard v-for="order in store.orders" :key="order.id"
                            class="overflow-hidden hover:shadow-md transition-shadow" :ui="{ body: 'p-0' }">
                            <!-- Header: ID + Price -->
                            <div
                                class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-dashed border-slate-100">
                                <UBadge color="neutral" variant="soft" size="sm" class="font-mono font-bold">
                                    {{ order.short_id || order.id?.slice(-8) }}
                                </UBadge>
                                <span class="font-black text-lg text-primary">
                                    {{ numberToCurrency(order.price_guest_after || order.price_guest) }}
                                </span>
                            </div>

                            <!-- Route -->
                            <div class="px-4 py-3 space-y-2">
                                <div class="flex items-start gap-2.5">
                                    <div
                                        class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 shrink-0">
                                        <UIcon name="i-lucide-map-pin" class="w-3 h-3 text-blue-500" />
                                    </div>
                                    <div>
                                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                            Điểm đón
                                            <span v-if="order.time_label" class="text-primary ml-1">({{ order.time_label
                                                }})</span>
                                        </p>
                                        <p class="text-sm font-semibold text-slate-800">{{ order.departure.district }},
                                            {{
                                            order.departure.city }}</p>
                                        <p v-if="order.departure.address_1" class="text-xs text-slate-400">{{
                                            order.departure.address_1
                                            }}</p>
                                    </div>
                                </div>
                                <div class="ml-2.5 border-l-2 border-dashed border-slate-200 h-3" />
                                <div class="flex items-start gap-2.5">
                                    <div
                                        class="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5 shrink-0">
                                        <UIcon name="i-lucide-navigation" class="w-3 h-3 text-primary" />
                                    </div>
                                    <div>
                                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Điểm đến
                                        </p>
                                        <p class="text-sm font-semibold text-slate-800">{{ order.destination.district
                                            }}, {{
                                            order.destination.city }}</p>
                                        <p v-if="order.destination.address_1" class="text-xs text-slate-400">{{
                                            order.destination.address_1 }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Badges -->
                            <div class="flex gap-2 px-4 pb-3 flex-wrap">
                                <UBadge color="primary" variant="soft" size="xs" icon="i-lucide-car">
                                    {{ order.name_service || 'Xe ghép' }}
                                </UBadge>
                                <UBadge color="neutral" variant="soft" size="xs" icon="i-lucide-clock">
                                    {{ formatDate(order.date_of_destination) }}
                                </UBadge>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-2 px-4 pb-4">
                                <UButton variant="soft" color="neutral" class="flex-1 font-bold"
                                    :loading="rejectingId === order.id" @click="handleReject(order.id)">
                                    Bỏ qua
                                </UButton>
                                <UButton color="primary" icon="i-lucide-car" class="flex-2 font-bold"
                                    :loading="acceptingId === order.id" @click="handleAccept(order.id)">
                                    Nhận cuốc
                                </UButton>
                            </div>
                        </UCard>
                    </div>
                </div>
            </div>

            <!-- Mobile bottom nav -->
            <nav
                class="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-2 py-2 flex justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-20">
                <button v-for="tab in tabs" :key="tab.id"
                    class="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors"
                    :class="activeTab === tab.id ? 'text-primary' : 'text-slate-400'" @click="activeTab = tab.id">
                    <UIcon :name="tab.icon" class="w-6 h-6" />
                    <span class="text-[10px] font-bold">{{ tab.label }}</span>
                </button>
            </nav>
        </div>

        <!-- ── TOPUP MODAL ── -->
        <UModal v-model:open="showTopup" title="Nạp tiền ví">
            <template #body>
                <div class="p-4 space-y-4">
                    <UCard :ui="{ body: 'text-center bg-orange-50 rounded-2xl' }">
                        <p class="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Số dư hiện tại</p>
                        <p class="text-3xl font-black text-primary">{{ numberToCurrency(store.walletBalance) }}</p>
                    </UCard>
                    <p class="text-sm text-center text-slate-500">Liên hệ hotline để nạp tiền nhanh nhất</p>
                    <UButton block color="primary" icon="i-lucide-phone" size="lg" to="tel:0972970000">
                        Gọi: 0972 97 0000
                    </UButton>
                </div>
            </template>
        </UModal>

        <!-- ── TOAST ── -->
        <Teleport to="body">
            <Transition name="toast">
                <div v-if="toastMsg"
                    class="fixed top-6 left-1/2 -translate-x-1/2 z-9999 text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 max-w-[90vw] whitespace-nowrap"
                    :class="toastSuccess ? 'bg-slate-900 text-white' : 'bg-red-900 text-white'">
                    <UIcon :name="toastSuccess ? 'i-lucide-check-circle' : 'i-lucide-x-circle'" class="w-4 h-4 shrink-0"
                        :class="toastSuccess ? 'text-green-400' : 'text-red-400'" />
                    {{ toastMsg }}
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script lang="ts" setup>
import { useDriverStore } from '~/stores/driver'
import { numberToCurrency } from '~/utils'

definePageMeta({ layout: false, middleware: 'auth-driver' })

const store = useDriverStore()

// ── Data ──────────────────────────────────────────
const isOnline = ref(true)
const showTopup = ref(false)
const activeTab = ref('orders')
const acceptingId = ref<string | null>(null)
const rejectingId = ref<string | null>(null)
const completingOrder = ref(false)
const toastMsg = ref<string | null>(null)
const toastSuccess = ref(true)

const tabs = [
    { id: 'orders', icon: 'i-lucide-car', label: 'Nhận cuốc' },
    { id: 'history', icon: 'i-lucide-clock', label: 'Lịch sử' },
    { id: 'wallet', icon: 'i-lucide-wallet', label: 'Ví tiền' },
    { id: 'profile', icon: 'i-lucide-user-round', label: 'Tài khoản' },
]

// ── Computed ──────────────────────────────────────
const todayLabel = computed(() =>
    new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
)

const stats = computed(() => [
    { label: 'Số dư ví', value: numberToCurrency(store.walletBalance), icon: 'i-lucide-wallet', iconColor: 'text-primary', valueClass: 'text-xl text-primary' },
    { label: 'Cuốc chờ', value: String(store.orders.length), icon: 'i-lucide-list-todo', iconColor: 'text-blue-500', valueClass: 'text-3xl text-slate-800' },
    { label: 'Trạng thái', value: store.activeOrder ? 'Đang chạy' : 'Sẵn sàng', icon: 'i-lucide-radio', iconColor: store.activeOrder ? 'text-green-500' : 'text-slate-400', valueClass: `text-lg ${store.activeOrder ? 'text-green-600' : 'text-slate-400'}` },
    { label: 'Xe', value: store.profile?.transport?.ten_xe || '—', icon: 'i-lucide-car', iconColor: 'text-slate-400', valueClass: 'text-base text-slate-700' },
])

// ── Lifecycle ─────────────────────────────────────
onMounted(async () => {
    await Promise.all([store.fetchProfile(), store.fetchWallet(), store.fetchActiveOrder(), store.fetchOrders()])
    const timer = setInterval(() => { if (isOnline.value) refresh() }, 30_000)
    onUnmounted(() => clearInterval(timer))
})

// ── Helpers ───────────────────────────────────────
function showToast(msg: string, success = true) {
    toastMsg.value = msg
    toastSuccess.value = success
    setTimeout(() => (toastMsg.value = null), 3000)
}

async function refresh() {
    await Promise.all([store.fetchActiveOrder(), store.fetchOrders(), store.fetchWallet()])
}

async function handleAccept(id: string) {
    acceptingId.value = id
    const ok = await store.acceptOrder(id)
    acceptingId.value = null
    showToast(ok ? 'Nhận cuốc thành công!' : 'Không thể nhận cuốc. Thử lại.', ok)
}

async function handleReject(id: string) {
    rejectingId.value = id
    const ok = await store.rejectOrder(id)
    rejectingId.value = null
    if (ok) showToast('Đã bỏ qua cuốc')
}

async function handleComplete() {
    if (!store.activeOrder) return
    completingOrder.value = true
    const ok = await store.completeOrder(store.activeOrder.id)
    completingOrder.value = false
    showToast(ok ? 'Hoàn thành chuyến! Tiền đã về ví.' : 'Có lỗi xảy ra.', ok)
}

function formatDate(d: string) {
    if (!d) return ''
    try { return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(d)) }
    catch { return d }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition: all .25s ease
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -12px)
}
</style>