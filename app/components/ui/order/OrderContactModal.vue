<template>
  <UModal
    :open="open"
    title="Thông tin liên hệ"
    description="Thông tin để tài xế liên hệ và xác nhận chuyến đi của bạn"
    :ui="{
      content: 'sm:w-120 overflow-hidden',
      body: 'p-5 sm:p-6',
    }"
    @update:open="handleModalClose"
  >
    <template #body>
      <template v-if="!showOtpModal">
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
            <UFormField name="name" label="Họ và tên" required size="lg">
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

      <template v-else>
        <p class="text-sm text-left font-medium mb-6">
          Mã OTP đã gửi về số điện thoại {{ contact.phone }} vui lòng kiểm tra
          Zalo hoặc SMS của bạn.
        </p>

        <div class="sm:py-6 flex flex-col gap-3.5">
          <div class="flex justify-center">
            <UPinInput v-model="otpValue" otp :length="6" size="xl" />
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
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui"
import z from "zod"
import type { OrderDetail, OrderPreview } from "~/type"
import { orderService } from "~/services/order.service"

interface SuccessData {
  departure_city: string
  departure_district: string
  departure_address_1: string
  destination_city: string
  destination_district: string
  destination_address_1: string
  service_name: string
  price: number
}

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
  "update:open": [value: boolean]
  confirmed: [data: SuccessData]
}>()

const { setAuth } = useAuth()
const { trackBookingSubmit, trackPurchase } = useGtagEvent()
const { trackPixelBookingSubmit, trackPixelBookingSuccess } = useMetaPixelEvent()

const contact = reactive({ name: "", phone: "" })
const showOtpModal = ref(false)
const otpValue = ref<string[]>([])
const resendCooldown = ref(0)
const hookLoading = ref(false)
const otpLoading = ref(false)
const hookError = ref("")
const otpError = ref("")
const savedPrice = ref(0)

const contactSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ và tên"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
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
  }
})

const getPreview = (id: string) =>
  props.previews.find((p) => p.id_service === id && p.price_guest_after > 0)

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

async function submitOrderHook({ isResend = false } = {}) {
  hookLoading.value = true
  hookError.value = ""
  otpError.value = ""
  const preview = getPreview(props.idService)
  savedPrice.value = preview?.price_guest_after || 0

  try {
    await orderService.createOrderHook({
      ...props.order,
      full_name: contact.name,
      phone: contact.phone,
      price_guest_after: preview?.price_guest_after ?? 0,
      price_guest: preview?.price_guest ?? 0,
      price: preview?.price_original ?? 0,
      note: props.order.note?.trim() || "",
    })
    if (isResend) {
      otpValue.value = []
    } else {
      showOtpModal.value = true
      // Track GA4 & Meta Pixel booking_submit event (lần đầu gửi OTP)
      const params = {
        route_from: props.order.departure_city,
        route_to: props.order.destination_city,
        service_name: props.serviceName,
        price: savedPrice.value,
      }
      trackBookingSubmit(params)
      trackPixelBookingSubmit(params)
    }
    startResendCooldown()
  } catch {
    const msg = isResend
      ? "Không thể gửi lại OTP. Vui lòng thử lại."
      : "Không thể gửi OTP. Vui lòng thử lại."
    if (isResend) otpError.value = msg
    else hookError.value = msg
  } finally {
    hookLoading.value = false
  }
}

const sendOTP = () => submitOrderHook()

async function handleResend() {
  if (resendCooldown.value > 0 || hookLoading.value) return
  await submitOrderHook({ isResend: true })
}

function handleBackToInfo() {
  showOtpModal.value = false
  otpValue.value = []
  otpError.value = ""
}

function handleModalClose(value: boolean) {
  if (value === false && showOtpModal.value) {
    showOtpModal.value = false
  } else {
    emit("update:open", value)
  }
}

async function confirmOTP() {
  otpLoading.value = true
  otpError.value = ""
  try {
    const res = await orderService.confirmOrderOtp(otpValue.value.join(""))

    if (res.token && res.customer) {
      setAuth(res.token, res.customer)
    }

    emit("confirmed", {
      departure_city: props.order.departure_city,
      departure_district: props.order.departure_dictrict,
      departure_address_1: props.order.departure_address_1,
      destination_city: props.order.destination_city,
      destination_district: props.order.destination_dictrict,
      destination_address_1: props.order.destination_address_1,
      service_name: props.serviceName,
      price: savedPrice.value,
    })

    // Track GA4 & Meta Pixel purchase event (conversion)
    const params = {
      route_from: props.order.departure_city,
      route_to: props.order.destination_city,
      service_name: props.serviceName,
      price: savedPrice.value,
    }
    trackPurchase(params)
    trackPixelBookingSuccess(params)

    // Lưu log vào cơ sở dữ liệu (fire and forget)
    $fetch('/api/logs/booking', {
      method: 'POST',
      body: params
    }).catch(console.error)

    emit("update:open", false)
    showOtpModal.value = false
    otpValue.value = []
  } catch {
    otpError.value = "Mã OTP không đúng hoặc đã hết hạn."
  } finally {
    otpLoading.value = false
  }
}
</script>
