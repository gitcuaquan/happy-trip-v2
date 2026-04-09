<template>
  <div class="relative w-full max-w-md mx-auto my-10 p-2">

      <div class="absolute -top-10 -left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse [animation-duration:4s]"></div>
      <div class="absolute -bottom-10 -right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse [animation-duration:5s]"></div>

      <div class="absolute -right-2 -top-6 z-20 animate-bounce [animation-duration:2.5s]">
        <div class="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="size-5 text-yellow-500 animate-pulse [animation-duration:0.5s]" />
          <span class="text-xs font-black text-slate-700 uppercase tracking-wider">Siêu tốc</span>
        </div>
      </div>

    <UCard class="relative z-10 backdrop-blur-md bg-white/95 border-2 border-white" :ui="{
      root: 'w-full overflow-visible shadow-2xl rounded-4xl',
      header: 'p-0 overflow-hidden rounded-t-4xl',
      body: 'p-6 space-y-6',
      footer: 'px-6 pb-6 pt-0 border-t-0'
    }">
      <template #header>
        <div class="bg-linear-to-r from-primary to-orange-500 px-6 py-5 relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

          <div class="flex items-center gap-2 mb-2 relative z-10">
            <UIcon name="i-lucide-car-taxi-front" class="size-6 text-white" />
            <span class="text-white font-black text-lg tracking-tight">Đặt xe HappyTrip</span>
          </div>
          <div class="flex items-center gap-2 mt-1 relative z-10">
            <UBadge color="info" variant="solid" class="text-primary bg-white/90 font-bold" size="sm" label="Nhanh"
              icon="i-lucide-zap" />
            <UBadge color="info" variant="soft" class="text-primary bg-white/90 border-white/30" size="sm"
              label="An toàn" icon="i-lucide-shield-check" />
          </div>
        </div>
      </template>

      <UFormField>
        <template #label>
          <div class="flex items-center gap-2 mb-1">
            <div class="p-1.5 bg-primary/10 rounded-lg">
              <div class="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Điểm đón</span>
          </div>
        </template>
        <ElementAddress icon="i-lucide-locate-fixed" label="Điểm đón" placeholder="Bạn đang ở đâu?"
          v-model:city="order.departure_city" v-model:province="order.departure_dictrict"
          v-model:address="order.departure_address_1" :exclude-city="order.destination_city" />
      </UFormField>

      <USeparator class="flex-1 opacity-70" />

      <UFormField>
        <template #label>
          <div class="flex items-center gap-2 mb-1">
            <div class="p-1.5 bg-blue-500/10 rounded-lg">
              <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Điểm đến</span>
          </div>
        </template>
        <ElementAddress icon="i-lucide-map-pin" label="Điểm đến" placeholder="Điểm đến của bạn?"
          v-model:city="order.destination_city" v-model:province="order.destination_dictrict"
          v-model:address="order.destination_address_1" :exclude-city="order.departure_city" />
      </UFormField>

      <UFormField>
        <template #label>
          <span class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Thời gian khởi hành</span>
        </template>
        <div
          class="flex items-center gap-3 px-4 h-12 rounded-xl border-2 border-slate-100 bg-slate-50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <UIcon name="i-lucide-calendar-clock" class="size-5 text-primary" />
          <UiDatePicker v-model="order.date_of_destination" class="flex-1 text-sm font-medium" />
        </div>
      </UFormField>

      <Transition name="fade">
        <div v-if="hasRouteData" class="space-y-3 pt-2">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <UIcon name="i-lucide-car" class="size-4" /> Chọn loại xe
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="item in services" :key="item.id" @click="selectService(item)" :class="[
              'relative overflow-hidden rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300',
              !getPreview(item.id) ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100' : 'hover:-translate-y-1 hover:shadow-lg',
              order.id_service === item.id
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-slate-100 bg-white'
            ]">
              <div v-if="order.id_service === item.id"
                class="absolute -bottom-4 -right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>

              <div class="flex items-start justify-between mb-3 relative z-10">
                <div
                  :class="['p-2 rounded-xl', order.id_service === item.id ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-100 text-slate-500']">
                  <UIcon name="i-lucide-car-front" class="size-6" />
                </div>
                <UIcon v-if="order.id_service === item.id" name="i-lucide-check-circle-2" class="size-5 text-primary" />
              </div>

              <div class="relative z-10">
                <p class="text-sm font-black text-slate-800 leading-tight mb-1">{{ item.name }}</p>
                <p class="text-[11px] text-slate-500 font-medium mb-3">{{ item.description }}</p>
                <div v-if="getPreview(item.id)"
                  class="inline-flex items-center px-2 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-black">
                  {{ numberToCurrency(getPreview(item.id)?.price_guest_after || 0) }}
                </div>
                <p v-else class="text-[11px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded-lg inline-block">Chưa hỗ
                  trợ
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <UButton block size="xl" color="primary" :disabled="!isReady"
        class="rounded-2xl font-black text-lg shadow-xl transition-all duration-300"
        :class="isReady ? 'shadow-primary/40 hover:scale-[1.02]' : ''" @click="openModal">
        <span class="flex items-center gap-2 py-1">
          <UIcon name="i-lucide-rocket" class="size-5" />
          ĐẶT CHUYẾN NGAY
        </span>
      </UButton>

      <template #footer>
        <div class="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-xl border border-slate-100">
          <div class="flex -space-x-2">
            <img class="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1"
              alt="Avatar" />
            <img class="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2"
              alt="Avatar" />
            <div
              class="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">
              +</div>
          </div>
          <span class="text-[11px] text-slate-500 font-medium">Hơn <strong class="text-slate-800">1.200+</strong> người
            đã đặt hôm nay</span>
        </div>
      </template>
    </UCard>

    <UModal v-model:open="isModalOpen" :ui="{ body: 'p-5' }">
      <template #title>
        <div class="flex items-center gap-2">
          <UIcon :name="otpSent ? 'i-lucide-message-square-dot' : 'i-lucide-user-round'" class="size-4 text-primary" />
          <span class="text-sm font-semibold">
            {{ otpSent ? 'Nhập mã OTP' : 'Thông tin liên hệ' }}
          </span>
        </div>
      </template>

      <template #body>
        <div v-if="!otpSent" class="flex flex-col gap-4">
          <UFormField label="Họ và tên" required>
            <UInput v-model="contact.name" placeholder="Nguyễn Văn A" leading-icon="i-lucide-user" class="w-full"
              size="md" />
          </UFormField>

          <UFormField label="Số điện thoại" description="Ưu tiên số có đăng ký Zalo" required>
            <UInput v-model="contact.phone" placeholder="0901 234 567" type="tel" leading-icon="i-lucide-phone"
              class="w-full" size="md" />
          </UFormField>

          <UAlert v-if="hookError" color="error" variant="soft" :description="hookError" icon="i-lucide-circle-alert" />

          <UButton block size="md" color="primary" icon="i-lucide-send" label="Gửi mã OTP" :loading="hookLoading"
            :disabled="!contact.name || !contact.phone" @click="sendOTP" />
        </div>

        <div v-else class="flex flex-col gap-4">
          <UAlert color="info" variant="soft" icon="i-lucide-info"
            :description="`Mã OTP đã gửi đến ${contact.phone}. Vui lòng kiểm tra tin nhắn.`" />

          <div class="flex justify-center">
            <UPinInput v-model="otpValue" otp :length="6" size="md" />
          </div>

          <UAlert v-if="otpError" color="error" variant="soft" :description="otpError" icon="i-lucide-circle-x" />

          <UButton block size="md" color="primary" icon="i-lucide-check-circle" label="Xác nhận OTP"
            :loading="otpLoading" :disabled="otpValue.length < 6" @click="confirmOTP" />

          <UButton block size="sm" color="neutral" variant="ghost" icon="i-lucide-arrow-left" label="Đổi số điện thoại"
            @click="otpSent = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>


<script lang="ts" setup>
import type { OrderDetail, OrderPreview } from '~/type'

const BASE = 'https://sysdev.happytrip.vn'
const SECRET = '123'

// ─── State ────────────────────────────────────────────────
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
  { id: '66947d0917482239472b9807', name: 'Bao chuyến 5 chỗ', description: '1–4 hành khách' },
  { id: '66947cea17482239472b88e8', name: 'Bao chuyến 7 chỗ', description: '3–6 hành khách' },
])

const previews = ref<OrderDetail[]>([])
const isModalOpen = ref(false)
const otpSent = ref(false)
const otpValue = ref<string[]>([])
const hookLoading = ref(false)
const otpLoading = ref(false)
const hookError = ref('')
const otpError = ref('')

const contact = reactive({ name: '', phone: '' })

// ─── Computed ──────────────────────────────────────────────
const addressReady = computed(() => {
  const o = order.value
  return !!(o.departure_city && o.departure_dictrict && o.destination_city && o.destination_dictrict)
})

const hasRouteData = computed(() => previews.value.length > 0)

const isReady = computed(() => {
  const o = order.value
  return !!(
    o.departure_city && o.departure_dictrict && o.departure_address_1 &&
    o.destination_city && o.destination_dictrict && o.destination_address_1 &&
    o.id_service
  )
})

const getPreview = (id: string) => previews.value.find(p => p.id_service === id && p.price_guest_after > 0)

// ─── Watch: tự động tính giá khi đủ địa chỉ ──────────────
watch(addressReady, async (val) => {
  if (!val) { previews.value = []; return }
  await calcPreviews()
})

// ─── Helpers ──────────────────────────────────────────────
async function calcPreviews() {
  const results = await Promise.allSettled(
    services.value.map(s =>
      $fetch<OrderDetail>(`${BASE}/api/order/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'https://happytrip.vn',
          referer: 'https://happytrip.vn/',
        },
        body: { ...order.value, id_service: s.id },
      })
    )
  )
  previews.value = results
    .filter((r): r is PromiseFulfilledResult<OrderDetail> => r.status === 'fulfilled')
    .map(r => r.value)
}

function selectService(item: { id: string }) {
  if (!getPreview(item.id)) return
  order.value.id_service = item.id
}




function openModal() {
  isModalOpen.value = true
  otpSent.value = false
  otpValue.value = []
  hookError.value = ''
  otpError.value = ''
}

// ─── API calls ─────────────────────────────────────────────
async function sendOTP() {
  hookLoading.value = true
  hookError.value = ''
  const preview = getPreview(order.value.id_service)
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
  }
  catch {
    hookError.value = 'Không thể gửi OTP. Vui lòng thử lại.'
  }
  finally {
    hookLoading.value = false
  }
}

async function confirmOTP() {
  otpLoading.value = true
  otpError.value = ''
  try {
    await $fetch(`${BASE}/api/order/confirm-otp/${SECRET}`, {
      method: 'POST',
      params: { otp: otpValue.value.join('') },
    })
    isModalOpen.value = false

  }
  catch {
    otpError.value = 'Mã OTP không đúng hoặc đã hết hạn.'
  }
  finally {
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
</style>