<template>
  <ClientOnly>
    <div class="w-screen h-screen grid grid-cols-1 md:grid-cols-2">
      <div class="fixed top-0 flex gap-3 left-0 p-2 z-10">
        <UColorModeButton variant="outline" />
      </div>

      <div class="w-full h-screen flex flex-col justify-center items-center px-6">
        <AppLogo class="h-10 w-auto mb-4" />
        <h1 class="text-xl font-bold">Chào mừng bạn đến HappyTrip</h1>
        <p class="text-muted mt-3 text-sm">
          {{ otpSent ? `Mã đã gửi về ${form.phone}` : 'Nhập số điện thoại để nhận mã OTP' }}
        </p>

        <div class="w-full max-w-102.5">
          <!-- Step 1: Nhập SDT & Gửi OTP -->
          <div v-if="!otpSent" class="flex flex-col gap-6 pt-6">
            <UFormField label="Số điện thoại" name="phone" class="w-full">
              <UInput 
                v-model="form.phone" 
                type="tel" 
                placeholder="0912 345 678" 
                leading-icon="i-lucide-phone"
                class="w-full" 
                size="md"
                :disabled="loading"
              />
            </UFormField>

            <UAlert 
              v-if="errorMsg" 
              icon="i-lucide-circle-x" 
              :ui="{ icon: 'size-10' }" 
              class="items-center"
              color="error" 
              variant="subtle" 
              :description="errorMsg" 
            />

            <UButton 
              class="w-full justify-center" 
              :loading="loading"
              :disabled="!form.phone"
              label="Gửi mã OTP"
              icon="i-lucide-send"
              @click="handleSendOtp"
            />
          </div>

          <!-- Step 2: Nhập OTP & Xác nhận -->
          <Transition name="slide-down">
            <div v-if="otpSent" class="flex flex-col gap-6 pt-6">
              <div class="flex justify-center">
                <UPinInput v-model="otpCode" otp :length="6" size="md" />
              </div>

              <UAlert 
                v-if="errorMsg" 
                icon="i-lucide-circle-x" 
                :ui="{ icon: 'size-10' }" 
                class="items-center"
                color="error" 
                variant="subtle" 
                :description="errorMsg" 
              />

              <UButton 
                class="w-full justify-center" 
                :loading="loading"
                :disabled="otpCode.length < 6"
                label="Xác nhận đăng nhập"
                icon="i-lucide-log-in"
                @click="handleConfirmOtp"
              />

              <!-- Gửi lại OTP & Đổi số -->
              <div class="flex items-center justify-center gap-2 text-xs text-muted">
                <button 
                  type="button" 
                  class="text-primary font-semibold disabled:opacity-40"
                  :disabled="resendCooldown > 0" 
                  @click="handleResend"
                >
                  {{ resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại' }}
                </button>
                <span>·</span>
                <button 
                  type="button" 
                  class="text-muted underline" 
                  @click="resetForm"
                >
                  Đổi số
                </button>
              </div>
            </div>
          </Transition>

          <p class="text-center text-sm text-muted mt-6">
            Cần hỗ trợ?
            <a href="tel:0972970000" class="text-primary font-semibold">Liên hệ 0972 97 0000</a>
          </p>
          <div class="text-center mt-4 text-xs text-muted">
            <UIcon name="i-lucide-shield-check" class="inline w-3.5 h-3.5 mr-1" />
            Bảo mật & Tin cậy — HappyTrip v2
          </div>
        </div>
      </div>

      <div class="hidden md:block h-screen w-full">
        <div class="w-full h-full relative">
          <AuthBackground direction="right" :speed="1" :squareSize="40" :borderColor="primaryColor"
            :hoverFillColor="primaryColor" />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
definePageMeta({ layout: false })

const { setAuth } = useAuth()
const { customerService } = await import('~/services/customer.service')

const form = reactive({ phone: '' })
const otpCode = ref<string[]>([])
const loading = ref(false)
const errorMsg = ref('')
const otpSent = ref(false)
const resendCooldown = ref(0)

async function handleSendOtp() {
  if (!form.phone) return
  loading.value = true
  errorMsg.value = ''
  try {
    // Gửi OTP qua API login (chỉ cần phone)
    await customerService.sendOtpLogin(form.phone)
    otpSent.value = true
    startCooldown()
  } catch {
    errorMsg.value = 'Không thể gửi OTP. Vui lòng kiểm tra lại số điện thoại.'
  } finally {
    loading.value = false
  }
}

async function handleConfirmOtp() {
  if (otpCode.value.length < 6) return
  loading.value = true
  errorMsg.value = ''
  try {
    // Xác nhận OTP
    const res = await customerService.confirmOtpLogin(otpCode.value.join(''))
    setAuth(res.token, res.customer)
    navigateTo('/')
  } catch {
    errorMsg.value = 'Mã OTP không đúng hoặc đã hết hạn.'
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  if (resendCooldown.value > 0) return
  try {
    await customerService.sendOtpLogin(form.phone)
    otpCode.value = []
    startCooldown()
  } catch {
    errorMsg.value = 'Không thể gửi lại OTP.'
  }
}

function resetForm() {
  otpSent.value = false
  otpCode.value = []
  errorMsg.value = ''
  resendCooldown.value = 0
  form.phone = ''
}

function startCooldown() {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(interval)
  }, 1000)
}

const primaryColor = computed(() => {
  if (import.meta.server) return '#00DC82'
  return getComputedStyle(document.documentElement).getPropertyValue('--ui-primary').trim() || '#00DC82'
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>