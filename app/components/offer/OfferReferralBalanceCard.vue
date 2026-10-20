<template>
  <!-- Không còn số dư: mời giới thiệu bạn bè (không có link chia sẻ) -->
  <div
    v-if="isEmpty"
    class="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5"
  >
    <div class="flex items-start gap-3.5">
      <div class="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <UIcon
          name="i-lucide-gift"
          class="size-5"
        />
      </div>
      <div class="space-y-1">
        <p class="font-bold text-slate-800">
          Giới thiệu bạn bè
        </p>
        <p class="text-sm text-slate-500 leading-relaxed">
          Khi bạn bè nhập SĐT của bạn lúc đặt chuyến đầu tiên, bạn bè được giảm 50.000đ,
          bạn nhận 100.000đ sau khi chuyến hoàn thành.
        </p>
      </div>
    </div>
  </div>

  <!-- Thẻ số dư: 1 thẻ duy nhất cho toàn bộ số dư, chi tiết từng lần nhận ở "Xem chi tiết" -->
  <div
    v-else
    class="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
  >
    <div class="p-5 space-y-3.5">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <UIcon
            name="i-lucide-wallet"
            class="size-4.5"
          />
        </div>
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Số dư giới thiệu</span>
      </div>

      <div>
        <p class="text-3xl font-black text-primary leading-none">
          {{ numberToCurrency(summary.balance) }}
        </p>
        <p class="text-sm text-slate-500 mt-1.5">
          Dùng tối đa <b class="text-slate-700">{{ maxRatePercent }}%</b> giá mỗi chuyến
        </p>
      </div>

      <!-- Chỉ hiển thị khi có tiền đang giữ cho chuyến chưa kết thúc -->
      <div
        v-if="summary.reserved_amount > 0"
        class="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5 text-sm"
      >
        <span class="flex items-center gap-1.5 text-slate-600">
          <UIcon
            name="i-lucide-clock"
            class="size-4 text-slate-400 shrink-0"
          />
          Đang dùng cho chuyến:
        </span>
        <b class="text-slate-800">{{ numberToCurrency(summary.reserved_amount) }}</b>
      </div>

      <!-- Cảnh báo phần sắp hết hạn (sẽ bị trừ trước); tô màu khi còn ≤ 30 ngày -->
      <div
        v-if="showExpiryWarning"
        class="flex items-start gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm"
        :class="expiringSoon
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-slate-50 border-slate-100 text-slate-500'"
      >
        <UIcon
          name="i-lucide-alert-triangle"
          class="size-4 shrink-0 mt-0.5"
          :class="expiringSoon ? 'text-amber-500' : 'text-slate-400'"
        />
        <span>
          <b>{{ numberToCurrency(summary.next_expiring_amount || 0) }}</b>
          sẽ hết hạn ngày {{ formatDateVN(summary.next_expires_at) }}
        </span>
      </div>

      <!-- Chi tiết từng lần nhận — chỉ là thông tin, không có nút "Dùng" -->
      <div v-if="details.length > 0">
        <UButton
          block
          variant="soft"
          color="neutral"
          size="sm"
          class="justify-center rounded-xl font-bold"
          @click="expanded = !expanded"
        >
          Xem chi tiết
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 transition-transform duration-200"
            :class="expanded && 'rotate-180'"
          />
        </UButton>

        <ul
          v-if="expanded"
          class="mt-2 divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden"
        >
          <li
            v-for="detail in details"
            :key="detail.id"
            class="px-3.5 py-3 text-sm text-slate-600 bg-slate-50/50"
          >
            Giới thiệu <b class="text-slate-800">{{ detail.referee_phone }}</b>
            · còn <b class="text-slate-800">{{ numberToCurrency(detail.remaining) }}</b>
            / {{ numberToCurrency(detail.amount) }}
            · HSD {{ formatDateVN(detail.expires_at) }}<span
              v-if="detail.reserved_amount > 0"
            > · đang dùng {{ numberToCurrency(detail.reserved_amount) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ReferralCreditDetail, ReferralCreditSummary } from '~/type'

const props = defineProps<{
  summary: ReferralCreditSummary
  details: ReferralCreditDetail[]
}>()

const expanded = ref(false)

// balance = 0 và reserved_amount = 0 → thay thẻ bằng lời mời giới thiệu
const isEmpty = computed(() => props.summary.balance === 0 && props.summary.reserved_amount === 0)

const maxRatePercent = computed(() => Math.round((props.summary.max_rate || 0) * 100))

const showExpiryWarning = computed(
  () => !!props.summary.next_expires_at && (props.summary.next_expiring_amount || 0) > 0
)

// Tô màu cảnh báo khi phần sắp hết hạn còn ≤ 30 ngày
const expiringSoon = computed(
  () => !!props.summary.next_expires_at && daysUntil(props.summary.next_expires_at) <= 30
)
</script>
