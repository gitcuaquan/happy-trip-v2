
<template>
  <ClientOnly>
    <div class="w-screen h-screen grid grid-cols-1 md:grid-cols-2">
      <!-- Top-left controls -->
      <div class="fixed top-0 flex gap-3 left-0 p-2 z-10">
        <UColorModeButton variant="outline" />
      </div>

      <!-- Left: Form -->
      <div class="w-full h-screen flex flex-col justify-center items-center px-6">
        <AppLogo class="h-10 w-auto mb-4" />
        <h1 class="text-xl font-bold">Chào mừng Đối tác HappyTrip</h1>
        <p class="text-muted mt-3 text-sm">Đăng nhập để bắt đầu nhận cuốc</p>

        <div class="w-full max-w-102.5">
          <UForm
            :state="form"
            class="flex flex-col gap-6 pt-6"
           
          >
            <UFormField label="Số điện thoại" name="phone" class="w-full">
              <UInput
                v-model="form.phone"
                type="tel"
                placeholder="0912 345 678"
                leading-icon="i-lucide-phone"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Mật khẩu" name="password" class="w-full">
              <UInput
                v-model="form.password"
                :type="showPw ? 'text' : 'password'"
                placeholder="••••••••"
                leading-icon="i-lucide-lock"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    :icon="showPw ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    size="sm"
                    @click="showPw = !showPw"
                  />
                </template>
              </UInput>
            </UFormField>

            <UAlert
           
              icon="i-lucide-circle-x"
              :ui="{ icon: 'size-10' }"
              class="items-center"
              color="error"
              variant="subtle"
             
            />

            <UButton
              type="submit"
             
              class="w-full justify-center"
            >
              Đăng nhập
            </UButton>
          </UForm>

          <p class="text-center text-sm text-muted mt-6">
            Chưa có tài khoản?
            <a href="tel:0972970000" class="text-primary font-semibold">
              Liên hệ 0972 97 0000
            </a>
          </p>

          <div class="text-center mt-4 text-xs text-muted">
            <UIcon name="i-lucide-shield-check" class="inline w-3.5 h-3.5 mr-1" />
            Bảo mật & Tin cậy — HappyTrip Partner v2
          </div>
        </div>
      </div>

      <!-- Right: Animated background -->
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

  </ClientOnly>
</template>

<script lang="ts" setup>


definePageMeta({ layout: false, middleware: 'auth-driver' })




const form = reactive({ phone: '', password: '' })
const showPw = ref(false)

const primaryColor = computed(() => {
  if (import.meta.server) return '#00DC82'
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue('--ui-primary')
      .trim() || '#00DC82'
  )
})


</script>