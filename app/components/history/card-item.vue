<template>
  <UCard
  
    variant="outline"
    :ui="{
      root: 'rounded-2xl',
      header: 'px-4 py-3 sm:px-4',
      body: 'px-4 py-3 sm:px-4 sm:py-3',
      footer: 'px-4 py-3 sm:px-4'
    }"
  >

    <!-- ─── HEADER ─── -->
    <template #header>
      <div class="flex items-center justify-between">
        <UBadge
          :color="statusColor"
          variant="subtle"
          size="sm"
          :icon="statusIcon"
          :label="statusLabel"
          class="rounded-full"
        />
        <div class="flex items-center gap-1 text-xs text-muted">
          <UIcon name="i-lucide-clock" class="size-3 shrink-0" />
          {{ formattedDate }}
        </div>
      </div>
    </template>

    <!-- ─── BODY ─── -->
    <template #default>
      <div class="space-y-3">

        <!-- Route -->
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

        <!-- Giá -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-muted">
            <UIcon name="i-lucide-wallet" class="size-3.5 shrink-0" />
            <span class="text-xs">Tổng tiền</span>
          </div>
          <span :class="['text-base font-black tracking-tight', order.status === 'cancelled' ? 'text-muted line-through' : 'text-primary']">
            {{ numberToCurrency(order.price_guest_after) }}
          </span>
        </div>

        <!-- Meta chips -->
        <div class="flex flex-wrap gap-1.5">
          <UBadge color="neutral" variant="outline" size="sm" :icon="'i-lucide-car'" :label="order.name_service" />
          <UBadge v-if="order.distance" color="neutral" variant="outline" size="sm" icon="i-lucide-route" :label="`${order.distance} km`" />
          <UBadge v-if="order.customer?.full_name" color="neutral" variant="outline" size="sm" icon="i-lucide-user" :label="order.customer.full_name" class="max-w-30 truncate" />
        </div>

      </div>
    </template>

    <!-- ─── FOOTER ─── -->
    <template #footer>
      <div v-if="order.status === 'in_progress'" class="flex gap-2">
        <UButton
          color="success"
          variant="soft"
          icon="i-lucide-phone"
          label="Liên hệ"
          class="flex-1 justify-center rounded-xl"
        />
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-x"
          label="Hủy chuyến"
          class="flex-1 justify-center rounded-xl"
        />
      </div>

      
      <div v-else class="flex justify-center">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          label="Đặt lại chuyến"
          class="justify-center rounded-xl"
        />
      </div>
    </template>

  </UCard>
</template>

<script lang="ts" setup>
import type { HistoryOrder } from '~/type'
import { formatAddress } from '~/type'

const props = defineProps<{ order: HistoryOrder }>()

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

const statusLabel = computed(() => ({
  in_progress: 'Đang thực hiện',
  completed:   'Đã hoàn thành',
  cancelled:   'Đã hủy',
}[props.order.status] ?? ''))

const statusColor = computed(() => ({
  in_progress: 'info',
  completed:   'success',
  cancelled:   'error',
}[props.order.status] as 'info' | 'success' | 'error'))

const statusIcon = computed(() => ({
  in_progress: 'i-lucide-radio',
  completed:   'i-lucide-check-circle',
  cancelled:   'i-lucide-x-circle',
}[props.order.status] ?? ''))

function numberToCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
}
</script>