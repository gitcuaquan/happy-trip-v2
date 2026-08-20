<template>
  <ClientOnly>
    <div class="w-screen min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      <div class="fixed top-0 left-0 p-3 z-10">
        <UButton
          to="/"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          label="Trang chủ"
          size="sm"
        />
      </div>

      <div class="w-full min-h-screen flex flex-col justify-center items-center px-6 py-12">
        <AppLogo class="h-10 w-auto mb-4" />
        <div class="flex items-center gap-2 mb-2">
          <h1 class="text-xl font-bold text-slate-900 dark:text-white">Đăng nhập quản trị</h1>
          <UBadge color="primary" variant="subtle" size="sm" class="font-bold">ADMIN</UBadge>
        </div>
        <p class="text-muted mt-1 text-sm text-center">
          Hệ thống quản lý nội dung và bài viết HappyTrip
        </p>

        <UForm
          :schema="schema"
          :state="form"
          class="w-full max-w-sm flex flex-col gap-5 pt-6"
          @submit="onSubmit"
        >
          <UFormField label="Tên đăng nhập / SĐT" name="username" required>
            <UInput
              v-model="form.username"
              placeholder="manhquan2k hoặc số điện thoại"
              leading-icon="i-lucide-user"
              class="w-full"
              size="md"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Mật khẩu" name="password" required>
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Nhập mật khẩu quản trị"
              leading-icon="i-lucide-lock"
              class="w-full"
              size="md"
              :disabled="loading"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                />
              </template>
            </UInput>
          </UFormField>

          <UAlert
            v-if="errorMsg"
            icon="i-lucide-circle-x"
            color="error"
            variant="subtle"
            :description="errorMsg"
          />

          <UButton
            type="submit"
            class="w-full justify-center font-bold"
            :loading="loading"
            label="Đăng Nhập Quản Trị"
            icon="i-lucide-log-in"
            size="md"
            color="primary"
          />

          <div class="text-center mt-2 text-xs text-muted">
            <UIcon name="i-lucide-shield-check" class="inline w-3.5 h-3.5 mr-1 text-emerald-500" />
            Bảo mật & Mã hóa dữ liệu — HappyTrip Admin
          </div>
        </UForm>
      </div>

      <div class="hidden md:block min-h-screen w-full bg-primary/10">
        <Background />
      </div>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'
import Background from '~/components/auth/background.vue'
import { adminService } from '../../services/admin.service'

definePageMeta({ layout: false })

const { setAdminAuth } = useAuth()

const schema = z.object({
  username: z
    .string()
    .min(1, 'Vui lòng nhập tên đăng nhập hoặc số điện thoại'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu'),
})

type Schema = z.infer<typeof schema>

const form = reactive<Schema>({ username: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit(_e: FormSubmitEvent<Schema>) {
  loading.value = true
  errorMsg.value = ''
  try {
    const { token, admin } = await adminService.login(form.username, form.password)
    setAdminAuth(token, admin)
    await navigateTo('/admin/blog')
  } catch (err: any) {
    errorMsg.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Tài khoản hoặc mật khẩu không chính xác'
  } finally {
    loading.value = false
  }
}
</script>
