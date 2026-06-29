<template>
  <UModal
    v-model:open="isOpen"
    :dismissible="!isLoading"
    title="Xác nhận hủy chuyến"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-muted">
          Bạn có chắc chắn muốn hủy chuyến này không? Vui lòng cho chúng tôi biết lý do để cải thiện dịch vụ.
        </p>

        <!-- Gợi ý lý do hủy -->
        <div class="space-y-1.5">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Lý do hủy</p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="reason in cancelReasons"
              :key="reason"
              size="xs"
              :color="selectedReason === reason ? 'primary' : 'neutral'"
              :variant="selectedReason === reason ? 'solid' : 'outline'"
              class="text-xs"
              @click="selectReason(reason)"
            >
              {{ reason }}
            </UButton>
          </div>
        </div>

        <!-- Ghi chú bổ sung -->
        <UFormField label="" size="sm">
          <template #label>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Ghi chú thêm (không bắt buộc)</span>
          </template>
          <UTextarea
            v-model="cancelNote"
            placeholder="Nhập lý do hoặc ghi chú thêm..."
            :rows="3"
            :maxrows="5"
            autoresize
            :maxlength="300"
            class="w-full"
            :ui="{ base: 'text-sm' }"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        label="Thoát"
        :disabled="isLoading"
        @click="close"
      />
      <UButton
        color="error"
        label="Hủy chuyến"
        :loading="isLoading"
        :disabled="!finalNote"
        @click="confirm"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
interface Props {
  modelValue: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', note: string): void
  (e: 'cancel'): void
}>()

const cancelReasons = [
  'Thay đổi lịch trình',
  'Đặt nhầm điểm đón/trả',
  'Tìm được phương tiện khác',
  'Giá không phù hợp',
  'Lý do cá nhân',
]

const selectedReason = ref('')
const cancelNote = ref('')

const finalNote = computed(() => {
  const parts: string[] = []
  if (selectedReason.value) parts.push(selectedReason.value)
  if (cancelNote.value.trim()) parts.push(cancelNote.value.trim())
  return parts.join(' - ')
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function selectReason(reason: string) {
  selectedReason.value = selectedReason.value === reason ? '' : reason
}

function close() {
  emit('update:modelValue', false)
  emit('cancel')
  resetForm()
}

function confirm() {
  emit('confirm', finalNote.value)
}

function resetForm() {
  selectedReason.value = ''
  cancelNote.value = ''
}

watch(isOpen, (val) => {
  if (!val) resetForm()
})
</script>
