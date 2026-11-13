<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { CalendarDate, Time, today, getLocalTimeZone } from '@internationalized/date'
import { useTripVoice, useVoiceModalState } from '~/composables/useTripVoice'
import { useVoiceBookingSync, type VoiceBookingForm } from '~/composables/useVoiceBookingSync'
import { customerService } from '~/services/customer.service'
import { orderService } from '~/services/order.service'
import type { CreateOrderByAjaxPayload } from '~/type'
import type { AiVoiceCreateOrderResponse } from '~/services/ai-voice.service'

interface Props {
  modelValue?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'order-created', order: AiVoiceCreateOrderResponse): void
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

// Người dùng sửa tay một trường -> đánh dấu bảo vệ, tránh AI ghi đè
const handleFieldInput = (key: keyof VoiceBookingForm, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  sync.updateField(key, target?.value ?? '')
}

// Lắng nghe transcript giọng nói từ voice composable đẩy sang sync composable
const stopSpeechListener = voice.onSpeechDelta((delta) => {
  sync.applySpeech(delta)
})

// Trạng thái cục bộ modal
const isRequestingPermission = ref(false)
const showOrderConfirmStep = ref(false)
const isSubmittingOrder = ref(false)
const orderSuccessData = ref<AiVoiceCreateOrderResponse | null>(null)
const orderSubmitError = ref<string | null>(null)
const formError = ref<string | null>(null)

// Bước xác thực OTP — dùng chung API với luồng đặt tay (OrderContactModal)
const showOtpStep = ref(false)
const otpValue = ref<string[]>([])
const otpLoading = ref(false)
const otpError = ref<string | null>(null)
const resendCooldown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

const { token, setAuth, syncMe } = useAuth()

// Người dùng chủ động nhập tay (bỏ qua bước chờ kết nối giọng nói)
const isManualEntry = ref(false)
const isVoiceBootstrapping = ref(false)
const showConversation = ref(true)
let voiceBootstrapTimer: ReturnType<typeof setTimeout> | null = null

// Form khách hàng bổ sung khi đặt đơn
const customerName = ref('')
const customerPhone = ref('')

// ─── Tiện ích ngày giờ ───────────────────────────────────
const pad2 = (value: number) => String(value).padStart(2, '0')

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const toTimeInput = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`

const ensureDefaultDateTime = () => {
  if (sync.bookingForm.date && sync.bookingForm.time) return
  const suggested = new Date(Date.now() + 30 * 60 * 1000)
  suggested.setSeconds(0, 0)
  const roundedMinutes = Math.ceil(suggested.getMinutes() / 5) * 5
  if (roundedMinutes >= 60) {
    suggested.setHours(suggested.getHours() + 1, 0, 0, 0)
  } else {
    suggested.setMinutes(roundedMinutes, 0, 0)
  }
  if (!sync.bookingForm.date) sync.bookingForm.date = toDateInput(suggested)
  if (!sync.bookingForm.time) sync.bookingForm.time = toTimeInput(suggested)
}

const minCalendarDate = computed(() => today(getLocalTimeZone()))

const departureCalendarDate = computed<CalendarDate | null>({
  get: () => {
    const value = sync.bookingForm.date
    if (!value) return null
    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return null
    return new CalendarDate(year, month, day)
  },
  set: (value) => {
    if (!value) {
      sync.updateField('date', '')
      return
    }
    sync.updateField('date', `${value.year}-${pad2(value.month)}-${pad2(value.day)}`)
  }
})

const departureTimeValue = computed<Time | null>({
  get: () => {
    const [hour, minute] = (sync.bookingForm.time || '').split(':').map(Number)
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null
    return new Time(hour, minute)
  },
  set: (value) => {
    if (!value) {
      sync.updateField('time', '')
      return
    }
    sync.updateField('time', `${pad2(value.hour)}:${pad2(value.minute)}`)
  }
})

const departureDateLabel = computed(() => {
  if (!sync.bookingForm.date) return 'Chọn ngày khởi hành'
  const date = new Date(`${sync.bookingForm.date}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Chọn ngày khởi hành'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(date)
})

// ─── Trạng thái kết nối / skeleton ───────────────────────
const clearVoiceBootstrapTimer = () => {
  if (voiceBootstrapTimer) {
    clearTimeout(voiceBootstrapTimer)
    voiceBootstrapTimer = null
  }
}

const beginVoiceBootstrap = () => {
  isVoiceBootstrapping.value = true
  clearVoiceBootstrapTimer()
  // Nếu máy chủ/giọng nói phản hồi chậm, tối đa 12s sau vẫn mở form để khách nhập tay
  voiceBootstrapTimer = setTimeout(() => {
    isVoiceBootstrapping.value = false
  }, 12000)
}

const endVoiceBootstrap = () => {
  isVoiceBootstrapping.value = false
  clearVoiceBootstrapTimer()
}

const showConnectingSkeleton = computed(() =>
  voice.permissionStatus.value === 'granted'
  && isVoiceBootstrapping.value
  && !isManualEntry.value
  && !showOrderConfirmStep.value
  && !showOtpStep.value
  && !orderSuccessData.value
)

watch(
  () => voice.isConnected.value,
  (connected) => {
    if (connected) endVoiceBootstrap()
  }
)

// Khi OpenAI lỗi -> thoát skeleton ngay để hiện thông báo lỗi rõ ràng
watch(
  () => voice.voiceError.value,
  (err) => {
    if (err) endVoiceBootstrap()
  }
)

const startVoiceFromManual = async () => {
  isManualEntry.value = false
  beginVoiceBootstrap()
  await voice.startSession()
}

const useManualEntry = () => {
  endVoiceBootstrap()
  isManualEntry.value = true
  voice.permissionStatus.value = 'granted'
  ensureDefaultDateTime()
}

const showVoiceStatus = computed(() =>
  voice.permissionStatus.value === 'granted'
  && !showOrderConfirmStep.value
  && !showOtpStep.value
  && !orderSuccessData.value
)

const voiceConnectionLabel = computed(() => {
  if (voice.isConnected.value) return 'Đang nghe'
  if (voice.isConnecting.value) return 'Đang kết nối...'
  if (voice.voiceError.value) return 'Lỗi kết nối'
  return isManualEntry.value ? 'Nhập tay' : 'Đã dừng'
})

const voiceStatusText = computed(() => {
  if (voice.isConnected.value) {
    if (voice.assistantTranscript.value) return voice.assistantTranscript.value
    if (voice.speakerMode.value === 'user') return 'Đang nghe bạn nói...'
    return 'Bạn cứ nói điểm đón, điểm đến và giờ đi.'
  }
  if (voice.isConnecting.value) return voice.statusMessage.value || 'Đang kết nối trợ lý Trip...'
  return voice.statusMessage.value || 'Nhấn "Kết nối" để bắt đầu lại phiên đàm thoại.'
})

const replayAssistant = () => {
  const text = voice.assistantTranscript.value
  if (text) voice.speakTrip(text)
}

// ─── Tiêu đề & mô tả modal đồng bộ theo từng bước ────────
const modalTitle = computed(() => {
  if (orderSuccessData.value) return 'Đặt xe thành công!'
  if (showOtpStep.value) return 'Xác nhận mã OTP'
  if (showOrderConfirmStep.value) return 'Xác nhận thông tin đặt chuyến'
  if (voice.permissionStatus.value !== 'granted') return 'Cấp quyền Microphone'
  if (showConnectingSkeleton.value) return 'Đang kết nối trợ lý Trip'
  return 'Đặt xe bằng giọng nói'
})

const modalDescription = computed(() => {
  if (orderSuccessData.value) return 'Chuyến đi của bạn đã được ghi nhận trên hệ thống Happy Trip.'
  if (showOtpStep.value) return 'Nhập mã OTP đã gửi về số điện thoại để hoàn tất đặt chuyến.'
  if (showOrderConfirmStep.value) return 'Nhập họ tên và số điện thoại để nhận mã OTP xác nhận chuyến đi.'
  if (voice.permissionStatus.value !== 'granted') return 'Cho phép sử dụng micro để trò chuyện với AI Trip.'
  if (showConnectingSkeleton.value) return 'Vui lòng chờ trong giây lát để bắt đầu phiên đàm thoại.'
  return 'Nói điểm đón, điểm đến và giờ đi tự nhiên để nhận báo giá tức thì.'
})

// ─── Vòng đời modal ──────────────────────────────────────
watch(isOpen, async (newVal) => {
  if (newVal) {
    orderSuccessData.value = null
    showOrderConfirmStep.value = false
    showOtpStep.value = false
    otpValue.value = []
    otpError.value = null
    resendCooldown.value = 0
    clearResendTimer()
    orderSubmitError.value = null
    formError.value = null
    isManualEntry.value = false
    isVoiceBootstrapping.value = false
    ensureDefaultDateTime()

    // Kiểm tra trạng thái quyền
    const status = await voice.checkPermission()
    if (status === 'granted') {
      beginVoiceBootstrap()
      await voice.startSession()
    }
  } else {
    // Khi đóng modal -> dừng phiên đàm thoại và giải phóng micro
    endVoiceBootstrap()
    voice.stopSession()
    voice.releaseMicrophone()
    sync.resetForm()
    clearResendTimer()
    otpValue.value = []
    showOtpStep.value = false
    resendCooldown.value = 0
  }
})

onUnmounted(() => {
  clearVoiceBootstrapTimer()
  clearResendTimer()
  stopSpeechListener()
})

// Yêu cầu quyền Microphone
const handleRequestPermission = async () => {
  isRequestingPermission.value = true
  formError.value = null
  try {
    const granted = await voice.requestPermissions()
    if (granted) {
      beginVoiceBootstrap()
      await voice.startSession()
    }
  } finally {
    isRequestingPermission.value = false
  }
}

// Mở bước xác nhận đặt xe
const handleOpenOrderConfirm = () => {
  orderSubmitError.value = null
  customerName.value = sync.bookingForm.customer_name || 'Khách hàng'
  customerPhone.value = sync.bookingForm.customer_phone || ''
  // Kết thúc phiên đàm thoại & giải phóng micro khi chuyển sang bước xác nhận
  endVoiceBootstrap()
  voice.releaseMicrophone()
  showOrderConfirmStep.value = true
}

// ─── OTP (dùng chung API với luồng đặt tay OrderContactModal) ──
function clearResendTimer() {
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
}

function startResendCooldown() {
  clearResendTimer()
  resendCooldown.value = 60
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearResendTimer()
  }, 1000)
}

const normalizePhone = (value: string) => value.trim().replace(/\s+/g, '')

/** Xác nhận thông tin -> gửi OTP về số điện thoại, chuyển sang bước nhập OTP */
const handleConfirmOrder = async () => {
  const phone = normalizePhone(customerPhone.value)
  if (!phone || phone.length < 9) {
    orderSubmitError.value = 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 chữ số)'
    return
  }

  isSubmittingOrder.value = true
  orderSubmitError.value = null

  try {
    sync.updateField('customer_name', customerName.value.trim() || 'Khách hàng')
    sync.updateField('customer_phone', phone)

    await customerService.sendLoginOtp(phone)

    showOrderConfirmStep.value = false
    showOtpStep.value = true
    otpValue.value = []
    otpError.value = null
    startResendCooldown()
  } catch (err: unknown) {
    orderSubmitError.value = extractErrorMessage(
      err,
      'Không thể gửi mã OTP. Vui lòng kiểm tra số điện thoại và thử lại.'
    )
  } finally {
    isSubmittingOrder.value = false
  }
}

/** Gửi lại OTP */
const handleResendOtp = async () => {
  if (resendCooldown.value > 0 || otpLoading.value) return
  const phone = normalizePhone(customerPhone.value)
  if (!phone) return

  otpLoading.value = true
  otpError.value = null
  try {
    await customerService.sendLoginOtp(phone)
    otpValue.value = []
    startResendCooldown()
  } catch (err: unknown) {
    otpError.value = extractErrorMessage(err, 'Không thể gửi lại OTP. Vui lòng thử lại sau.')
  } finally {
    otpLoading.value = false
  }
}

/** Xác thực OTP rồi tạo đơn đặt xe — dùng đúng API đặt tay order/by-ajax */
const handleVerifyOtp = async () => {
  const phone = normalizePhone(customerPhone.value)
  const otp = otpValue.value.join('')
  if (otp.length < 6) return

  otpLoading.value = true
  otpError.value = null

  try {
    // 1. Xác thực OTP (giống OrderContactModal) -> nhận token khách hàng
    const res = await customerService.verifyLoginOtp(phone, otp)
    const authToken = res?.token || ''

    if (!authToken) {
      otpError.value = 'Không nhận được phiên xác thực. Vui lòng thử lại.'
      return
    }

    if (res?.customer) {
      setAuth(authToken, res.customer)
    }

    // 2. Tạo đơn qua API đặt tay (có token OTP) — KHÔNG dùng luồng partner/admin duyệt
    const form = sync.bookingForm
    const serviceId = form.car?.includes('7')
      ? '66947cea17482239472b88e8'
      : '66947d0917482239472b9807'

    const calc = sync.calculationResult.value
    const priceGuestAfter = calc?.price || calc?.discount_price || calc?.original_price
      || (form.car?.includes('7') ? 1100000 : 900000)

    const payload: CreateOrderByAjaxPayload = {
      departure_city: form.pickupArea,
      departure_dictrict: form.pickupWard,
      departure_address_1: form.pickupDetail || 'LH',
      destination_city: form.dropoffArea,
      destination_dictrict: form.dropoffWard,
      destination_address_1: form.dropoffDetail || 'LH',
      date_of_destination: form.date
        ? `${form.date}T${form.time || '07:00'}:00`
        : null,
      id_service: serviceId,
      full_name: customerName.value.trim() || 'Khách hàng',
      phone,
      note: [form.passengers ? `Số khách: ${form.passengers}` : '', form.notes, 'Đơn đặt qua trợ lý AI Voice Happy Trip']
        .filter(Boolean)
        .join(' | '),
      price_guest_after: priceGuestAfter,
      price_guest: priceGuestAfter,
      price: calc?.original_price || priceGuestAfter,
      discount: { type: null }
    }

    const order = await orderService.createOrderByAjax(authToken, payload)

    const result: AiVoiceCreateOrderResponse = {
      success: true,
      order_id: order.id,
      short_id: order.short_id,
      message: 'Đặt chuyến thành công'
    }

    orderSuccessData.value = result
    emit('order-created', result)
    voice.stopSession()
    showOtpStep.value = false
    clearResendTimer()
    resendCooldown.value = 0
  } catch (err: unknown) {
    console.error('Lỗi khi xác thực OTP / đặt chuyến:', err)
    otpError.value = extractErrorMessage(
      err,
      'Không thể hoàn tất đặt chuyến. Vui lòng kiểm tra lại mã OTP hoặc thử lại.'
    )
  } finally {
    otpLoading.value = false
  }
}

/** Quay lại bước nhập thông tin */
const handleBackToContact = () => {
  showOtpStep.value = false
  showOrderConfirmStep.value = true
  otpValue.value = []
  otpError.value = null
  clearResendTimer()
  resendCooldown.value = 0
  if (token.value && !sync.bookingForm.customer_phone) {
    syncMe?.()
  }
}

// ─── Nút hành động chính trên form ───────────────────────
const carOptions = [
  { value: '5 chỗ', label: 'Xe 5 chỗ', hint: 'Tối đa 4 khách · Sedan', icon: 'i-lucide-car' },
  { value: '7 chỗ', label: 'Xe 7 chỗ', hint: 'Tối đa 6 khách · MPV/SUV', icon: 'i-lucide-car-front' }
]

const hasPrice = computed(() => {
  const result = sync.calculationResult.value
  return Boolean(result && (result.price || result.discount_price || result.original_price))
})

const primaryButtonLabel = computed(() => {
  if (sync.isCalculating.value) return 'Đang tính giá...'
  if (hasPrice.value) return `Đặt chuyến • ${sync.formattedPrice.value}`
  return 'Nhập thông tin để xem giá'
})

const handlePrimaryAction = async () => {
  formError.value = null
  if (sync.isCalculating.value) return

  const form = sync.bookingForm
  if (!form.pickupArea || !form.pickupWard || !form.dropoffArea || !form.dropoffWard) {
    formError.value = 'Vui lòng chọn điểm đón và điểm đến trước khi xem giá.'
    return
  }

  if (!hasPrice.value) {
    await sync.calculateFare()
    if (!hasPrice.value) {
      formError.value = sync.calculateError.value || 'Chưa thể tính giá cho lộ trình này. Vui lòng kiểm tra lại thông tin.'
    }
    return
  }

  if (!form.pickupDetail || !form.dropoffDetail) {
    formError.value = 'Vui lòng nhập số nhà, tên đường cho điểm đón và điểm đến.'
    return
  }

  if (!form.date || !form.time) {
    formError.value = 'Vui lòng chọn thời gian khởi hành.'
    return
  }

  if (!form.car) {
    formError.value = 'Vui lòng chọn loại xe 5 chỗ hoặc 7 chỗ.'
    return
  }

  handleOpenOrderConfirm()
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
      content: 'w-[calc(100vw-0.5rem)] sm:max-w-[560px] max-h-[calc(100dvh-0.5rem)] sm:max-h-[calc(100dvh-4rem)] rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-2xl ring-0 overflow-hidden p-0 divide-y-0',
      overlay: 'bg-slate-950/60 backdrop-blur-[2px]'
    }"
  >
    <template #content>
      <div class="flex max-h-[inherit] flex-col">
        <!-- Thanh trên cùng: trạng thái trợ lý, kết thúc cuộc gọi & đóng -->
        <div class="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-white/85 px-3 py-2 backdrop-blur-sm sm:px-4">
          <template v-if="showVoiceStatus">
            <template v-if="isManualEntry && !voice.isConnected.value">
              <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <UIcon
                  name="i-lucide-keyboard"
                  class="size-4"
                />
              </div>
              <p class="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-600">
                Đang nhập thông tin bằng tay
              </p>
              <UButton
                size="xs"
                variant="soft"
                color="primary"
                icon="i-lucide-mic"
                label="Bật trợ lý"
                class="shrink-0 cursor-pointer"
                @click="startVoiceFromManual"
              />
            </template>
            <template v-else>
              <div class="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UIcon
                  name="i-lucide-bot"
                  class="size-4"
                />
                <span
                  class="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-white"
                  :class="voice.isConnected.value ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="truncate text-[11px] font-bold text-slate-800">Trợ lý Trip</span>
                  <span
                    class="shrink-0 text-[10px] font-semibold"
                    :class="voice.isConnected.value ? 'text-emerald-600' : 'text-amber-600'"
                  >
                    {{ voiceConnectionLabel }}
                  </span>
                </div>
                <p class="truncate text-[11px] text-slate-500">
                  {{ voiceStatusText }}
                </p>
              </div>

              <div
                v-if="!showConnectingSkeleton"
                class="flex shrink-0 items-center gap-1"
              >
                <div class="hidden h-4 items-end gap-[2px] sm:flex">
                  <div
                    v-for="(height, idx) in voice.waveformData.value.slice(0, 8)"
                    :key="idx"
                    class="w-[3px] rounded-full transition-all duration-75"
                    :style="{ height: `${Math.max(18, Math.min(height, 100))}%` }"
                    :class="voice.speakerMode.value === 'assistant' ? 'bg-primary' : voice.speakerMode.value === 'user' ? 'bg-emerald-500' : 'bg-slate-300'"
                  />
                </div>
                <UButton
                  v-if="voice.isConnected.value"
                  :icon="voice.isMuted.value ? 'i-lucide-mic-off' : 'i-lucide-mic'"
                  :color="voice.isMuted.value ? 'error' : 'neutral'"
                  variant="ghost"
                  size="xs"
                  :title="voice.isMuted.value ? 'Bật Micro' : 'Tắt Micro'"
                  :aria-label="voice.isMuted.value ? 'Bật Micro' : 'Tắt Micro'"
                  @click="voice.toggleMute"
                />
                <UButton
                  v-if="voice.isConnected.value"
                  icon="i-lucide-phone-off"
                  color="error"
                  variant="soft"
                  size="xs"
                  label="Dừng"
                  class="cursor-pointer"
                  title="Kết thúc cuộc gọi với trợ lý"
                  @click="voice.stopSession"
                />
                <UButton
                  v-else
                  icon="i-lucide-mic"
                  color="primary"
                  variant="soft"
                  size="xs"
                  label="Kết nối"
                  class="cursor-pointer"
                  title="Kết nối lại trợ lý"
                  @click="startVoiceFromManual"
                />
              </div>
            </template>
          </template>
          <template v-else>
            <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UIcon
                :name="orderSuccessData ? 'i-lucide-check-circle' : showOtpStep ? 'i-lucide-shield-check' : showOrderConfirmStep ? 'i-lucide-clipboard-check' : 'i-lucide-mic'"
                class="size-4"
              />
            </div>
            <span class="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">{{ modalTitle }}</span>
          </template>

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            class="shrink-0 rounded-full bg-white/80 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng cửa sổ đặt xe"
            @click="handleClose"
          />
        </div>

        <!-- Lỗi kết nối trợ lý AI (không tự chuyển sang Demo/Web Speech) -->
        <div
          v-if="voice.voiceError.value && showVoiceStatus"
          class="shrink-0 px-4 pt-2 sm:px-5"
        >
          <UAlert
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :title="voice.voiceErrorKind.value === 'not_configured' ? 'Trợ lý AI chưa được cấu hình' : 'Không kết nối được trợ lý AI'"
            :description="voice.voiceError.value"
            :ui="{ root: 'p-2.5', title: 'text-xs font-bold', description: 'text-[11px] leading-relaxed' }"
          >
            <template #actions>
              <UButton
                color="error"
                variant="solid"
                size="xs"
                icon="i-lucide-rotate-ccw"
                label="Thử lại"
                class="cursor-pointer"
                @click="startVoiceFromManual"
              />
            </template>
          </UAlert>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <!-- ========================================== -->
          <!-- BƯỚC 1: GATE BẮT BUỘC CẤP QUYỀN MICROPHONE -->
          <!-- ========================================== -->
          <div
            v-if="voice.permissionStatus.value !== 'granted'"
            class="px-5 pb-6 pt-10 text-center sm:px-6 sm:pb-8"
          >
            <div class="relative mx-auto flex size-14 items-center justify-center sm:size-16">
              <div class="absolute inset-0 rounded-full bg-primary/20 opacity-60 animate-ping" />
              <div class="relative flex size-14 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary shadow-xs sm:size-16">
                <UIcon
                  name="i-lucide-mic"
                  class="size-7 sm:size-8"
                />
              </div>
            </div>

            <div class="mx-auto mt-4 max-w-md space-y-1">
              <h3 class="text-base font-bold text-slate-900 sm:text-lg">
                Cho phép truy cập Microphone
              </h3>
              <p class="px-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                Trò chuyện trực tiếp bằng giọng nói với Trợ lý AI và nhận báo giá tự động cho chuyến đi của bạn.
              </p>
            </div>

            <div class="mx-auto mt-4 max-w-lg space-y-2 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-left sm:p-4">
              <div class="flex items-center gap-2.5 text-xs text-slate-700">
                <UIcon
                  name="i-lucide-check-circle-2"
                  class="size-4 shrink-0 text-primary"
                />
                <span>Nói điểm đón, điểm đến và giờ đi tự nhiên bằng tiếng Việt</span>
              </div>
              <div class="flex items-center gap-2.5 text-xs text-slate-700">
                <UIcon
                  name="i-lucide-check-circle-2"
                  class="size-4 shrink-0 text-primary"
                />
                <span>Tự động tính cước minh bạch 100% không phát sinh phụ phí</span>
              </div>
              <div class="flex items-center gap-2.5 text-xs text-slate-700">
                <UIcon
                  name="i-lucide-check-circle-2"
                  class="size-4 shrink-0 text-primary"
                />
                <span>Bảo mật an toàn, chỉ thu âm trực tiếp trong phiên đàm thoại</span>
              </div>
            </div>

            <UAlert
              v-if="voice.permissionStatus.value === 'denied'"
              class="mt-4 text-left"
              color="error"
              variant="subtle"
              icon="i-lucide-alert-triangle"
              title="Microphone đã bị chặn"
              description="Nhấn vào biểu tượng Ổ khóa trên thanh địa chỉ URL, chuyển Microphone sang 'Cho phép' và bấm Thử lại."
            />

            <div class="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <UButton
                color="primary"
                size="lg"
                icon="i-lucide-mic"
                :loading="isRequestingPermission"
                :label="voice.permissionStatus.value === 'denied' ? 'Thử lại cấp quyền' : 'Cấp quyền Micro & Bắt đầu'"
                class="w-full cursor-pointer px-6 font-bold shadow-xs sm:w-auto"
                @click="handleRequestPermission"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="md"
                icon="i-lucide-keyboard"
                label="Nhập thông tin bằng tay"
                class="w-full cursor-pointer text-slate-600 sm:w-auto"
                @click="useManualEntry"
              />
            </div>
          </div>

          <!-- ========================================== -->
          <!-- BƯỚC 2: ĐANG KẾT NỐI - HIỂN THỊ SKELETON   -->
          <!-- ========================================== -->
          <div
            v-else-if="showConnectingSkeleton"
            class="px-4 pb-6 pt-10 sm:px-6 sm:pb-8"
          >
            <div class="flex flex-col items-center gap-2.5 pb-1 text-center">
              <div class="relative flex size-14 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary">
                <span class="absolute inset-0 rounded-full bg-primary/20 opacity-70 animate-ping" />
                <UIcon
                  name="i-lucide-mic"
                  class="relative size-6"
                />
              </div>
              <div class="max-w-xs space-y-0.5">
                <p class="flex items-center justify-center gap-2 text-sm font-bold text-slate-800">
                  <UIcon
                    name="i-lucide-loader-2"
                    class="size-4 animate-spin text-primary"
                  />
                  Đang kết nối trợ lý Trip...
                </p>
                <p class="text-xs text-slate-500">
                  {{ voice.statusMessage.value || 'Vui lòng chờ trong giây lát để bắt đầu phiên đàm thoại.' }}
                </p>
              </div>
            </div>

            <!-- Skeleton mô phỏng đúng bố cục form -->
            <div
              class="mt-5 space-y-4"
              aria-hidden="true"
            >
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <USkeleton class="size-5 rounded-md" />
                  <USkeleton class="h-3 w-24 rounded-md" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <USkeleton class="h-9 rounded-md" />
                  <USkeleton class="h-9 rounded-md" />
                </div>
                <USkeleton class="h-9 rounded-md" />
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <USkeleton class="size-5 rounded-md" />
                  <USkeleton class="h-3 w-24 rounded-md" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <USkeleton class="h-9 rounded-md" />
                  <USkeleton class="h-9 rounded-md" />
                </div>
                <USkeleton class="h-9 rounded-md" />
              </div>

              <div class="space-y-2">
                <USkeleton class="h-3 w-40 rounded-md" />
                <div class="flex items-center gap-2">
                  <USkeleton class="h-9 flex-1 rounded-md" />
                  <USkeleton class="h-9 w-[112px] shrink-0 rounded-md" />
                </div>
                <USkeleton class="h-3 w-11/12 rounded-md" />
              </div>

              <div class="space-y-2">
                <USkeleton class="h-3 w-16 rounded-md" />
                <USkeleton class="h-20 rounded-md" />
              </div>

              <USkeleton class="h-12 rounded-lg" />
            </div>

            <div class="mt-4 text-center">
              <button
                type="button"
                class="cursor-pointer text-xs font-semibold text-primary hover:underline"
                @click="useManualEntry"
              >
                Nhập thông tin bằng tay
              </button>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- BƯỚC 3: FORM ĐẶT XE (GIỐNG IMAGE 1)        -->
          <!-- ========================================== -->
          <div v-else-if="!showOrderConfirmStep && !showOtpStep && !orderSuccessData">
            <div class="space-y-4 px-4 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
              <!-- Khung hội thoại & nghe lại -->
              <div
                v-if="!isManualEntry || voice.assistantTranscript.value || voice.userTranscript.value"
                class="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/80"
              >
                <div class="flex items-center justify-between gap-2 px-3 py-2">
                  <button
                    type="button"
                    class="flex min-w-0 cursor-pointer items-center gap-1.5 text-[11px] font-bold text-slate-600"
                    @click="showConversation = !showConversation"
                  >
                    <UIcon
                      name="i-lucide-messages-square"
                      class="size-3.5 shrink-0 text-primary"
                    />
                    <span class="truncate">Hội thoại với Trip</span>
                    <UIcon
                      :name="showConversation ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                      class="size-3 shrink-0 text-slate-400"
                    />
                  </button>

                  <UButton
                    icon="i-lucide-volume-2"
                    color="primary"
                    variant="ghost"
                    size="xs"
                    label="Nghe lại"
                    :disabled="!voice.assistantTranscript.value"
                    class="shrink-0 cursor-pointer text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
                    @click="replayAssistant"
                  />
                </div>

                <div
                  v-if="showConversation"
                  class="max-h-36 space-y-2 overflow-y-auto border-t border-slate-200/70 p-2.5"
                >
                  <!-- Phản hồi của Trợ lý Trip -->
                  <div
                    v-if="voice.assistantTranscript.value"
                    class="flex items-start gap-2"
                  >
                    <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      <UIcon
                        name="i-lucide-bot"
                        class="size-3.5"
                      />
                    </div>
                    <div class="flex-1 rounded-2xl rounded-tl-none border border-slate-200 bg-white p-2.5 text-xs leading-relaxed text-slate-800 shadow-xs">
                      <span class="mb-1 block text-[11px] font-bold text-primary">Trợ lý Trip</span>
                      <p>{{ voice.assistantTranscript.value }}</p>
                    </div>
                  </div>

                  <!-- Lời khách nói -->
                  <div
                    v-if="voice.userTranscript.value"
                    class="flex flex-row-reverse items-start gap-2"
                  >
                    <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                      <UIcon
                        name="i-lucide-user"
                        class="size-3.5"
                      />
                    </div>
                    <div class="max-w-[85%] rounded-2xl rounded-tr-none border border-primary/20 bg-primary/10 p-2.5 text-right text-xs leading-relaxed text-slate-900 shadow-xs">
                      <span class="mb-0.5 block text-[11px] font-bold text-slate-700">Lời của bạn</span>
                      <p>{{ voice.userTranscript.value }}</p>
                    </div>
                  </div>

                  <!-- Placeholder khi chưa có lời thoại -->
                  <div
                    v-if="!voice.assistantTranscript.value && !voice.userTranscript.value"
                    class="space-y-1 py-2 text-center text-slate-400"
                  >
                    <UIcon
                      name="i-lucide-mic"
                      class="mx-auto size-5 animate-pulse text-primary"
                    />
                    <p class="text-xs">
                      Đang lắng nghe... Bạn hãy nói lộ trình muốn đi.
                    </p>
                    <p class="text-[11px] text-slate-500">
                      Ví dụ: "Đón tôi ở Phường Bàn Cờ đi Vũng Tàu sáng mai 7 giờ, xe 5 chỗ"
                    </p>
                  </div>
                </div>
              </div>

              <!-- Điểm đón -->
              <div>
                <div class="mb-2 flex items-center gap-2">
                  <div class="rounded-lg bg-primary/10 p-1.5">
                    <div class="size-2.5 rounded-full bg-primary" />
                  </div>
                  <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Điểm đón</span>
                </div>
                <ElementAddress
                  :city="sync.bookingForm.pickupArea"
                  :province="sync.bookingForm.pickupWard"
                  :address="sync.bookingForm.pickupDetail"
                  name-prefix="departure"
                  icon="i-lucide-locate-fixed"
                  label="Điểm đón"
                  placeholder="Bạn đang ở đâu?"
                  :exclude-district="sync.bookingForm.dropoffWard"
                  @update:city="(value) => sync.updateField('pickupArea', value)"
                  @update:province="(value) => sync.updateField('pickupWard', value)"
                  @update:address="(value) => sync.updateField('pickupDetail', value)"
                />
              </div>

              <!-- Điểm đến -->
              <div>
                <div class="mb-2 flex items-center gap-2">
                  <div class="rounded-lg bg-blue-500/10 p-1.5">
                    <div class="size-2.5 rounded-full bg-blue-500" />
                  </div>
                  <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Điểm đến</span>
                </div>
                <ElementAddress
                  :city="sync.bookingForm.dropoffArea"
                  :province="sync.bookingForm.dropoffWard"
                  :address="sync.bookingForm.dropoffDetail"
                  name-prefix="destination"
                  icon="i-lucide-map-pin"
                  label="Điểm đến"
                  placeholder="Điểm đến của bạn?"
                  :exclude-district="sync.bookingForm.pickupWard"
                  @update:city="(value) => sync.updateField('dropoffArea', value)"
                  @update:province="(value) => sync.updateField('dropoffWard', value)"
                  @update:address="(value) => sync.updateField('dropoffDetail', value)"
                />
              </div>

              <!-- Thời gian khởi hành -->
              <div>
                <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Thời gian khởi hành</span>

                <div class="mt-2 flex items-center gap-2">
                  <UPopover>
                    <UButton
                      color="neutral"
                      variant="outline"
                      icon="i-lucide-calendar"
                      :ui="{ leadingIcon: 'text-primary', label: 'truncate' }"
                      class="min-w-0 flex-1 justify-start text-left text-sm font-medium"
                    >
                      {{ departureDateLabel }}
                    </UButton>

                    <template #content>
                      <UCalendar
                        v-model="departureCalendarDate"
                        :min-value="minCalendarDate"
                        size="sm"
                        class="p-3"
                      />
                    </template>
                  </UPopover>

                  <UInputTime
                    v-model="departureTimeValue"
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-alarm-clock"
                    :ui="{ leadingIcon: 'text-primary', base: 'h-9 w-[104px] justify-center text-sm font-medium' }"
                    class="shrink-0"
                  />
                </div>

                <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
                  Nếu đặt xe hôm nay vui lòng đặt trước 30 phút để tài xế có thời gian chuẩn bị và di chuyển đến điểm đón.
                </p>
              </div>

              <!-- Loại xe -->
              <div>
                <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Loại xe</span>
                <div class="mt-2 grid grid-cols-2 gap-2">
                  <button
                    v-for="option in carOptions"
                    :key="option.value"
                    type="button"
                    class="rounded-xl border p-2.5 text-left transition-colors"
                    :class="sync.bookingForm.car === option.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-slate-200 bg-white hover:border-primary/40'"
                    @click="sync.updateField('car', option.value)"
                  >
                    <span class="flex items-center gap-1.5">
                      <UIcon
                        :name="option.icon"
                        class="size-4 shrink-0"
                        :class="sync.bookingForm.car === option.value ? 'text-primary' : 'text-slate-400'"
                      />
                      <span class="text-sm font-bold text-slate-800">{{ option.label }}</span>
                    </span>
                    <span class="mt-0.5 block text-[11px] text-slate-500">{{ option.hint }}</span>
                  </button>
                </div>
              </div>

              <!-- Ghi chú -->
              <UFormField
                name="note"
                size="sm"
                :ui="{ error: 'text-xs text-left' }"
              >
                <template #label>
                  <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Ghi chú</span>
                </template>
                <UTextarea
                  v-model="sync.bookingForm.notes"
                  placeholder="Ví dụ: có người già, trẻ em, thú cưng, cần xe xăng/xe điện..."
                  :rows="3"
                  :maxrows="6"
                  autoresize
                  :maxlength="500"
                  class="w-full"
                  :ui="{ base: 'text-sm' }"
                  @input="handleFieldInput('notes', $event)"
                />
              </UFormField>

              <UAlert
                v-if="formError"
                color="error"
                variant="soft"
                :description="formError"
                icon="i-lucide-alert-circle"
                class="text-xs"
              />

              <!-- CTA -->
              <UButton
                color="primary"
                block
                size="xl"
                :loading="sync.isCalculating.value"
                :disabled="sync.isCalculating.value"
                class="h-12 cursor-pointer text-sm font-black uppercase tracking-wide shadow-lg shadow-primary/20 sm:text-base"
                @click="handlePrimaryAction"
              >
                <span class="flex w-full items-center justify-center gap-2">
                  <UIcon
                    name="i-lucide-rocket"
                    class="size-5 shrink-0"
                  />
                  {{ primaryButtonLabel }}
                </span>
              </UButton>

              <!-- Điều khoản -->
              <div class="text-center text-xs leading-relaxed text-slate-500">
                Bằng việc đặt chuyến, chúng tôi hiểu rằng bạn đồng ý với
                <SharedPolicy>
                  <span class="inline cursor-pointer font-semibold uppercase text-primary">
                    Điều khoản và lưu ý khi đặt xe
                  </span>
                </SharedPolicy>
                của Happy Trip.
              </div>

              <!-- Lưu ý cuối form -->
              <ol class="list-decimal space-y-1 border-t border-slate-200 pl-4 pt-3 text-left text-xs leading-relaxed text-slate-600">
                <li>Giá xe riêng, đã bao gồm phí và đi cao tốc, không phát sinh</li>
                <li>Đón trả tận nơi theo yêu cầu, <b>không cần cọc</b></li>
                <li>Kết thúc chuyến xe thanh toán cho tài xế, xe bao mới sạch</li>
              </ol>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- BƯỚC 4: NHẬP SĐT XÁC NHẬN ĐẶT ĐƠN          -->
          <!-- ========================================== -->
          <div
            v-else-if="showOrderConfirmStep && !orderSuccessData"
            class="space-y-3.5 px-4 pb-5 pt-10 sm:px-6 sm:pb-6 sm:pt-8"
          >
            <div class="space-y-0.5 pr-8">
              <h3 class="text-base font-bold text-slate-900">
                Xác nhận thông tin đặt chuyến
              </h3>
              <p class="text-xs text-slate-500">
                Nhập số điện thoại để nhận thông tin tài xế và mã chuyến xe.
              </p>
            </div>

            <UAlert
              title="Thông tin xác nhận chuyến xe"
              color="primary"
              variant="subtle"
              description="Vui lòng cung cấp số điện thoại chính xác để tài xế liên hệ đón và nhận mã xác nhận chuyến đi."
            />

            <div class="space-y-3">
              <UFormField
                label="Họ và tên người đi"
                required
                size="md"
              >
                <UInput
                  v-model="customerName"
                  placeholder="Nguyễn Văn A"
                  leading-icon="i-lucide-user"
                  class="w-full"
                  size="md"
                />
              </UFormField>

              <UFormField
                label="Số điện thoại đón xe"
                required
                size="md"
                description="Ưu tiên số có đăng ký Zalo"
              >
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
              <div class="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <div class="flex justify-between gap-3">
                  <span>Lộ trình:</span>
                  <strong class="text-right text-slate-900">{{ sync.bookingForm.pickupWard || sync.bookingForm.pickupArea }} ➔ {{ sync.bookingForm.dropoffArea }}</strong>
                </div>
                <div class="flex justify-between">
                  <span>Khởi hành:</span>
                  <span class="text-slate-900">{{ sync.bookingForm.time }} • {{ departureDateLabel }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Dòng xe:</span>
                  <span class="text-slate-900">{{ sync.bookingForm.car || '5 chỗ' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Giá cước:</span>
                  <strong class="font-mono text-sm text-primary">{{ sync.formattedPrice.value }}</strong>
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
                  class="flex-1 cursor-pointer"
                  @click="showOrderConfirmStep = false"
                />
                <UButton
                  color="primary"
                  size="lg"
                  label="Gửi mã OTP"
                  icon="i-lucide-send"
                  :loading="isSubmittingOrder"
                  class="flex-1 cursor-pointer font-bold shadow-xs"
                  @click="handleConfirmOrder"
                />
              </div>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- BƯỚC 5: NHẬP MÃ OTP XÁC THỰC                 -->
          <!-- ========================================== -->
          <div
            v-else-if="showOtpStep && !orderSuccessData"
            class="space-y-3.5 px-4 pb-5 pt-10 sm:px-6 sm:pb-6 sm:pt-8"
          >
            <div class="space-y-0.5 pr-8">
              <h3 class="text-base font-bold text-slate-900">
                Nhập mã OTP
              </h3>
              <p class="text-xs leading-relaxed text-slate-500">
                Mã OTP đã được gửi về số điện thoại
                <strong class="font-semibold text-slate-700">{{ customerPhone }}</strong>.
                Vui lòng kiểm tra <strong class="font-semibold text-slate-700">Zalo</strong> hoặc
                <strong class="font-semibold text-slate-700">tin nhắn SMS</strong> để lấy mã.
              </p>
            </div>

            <UAlert
              icon="i-lucide-shield-check"
              color="primary"
              variant="subtle"
              title="Xác thực chuyến xe"
              description="Mã OTP giúp bảo vệ chuyến đi của bạn. Vui lòng không chia sẻ mã cho người khác."
            />

            <div class="flex justify-center py-1">
              <UPinInput
                v-model="otpValue"
                otp
                :length="6"
                size="xl"
              />
            </div>

            <UAlert
              v-if="otpError"
              color="error"
              variant="soft"
              :description="otpError"
              icon="i-lucide-circle-x"
            />

            <p class="text-center text-xs text-slate-500">
              Không nhận được mã?
              <button
                type="button"
                class="font-semibold text-primary disabled:opacity-40"
                :disabled="resendCooldown > 0 || otpLoading"
                @click="handleResendOtp"
              >
                {{ resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại' }}
              </button>
            </p>

            <div class="flex items-center gap-2.5 pt-1">
              <UButton
                color="neutral"
                variant="outline"
                size="lg"
                label="Quay lại"
                icon="i-lucide-arrow-left"
                class="flex-1 cursor-pointer"
                :disabled="otpLoading"
                @click="handleBackToContact"
              />
              <UButton
                color="primary"
                size="lg"
                label="Xác nhận đặt xe"
                icon="i-lucide-check-circle"
                :loading="otpLoading"
                :disabled="otpValue.length < 6"
                class="flex-1 cursor-pointer font-bold shadow-xs"
                @click="handleVerifyOtp"
              />
            </div>
          </div>

          <!-- ========================================== -->
          <!-- BƯỚC 6: THÔNG BÁO ĐẶT XE THÀNH CÔNG        -->
          <!-- ========================================== -->
          <div
            v-else-if="orderSuccessData"
            class="space-y-3.5 px-4 pb-6 pt-10 text-center sm:px-6 sm:pb-8"
          >
            <div class="mx-auto flex size-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-500">
              <UIcon
                name="i-lucide-check-circle"
                class="size-8"
              />
            </div>

            <div class="space-y-0.5">
              <h3 class="text-lg font-bold text-slate-900">
                Đặt xe thành công!
              </h3>
              <p class="mx-auto max-w-sm text-xs text-slate-500">
                Hệ thống Happy Trip đã ghi nhận chuyến xe của bạn. Tài xế sẽ liên hệ xác nhận sớm nhất.
              </p>
            </div>

            <div class="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-600">
              <div class="flex justify-between">
                <span>Mã chuyến xe:</span>
                <strong class="font-mono text-sm text-slate-900">{{ orderSuccessData.short_id || orderSuccessData.order_id }}</strong>
              </div>
              <div class="flex justify-between gap-3">
                <span>Lộ trình:</span>
                <span class="text-right text-slate-800">{{ sync.bookingForm.pickupWard || sync.bookingForm.pickupArea }} ➔ {{ sync.bookingForm.dropoffArea }}</span>
              </div>
              <div class="flex justify-between">
                <span>Giá cước:</span>
                <strong class="font-mono text-sm text-primary">{{ sync.formattedPrice.value }}</strong>
              </div>
            </div>

            <UButton
              color="primary"
              size="lg"
              block
              label="Đóng"
              class="cursor-pointer font-bold"
              @click="handleClose"
            />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
