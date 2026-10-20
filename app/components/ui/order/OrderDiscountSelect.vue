<template>
  <div
    v-if="options && options.length > 0"
    class="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="p-1 bg-primary/10 rounded-md text-primary">
          <UIcon
            name="i-lucide-ticket-percent"
            class="size-4"
          />
        </div>
        <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Ưu đãi chuyến đi</span>
      </div>
      <span
        v-if="selectedAmount > 0"
        class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
      >
        Giảm {{ numberToCurrency(selectedAmount) }}
      </span>
    </div>

    <!-- Options List -->
    <div class="space-y-2">
      <!-- 1. Tùy chọn: Không dùng ưu đãi -->
      <label
        class="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all duration-150"
        :class="[
          selectedKey === 'none'
            ? 'border-primary bg-white shadow-xs'
            : 'border-slate-200/80 bg-white/70 hover:bg-white'
        ]"
      >
        <input
          type="radio"
          name="discount_option"
          value="none"
          :checked="selectedKey === 'none'"
          class="mt-1 text-primary focus:ring-primary size-4"
          @change="chooseNone"
        >
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-800">Không dùng ưu đãi</p>
        </div>
      </label>

      <!-- 2. Danh sách ưu đãi từ server -->
      <div
        v-for="(opt, idx) in options"
        :key="getOptionKey(opt, idx)"
        class="rounded-lg border transition-all duration-150 overflow-hidden"
        :class="[
          selectedKey === getOptionKey(opt, idx)
            ? 'border-primary bg-white shadow-xs'
            : (opt.eligible || opt.requires_referrer)
              ? 'border-slate-200/80 bg-white/70 hover:bg-white'
              : 'border-slate-200/50 bg-slate-50/70 opacity-90'
        ]"
      >
        <label
          class="flex items-start gap-2.5 p-2.5 cursor-pointer"
          :class="{ 'cursor-not-allowed': !opt.eligible && !opt.requires_referrer }"
        >
          <input
            type="radio"
            name="discount_option"
            :value="getOptionKey(opt, idx)"
            :checked="selectedKey === getOptionKey(opt, idx)"
            :disabled="!opt.eligible && !opt.requires_referrer"
            class="mt-1 text-primary focus:ring-primary size-4 disabled:opacity-40"
            @change="chooseOption(opt, idx)"
          >
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline justify-between gap-2">
              <span class="text-xs font-bold text-slate-800 leading-snug">
                {{ opt.label }}
              </span>
              <span
                v-if="opt.amount > 0"
                class="text-xs font-black text-emerald-600 shrink-0"
              >
                −{{ numberToCurrency(opt.amount) }}
              </span>
              <span
                v-else-if="opt.requires_referrer && !opt.eligible"
                class="text-[11px] font-semibold text-primary/80 shrink-0"
              >
                −50.000đ (nhập SĐT)
              </span>
            </div>

            <!-- Campaign name hoặc Balance info -->
            <p
              v-if="opt.campaign_name"
              class="text-[11px] text-slate-500 mt-0.5"
            >
              {{ opt.campaign_name }}
            </p>
            <p
              v-if="opt.available_balance"
              class="text-[11px] text-slate-500 mt-0.5"
            >
              Số dư: {{ numberToCurrency(opt.available_balance) }} ({{ opt.credit_count || 1 }} lượt)
            </p>

            <!-- Hạn sử dụng -->
            <p
              v-if="opt.expires_at"
              class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-3 shrink-0"
              />
              HSD: {{ formatDate(opt.expires_at) }}
            </p>

            <!-- Khách mới cần nhập SĐT người giới thiệu (chỉ hiển thị khi click chọn mục này hoặc đã áp dụng) -->
            <Transition name="fade">
              <div
                v-if="opt.requires_referrer && (selectedKey === getOptionKey(opt, idx) || opt.eligible)"
                class="mt-2 pt-2 border-t border-slate-100"
                @click.stop
              >
                <div class="flex items-center gap-2">
                  <UInput
                    ref="referrerInputRef"
                    v-model="referrerPhoneInput"
                    placeholder="SĐT người giới thiệu (09...)"
                    type="tel"
                    size="xs"
                    class="flex-1"
                    :disabled="referrerLoading"
                    @keyup.enter="handleApplyReferrer"
                  />
                  <UButton
                    size="xs"
                    color="primary"
                    :loading="referrerLoading"
                    :disabled="!canApplyReferrer"
                    label="Áp dụng"
                    @click="handleApplyReferrer"
                  />
                </div>

                <!-- Reason alert khi chưa đủ điều kiện -->
                <div
                  v-if="!opt.eligible && (opt.reason || localReferrerError)"
                  class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md p-1.5 mt-1.5 flex items-start gap-1"
                >
                  <UIcon
                    name="i-lucide-alert-triangle"
                    class="size-3.5 text-amber-500 shrink-0 mt-0.5"
                  />
                  <span>{{ localReferrerError || opt.reason }}</span>
                </div>

                <!-- Success alert khi đã áp dụng thành công -->
                <div
                  v-else-if="opt.eligible"
                  class="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-md p-1.5 mt-1.5 flex items-center gap-1"
                >
                  <UIcon
                    name="i-lucide-check-circle"
                    class="size-3.5 text-emerald-500 shrink-0"
                  />
                  <span>Đã áp dụng người giới thiệu: {{ appliedReferrerPhone }}</span>
                </div>
              </div>
            </Transition>

            <!-- Reason khi không đủ điều kiện cho voucher/credit -->
            <div
              v-if="!opt.eligible && opt.reason && !opt.requires_referrer"
              class="text-[11px] text-slate-500 bg-slate-100 rounded p-1 mt-1 flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-info"
                class="size-3 text-slate-400 shrink-0"
              />
              <span>{{ opt.reason }}</span>
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- Pricing Breakdown Summary -->
    <div class="pt-2.5 border-t border-slate-200/70 text-xs space-y-1">
      <div class="flex justify-between text-slate-600">
        <span>Giá chuyến:</span>
        <span class="font-medium text-slate-800">{{ numberToCurrency(priceGuestAfter) }}</span>
      </div>
      <div
        v-if="selectedAmount > 0"
        class="flex justify-between text-emerald-600"
      >
        <span>Ưu đãi:</span>
        <span class="font-bold">−{{ numberToCurrency(selectedAmount) }}</span>
      </div>
      <div class="flex justify-between items-center pt-1 text-slate-900 border-t border-dashed border-slate-200">
        <span class="font-bold text-slate-700">Thanh toán cho tài xế:</span>
        <span class="text-sm font-black text-primary">{{ numberToCurrency(customerPay) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DiscountOption, OrderDiscountInput } from '~/type'

const props = defineProps<{
  options: DiscountOption[]
  priceGuestAfter: number
  modelValue?: OrderDiscountInput | null
  referrerLoading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: OrderDiscountInput | null]
  'applyReferrer': [phone: string]
}>()

const referrerPhoneInput = ref('')
const appliedReferrerPhone = ref('')
const localReferrerError = ref('')
const selectedKey = ref<string>('none')
const referrerInputRef = ref()

// Tạo key định danh cho từng option
function getOptionKey(opt: DiscountOption, idx: number): string {
  if (opt.type === 'Voucher') return `voucher-${opt.campaign_id || idx}`
  if (opt.type === 'ReferralCredit') return 'referral-credit'
  if (opt.type === 'ReferralWelcome') return 'referral-welcome'
  return `opt-${idx}`
}

const canApplyReferrer = computed(() => {
  const p = referrerPhoneInput.value.trim()
  return /^0\d{9}$/.test(p)
})

// Tính số tiền giảm của option đang chọn
const selectedAmount = computed(() => {
  if (selectedKey.value === 'none') return 0
  const found = props.options.find((opt, idx) => getOptionKey(opt, idx) === selectedKey.value)
  if (!found || !found.eligible) return 0
  return found.amount || 0
})

// Số tiền khách phải trả cho tài xế
const customerPay = computed(() => {
  return Math.max(0, props.priceGuestAfter - selectedAmount.value)
})

function chooseNone() {
  selectedKey.value = 'none'
  emit('update:modelValue', { type: null })
}

function chooseOption(opt: DiscountOption, idx: number) {
  if (!opt.eligible && !opt.requires_referrer) return
  selectedKey.value = getOptionKey(opt, idx)

  if (opt.type === 'Voucher') {
    emit('update:modelValue', {
      type: 'Voucher',
      campaign_id: opt.campaign_id || ''
    })
  } else if (opt.type === 'ReferralCredit') {
    emit('update:modelValue', {
      type: 'ReferralCredit'
    })
  } else if (opt.type === 'ReferralWelcome') {
    if (opt.eligible) {
      emit('update:modelValue', {
        type: 'ReferralWelcome',
        referrer_phone: appliedReferrerPhone.value || referrerPhoneInput.value.trim()
      })
    } else {
      emit('update:modelValue', { type: null })
      nextTick(() => {
        const inputEl = referrerInputRef.value?.$el?.querySelector('input') || referrerInputRef.value?.input || referrerInputRef.value
        inputEl?.focus?.()
      })
    }
  }
}

function handleApplyReferrer() {
  const phone = referrerPhoneInput.value.trim()
  localReferrerError.value = ''
  if (!/^0\d{9}$/.test(phone)) {
    localReferrerError.value = 'Số điện thoại không hợp lệ (cần 10 chữ số bắt đầu bằng 0)'
    return
  }
  appliedReferrerPhone.value = phone
  emit('applyReferrer', phone)
}

// Watch khi options thay đổi (sau khi load hoặc apply referrer):
watch(
  () => props.options,
  (newOpts) => {
    // Nếu option ReferralWelcome vừa trở thành eligible sau khi apply referrer, tự động chọn nó
    const welcomeOpt = newOpts.find(o => o.type === 'ReferralWelcome')
    if (welcomeOpt?.eligible && appliedReferrerPhone.value) {
      const idx = newOpts.indexOf(welcomeOpt)
      chooseOption(welcomeOpt, idx)
      return
    }

    // Nếu option đang chọn không còn hợp lệ, reset về 'none'
    if (selectedKey.value !== 'none') {
      const current = newOpts.find((o, idx) => getOptionKey(o, idx) === selectedKey.value)
      if (!current || (!current.eligible && !current.requires_referrer)) {
        chooseNone()
      }
    }
  },
  { deep: true }
)

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return isoStr
  }
}
</script>
