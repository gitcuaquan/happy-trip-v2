<template>
  <UModal
    :open="open"
    :title="modalTitle"
    :description="modalDescription"
    :ui="{
      content: 'sm:w-120 overflow-hidden',
      body: 'p-5 sm:p-6'
    }"
    @update:open="handleModalClose"
  >
    <template #body>
      <!-- BƯỚC 1: NHẬP THÔNG TIN LIÊN HỆ -->
      <template v-if="step === 'contact'">
        <UAlert
          title="Xin chú ý"
          color="success"
          class="mb-5"
          variant="subtle"
          description="Thông tin này để gửi mã OTP xác nhận chuyến đi của bạn. Vui lòng đảm bảo số điện thoại chính xác và ưu tiên số điện thoại đăng ký Zalo để nhận OTP nhanh chóng."
        />
        <div class="flex flex-col gap-3.5">
          <UForm
            :schema="contactSchema"
            :state="contact"
            class="flex flex-col gap-3.5"
            @submit="onSubmitContact"
          >
            <UFormField
              name="name"
              label="Họ và tên"
              required
              size="lg"
            >
              <UInput
                v-model="contact.name"
                placeholder="Nguyễn Văn A"
                leading-icon="i-lucide-user"
                class="w-full"
                size="lg"
              />
            </UFormField>
            <UFormField
              name="phone"
              label="Số điện thoại"
              description="Ưu tiên số có đăng ký Zalo"
              required
              size="lg"
            >
              <UInput
                v-model="contact.phone"
                placeholder="0901 234 567"
                type="tel"
                leading-icon="i-lucide-phone"
                class="w-full"
                size="lg"
              />
            </UFormField>
            <UAlert
              v-if="hookError"
              color="error"
              variant="soft"
              :description="hookError"
              icon="i-lucide-circle-alert"
            />
            <UButton
              type="submit"
              block
              color="primary"
              icon="i-lucide-send"
              label="Gửi mã OTP"
              :loading="hookLoading"
              class="mt-1"
            />
          </UForm>

          <div class="flex items-center gap-2">
            <div class="flex-1 h-px bg-slate-100" />
            <span class="text-[10px] text-slate-400">bảo mật & an toàn</span>
            <div class="flex-1 h-px bg-slate-100" />
          </div>
        </div>
      </template>

      <!-- BƯỚC 2: NHẬP MÃ OTP -->
      <template v-else-if="step === 'otp'">
        <p class="text-sm text-left font-medium mb-6">
          Mã OTP đã gửi về số điện thoại {{ contact.phone }} vui lòng kiểm tra
          Zalo hoặc SMS của bạn.
        </p>

        <div class="sm:py-6 flex flex-col gap-3.5">
          <div class="flex justify-center">
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
          <UButton
            block
            color="primary"
            size="lg"
            icon="i-lucide-check-circle"
            label="Xác nhận OTP"
            :loading="otpLoading"
            :disabled="otpValue.length < 6"
            @click="confirmOTP"
          />

          <p class="text-center text-xs text-slate-500">
            Không nhận được mã?
            <button
              type="button"
              class="text-primary font-semibold disabled:opacity-40"
              :disabled="resendCooldown > 0 || otpLoading"
              @click="handleResend"
            >
              {{
                resendCooldown > 0
                  ? `Gửi lại (${resendCooldown}s)`
                  : "Gửi lại"
              }}
            </button>
          </p>

          <UButton
            block
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            label="Đổi số điện thoại"
            @click="handleBackToInfo"
          />

          <div class="flex items-center gap-2">
            <div class="flex-1 h-px bg-slate-100" />
            <span class="text-[10px] text-slate-400">bảo mật & an toàn</span>
            <div class="flex-1 h-px bg-slate-100" />
          </div>
        </div>
      </template>

      <!-- BƯỚC 3: CHỌN ƯU ĐÃI (KHI CÓ ƯU ĐÃI KHẢ DỤNG) -->
      <template v-else-if="step === 'discount'">
        <div class="flex flex-col gap-4">
          <UiOrderDiscountSelect
            :options="discountOptions"
            :price-guest-after="savedPrice"
            :model-value="selectedDiscount"
            :referrer-loading="referrerLoading"
            @update:model-value="selectedDiscount = $event"
            @apply-referrer="handleApplyReferrer"
          />

          <UAlert
            v-if="createOrderError"
            color="error"
            variant="soft"
            :description="createOrderError"
            icon="i-lucide-circle-alert"
          />

          <UButton
            block
            color="primary"
            size="lg"
            icon="i-lucide-check-circle"
            label="Xác nhận đặt xe"
            :loading="createOrderLoading"
            @click="submitDiscountOrder"
          />

          <div class="flex items-center gap-2">
            <div class="flex-1 h-px bg-slate-100" />
            <span class="text-[10px] text-slate-400">bảo mật & an toàn</span>
            <div class="flex-1 h-px bg-slate-100" />
          </div>
        </div>
      </template>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'
import type {
  OrderDetail,
  OrderPreview,
  DiscountOption,
  OrderDiscountInput,
  CreateOrderByAjaxPayload
} from '~/type'
import { orderService } from '~/services/order.service'
import { customerService } from '~/services/customer.service'
import type { SuccessData } from '~/components/ui/order/OrderSuccessModal.vue'

const props = defineProps<{
  open: boolean
  order: OrderPreview
  idService: string
  previews: OrderDetail[]
  serviceName: string
  initialName?: string
  initialPhone?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirmed': [data: SuccessData]
}>()

const { setAuth, token } = useAuth()
const { trackBookingSubmit, trackPurchase } = useGtagEvent()
const { trackPixelBookingSubmit, trackPixelBookingSuccess } = useMetaPixelEvent()

type Step = 'contact' | 'otp' | 'discount'
const step = ref<Step>('contact')

const contact = reactive({ name: '', phone: '' })
const otpValue = ref<string[]>([])
const resendCooldown = ref(0)
const hookLoading = ref(false)
const otpLoading = ref(false)
const hookError = ref('')
const otpError = ref('')
const savedPrice = ref(0)

// Discount step state
const discountOptions = ref<DiscountOption[]>([])
const selectedDiscount = ref<OrderDiscountInput | null>({ type: null })
const referrerLoading = ref(false)
const createOrderLoading = ref(false)
const createOrderError = ref('')

const modalTitle = computed(() => {
  if (step.value === 'discount') return 'Ưu đãi chuyến đi'
  if (step.value === 'otp') return 'Xác nhận OTP'
  return 'Thông tin liên hệ'
})

const modalDescription = computed(() => {
  if (step.value === 'discount') return 'Chọn ưu đãi chuyến đi để tiết kiệm chi phí'
  if (step.value === 'otp') return 'Mã OTP đã được gửi về số điện thoại của bạn'
  return 'Thông tin để tài xế liên hệ và xác nhận chuyến đi của bạn'
})

const contactSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ và tên'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
})

type ContactSchema = z.infer<typeof contactSchema>

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (!contact.name && props.initialName) {
      contact.name = props.initialName
    }
    if (!contact.phone && props.initialPhone) {
      contact.phone = props.initialPhone
    }
  } else {
    resetModalState()
  }
})

const getPreview = (id: string) =>
  props.previews.find(p => p.id_service === id && p.price_guest_after > 0)

function resetModalState() {
  step.value = 'contact'
  otpValue.value = []
  hookError.value = ''
  otpError.value = ''
  createOrderError.value = ''
  discountOptions.value = []
  selectedDiscount.value = { type: null }
}

function onSubmitContact(_e: FormSubmitEvent<ContactSchema>) {
  sendOTP()
}

function startResendCooldown() {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(interval)
  }, 1000)
}

async function sendOTP() {
  hookLoading.value = true
  hookError.value = ''
  otpError.value = ''
  const preview = getPreview(props.idService)
  savedPrice.value = preview?.price_guest_after || 0

  try {
    await customerService.sendLoginOtp(contact.phone)
    step.value = 'otp'
    otpValue.value = []
    startResendCooldown()

    // Track GA4 & Meta Pixel booking_submit event (lần đầu gửi OTP)
    const params = {
      route_from: props.order.departure_city,
      route_to: props.order.destination_city,
      service_name: props.serviceName,
      price: savedPrice.value
    }
    trackBookingSubmit(params)
    trackPixelBookingSubmit(params)
  } catch (err: unknown) {
    hookError.value
      = err?.data?.message
        || (typeof err?.data === 'string' && err.data)
        || 'Không thể gửi OTP. Vui lòng thử lại.'
  } finally {
    hookLoading.value = false
  }
}

async function handleResend() {
  if (resendCooldown.value > 0 || hookLoading.value) return
  otpLoading.value = true
  otpError.value = ''
  try {
    await customerService.sendLoginOtp(contact.phone)
    otpValue.value = []
    startResendCooldown()
  } catch (err: unknown) {
    otpError.value
      = err?.data?.message
        || (typeof err?.data === 'string' && err.data)
        || 'Không thể gửi lại OTP. Vui lòng thử lại sau.'
  } finally {
    otpLoading.value = false
  }
}

function handleBackToInfo() {
  step.value = 'contact'
  otpValue.value = []
  otpError.value = ''
}

function handleModalClose(value: boolean) {
  if (value === false) {
    emit('update:open', false)
    setTimeout(() => {
      resetModalState()
    }, 200)
  } else {
    emit('update:open', value)
  }
}

async function confirmOTP() {
  otpLoading.value = true
  otpError.value = ''
  try {
    const res = await customerService.verifyLoginOtp(contact.phone, otpValue.value.join(''))

    if (res.token && res.customer) {
      setAuth(res.token, res.customer)
    }

    const preview = getPreview(props.idService)
    savedPrice.value = preview?.price_guest_after || 0

    // Gọi discount-options với token vừa nhận
    let options: DiscountOption[] = []
    try {
      options = await orderService.getDiscountOptions(res.token, {
        price_guest_after: savedPrice.value
      })
    } catch (err) {
      console.warn('Lỗi lấy discount-options, tiếp tục tạo đơn:', err)
      options = []
    }

    discountOptions.value = options

    if (!options || options.length === 0) {
      // Danh sách ưu đãi rỗng -> Đặt xe ngay qua by-ajax
      await executeOrderByAjax(res.token, { type: null })
    } else {
      // Có ưu đãi -> Chuyển sang popup chọn ưu đãi
      step.value = 'discount'
    }
  } catch (err: unknown) {
    otpError.value
      = err?.data?.message
        || (typeof err?.data === 'string' && err.data)
        || 'Mã OTP không đúng hoặc đã hết hạn.'
  } finally {
    otpLoading.value = false
  }
}

async function handleApplyReferrer(phone: string) {
  if (!token.value) return
  referrerLoading.value = true
  createOrderError.value = ''
  try {
    discountOptions.value = await orderService.getDiscountOptions(token.value, {
      price_guest_after: savedPrice.value,
      referrer_phone: phone
    })
  } catch (err: unknown) {
    createOrderError.value
      = err?.data?.message
        || (typeof err?.data === 'string' && err.data)
        || 'Không thể áp dụng số điện thoại người giới thiệu.'
  } finally {
    referrerLoading.value = false
  }
}

async function submitDiscountOrder() {
  if (!token.value) return
  await executeOrderByAjax(token.value, selectedDiscount.value)
}

async function executeOrderByAjax(authToken: string, discount: OrderDiscountInput | null) {
  createOrderLoading.value = true
  createOrderError.value = ''
  const preview = getPreview(props.idService)

  const payload: CreateOrderByAjaxPayload = {
    departure_city: props.order.departure_city,
    departure_dictrict: props.order.departure_dictrict,
    departure_address_1: props.order.departure_address_1,
    destination_city: props.order.destination_city,
    destination_dictrict: props.order.destination_dictrict,
    destination_address_1: props.order.destination_address_1,
    date_of_destination: props.order.date_of_destination,
    id_service: props.idService,
    full_name: contact.name,
    phone: contact.phone,
    price_guest_after: preview?.price_guest_after ?? 0,
    price_guest: preview?.price_guest ?? 0,
    price: preview?.price_original ?? 0,
    note: props.order.note?.trim() || '',
    discount: discount || { type: null }
  }

  try {
    const res = await orderService.createOrderByAjax(authToken, payload)

    emit('confirmed', {
      departure_city: props.order.departure_city,
      departure_district: props.order.departure_dictrict,
      departure_address_1: props.order.departure_address_1,
      destination_city: props.order.destination_city,
      destination_district: props.order.destination_dictrict,
      destination_address_1: props.order.destination_address_1,
      service_name: props.serviceName,
      price: res.price_guest_after || savedPrice.value,
      price_customer_pay: res.price_customer_pay,
      discount: res.discount
    })

    // Track GA4 & Meta Pixel purchase event (conversion)
    const trackingParams = {
      route_from: props.order.departure_city,
      route_to: props.order.destination_city,
      service_name: props.serviceName,
      price: res.price_customer_pay || res.price_guest_after || savedPrice.value
    }
    trackPurchase(trackingParams)
    trackPixelBookingSuccess(trackingParams)

    // Lưu log vào cơ sở dữ liệu (fire and forget)
    $fetch('/api/logs/booking', {
      method: 'POST',
      body: trackingParams
    }).catch(console.error)

    emit('update:open', false)
    resetModalState()
  } catch (err: unknown) {
    createOrderError.value = err?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.'
    // Khi gặp lỗi ưu đãi, không có đơn nào được tạo: gọi lại discount-options, cho khách chọn lại
    if (step.value === 'discount') {
      try {
        discountOptions.value = await orderService.getDiscountOptions(authToken, {
          price_guest_after: savedPrice.value
        })
      } catch (e) {
        console.error('Không thể tải lại discount options:', e)
      }
    }
  } finally {
    createOrderLoading.value = false
  }
}
</script>
