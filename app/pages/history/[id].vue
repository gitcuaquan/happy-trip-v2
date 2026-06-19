<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-default sticky top-0 z-50 border-b border-default">
            <UContainer>
                <div class="flex items-center gap-3 py-3">
                    <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="sm"
                        @click="$router.back()" aria-label="Quay lại" />
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-base leading-tight">Chi tiết chuyến đi</p>
                        <p v-if="orderDetail" class="text-xs text-muted font-mono">#{{ orderDetail.short_id }}</p>
                    </div>
                    <UBadge v-if="orderDetail" size="lg" :color="statusColor(orderDetail.status_type)" variant="soft"
                        :icon="statusIcon(orderDetail.status_type)"
                        class="shrink-0">
                        {{ orderDetail.status_name }}
                    </UBadge>
                </div>
            </UContainer>
        </div>
        <div class="mx-auto max-w-5xl">

            <!-- Loading -->
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 gap-3">
                <UIcon name="i-lucide-loader-2" class="size-8 text-primary animate-spin" />
                <p class="text-sm text-muted">Đang tải thông tin chuyến...</p>
            </div>

            <!-- Error -->
            <div v-else-if="!orderDetail"
                class="flex flex-col items-center justify-center py-32 gap-3 text-center px-6">
                <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <UIcon name="i-lucide-alert-circle" class="size-8 text-red-300" />
                </div>
                <p class="font-semibold">Không tìm thấy chuyến đi</p>
                <p class="text-sm text-muted">Chuyến đi này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
                <UButton variant="soft" color="primary" @click="$router.back()">Quay lại</UButton>
            </div>

            <!-- Content -->
            <UContainer v-else class="py-5 space-y-3 pb-10">
                <!-- Route Card -->
                <UCard :ui="{ body: 'p-0' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-bold text-muted uppercase tracking-wider">Lộ trình</p>
                            <div class="flex items-center gap-1.5 text-xs text-muted">
                                <UIcon name="i-lucide-calendar-clock" class="size-3.5" />
                                <span class="font-medium">{{ formatTime(orderDetail.date_of_destination) }}</span>
                            </div>
                        </div>
                    </template>

                    <div class="px-4 py-4 flex gap-3 items-start">
                        <div class="flex flex-col items-center mt-0.5 shrink-0">
                            <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            </div>
                            <div class="w-px h-8 bg-linear-to-b from-blue-200 to-orange-200 my-1" />
                            <div class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                                <UIcon name="i-lucide-map-pin" class="size-4 text-primary" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-5 flex-1 min-w-0">
                            <div>
                                <p class="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Điểm đón
                                </p>
                                <p class="text-sm font-semibold leading-snug">{{ orderDetail.departure.address_1 }}</p>
                                <p class="text-xs text-muted mt-0.5">
                                    {{ [orderDetail.departure.district,
                                    orderDetail.departure.city].filter(Boolean).join(',') }}
                                </p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-0.5">Điểm
                                    đến
                                </p>
                                <p class="text-sm font-semibold leading-snug">{{ orderDetail.destination.address_1 }}
                                </p>
                                <p class="text-xs text-muted mt-0.5">
                                    {{ [orderDetail.destination.district,
                                    orderDetail.destination.city].filter(Boolean).join(', ') }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div class="grid grid-cols-3 divide-x divide-default -mx-4 -my-3 border-t-0">
                            <div class="px-3 py-3 text-center">
                                <p class="text-[10px] text-muted font-medium uppercase tracking-wide">Khoảng cách</p>
                                <p class="text-sm font-bold mt-0.5">{{ orderDetail.distance }} <span
                                        class="font-normal text-muted text-xs">km</span></p>
                            </div>
                            <div class="px-3 py-3 text-center">
                                <p class="text-[10px] text-muted font-medium uppercase tracking-wide">Loại xe</p>
                                <p class="text-sm font-bold mt-0.5 truncate px-1">{{ orderDetail.name_service }}</p>
                            </div>
                            <div class="px-3 py-3 text-center">
                                <p class="text-[10px] text-muted font-medium uppercase tracking-wide">Số lượng</p>
                                <p class="text-sm font-bold mt-0.5">{{ orderDetail.quantity }}</p>
                            </div>
                        </div>
                    </template>
                </UCard>

                <!-- Driver Card - hiện khi đã có partner (Tài xế nhận đơn trở đi) -->
                <UCard v-if="orderDetail.partner">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-bold text-muted uppercase tracking-wider">Tài xế</p>
                            <UBadge v-if="orderDetail.accepted_at" color="success" variant="soft" size="sm" class="rounded-full">
                                <UIcon name="i-lucide-check-circle" class="size-3 mr-1" />
                                Đã nhận lúc {{ formatTime(orderDetail.accepted_at) }}
                            </UBadge>
                        </div>
                    </template>

                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20">
                            <span class="text-base font-bold text-primary">
                                {{ initials(orderDetail.partner.full_name) }}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm truncate">{{ orderDetail.partner.full_name }}</p>
                            <p class="text-xs text-muted mt-0.5 flex items-center gap-1">
                                <UIcon name="i-lucide-phone" class="size-3" />
                                {{ orderDetail.partner.phone }}
                            </p>
                        </div>
                        <UButton
                            :to="`tel:${orderDetail.partner.phone}`"
                            icon="i-lucide-phone-call"
                            size="sm"
                            color="primary"
                            variant="solid"
                            class="rounded-xl"
                            label="Gọi"
                        />
                    </div>

                    <!-- Vehicle info -->
                    <template v-if="orderDetail.partner.transport" #footer>
                        <div class="-mx-4 -my-3 px-4 py-3 bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-b-md">
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-default shadow-sm">
                                    <UIcon name="i-lucide-car-front" class="size-5 text-primary" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-bold">
                                            {{ orderDetail.partner.transport.hang_xe }}
                                            {{ orderDetail.partner.transport.ten_xe }}
                                        </span>
                                        <UBadge color="neutral" variant="subtle" size="xs">
                                            {{ orderDetail.partner.transport.type_name }}
                                        </UBadge>
                                        <UBadge v-if="orderDetail.partner.transport.created_year" color="neutral" variant="outline" size="xs">
                                            {{ orderDetail.partner.transport.created_year }}
                                        </UBadge>
                                    </div>
                                    <div class="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-default">
                                        <UIcon name="i-lucide-hash" class="size-3 text-muted" />
                                        <span class="text-xs font-bold font-mono tracking-wider">
                                            {{ orderDetail.partner.transport.license_plate }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </UCard>

                <!-- Customer Card -->
                <UCard>
                    <template #header>
                        <p class="text-xs font-bold text-muted uppercase tracking-wider">Khách hàng</p>
                    </template>
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <span class="text-sm font-bold text-primary">{{ initials(orderDetail.customer.full_name)
                            }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm truncate">{{ orderDetail.customer.full_name }}</p>
                            <p class="text-xs text-muted mt-0.5">{{ orderDetail.customer.phone }}</p>
                        </div>
                        <UButton :to="`tel:${orderDetail.customer.phone}`" icon="i-lucide-phone" size="xs"
                            color="primary" variant="soft" class="rounded-xl" aria-label="Gọi khách hàng" />
                    </div>
                </UCard>

                <!-- Safety Notice - hiện khi Chờ tài xế hoặc Đã nhận -->
                <SharedSafetyNotice v-if="[0, 1].includes(orderDetail.status_type)" />

                <!-- Note Card - chỉ hiện khi đơn đang Chờ tài xế -->
                <UCard v-if="orderDetail.status_type === 0 && orderDetail.note">
                    <template #header>
                        <p class="text-xs font-bold text-muted uppercase tracking-wider">Ghi chú</p>
                    </template>
                    <div class="flex gap-3 items-start">
                        <div class="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <UIcon name="i-lucide-sticky-note" class="size-4 text-primary" />
                        </div>
                        <p class="text-sm leading-relaxed whitespace-pre-line flex-1 text-slate-700">
                            {{ orderDetail.note }}
                        </p>
                    </div>
                </UCard>

                <!-- Creator Card -->
                <UCard v-if="orderDetail.creator?.user_phone">
                    <template #header>
                        <p class="text-xs font-bold text-muted uppercase tracking-wider">Người đặt chuyến</p>
                    </template>
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-full bg-elevated flex items-center justify-center shrink-0">
                            <UIcon name="i-lucide-user-check" class="size-5 text-muted" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm truncate">{{ orderDetail.creator.user_phone }}</p>
                            <p class="text-xs text-muted mt-0.5 capitalize">{{ orderDetail.creator.user_type }}</p>
                        </div>
                    </div>
                </UCard>

                <!-- Payment Card -->
                <UCard>
                    <template #header>
                        <p class="text-xs font-bold text-muted uppercase tracking-wider">Thanh toán</p>
                    </template>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between items-center">
                            <span class="text-muted">Giá gốc</span>
                            <span>{{ numberToCurrency(orderDetail.price_original) }}</span>
                        </div>
                        <div v-if="orderDetail.price_guest !== orderDetail.price_guest_after"
                            class="flex justify-between items-center">
                            <span class="text-muted">Giá trước KM</span>
                            <span>{{ numberToCurrency(orderDetail.price_guest) }}</span>
                        </div>
                        <div v-if="orderDetail.sub_fees?.sub_fee_price > 0" class="flex justify-between items-center">
                            <span class="text-muted">Phí phụ</span>
                            <span>+ {{ numberToCurrency(orderDetail.sub_fees.sub_fee_price) }}</span>
                        </div>
                        <div v-if="orderDetail.active_backhaul && orderDetail.backhaul?.price > 0"
                            class="flex justify-between items-center">
                            <span class="text-muted flex items-center gap-1.5">
                                <UIcon name="i-lucide-repeat" class="size-3.5" />Backhaul
                            </span>
                            <span>{{ numberToCurrency(orderDetail.backhaul.price) }}</span>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex justify-between items-center w-full">
                            <span class="font-bold">Khách phải trả</span>
                            <span class="text-xl font-black text-primary">{{
                                numberToCurrency(orderDetail.price_guest_after)
                            }}</span>
                        </div>
                    </template>
                </UCard>

                <!-- Timestamps Card -->
                <UCard>
                    <template #header>
                        <p class="text-xs font-bold text-muted uppercase tracking-wider">Thông tin thời gian</p>
                    </template>
                    <div class="space-y-3 text-sm">
                        <div v-if="orderDetail.created" class="flex justify-between items-center">
                            <span class="text-muted flex items-center gap-1.5">
                                <UIcon name="i-lucide-plus-circle" class="size-3.5" />Đặt chuyến lúc
                            </span>
                            <span class="font-medium">{{ formatTime(orderDetail.created) }}</span>
                        </div>
                        <div v-if="orderDetail.date_of_destination" class="flex justify-between items-center">
                            <span class="text-muted flex items-center gap-1.5">
                                <UIcon name="i-lucide-calendar-clock" class="size-3.5" />Giờ khởi hành
                            </span>
                            <span class="font-medium">{{ formatTime(orderDetail.date_of_destination) }}</span>
                        </div>
                        <div v-if="orderDetail.active_time" class="flex justify-between items-center">
                            <span class="text-muted flex items-center gap-1.5">
                                <UIcon name="i-lucide-play-circle" class="size-3.5" />Hoạt động từ
                            </span>
                            <span class="font-medium">{{ formatTime(orderDetail.active_time) }}</span>
                        </div>
                    </div>
                </UCard>
            </UContainer>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'nuxt/app'
import { OrderDetail } from '@/type'
import { orderService } from '@/services/order.service'

const route = useRoute()
const { token } = useAuth()
const toast = useToast()
const orderId = route.params.id as string

const isLoading = ref(true)
const orderDetail = ref<OrderDetail | null>(null)

const fetchDetail = async () => {
    if (!token.value) {
        navigateTo('/login')
        return
    }
    isLoading.value = true
    try {
        const response = await orderService.getOrderDetail(token.value, orderId)
        orderDetail.value = new OrderDetail(response)
    } catch (error) {
        console.error('Lỗi lấy chi tiết:', error)
        orderDetail.value = null
    } finally {
        isLoading.value = false
    }
}


onMounted(() => { fetchDetail() })

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (iso: string | undefined | null) => {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date(iso))
}

const numberToCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN').format(val ?? 0) + ' ₫'

const initials = (name: string) =>
    name?.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || '?'

// status_type theo Order interface:
// 0-Chờ tài xế, 1-Tài xế đã nhận, 2-Đang hoạt động, 3-Hoàn thành, 4-Đã hủy
const statusColor = (type: number): any => {
    const map: Record<number, string> = { 0: 'warning', 1: 'primary', 2: 'primary', 3: 'success', 4: 'error' }
    return map[type] ?? 'neutral'
}

const statusIcon = (type: number) => {
    const map: Record<number, string> = {
        0: 'i-lucide-clock',
        1: 'i-lucide-user-check',
        2: 'i-lucide-navigation',
        3: 'i-lucide-check-circle-2',
        4: 'i-lucide-x-circle',
    }
    return map[type] ?? 'i-lucide-info'
}

</script>