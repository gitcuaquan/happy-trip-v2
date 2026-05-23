<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:w-120 overflow-hidden p-0', body: 'p-0' }">
    <template #content>
      <div>
        <!-- Header -->
        <div class="bg-primary px-4 pt-3 pb-2 sm:px-8 sm:pt-5 sm:pb-4 text-center">
          <p class="text-white font-semibold text-sm sm:text-base">
            Nhập mã OTP
          </p>
          <p class="text-white/75 text-xs sm:text-sm sm:mt-1">
            Mã đã gửi đến <span class="font-semibold">{{ phone }}</span>
          </p>
        </div>

        <!-- Content -->
        <div class="p-5 sm:px-8 sm:py-6 flex flex-col gap-3.5">
          <div class="flex justify-center">
            <UPinInput v-model="otpCode" otp :length="6" size="md" />
          </div>

          <UAlert 
            v-if="error" 
            color="error" 
            variant="soft" 
            :description="error" 
            icon="i-lucide-circle-x" 
          />

          <UButton 
            block 
            color="primary" 
            icon="i-lucide-check-circle" 
            label="Xác nhận OTP" 
            :loading="loading"
            :disabled="otpCode.length < 6" 
            @click="handleConfirm" 
          />

          <p class="text-center text-xs text-muted">
            Không nhận được mã?
            <button
              class="text-primary font-semibold disabled:opacity-50"
              :disabled="resendCooldown > 0 || resendLoading"
              @click="handleResend"
            >
              {{
                resendLoading ? 'Đang gửi...' :
                resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại'
              }}
            </button>
          </p>

          <div class="flex items-center gap-2">
            <div class="flex-1 h-px bg-slate-100" />
            <span class="text-[10px] text-slate-400">bảo mật & an toàn</span>
            <div class="flex-1 h-px bg-slate-100" />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  phone: string
  loading?: boolean
  error?: string
  resendLoading?: boolean
}>()

const emit = defineEmits<{
  confirm: [otp: string]
  resend: []
}>()

const open = defineModel<boolean>({ default: false })

const otpCode = ref<string[]>([])
const resendCooldown = ref(0)

watch(open, (val) => {
  if (val) {
    otpCode.value = []
    startResendCooldown()
  }
})

function handleConfirm() {
  if (otpCode.value.length < 6 || props.loading) return
  emit('confirm', otpCode.value.join(''))
}

function handleResend() {
  if (resendCooldown.value > 0 || props.resendLoading) return
  emit('resend')
  startResendCooldown()
}

function startResendCooldown() {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(interval)
  }, 1000)
}
</script>