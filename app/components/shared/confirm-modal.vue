<template>
  <UModal
    v-model:open="isOpen"
    :dismissible="!isLoading"
    :ui="{ footer: 'justify-end' }"
    :title="title"
  >

    <!-- Nội dung -->
    <template #body>
      <p class="text-center text-sm text-muted">{{ message }}</p>
    </template>

    <!-- Actions -->
    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        label="Thoát"
        :disabled="isLoading"
        @click="close"
      />
      <UButton
        :color="confirmColor"
        :variant="confirmVariant"
        :label="confirmLabel"
        :loading="isLoading"
        @click="confirm"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmColor?: 'error' | 'success' | 'warning' | 'info'
  confirmVariant?: 'solid' | 'outline' | 'soft'
  icon?: string
  iconColor?: string
  iconBgColor?: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Xác nhận',
  confirmColor: 'error',
  confirmVariant: 'solid',
  icon: 'i-lucide-alert-triangle',
  iconColor: 'text-red-500',
  iconBgColor: 'bg-red-50',
  isLoading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  emit('confirm')
}
</script>