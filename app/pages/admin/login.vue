<template>
  <ClientOnly>
    <div class="w-screen h-screen grid grid-cols-1 md:grid-cols-2">
      <div class="fixed top-0 flex gap-3 left-0 p-2 z-10">
        <UColorModeButton variant="outline" />
      </div>

      <div class="w-full h-screen flex flex-col justify-center items-center px-6">
        <AppLogo class="h-10 w-auto mb-4" />
        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-primary" />
          <h1 class="text-xl font-bold">Đăng nhập Quản trị viên</h1>
        </div>
        <p class="text-muted mt-1 text-sm">
          Khu vực dành cho nhân viên HappyTrip
        </p>

        <div class="w-full max-w-102.5">
          <div class="flex flex-col gap-5 pt-6">
            <UFormField label="Số điện thoại" name="phone" class="w-full">
              <UInput
                v-model="form.phone"
                type="tel"
                placeholder="0912 345 678"
                leading-icon="i-lucide-phone"
                class="w-full"
                size="md"
                :disabled="loading"
                @keyup.enter="handleLogin"
              />
            </UFormField>

            <UFormField label="Mật khẩu" name="password" class="w-full">
              <UInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Nhập mật khẩu"
                leading-icon="i-lucide-lock"
                :trailing-icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :ui="{ trailing: 'pointer-events-auto cursor-pointer' }"
                class="w-full"
                size="md"
                :disabled="loading"
                @keyup.enter="handleLogin"
                @update:trailing-icon-click="showPassword = !showPassword"
              >
                <template #trailing>
                  <UButton
                    variant="link"
                    color="neutral"
                    size="sm"
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    @click="showPassword = !showPassword"
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
              :disabled="!form.phone || !form.password"
              label="Đăng nhập"
              icon="i-lucide-log-in"
              @click="handleLogin"
            />
          </div>

          <div class="text-center mt-6 text-xs text-muted">
            <UIcon name="i-lucide-shield-check" class="inline w-3.5 h-3.5 mr-1" />
            Bảo mật & Tin cậy — HappyTrip Admin
          </div>
        </div>
      </div>

      <div class="hidden md:block h-screen w-full">
        <div class="w-full h-full relative">
          <AuthBackground direction="right" :speed="1" :square-size="40" :border-color="primaryColor"
            :hover-fill-color="primaryColor"
          />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
definePageMeta({ layout: false })

// Chặn search engine index page admin
useSeoMeta({
  title: 'Đăng nhập quản trị',
  robots: 'noindex, nofollow'
})

const { setAdminAuth } = useAdminAuth()
const { adminService } = await import('~/services/admin.service')

const form = reactive({ phone: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

async function handleLogin() {
  if (!form.phone || !form.password) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await adminService.login(form.phone, form.password)
    setAdminAuth(res.accessToken, res.user)
    navigateTo('/policy')
  } catch {
    errorMsg.value = 'Số điện thoại hoặc mật khẩu không đúng.'
  } finally {
    loading.value = false
  }
}

const primaryColor = computed(() => {
  if (import.meta.server) return '#00DC82'
  return getComputedStyle(document.documentElement).getPropertyValue('--ui-primary').trim() || '#00DC82'
})
</script>
