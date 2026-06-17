<template>
  <UModal
    v-model:open="isOpen"
    :dismissible="!loading && allowDismiss"
    :close="allowDismiss"
    title="Tạo mật khẩu"
    description="Đặt mật khẩu để lần sau đăng nhập nhanh hơn, không cần OTP."
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Mật khẩu mới" name="new_password">
          <UInput
            v-model="form.password"
            :type="show ? 'text' : 'password'"
            placeholder="Tối thiểu 6 ký tự"
            leading-icon="i-lucide-lock"
            class="w-full"
            :disabled="loading"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                :padded="false"
                @click="show = !show"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="Nhập lại mật khẩu" name="confirm_password">
          <UInput
            v-model="form.confirm"
            :type="show ? 'text' : 'password'"
            placeholder="Nhập lại mật khẩu"
            leading-icon="i-lucide-lock-keyhole"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>

        <UAlert
          v-if="errorMsg"
          icon="i-lucide-circle-x"
          color="error"
          variant="subtle"
          :description="errorMsg"
          :ui="{ icon: 'size-5' }"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          v-if="allowDismiss"
          color="neutral"
          variant="outline"
          label="Để sau"
          :disabled="loading"
          @click="close"
        />
        <UButton
          color="primary"
          label="Tạo mật khẩu"
          icon="i-lucide-check"
          :loading="loading"
          :disabled="!canSubmit"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { customerService } from '~/services/customer.service'

interface Props {
  modelValue: boolean
  allowDismiss?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  allowDismiss: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const { token, syncMe } = useAuth()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({ password: '', confirm: '' })
const show = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const canSubmit = computed(
  () => form.password.length >= 6 && form.confirm.length >= 6 && !loading.value
)

watch(isOpen, (v) => {
  if (!v) {
    form.password = ''
    form.confirm = ''
    errorMsg.value = ''
    show.value = false
  }
})

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  errorMsg.value = ''
  if (form.password.length < 6) {
    errorMsg.value = 'Mật khẩu tối thiểu 6 ký tự.'
    return
  }
  if (form.password !== form.confirm) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp.'
    return
  }
  if (!token.value) {
    errorMsg.value = 'Bạn cần đăng nhập trước.'
    return
  }

  loading.value = true
  try {
    await customerService.createPassword(token.value, form.password)
    await syncMe()
    emit('success')
    emit('update:modelValue', false)
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Không thể tạo mật khẩu. Thử lại sau.'
  } finally {
    loading.value = false
  }
}
</script>
