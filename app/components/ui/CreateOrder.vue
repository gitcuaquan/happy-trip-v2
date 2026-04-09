<template>
  <UCard
    :ui="{
      root: 'w-full overflow-hidden shadow-xl',
      header: 'p-0',
      body: 'p-4 space-y-4',
      footer: 'px-4 pb-4 pt-0'
    }"
  >
    <!-- Header -->
    <template #header>
      <div class="bg-primary px-5 py-4">
        <div class="flex items-center gap-2 mb-0.5">
          <UIcon name="i-lucide-car-taxi-front" class="size-5 text-white" />
          <span class="text-white font-bold text-base tracking-tight">Đặt xe HappyTrip</span>
        </div>
        <div class="flex items-center gap-3 mt-1">
          <UBadge color="neutral" variant="subtle" size="sm" label="Nhanh" icon="i-lucide-zap" />
          <UBadge color="neutral" variant="subtle" size="sm" label="An toàn" icon="i-lucide-shield-check" />
          <UBadge color="neutral" variant="subtle" size="sm" label="Giá rẻ" icon="i-lucide-tag" />
        </div>
      </div>
    </template>

    <!-- Điểm đón -->
    <UFormField>
      <template #label>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20 shrink-0" />
          <span class="text-xs font-semibold text-muted uppercase tracking-wider">Điểm đón</span>
        </div>
      </template>
      <ElementAddress
        icon="i-lucide-locate-fixed"
        label="Điểm đón"
        placeholder="Bạn đang ở đâu?"
        v-model:city="order.departure_city"
        v-model:province="order.departure_dictrict"
        v-model:address="order.departure_address_1"
        :exclude-city="order.destination_city"
      />
    </UFormField>

    <!-- Swap -->
    <div class="flex items-center gap-3">
      <USeparator class="flex-1" />
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-arrow-up-down"
        size="xs"
        square
        @click="swapLocations"
      />
      <USeparator class="flex-1" />
    </div>

    <!-- Điểm đến -->
    <UFormField>
      <template #label>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20 shrink-0" />
          <span class="text-xs font-semibold text-muted uppercase tracking-wider">Điểm đến</span>
        </div>
      </template>
      <ElementAddress
        icon="i-lucide-map-pin"
        label="Điểm đến"
        placeholder="Điểm đến của bạn?"
        v-model:city="order.destination_city"
        v-model:province="order.destination_dictrict"
        v-model:address="order.destination_address_1"
        :exclude-city="order.departure_city"
      />
    </UFormField>

    <!-- Ngày đi -->
    <UFormField>
      <template #label>
        <span class="text-xs font-semibold text-muted uppercase tracking-wider">Ngày đi</span>
      </template>
      <div class="flex items-center gap-2 px-3 h-9 rounded-lg border border-default bg-default">
        <UIcon name="i-lucide-calendar" class="size-4 text-muted shrink-0" />
        <UiDatePicker v-model="order.date_of_destination" class="flex-1 text-sm" />
      </div>
    </UFormField>

    <!-- Chọn loại xe -->
    <Transition name="fade">
      <div v-if="hasRouteData" class="space-y-2">
        <p class="text-xs font-semibold text-muted uppercase tracking-wider">Chọn loại xe</p>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="item in services"
            :key="item.id"
            @click="selectService(item)"
            :class="[
              'rounded-xl border p-3 cursor-pointer transition-all duration-200',
              !getPreview(item.id) ? 'opacity-40 cursor-not-allowed bg-muted/30 border-default' : 'hover:shadow-md',
              order.id_service === item.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                : 'border-default hover:border-primary/50'
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <UIcon name="i-lucide-car-front" class="size-5 text-primary" />
              <UBadge
                v-if="order.id_service === item.id"
                color="primary"
                variant="soft"
                size="xs"
                label="Đã chọn"
                icon="i-lucide-check"
              />
            </div>
            <p class="text-sm font-semibold text-highlighted leading-tight">{{ item.name }}</p>
            <p class="text-xs text-muted mt-0.5">{{ item.description }}</p>
            <p v-if="getPreview(item.id)" class="text-sm font-bold text-primary mt-2">
              {{ numberToCurrency(getPreview(item.id)!.price_guest_after) }}
            </p>
            <p v-else class="text-xs text-error font-medium mt-2">Chưa hỗ trợ tuyến này</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Nút đặt -->
    <UButton
      block
      size="md"
      color="primary"
      :disabled="!isReady"
      icon="i-lucide-car-taxi-front"
      :variant="isReady ? 'solid' : 'soft'"
      label="Đặt ngay"
      @click="openModal"
    />

    <template #footer>
      <div class="flex items-center justify-center gap-1.5">
        <UIcon name="i-lucide-users" class="size-3.5 text-muted" />
        <span class="text-xs text-muted">Trung bình <strong class="text-highlighted">1.200</strong> lượt đặt mỗi ngày</span>
      </div>
    </template>
  </UCard>

  <!-- Modal -->
  <UModal v-model:open="isModalOpen" :ui="{ body: 'p-5' }">
    <template #title>
      <div class="flex items-center gap-2">
        <UIcon
          :name="otpSent ? 'i-lucide-message-square-dot' : 'i-lucide-user-round'"
          class="size-4 text-primary"
        />
        <span class="text-sm font-semibold">
          {{ otpSent ? 'Nhập mã OTP' : 'Thông tin liên hệ' }}
        </span>
      </div>
    </template>

    <template #body>
      <!-- Bước 1: Nhập tên + SĐT -->
      <div v-if="!otpSent" class="flex flex-col gap-4">
        <UFormField label="Họ và tên" required>
          <UInput
            v-model="contact.name"
            placeholder="Nguyễn Văn A"
            leading-icon="i-lucide-user"
            class="w-full"
            size="md"
          />
        </UFormField>

        <UFormField
          label="Số điện thoại"
          description="Ưu tiên số có đăng ký Zalo"
          required
        >
          <UInput
            v-model="contact.phone"
            placeholder="0901 234 567"
            type="tel"
            leading-icon="i-lucide-phone"
            class="w-full"
            size="md"
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
          block
          size="md"
          color="primary"
          icon="i-lucide-send"
          label="Gửi mã OTP"
          :loading="hookLoading"
          :disabled="!contact.name || !contact.phone"
          @click="sendOTP"
        />
      </div>

      <!-- Bước 2: Nhập OTP -->
      <div v-else class="flex flex-col gap-4">
        <UAlert
          color="info"
          variant="soft"
          icon="i-lucide-info"
          :description="`Mã OTP đã gửi đến ${contact.phone}. Vui lòng kiểm tra tin nhắn.`"
        />

        <div class="flex justify-center">
          <UPinInput v-model="otpValue" otp :length="6" size="md" />
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
          size="md"
          color="primary"
          icon="i-lucide-check-circle"
          label="Xác nhận OTP"
          :loading="otpLoading"
          :disabled="otpValue.length < 6"
          @click="confirmOTP"
        />

        <UButton
          block
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          label="Đổi số điện thoại"
          @click="otpSent = false"
        />
      </div>
    </template>
  </UModal>
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

function swapLocations() {
  const o = order.value
  ;[o.departure_city, o.destination_city] = [o.destination_city, o.departure_city]
  ;[o.departure_dictrict, o.destination_dictrict] = [o.destination_dictrict, o.departure_dictrict]
  ;[o.departure_address_1, o.destination_address_1] = [o.destination_address_1, o.departure_address_1]
  o.id_service = ''
  previews.value = []
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
    // TODO: chuyển sang trang thành công
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