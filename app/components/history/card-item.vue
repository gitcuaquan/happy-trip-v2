<template>
  <UCard variant="outline" :ui="{
    root: 'rounded-2xl hover:border-primary/30 transition-colors cursor-pointer',
    header: 'px-4 py-3 sm:px-4',
    body: 'px-4 py-3 sm:px-4 sm:py-3',
    footer: 'px-4 py-3 sm:px-4'
  }" @click="emit('navigate', order.short_id)">

    <template #header>
      <div class="flex items-center justify-between">
        <UBadge :color="statusColor" variant="subtle" size="sm" :icon="statusIcon" :label="statusLabel"
          class="rounded-full" />

        <UBadge color="primary" variant="soft" size="sm" icon="i-lucide-arrow-right"
          class="hover:bg-primary-100 transition-colors rounded-full" @click.stop="emit('navigate', order.short_id)">
          Chi tiết
        </UBadge>
      </div>
    </template>

    <template #default>
      <div class="space-y-3">

        <div
          class="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg w-max border border-slate-100">
          <UIcon name="i-lucide-calendar-clock" class="size-3.5 shrink-0 text-primary" />
          {{ formattedDate }}
        </div>

        <div class="flex gap-3">
          <div class="flex flex-col items-center shrink-0 pt-0.5">
            <div class="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
            <div class="w-px flex-1 my-1 min-h-5 border-l-2 border-dashed border-default" />
            <div class="w-2.5 h-2.5 rounded-full bg-info ring-2 ring-info/20" />
          </div>
          <div class="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <p class="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Điểm đón</p>
              <p class="text-sm font-semibold text-highlighted line-clamp-1">{{ departureDisplay }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Điểm đến</p>
              <p class="text-sm font-semibold text-highlighted line-clamp-1">{{ destinationDisplay }}</p>
            </div>
          </div>
        </div>

        <USeparator dashed />

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-muted">
            <UIcon name="i-lucide-wallet" class="size-3.5 shrink-0" />
            <span class="text-xs">Tổng tiền</span>
          </div>
          <span
            :class="['text-base font-black tracking-tight', order.status_type === 3 ? 'text-muted line-through' : 'text-primary']">
            {{ numberToCurrency(order.price_guest_after) }}
          </span>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <UBadge color="neutral" variant="outline" size="sm" :icon="'i-lucide-car'" :label="order.name_service" />
          <UBadge v-if="order.distance" color="neutral" variant="outline" size="sm" icon="i-lucide-route"
            :label="`${order.distance} km`" />
          <UBadge v-if="order.customer?.full_name" color="neutral" variant="outline" size="sm" icon="i-lucide-user"
            :label="order.customer.full_name" class="max-w-30 truncate" />
        </div>

      </div>
    </template>

    <template #footer>
      <div v-if="order.status_type === 0 || order.status_type === 1" class="flex gap-1.5 sm:gap-2">
        <UButton size="sm" color="success" variant="soft" icon="i-lucide-phone"
          :label="order.status_type === 1 ? 'Gọi tài xế' : 'Hỗ trợ'"
          class="flex-1 justify-center rounded-xl px-1 text-[11px] sm:text-xs font-bold truncate"
          :to="order.status_type === 1 && order.partner?.phone ? `tel:${order.partner.phone}` : 'tel:0972970000'"
          @click.stop />

        <UButton size="sm" color="primary" variant="soft" icon="i-lucide-arrow-left-right" label="Đặt Chiều về"
          class="flex-1 justify-center rounded-xl px-1 text-[11px] sm:text-xs font-bold truncate"
          @click.stop="emit('return-trip')" />

        <UButton size="sm" color="error" variant="soft" icon="i-lucide-x" label="Hủy Chuyến"
          class="flex-1 justify-center rounded-xl px-1 text-[11px] sm:text-xs font-bold truncate"
          @click.stop="emit('cancel', order.id)" />
      </div>

      <div v-else class="flex gap-2">
        <UButton size="sm" color="primary" variant="soft" icon="i-lucide-arrow-left-right" label="Đặt chiều về"
          class="flex-1 justify-center rounded-xl font-bold" @click.stop="emit('return-trip')" />

        <UButton size="sm" color="neutral" variant="soft" icon="i-lucide-refresh-cw" label="Đặt lại chuyến"
          class="flex-1 justify-center rounded-xl font-bold" @click.stop="emit('rebook')" />
      </div>
    </template>

  </UCard>
</template>
<script lang="ts" setup>
import type { Order } from '~/type'
import { formatAddress } from '~/type'
import { useAuth } from '~/composables/useAuth'
const props = defineProps<{ order: Order }>()
const emit = defineEmits<{
  (e: 'refreshList'): void
  (e: 'cancel', orderId: string): void
  (e: 'navigate', orderId: string): void
  (e: 'rebook'): void
  (e: 'return-trip'): void
}>()

const { token } = useAuth()
const toast = useToast()

const departureDisplay = computed(() =>
  props.order.departure.address_1
    ? formatAddress(props.order.departure)
    : props.order.departure.city
)

const destinationDisplay = computed(() =>
  props.order.destination.address_1
    ? formatAddress(props.order.destination)
    : props.order.destination.city
)

const formattedDate = computed(() => {
  if (!props.order.date_of_destination) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',

  }).format(new Date(props.order.date_of_destination))
})

const statusLabel = computed(() => props.order.status_name)

const statusColor = computed(() => ({
  0: 'warning',  // 0: Chờ tài xế (Màu vàng cam)
  1: 'info',     // 1: Đang thực hiện (Màu xanh dương)
  2: 'success',  // 2: Hoàn thành (Màu xanh lá)
  3: 'error',    // 3: Đã hủy (Màu đỏ)
} as const)[props.order.status_type] || 'neutral')

// Icon map theo 4 trạng thái
const statusIcon = computed(() => ({
  0: 'i-lucide-loader',
  1: 'i-lucide-radio',
  2: 'i-lucide-check-circle',
  3: 'i-lucide-x-circle',
}[props.order.status_type] || 'i-lucide-info'))

function numberToCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
}
</script>