<template>
  <div class="relative w-full max-w-md mx-auto my-10 p-2">

    <!-- Background blobs -->
    <div class="absolute -top-10 -left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse [animation-duration:4s]" />
    <div class="absolute -bottom-10 -right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse [animation-duration:5s]" />

    <!-- Badge -->
    <div class="absolute right-2 -top-8 z-20 animate-bounce [animation-duration:2.5s]">
      <div class="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2">
        <UIcon name="i-lucide-sparkles" class="size-5 text-yellow-500 animate-pulse [animation-duration:0.5s]" />
        <span class="text-xs font-black text-slate-700 uppercase tracking-wider">Siêu tốc</span>
      </div>
    </div>

    <!-- Main card -->
    <UCard
    :key="formKey"
      class="relative z-10 backdrop-blur-md bg-white/95 border-2 border-white"
      :ui="{
        root: 'w-full overflow-visible shadow-2xl rounded-4xl',
        header: 'overflow-hidden rounded-t-4xl bg-primary',
        body: 'p-3 space-y-6',
        footer: 'px-1 pb-1 pt-0 border-t-0',
      }"
    >
      <template #header>
        <div class="flex items-center uppercase justify-center gap-2 relative z-10">
          <span class="text-white font-black text-lg tracking-tight">Đặt xe HappyTrip</span>
        </div>
      </template>

      <UForm :schema="schema" :state="order" class="space-y-4 text-left" @submit="onSubmit">

        <!-- Điểm đón -->
        <div class="mb-2">
          <div class="flex items-center gap-2 mb-2">
            <div class="p-1.5 bg-primary/10 rounded-lg">
              <div class="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Điểm đón</span>
          </div>
          <ElementAddress
            namePrefix="departure"
            icon="i-lucide-locate-fixed"
            label="Điểm đón"
            placeholder="Bạn đang ở đâu?"
            v-model:city="order.departure_city"
            v-model:province="order.departure_dictrict"
            v-model:address="order.departure_address_1"
            :exclude-city="order.destination_city"
          />
        </div>

        <!-- Điểm đến -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="p-1.5 bg-blue-500/10 rounded-lg">
              <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Điểm đến</span>
          </div>
          <ElementAddress
            namePrefix="destination"
            icon="i-lucide-map-pin"
            label="Điểm đến"
            placeholder="Điểm đến của bạn?"
            v-model:city="order.destination_city"
            v-model:province="order.destination_dictrict"
            v-model:address="order.destination_address_1"
            :exclude-city="order.departure_city"
          />
        </div>

        <!-- Thời gian -->
        <UFormField :ui="{ error: 'text-xs text-left' }">
          <template #label>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian khởi hành</span>
          </template>
          <UiDatePicker v-model="order.date_of_destination" class="flex-1 text-sm font-medium" />
        </UFormField>

        <!-- Chọn loại xe -->
        <Transition name="fade">
          <div v-if="hasRouteData" class="space-y-2 pt-2">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Chọn loại xe</p>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="item in services"
                :key="item.id"
                @click="selectService(item)"
                :class="[
                  'relative overflow-hidden rounded-xl border-2 p-2.5 cursor-pointer transition-all duration-200',
                  !getPreview(item.id) ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100' : 'active:scale-95',
                  order.id_service === item.id ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' : 'border-slate-100 bg-white',
                ]"
              >
                <div v-if="order.id_service === item.id" class="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/10 rounded-full blur-lg" />
                <div class="relative z-10">
                  <p class="text-[16px] font-black text-slate-800 leading-tight mb-0.5 truncate">{{ item.name }}</p>
                  <p class="text-[15px] text-slate-500 font-medium mb-2 truncate">{{ item.description }}</p>
                  <div v-if="getPreview(item.id)" class="inline-flex items-center px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md text-xs font-bold tracking-tight">
                    {{ numberToCurrency(getPreview(item.id)?.price_guest_after || 0) }}
                  </div>
                  <p v-else class="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-md inline-block">
                    Chưa hỗ trợ
                  </p>
                </div>
              </div>
            </div>
            <p v-if="hasValidPrice" class="text-[12px] text-slate-500 leading-relaxed mt-3">
              Giá tiền này đã bao gồm tất cả các khoản phí. <b>Không phát sinh thêm</b>
            </p>
          </div>
        </Transition>

        <UButton type="submit" color="primary" class="rounded-2xl font-black text-sm shadow-xl transition-all duration-300 w-full block">
          <span class="flex items-center justify-center gap-2 py-1 w-full">
            <UIcon name="i-lucide-rocket" class="size-5" />
            ĐẶT CHUYẾN NGAY
          </span>
        </UButton>

      </UForm>

      <template #footer>
        <div class="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-xl border border-slate-100">
          <div class="flex -space-x-2">
            <img class="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="Avatar" />
            <img class="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="Avatar" />
            <div class="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">+</div>
          </div>
          <span class="text-[11px] text-slate-500 font-medium">
            Hơn <strong class="text-slate-800">1.200+</strong> người đã đặt hôm nay
          </span>
        </div>
      </template>
    </UCard>

    <!-- Modal: Thông tin liên hệ & OTP -->
    <UModal v-model:open="isModalOpen" :ui="{ content: 'sm:w-120 overflow-hidden p-0', body: 'p-0' }">
      <template #content>
        <div>
          <div class="bg-primary px-4 pt-3 pb-2 sm:px-8 sm:pt-5 sm:pb-4 text-center">
            <p class="text-white font-semibold text-sm sm:text-base">
              {{ otpSent ? 'Nhập mã OTP' : 'Thông tin liên hệ' }}
            </p>
            <p class="text-white/75 text-xs sm:text-sm sm:mt-1">
              {{ otpSent ? `Mã đã gửi đến ${contact.phone}` : 'Chúng tôi sẽ xác nhận qua tin nhắn' }}
            </p>
          </div>

          <div class="p-5 sm:px-8 sm:py-6 flex flex-col gap-3.5">

            <!-- Bước 1: Nhập thông tin -->
            <UForm v-if="!otpSent" :schema="contactSchema" :state="contact" class="flex flex-col gap-3.5" @submit="onSubmitContact">
              <UFormField name="name" label="Họ và tên" required :ui="{ label: 'text-xs font-medium' }">
                <UInput v-model="contact.name" placeholder="Nguyễn Văn A" leading-icon="i-lucide-user" class="w-full" size="md" />
              </UFormField>
              <UFormField name="phone" label="Số điện thoại" description="Ưu tiên số có đăng ký Zalo" required :ui="{ label: 'text-xs font-medium', description: 'text-xs' }">
                <UInput v-model="contact.phone" placeholder="0901 234 567" type="tel" leading-icon="i-lucide-phone" class="w-full" size="md" />
              </UFormField>
              <UAlert v-if="hookError" color="error" variant="soft" :description="hookError" icon="i-lucide-circle-alert" />
              <UButton type="submit" block color="primary" icon="i-lucide-send" label="Gửi mã OTP" :loading="hookLoading" class="mt-1" />
            </UForm>

            <!-- Bước 2: Nhập OTP -->
            <div v-else class="flex flex-col gap-3.5">
              <div class="flex justify-center">
                <UPinInput v-model="otpValue" otp :length="6" size="md" />
              </div>
              <UAlert v-if="otpError" color="error" variant="soft" :description="otpError" icon="i-lucide-circle-x" />
              <UButton block color="primary" icon="i-lucide-check-circle" label="Xác nhận OTP" :loading="otpLoading" :disabled="otpValue.length < 6" @click="confirmOTP" />
              <UButton block size="sm" color="neutral" variant="ghost" icon="i-lucide-arrow-left" label="Đổi số điện thoại" @click="otpSent = false" />
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1 h-px bg-slate-100" />
              <span class="text-[10px] text-slate-400">bảo mật & an toàn</span>
              <div class="flex-1 h-px bg-slate-100" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Modal: Đặt xe thành công -->
    <UModal v-model:open="openDepositModal" prevent-close :ui="{
      content: 'bg-transparent shadow-none sm:max-w-sm',
      overlay: 'bg-black/40 backdrop-blur-sm'
    }">
      <template #content>
        <div class="bg-white shadow-2xl p-8 text-center relative overflow-hidden">
          <div class="mb-6 relative z-10 flex justify-center">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>

          <div class="relative z-10">
            <h3 class="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">Đặt xe thành công!</h3>
            <p class="text-slate-500 text-sm mb-6 leading-relaxed">
              Hệ thống đã ghi nhận chuyến đi của bạn. Tài xế sẽ liên hệ trong ít phút nữa.
            </p>

            <div class="bg-slate-50 rounded-xl mb-6 text-left border border-slate-100 shadow-sm flex flex-col">
              <div class="p-4 space-y-3">
                <div class="flex justify-between items-start gap-4">
                  <span class="text-xs text-slate-500 font-medium whitespace-nowrap">Điểm đón:</span>
                  <span class="text-sm font-bold text-slate-800 text-right">{{ successData.departure_city }}</span>
                </div>
                <div class="flex justify-between items-start gap-4">
                  <span class="text-xs text-slate-500 font-medium whitespace-nowrap">Điểm đến:</span>
                  <span class="text-sm font-bold text-slate-800 text-right">{{ successData.destination_city }}</span>
                </div>
                <div class="flex justify-between items-center gap-4">
                  <span class="text-xs text-slate-500 font-medium">Loại xe:</span>
                  <span class="text-sm font-bold text-slate-800">{{ successData.service_name }}</span>
                </div>
              </div>
              <div class="bg-orange-50 p-4 rounded-b-xl border-t border-orange-100 flex justify-between items-center">
                <span class="text-xs text-primary font-bold uppercase tracking-wide">Tổng tiền:</span>
                <span class="text-lg font-black text-primary">{{ numberToCurrency(successData.price) }}</span>
              </div>
            </div>

            <button
              @click="resetAll"
              class="w-full bg-linear-to-r from-primary to-orange-500 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(249,115,22,0.25)] transition-all active:scale-[0.98]"
            >
              Về trang chủ
            </button>
          </div>

          <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        </div>
      </template>
    </UModal>

  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'
import type { OrderDetail, OrderPreview } from '~/type'

const BASE = 'https://sysdev.happytrip.vn'
const SECRET = '123'

// ─── Order state ──────────────────────────────────────────
const order = ref<OrderPreview>({
  id_service: '',
  date_of_destination: null,
  departure_city: '',
  departure_dictrict: '',
  departure_address_1: '',
  destination_city: '',
  destination_dictrict: '',
  destination_address_1: '',
})

const services = ref([
  { id: '66947d0917482239472b9807', name: 'Bao chuyến 5 chỗ', description: '1-4 hành khách' },
  { id: '66947cea17482239472b88e8', name: 'Bao chuyến 7 chỗ', description: '3-6 hành khách' },
])

const previews = ref<OrderDetail[]>([])

// ─── Contact & OTP state ──────────────────────────────────
const contact = reactive({ name: '', phone: '' })
const isModalOpen = ref(false)
const otpSent = ref(false)
const otpValue = ref<string[]>([])
const hookLoading = ref(false)
const otpLoading = ref(false)
const hookError = ref('')
const otpError = ref('')

// ─── Success state ────────────────────────────────────────
const openDepositModal = ref(false)
const savedPrice = ref(0)
const successData = ref({ departure_city: '', destination_city: '', service_name: '', price: 0 })

// ─── Computed ─────────────────────────────────────────────
const addressReady = computed(() => {
  const o = order.value
  return !!(o.departure_city && o.departure_dictrict && o.destination_city && o.destination_dictrict)
})

const hasRouteData = computed(() => previews.value.length > 0)
const hasValidPrice = computed(() => previews.value.some(p => p.price_guest_after > 0))
const getPreview = (id: string) => previews.value.find(p => p.id_service === id && p.price_guest_after > 0)

// ─── Schemas ──────────────────────────────────────────────
const schema = z.object({
  departure_city: z.string().min(1, 'Vui lòng chọn Tỉnh/TP'),
  departure_dictrict: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  departure_address_1: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  destination_city: z.string().min(1, 'Vui lòng chọn Tỉnh/TP'),
  destination_dictrict: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  destination_address_1: z.string().min(1, 'Vui lòng nhập địa chỉ'),
})

const contactSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ và tên'),
  phone: z.string().min(1, 'Vui lòng nhập số điện thoại').regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ'),
})

type Schema = z.infer<typeof schema>
type ContactSchema = z.infer<typeof contactSchema>

// ─── Handlers ─────────────────────────────────────────────
function onSubmit(_e: FormSubmitEvent<Schema>) {
  isModalOpen.value = true
  otpSent.value = false
  otpValue.value = []
  hookError.value = ''
  otpError.value = ''
}

function onSubmitContact(_e: FormSubmitEvent<ContactSchema>) {
  sendOTP()
}

function selectService(item: { id: string }) {
  if (!getPreview(item.id)) return
  order.value.id_service = item.id
}

function resetAll() {
  openDepositModal.value = false
  window.location.reload()
}

// ─── Watch ────────────────────────────────────────────────
watch(addressReady, async (val) => {
  if (!val) {
    previews.value = []
    return
  }
  await calcPreviews()
  order.value.id_service = services.value[0]?.id || ''
})

// ─── API ──────────────────────────────────────────────────
async function calcPreviews() {
  const results = await Promise.allSettled(
    services.value.map(s =>
      $fetch<OrderDetail>(`${BASE}/api/order/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', origin: 'https://happytrip.vn', referer: 'https://happytrip.vn/' },
        body: { ...order.value, id_service: s.id },
      })
    )
  )
  previews.value = results
    .filter((r): r is PromiseFulfilledResult<OrderDetail> => r.status === 'fulfilled')
    .map(r => r.value)
}

async function sendOTP() {
  hookLoading.value = true
  hookError.value = ''
  const preview = getPreview(order.value.id_service)
  savedPrice.value = preview?.price_guest_after || 0

  try {
    await $fetch(`${BASE}/api/order/hook`, {
      method: 'POST',
      params: { secret: SECRET },
      headers: { 'Content-Type': 'application/json' },
      body: {
        ...order.value,
        full_name: contact.name,
        phone: contact.phone,
        price_guest_after: preview?.price_guest_after ?? 0,
        price_guest: preview?.price_guest ?? 0,
        price: preview?.price_original ?? 0,
      },
    })
    otpSent.value = true
  } catch {
    hookError.value = 'Không thể gửi OTP. Vui lòng thử lại.'
  } finally {
    hookLoading.value = false
  }
}


const formKey = ref(0) 
async function confirmOTP() {
  otpLoading.value = true
  otpError.value = ''
  try {
    await $fetch(`${BASE}/api/order/confirm-otp/${SECRET}`, {
      method: 'POST',
      params: { otp: otpValue.value.join('') },
    })
    isModalOpen.value = false
    successData.value = {
      departure_city: order.value.departure_city,
      destination_city: order.value.destination_city,
      service_name: services.value.find(s => s.id === order.value.id_service)?.name || '',
      price: savedPrice.value,
    }

    // Reset toàn bộ state
    order.value = {
      id_service: '',
      date_of_destination: null,
      departure_city: '',
      departure_dictrict: '',
      departure_address_1: '',
      destination_city: '',
      destination_dictrict: '',
      destination_address_1: '',
    }
    previews.value = []
    contact.name = ''
    contact.phone = ''
    otpValue.value = []
    formKey.value++ 
    openDepositModal.value = true

    setTimeout(() => { openDepositModal.value = false }, 3000)

  } catch {
    otpError.value = 'Mã OTP không đúng hoặc đã hết hạn.'
  } finally {
    otpLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #fff;
  stroke-miterlimit: 10;
  margin: 0 auto;
  box-shadow: inset 0px 0px 0px #f97316;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
}
.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #f97316;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke { 100% { stroke-dashoffset: 0; } }
@keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
@keyframes fill { 100% { box-shadow: inset 0px 0px 0px 50px #f97316; } }
</style>