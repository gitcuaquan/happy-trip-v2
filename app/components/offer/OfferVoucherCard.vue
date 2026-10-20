<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
    <!-- Dải màu trạng thái: xanh = khả dụng, vàng = đang giữ cho chuyến -->
    <div
      class="h-1"
      :class="voucher.state === 'Available' ? 'bg-emerald-400' : 'bg-amber-400'"
    />

    <div class="p-4 space-y-2.5">
      <div class="flex items-start justify-between gap-3">
        <p class="font-bold text-slate-800 leading-snug">
          {{ voucher.campaign_name }}
        </p>
        <UBadge
          :color="voucher.state === 'Available' ? 'success' : 'warning'"
          variant="subtle"
          size="sm"
          class="shrink-0 rounded-full"
          :label="statusLabel"
        />
      </div>

      <!-- Điều kiện & mức giảm, sắp theo giá tối thiểu tăng dần -->
      <ul class="space-y-1">
        <li
          v-for="tier in sortedTiers"
          :key="tier.min_price"
          class="flex items-start gap-2 text-sm text-slate-600"
        >
          <UIcon
            name="i-lucide-check"
            class="size-4 text-primary shrink-0 mt-0.5"
          />
          <span>
            Giảm <b class="text-slate-800">{{ numberToCurrency(tier.amount) }}</b>
            cho chuyến từ <b class="text-slate-800">{{ numberToCurrency(tier.min_price) }}</b>
          </span>
        </li>
      </ul>

      <div class="pt-2 mt-1 border-t border-dashed border-slate-200 flex items-center gap-1.5 text-xs text-slate-400">
        <UIcon
          name="i-lucide-calendar"
          class="size-3.5 shrink-0"
        />
        <span>HSD: {{ expiryLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CustomerVoucher, VoucherTier } from '~/type'

const props = defineProps<{
  voucher: CustomerVoucher
}>()

// Reserved: hiển thị chuyến đang giữ voucher; còn lại dùng nhãn tiếng Việt từ API
const statusLabel = computed(() =>
  props.voucher.state === 'Reserved' && props.voucher.order_short_id
    ? `Đang dùng cho chuyến ${props.voucher.order_short_id}`
    : props.voucher.status
)

const sortedTiers = computed<VoucherTier[]>(() =>
  [...(props.voucher.tiers || [])].sort((a, b) => a.min_price - b.min_price)
)

// HSD voucher = (expires_at − 1 giây) theo GMT+7
const expiryLabel = computed(() => formatVoucherExpiryVN(props.voucher.expires_at))
</script>
