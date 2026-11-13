<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useTripVoice, useVoiceModalState, VOICE_SCENARIOS } from '~/composables/useTripVoice'
import { useVoiceBookingSync } from '~/composables/useVoiceBookingSync'

interface Props {
  modelValue?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'order-created', order: any): void
}>()

const modalState = useVoiceModalState()
const isOpen = computed({
  get: () => {
    if (typeof props.modelValue === 'boolean') return props.modelValue
    return modalState.value
  },
  set: (val: boolean) => {
    modalState.value = val
    emit('update:modelValue', val)
  }
})

// Composables
const voice = useTripVoice()
const sync = useVoiceBookingSync({
  onManualFieldChange: (changes) => {
    voice.sendManualUpdate(changes)
  }
})

// Lắng nghe transcript giọng nói từ voice composable đẩy sang sync composable
voice.onSpeechDelta((delta) => {
  sync.applySpeech(delta)
})

// Trạng thái cục bộ modal
const isRequestingPermission = ref(false)
const showOrderConfirmStep = ref(false)
const isSubmittingOrder = ref(false)
const isEditingForm = ref(false)
const orderSuccessData = ref<any>(null)
const orderSubmitError = ref<string | null>(null)

// Form khách hàng bổ sung khi đặt đơn
const customerName = ref('')
const customerPhone = ref('')

// Tiêu đề & mô tả modal đồng bộ theo từng bước
const modalTitle = computed(() => {
  if (orderSuccessData.value) return 'Đặt xe thành công!'
  if (showOrderConfirmStep.value) return 'Xác nhận thông tin đặt chuyến'
  if (voice.permissionStatus.value !== 'granted') return 'Cấp quyền Microphone'
  return 'Trợ lý Giọng nói AI'
})

const modalDescription = computed(() => {
  if (orderSuccessData.value) return 'Chuyến đi của bạn đã được ghi nhận trên hệ thống Happy Trip.'
  if (showOrderConfirmStep.value) return 'Nhập số điện thoại để nhận thông tin tài xế và mã chuyến xe.'
  if (voice.permissionStatus.value !== 'granted') return 'Cho phép sử dụng micro để trò chuyện với AI Trip.'
  return 'Nói điểm đón, điểm đến và giờ đi tự nhiên để nhận báo giá tức thì.'
})

// Khi mở modal -> kiểm tra quyền
watch(isOpen, async (newVal) => {
  if (newVal) {
    orderSuccessData.value = null
    showOrderConfirmStep.value = false
    orderSubmitError.value = null
    isEditingForm.value = false

    // Kiểm tra trạng thái quyền
    const status = await voice.checkPermission()
    if (status === 'granted') {
      await voice.startSession()
    }
  } else {
    // Khi đóng modal -> dừng phiên đàm thoại và giải phóng micro
    voice.stopSession()
    voice.releaseMicrophone()
    sync.resetForm()
  }
})

// Yêu cầu quyền Microphone
const handleRequestPermission = async () => {
  isRequestingPermission.value = true
  try {
    const granted = await voice.requestPermissions()
    if (granted) {
      await voice.startSession()
    }
  } finally {
    isRequestingPermission.value = false
  }
}

// Bắt đầu thử nghiệm bằng kịch bản mẫu
const handleTestScenario = (scenarioId: string) => {
  voice.playScenario(scenarioId)
}

// Đặt lại hội thoại và biểu mẫu
const handleReset = () => {
  voice.stopSession()
  sync.resetForm()
  voice.startSession()
}

// Mở bước xác nhận đặt xe
const handleOpenOrderConfirm = () => {
  orderSubmitError.value = null
  customerName.value = sync.bookingForm.customer_name || 'Khách hàng'
  customerPhone.value = sync.bookingForm.customer_phone || ''
  showOrderConfirmStep.value = true
}

// Xác nhận đặt chuyến
const handleConfirmOrder = async () => {
  if (!customerPhone.value || customerPhone.value.trim().length < 9) {
    orderSubmitError.value = 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 chữ số)'
    return
  }

  isSubmittingOrder.value = true
  orderSubmitError.value = null

  try {
    sync.updateField('customer_name', customerName.value.trim())
    sync.updateField('customer_phone', customerPhone.value.trim())

    const result = await sync.createBookingOrder()
    orderSuccessData.value = result
    emit('order-created', result)
    voice.stopSession()
  } catch (err: any) {
    console.error('Lỗi khi đặt chuyến:', err)
    orderSubmitError.value = err?.message || 'Có lỗi xảy ra khi tạo đơn đặt xe. Vui lòng thử lại.'
  } finally {
    isSubmittingOrder.value = false
  }
}

// Đóng modal
const handleClose = () => {
  isOpen.value = false
  modalState.value = false
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    :description="modalDescription"
    :dismissible="!isSubmittingOrder"
    :ui="{
      content: 'w-[calc(100vw-1rem)] sm:max-w-2xl md:max-w-3xl max-h-[92dvh] flex flex-col rounded-2xl overflow-hidden',
      header: 'px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 shrink-0',
      body: 'p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-3.5'
    }"
  >
    <template #body>
      <!-- ========================================== -->
      <!-- BƯỚC 1: GATE BẮT BUỘC CẤP QUYỀN MICROPHONE -->
      <!-- ========================================== -->
      <div v-if="voice.permissionStatus.value !== 'granted'" class="text-center py-2 sm:py-3 space-y-4 sm:space-y-5">
        <!-- Biểu tượng Micro tròn cam chuẩn HappyTrip -->
        <div class="relative size-14 sm:size-16 mx-auto flex items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-60" />
          <div class="relative size-14 sm:size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/30 shadow-xs">
            <UIcon name="i-lucide-mic" class="size-7 sm:size-8" />
          </div>
        </div>

        <div class="space-y-1 max-w-md mx-auto">
          <h3 class="text-base sm:text-lg font-bold text-slate-900">
            Cho phép truy cập Microphone
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 leading-relaxed px-2">
            Trò chuyện trực tiếp bằng giọng nói với Trợ lý AI và nhận báo giá tự động cho chuyến đi của bạn.
          </p>
        </div>

        <!-- 3 Điểm nổi bật tinh gọn trên mobile -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4 space-y-2 text-left max-w-lg mx-auto">
          <div class="flex items-center gap-2.5 text-xs text-slate-700">
            <UIcon name="i-lucide-check-circle-2" class="size-4 text-primary shrink-0" />
            <span>Nói điểm đón, điểm đến và giờ đi tự nhiên bằng tiếng Việt</span>
          </div>
          <div class="flex items-center gap-2.5 text-xs text-slate-700">
            <UIcon name="i-lucide-check-circle-2" class="size-4 text-primary shrink-0" />
            <span>Tự động tính cước minh bạch 100% không phát sinh phụ phí</span>
          </div>
          <div class="flex items-center gap-2.5 text-xs text-slate-700">
            <UIcon name="i-lucide-check-circle-2" class="size-4 text-primary shrink-0" />
            <span>Bảo mật an toàn, chỉ thu âm trực tiếp trong phiên đàm thoại</span>
          </div>
        </div>

        <!-- Cảnh báo khi bị denied -->
        <UAlert
          v-if="voice.permissionStatus.value === 'denied'"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          title="Microphone đã bị chặn"
          description="Nhấn vào biểu tượng Ổ khóa 🔒 trên thanh địa chỉ URL, chuyển Microphone sang 'Cho phép' và bấm Thử lại."
        />

        <!-- Nút hành động -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <UButton
            color="primary"
            size="lg"
            icon="i-lucide-mic"
            :loading="isRequestingPermission"
            :label="voice.permissionStatus.value === 'denied' ? 'Thử lại cấp quyền' : 'Cấp quyền Micro & Bắt đầu'"
            class="w-full sm:w-auto font-bold px-6 shadow-xs"
            @click="handleRequestPermission"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="md"
            label="Đóng"
            class="w-full sm:w-auto text-slate-500"
            @click="handleClose"
          />
        </div>

        <!-- Thử nghiệm kịch bản mẫu -->
        <div class="text-xs text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-center gap-1">
          <span>Chưa tiện nói?</span>
          <button
            type="button"
            class="text-primary font-bold hover:underline cursor-pointer"
            @click="voice.permissionStatus.value = 'granted'; voice.startSession()"
          >
            Thử nghiệm kịch bản mẫu
          </button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BƯỚC 2: MÀN HÌNH HỘI THOẠI AI VOICE CHÍNH -->
      <!-- ========================================== -->
      <div v-else-if="!showOrderConfirmStep && !orderSuccessData" class="space-y-3 sm:space-y-3.5">
        <!-- 1. Thanh trạng thái & điều khiển gọn gàng -->
        <div class="p-2.5 sm:p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <div class="relative shrink-0">
              <div class="size-8 sm:size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                <UIcon name="i-lucide-bot" class="size-4 sm:size-5" />
              </div>
              <span
                class="absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-white"
                :class="voice.isConnected.value ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'"
              />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs sm:text-sm font-bold text-slate-900">Trợ lý AI Trip</span>
                <UBadge
                  v-if="voice.mode.value === 'live'"
                  color="success"
                  variant="subtle"
                  size="xs"
                >
                  Live WebRTC
                </UBadge>
                <UBadge
                  v-else
                  color="primary"
                  variant="subtle"
                  size="xs"
                >
                  Demo vi-VN
                </UBadge>
              </div>
              <p class="text-[11px] text-slate-500 truncate max-w-[150px] sm:max-w-xs">
                {{ voice.statusMessage.value }}
              </p>
            </div>
          </div>

          <!-- Các nút thao tác nhỏ gọn trên mobile -->
          <div class="flex items-center gap-1 shrink-0">
            <UButton
              :icon="voice.isMuted.value ? 'i-lucide-mic-off' : 'i-lucide-mic'"
              :color="voice.isMuted.value ? 'error' : 'neutral'"
              variant="outline"
              size="xs"
              :title="voice.isMuted.value ? 'Bật Micro' : 'Tắt Micro'"
              @click="voice.toggleMute"
            />
            <UButton
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="outline"
              size="xs"
              title="Đặt lại hội thoại"
              @click="handleReset"
            />
            <UButton
              icon="i-lucide-phone-off"
              color="error"
              variant="solid"
              size="xs"
              label="Dừng"
              @click="voice.stopSession"
            />
          </div>
        </div>

        <!-- 2. Khối Sóng âm thanh nhỏ gọn -->
        <div class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
          <div class="flex items-center gap-1.5 min-w-0">
            <span
              class="size-2 rounded-full shrink-0"
              :class="voice.speakerMode.value === 'assistant' ? 'bg-primary animate-ping' : voice.speakerMode.value === 'user' ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'"
            />
            <span class="text-[11px] font-bold text-slate-700 truncate">
              {{ voice.speakerMode.value === 'assistant' ? 'Trip đang trả lời...' : voice.speakerMode.value === 'user' ? 'Đang thu giọng nói...' : 'Đang lắng nghe' }}
            </span>
          </div>

          <!-- 16 thanh sóng âm thanh -->
          <div class="flex items-end gap-1 h-6 shrink-0">
            <div
              v-for="(height, idx) in voice.waveformData.value.slice(0, 16)"
              :key="idx"
              class="w-1 rounded-full transition-all duration-75"
              :style="{ height: `${Math.max(20, Math.min(height, 100))}%` }"
              :class="voice.speakerMode.value === 'assistant' ? 'bg-primary' : voice.speakerMode.value === 'user' ? 'bg-emerald-500' : 'bg-slate-300'"
            />
          </div>
        </div>

        <!-- 3. Khối Cuộc hội thoại trực tiếp (Live Transcripts) -->
        <div class="space-y-2 max-h-36 sm:max-h-44 overflow-y-auto p-2.5 sm:p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
          <!-- Phản hồi của Trợ lý Trip -->
          <div v-if="voice.assistantTranscript.value" class="flex items-start gap-2">
            <div class="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              <UIcon name="i-lucide-bot" class="size-3.5" />
            </div>
            <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-2.5 text-xs text-slate-800 leading-relaxed shadow-xs flex-1">
              <div class="flex items-center justify-between gap-1.5 mb-1">
                <span class="font-bold text-primary text-[11px]">Trợ lý Trip</span>
                <UButton
                  icon="i-lucide-volume-2"
                  variant="ghost"
                  color="primary"
                  size="xs"
                  label="Nghe lại"
                  class="py-0 px-1 text-[11px]"
                  @click="voice.speakTrip(voice.assistantTranscript.value)"
                />
              </div>
              <p>{{ voice.assistantTranscript.value }}</p>
            </div>
          </div>

          <!-- Lời khách nói -->
          <div v-if="voice.userTranscript.value" class="flex items-start gap-2 flex-row-reverse">
            <div class="size-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              <UIcon name="i-lucide-user" class="size-3.5" />
            </div>
            <div class="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-none p-2.5 text-xs text-slate-900 leading-relaxed shadow-xs text-right max-w-[85%]">
              <span class="font-bold text-slate-700 text-[11px] block mb-0.5">Lời của bạn</span>
              <p>{{ voice.userTranscript.value }}</p>
            </div>
          </div>

          <!-- Placeholder khi chưa có lời thoại -->
          <div v-if="!voice.assistantTranscript.value && !voice.userTranscript.value" class="py-3 text-center text-slate-400 space-y-1">
            <UIcon name="i-lucide-mic" class="size-5 mx-auto text-primary animate-pulse" />
            <p class="text-xs">Đang lắng nghe... Bạn hãy nói lộ trình muốn đi.</p>
            <p class="text-[11px] text-slate-500">Ví dụ: "Đón tôi ở Phường Bàn Cờ đi Vũng Tàu sáng mai 7 giờ, xe 5 chỗ"</p>
          </div>
        </div>

        <!-- 4. Thẻ tóm tắt lộ trình thông minh (Tối ưu tuyệt đối cho mobile) -->
        <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Thông tin nhận diện:</span>
            <button
              type="button"
              class="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              @click="isEditingForm = !isEditingForm"
            >
              <UIcon :name="isEditingForm ? 'i-lucide-chevron-up' : 'i-lucide-edit-3'" class="size-3" />
              <span>{{ isEditingForm ? 'Thu gọn' : 'Chỉnh sửa tay' }}</span>
            </button>
          </div>

          <!-- Badge tóm tắt lộ trình nhanh -->
          <div class="flex flex-wrap items-center gap-1.5">
            <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs">
              <UIcon name="i-lucide-map-pin" class="size-3 text-primary shrink-0" />
              <span class="font-medium truncate max-w-[130px] sm:max-w-none">{{ sync.bookingForm.pickupWard || 'Đón: Chờ thông tin...' }}</span>
            </div>
            <UIcon name="i-lucide-arrow-right" class="size-3 text-slate-400 shrink-0" />
            <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs">
              <UIcon name="i-lucide-navigation" class="size-3 text-emerald-600 shrink-0" />
              <span class="font-medium truncate max-w-[130px] sm:max-w-none">{{ sync.bookingForm.dropoffArea || 'Đến: Chờ thông tin...' }}</span>
            </div>
            <UBadge :color="sync.bookingForm.car ? 'primary' : 'neutral'" variant="subtle" size="xs">
              {{ sync.bookingForm.car || 'Chưa chọn xe' }}
            </UBadge>
          </div>

          <!-- Form chỉnh sửa tay mở rộng khi cần -->
          <div v-if="isEditingForm" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
            <UFormField label="Điểm đón" size="xs">
              <UInput
                v-model="sync.bookingForm.pickupWard"
                placeholder="Ví dụ: Phường Bàn Cờ"
                leading-icon="i-lucide-map-pin"
                size="sm"
                class="w-full"
                @input="sync.handleFieldInput('pickupWard', $event.target.value)"
              />
            </UFormField>

            <UFormField label="Điểm đến" size="xs">
              <UInput
                v-model="sync.bookingForm.dropoffArea"
                placeholder="Ví dụ: Vũng Tàu"
                leading-icon="i-lucide-navigation"
                size="sm"
                class="w-full"
                @input="sync.handleFieldInput('dropoffArea', $event.target.value)"
              />
            </UFormField>

            <UFormField label="Thời gian đi" size="xs">
              <div class="flex gap-1.5">
                <UInput
                  v-model="sync.bookingForm.date"
                  type="date"
                  size="sm"
                  class="flex-1"
                  @input="sync.handleFieldInput('date', $event.target.value)"
                />
                <UInput
                  v-model="sync.bookingForm.time"
                  type="time"
                  size="sm"
                  class="w-24"
                  @input="sync.handleFieldInput('time', $event.target.value)"
                />
              </div>
            </UFormField>

            <UFormField label="Hành khách & Hành lý" size="xs">
              <UInput
                v-model="sync.bookingForm.passengers"
                placeholder="Ví dụ: 2 người lớn, 2 vali"
                leading-icon="i-lucide-users"
                size="sm"
                class="w-full"
                @input="sync.handleFieldInput('passengers', $event.target.value)"
              />
            </UFormField>
          </div>
        </div>

        <!-- 5. Thẻ Báo Giá cước tự động & Nút Chốt chuyến -->
        <div v-if="sync.calculationResult.value?.price" class="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Cước phí trọn gói</div>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-xl sm:text-2xl font-black text-primary font-mono">{{ sync.formattedPrice.value }}</span>
              <span v-if="sync.calculationResult.value?.distance" class="text-xs text-slate-500">
                ({{ sync.calculationResult.value.distance }} km)
              </span>
            </div>
          </div>

          <UButton
            color="primary"
            size="md"
            label="Đặt chuyến ngay"
            icon="i-lucide-arrow-right"
            trailing
            class="font-bold px-4 sm:px-6 shadow-xs shrink-0 cursor-pointer"
            @click="handleOpenOrderConfirm"
          />
        </div>

        <!-- 6. Kịch bản mẫu nhanh dạng thanh trượt ngang -->
        <div class="pt-1 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span class="text-[11px] text-slate-400 font-medium shrink-0">💡 Thử nhanh:</span>
          <UButton
            v-for="(sc, scKey) in VOICE_SCENARIOS"
            :key="scKey"
            variant="subtle"
            color="neutral"
            size="xs"
            icon="i-lucide-play"
            :label="sc.title"
            class="shrink-0 text-[11px]"
            @click="handleTestScenario(scKey)"
          />
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BƯỚC 3: NHẬP SĐT XÁC NHẬN ĐẶT ĐƠN          -->
      <!-- ========================================== -->
      <div v-else-if="showOrderConfirmStep && !orderSuccessData" class="space-y-3.5 py-1">
        <UAlert
          title="Thông tin xác nhận chuyến xe"
          color="primary"
          variant="subtle"
          description="Vui lòng cung cấp số điện thoại chính xác để tài xế liên hệ đón và nhận mã xác nhận chuyến đi."
        />

        <div class="space-y-3">
          <UFormField label="Họ và tên người đi" required size="md">
            <UInput
              v-model="customerName"
              placeholder="Nguyễn Văn A"
              leading-icon="i-lucide-user"
              class="w-full"
              size="md"
            />
          </UFormField>

          <UFormField label="Số điện thoại đón xe" required size="md" description="Ưu tiên số có đăng ký Zalo">
            <UInput
              v-model="customerPhone"
              placeholder="0901 234 567"
              type="tel"
              leading-icon="i-lucide-phone"
              class="w-full"
              size="md"
            />
          </UFormField>

          <!-- Tóm tắt chuyến -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
            <div class="flex justify-between">
              <span>Lộ trình:</span>
              <strong class="text-slate-900">{{ sync.bookingForm.pickupWard || sync.bookingForm.pickupArea }} ➔ {{ sync.bookingForm.dropoffArea }}</strong>
            </div>
            <div class="flex justify-between">
              <span>Dòng xe:</span>
              <span class="text-slate-900">{{ sync.bookingForm.car || '5 chỗ' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Giá cước:</span>
              <strong class="text-primary font-mono text-sm">{{ sync.formattedPrice.value }}</strong>
            </div>
          </div>

          <UAlert
            v-if="orderSubmitError"
            color="error"
            variant="soft"
            :description="orderSubmitError"
            icon="i-lucide-alert-circle"
          />

          <div class="flex items-center gap-2.5 pt-1">
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              label="Quay lại"
              class="flex-1"
              @click="showOrderConfirmStep = false"
            />
            <UButton
              color="primary"
              size="lg"
              label="Hoàn tất đặt xe"
              icon="i-lucide-check"
              :loading="isSubmittingOrder"
              class="flex-1 font-bold shadow-xs cursor-pointer"
              @click="handleConfirmOrder"
            />
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BƯỚC 4: THÔNG BÁO ĐẶT XE THÀNH CÔNG        -->
      <!-- ========================================== -->
      <div v-else-if="orderSuccessData" class="text-center py-3 space-y-3.5">
        <div class="size-14 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 mx-auto flex items-center justify-center">
          <UIcon name="i-lucide-check-circle" class="size-8" />
        </div>

        <div class="space-y-0.5">
          <h3 class="text-lg font-bold text-slate-900">Đặt xe thành công!</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Hệ thống Happy Trip đã ghi nhận chuyến xe của bạn. Tài xế sẽ liên hệ xác nhận sớm nhất.
          </p>
        </div>

        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600 text-left">
          <div class="flex justify-between">
            <span>Mã chuyến xe:</span>
            <strong class="text-slate-900 font-mono text-sm">{{ orderSuccessData.short_id || orderSuccessData.order_id }}</strong>
          </div>
          <div class="flex justify-between">
            <span>Lộ trình:</span>
            <span class="text-slate-800">{{ sync.bookingForm.pickupWard || sync.bookingForm.pickupArea }} ➔ {{ sync.bookingForm.dropoffArea }}</span>
          </div>
          <div class="flex justify-between">
            <span>Giá cước:</span>
            <strong class="text-primary font-mono text-sm">{{ sync.formattedPrice.value }}</strong>
          </div>
        </div>

        <UButton
          color="primary"
          size="lg"
          block
          label="Đóng"
          class="font-bold cursor-pointer"
          @click="handleClose"
        />
      </div>
    </template>
  </UModal>
</template>
