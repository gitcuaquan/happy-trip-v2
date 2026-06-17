<template>
  <ClientOnly>
    <div class="w-screen h-screen grid grid-cols-1 md:grid-cols-2">
      <div class="fixed top-0 flex gap-3 left-0 p-2 z-10">
        <UColorModeButton variant="outline" />
      </div>

      <div class="w-full h-screen flex flex-col justify-center items-center px-6">
        <AppLogo class="h-10 w-auto mb-4" />
        <h1 class="text-xl font-bold">Chào mừng bạn đến HappyTrip</h1>
        <p class="text-muted mt-3 text-sm text-center">
          {{ subtitle }}
        </p>

        <div class="w-full max-w-102.5">
          <!-- STEP 1: Nhập số điện thoại -->
          <div v-if="step === 'phone'" class="flex flex-col gap-6 pt-6">
            <UFormField label="Số điện thoại" name="phone" class="w-full">
              <UInput
                v-model="form.phone"
                type="tel"
                placeholder="0912 345 678"
                leading-icon="i-lucide-phone"
                class="w-full"
                size="md"
                :disabled="loading"
                @keyup.enter="handleCheckPhone"
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
              label="Tiếp tục"
              icon="i-lucide-arrow-right"
              @click="handleCheckPhone"
            />
          </div>

          <!-- STEP 2A: Nhập mật khẩu (has_password = true) -->
          <Transition name="slide-down">
            <div v-if="step === 'password'" class="flex flex-col gap-6 pt-6">
              <UFormField label="Mật khẩu" name="password" class="w-full">
                <UInput
                  v-model="form.password"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="Nhập mật khẩu"
                  leading-icon="i-lucide-lock"
                  class="w-full"
                  size="md"
                  :disabled="loading"
                  @keyup.enter="handleLogin"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="showPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      :aria-label="showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                      :padded="false"
                      @click="showPwd = !showPwd"
                    />
                  </template>
                </UInput>
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
                :disabled="!form.password"
                label="Đăng nhập"
                icon="i-lucide-log-in"
                @click="handleLogin"
              />

              <div class="flex items-center justify-center gap-2 text-xs text-muted">
                <button type="button" class="text-primary font-semibold" @click="useOtpInstead">
                  Đăng nhập bằng OTP
                </button>
                <span>·</span>
                <button type="button" class="text-muted underline" @click="resetForm">
                  Đổi số
                </button>
              </div>
            </div>
          </Transition>

          <!-- STEP 2B: Nhập OTP (has_password = false hoặc fallback) -->
          <Transition name="slide-down">
            <div v-if="step === 'otp'" class="flex flex-col gap-6 pt-6">
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
                label="Xác nhận"
                icon="i-lucide-log-in"
                @click="handleVerifyOtp"
              />

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
                <button type="button" class="text-muted underline" @click="resetForm">
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
          <AuthBackground
            direction="right"
            :speed="1"
            :squareSize="40"
            :borderColor="primaryColor"
            :hoverFillColor="primaryColor"
          />
        </div>
      </div>
    </div>

    <!-- Modal tạo mật khẩu sau khi verify OTP của tài khoản chưa có pwd -->
    <SharedCreatePasswordModal
      v-model="showCreatePwd"
      :allow-dismiss="true"
      @success="onCreatedPassword"
      @update:model-value="onCreatePwdClose"
    />
  </ClientOnly>
</template>

<script lang="ts" setup>
definePageMeta({ layout: false })

import { customerService } from '~/services/customer.service'

const { setAuth } = useAuth()

type Step = 'phone' | 'password' | 'otp'

const step = ref<Step>('phone')
const form = reactive({ phone: '', password: '' })
const otpCode = ref<string[]>([])
const showPwd = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const resendCooldown = ref(0)
const showCreatePwd = ref(false)
const pendingRedirect = ref(false)

const subtitle = computed(() => {
  switch (step.value) {
    case 'phone':
      return 'Nhập số điện thoại để tiếp tục'
    case 'password':
      return `Đăng nhập với số ${form.phone}`
    case 'otp':
      return `Mã đã gửi về ${form.phone}`
    default:
      return ''
  }
})

async function handleCheckPhone() {
  if (!form.phone) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await customerService.checkPhone(form.phone)
    if (!res.exists) {
      errorMsg.value = 'Số điện thoại chưa được đăng ký. Vui lòng đặt xe trước để tạo tài khoản.'
      return
    }
    if (res.has_password) {
      step.value = 'password'
    } else {
      await customerService.sendLoginOtp(form.phone)
      step.value = 'otp'
      startCooldown()
    }
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Không thể kiểm tra số điện thoại. Thử lại sau.'
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  if (!form.password) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await customerService.login(form.phone, form.password)
    // login response trả về accessToken + thông tin user
    const customer = {
      id: res.id,
      full_name: res.fullName,
      phone: res.phone,
      created_at: '',
      has_password: true,
    }
    setAuth(res.accessToken, customer)
    navigateTo('/')
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Sai mật khẩu hoặc tài khoản không tồn tại.'
  } finally {
    loading.value = false
  }
}

async function handleVerifyOtp() {
  if (otpCode.value.length < 6) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await customerService.verifyLoginOtp(form.phone, otpCode.value.join(''))
    setAuth(res.token, res.customer)
    // Tài khoản chưa có pwd -> mở modal tạo pwd, redirect sau khi đóng
    if (res.customer && res.customer.has_password === false) {
      pendingRedirect.value = true
      showCreatePwd.value = true
    } else {
      navigateTo('/')
    }
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.'
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  if (resendCooldown.value > 0) return
  try {
    await customerService.sendLoginOtp(form.phone)
    otpCode.value = []
    startCooldown()
  } catch {
    errorMsg.value = 'Không thể gửi lại OTP.'
  }
}

async function useOtpInstead() {
  loading.value = true
  errorMsg.value = ''
  try {
    await customerService.sendLoginOtp(form.phone)
    step.value = 'otp'
    startCooldown()
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Không thể gửi OTP.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  step.value = 'phone'
  otpCode.value = []
  form.password = ''
  errorMsg.value = ''
  resendCooldown.value = 0
  showPwd.value = false
}

function startCooldown() {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(interval)
  }, 1000)
}

function onCreatedPassword() {
  navigateTo('/')
}

function onCreatePwdClose(value: boolean) {
  if (!value && pendingRedirect.value) {
    pendingRedirect.value = false
    navigateTo('/')
  }
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
