<template>
  <div class="relative w-full max-w-md mx-auto md:my-10 md:p-2">
    <!-- Main card -->
    <UCard
      :key="formKey"
      class="relative z-10 backdrop-blur-md bg-white/95 border-2 border-white text-slate-800"
      :ui="{
        root: 'w-full overflow-hidden shadow-2xl',
        body: 'sm:p-3 space-y-6',
        footer: 'px-1 pb-1 pt-0 border-t-0'
      }"
    >
      <div>
        <UForm
          :schema="schema"
          :state="order"
          class="space-y-4 text-left"
          :validate-on="['input', 'blur', 'change']"
          @submit="onSubmit"
        >
          <!-- Điểm đón -->
          <div class="mb-2">
            <div class="flex items-center gap-2 mb-2">
              <div class="p-1.5 bg-primary/10 rounded-lg">
                <div class="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Điểm đón</span>
            </div>
            <ElementAddress
              v-model:city="order.departure_city"
              v-model:province="order.departure_dictrict"
              v-model:address="order.departure_address_1"
              name-prefix="departure"
              icon="i-lucide-locate-fixed"
              label="Điểm đón"
              placeholder="Bạn đang ở đâu?"
              :exclude-district="order.destination_dictrict"
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
              v-model:city="order.destination_city"
              v-model:province="order.destination_dictrict"
              v-model:address="order.destination_address_1"
              name-prefix="destination"
              icon="i-lucide-map-pin"
              label="Điểm đến"
              placeholder="Điểm đến của bạn?"
              :exclude-district="order.departure_dictrict"
            />
          </div>

          <!-- Thời gian -->
          <div>
            <UFormField
              size="sm"
              :ui="{ error: 'text-xs text-left' }"
            >
              <template #label>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian khởi hành</span>
              </template>

              <UiDatePicker
                v-model="order.date_of_destination"
                class="flex-1 text-sm font-medium"
              />
            </UFormField>
            <div class="text-xs text-slate-500 mt-1">
              Nếu đặt xe hôm nay vui lòng đặt trước 30 phút để tài xế có thời
              gian chuẩn bị và di chuyển đến điểm đón.
            </div>
          </div>

          <!-- Chọn loại xe -->
          <Transition name="fade">
            <div
              v-if="hasRouteData"
              class="space-y-2 text-slate-600"
            >
              <div class="text-xs flex items-center gap-2 font-bold text-slate-500 uppercase tracking-widest">
                <div class="p-1.5 bg-success/10 rounded-lg">
                  <div class="w-2.5 h-2.5 rounded-full bg-success" />
                </div>
                Chọn loại xe
              </div>
              <div class="text-xs text-slate-500">
                Trẻ sơ sinh cũng được coi là 1 hành khách. Vui lòng
                chọn loại xe phù hợp với số lượng hành khách.
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="item in services"
                  :key="item.id"
                  :class="[
                    'relative overflow-hidden rounded-md border-2 p-2.5 cursor-pointer transition-all duration-200',
                    !getPreview(item.id)
                      ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100'
                      : 'active:scale-95 ',
                    order.id_service === item.id
                      ? 'border-primary/50 shadow-sm shadow-primary/10'
                      : 'border-slate-100 bg-white'
                  ]"
                  @click="selectService(item)"
                >
                  <div
                    v-if="order.id_service === item.id"
                    class="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/10 rounded-full blur-lg"
                  />
                  <div class="relative z-10">
                    <p class="text-sm font-black text-slate-800 leading-tight mb-0.5 truncate">
                      {{ item.name }}
                    </p>
                    <div
                      v-if="getPreview(item.id)"
                      class="inline-flex items-center text-xl py-0.5 text-primary rounded-md font-bold tracking-tight"
                    >
                      {{
                        numberToCurrency(
                          getPreview(item.id)?.price_guest_after || 0
                        )
                      }}
                    </div>
                    <p
                      v-else
                      class="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-md inline-block"
                    >
                      Chưa hỗ trợ
                    </p>
                    <div
                      v-if="item.description"
                      class="text-xs text-slate-500 mt-1"
                    >
                      {{ item.description }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-xs text-slate-500">
                Các dịch vụ 2 chiều dài ngày, cần xe ở lại phục vụ, số lượng khách lớn hơn 6, đón trả nhiều điểm hoặc các trường hợp khác vui lòng liên hệ: <a
                  href="tel:0972970000"
                  class="text-primary font-bold underline"
                >0972970000</a> để được hỗ trợ.
              </div>
            </div>
          </Transition>

          <!-- Thông tin người đi (hiển thị khi đã đăng nhập) -->
          <div
            v-if="isLoggedIn"
            class="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="p-1 bg-slate-200/80 rounded-md text-slate-700">
                  <UIcon
                    name="i-lucide-user"
                    class="size-4"
                  />
                </div>
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Thông tin người đi</span>
              </div>
              <span
                v-if="!isDifferentPhone"
                class="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-badge-check"
                  class="size-3"
                />
                Chính chủ
              </span>
              <span
                v-else
                class="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-users"
                  class="size-3"
                />
                Đặt hộ
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <UFormField
                label="Họ và tên"
                size="sm"
                :ui="{ label: 'text-xs font-semibold text-slate-600' }"
              >
                <UInput
                  v-model="loggedInContact.name"
                  placeholder="Họ và tên"
                  size="sm"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Số điện thoại"
                size="sm"
                :ui="{ label: 'text-xs font-semibold text-slate-600' }"
              >
                <UInput
                  v-model="loggedInContact.phone"
                  placeholder="09..."
                  type="tel"
                  size="sm"
                  class="w-full"
                />
              </UFormField>
            </div>

            <p
              v-if="isDifferentPhone"
              class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 flex items-start gap-1.5"
            >
              <UIcon
                name="i-lucide-info"
                class="size-3.5 text-amber-500 shrink-0 mt-0.5"
              />
              <span>SĐT người đi khác SĐT tài khoản: Ưu đãi voucher & giới thiệu chỉ áp dụng cho tài khoản chính chủ nên sẽ không áp dụng cho chuyến này.</span>
            </p>
          </div>

          <!-- Khối Ưu đãi (khi đã đăng nhập, cùng SĐT, và có ưu đãi khả dụng) -->
          <Transition name="fade">
            <div v-if="isLoggedIn && hasRouteData && !isDifferentPhone && formDiscountOptions.length > 0">
              <UiOrderDiscountSelect
                :options="formDiscountOptions"
                :price-guest-after="selectedTripPrice"
                :model-value="formSelectedDiscount"
                :referrer-loading="formReferrerLoading"
                @update:model-value="formSelectedDiscount = $event"
                @apply-referrer="handleFormApplyReferrer"
              />
            </div>
          </Transition>

          <!-- Ghi chú -->
          <UFormField
            name="note"
            size="sm"
            :ui="{ error: 'text-xs text-left' }"
          >
            <template #label>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Ghi chú</span>
            </template>
            <div class="w-full">
              <UTextarea
                v-model="order.note"
                placeholder="Ví dụ: có người già, trẻ em, thú cưng, cần xe xăng/xe điện..."
                :rows="3"
                :maxrows="6"
                autoresize
                :maxlength="500"
                class="w-full"
                :ui="{ base: 'text-sm' }"
              />
              <div
                v-if="showPhoneWarning"
                class="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-alert-circle"
                  class="size-3.5 shrink-0"
                />
                Không nhập số điện thoại ở ghi chú
              </div>
            </div>
          </UFormField>

          <!-- Báo lỗi từ server (nếu có khi submit by-ajax) -->
          <UAlert
            v-if="formOrderError"
            color="error"
            variant="soft"
            :description="formOrderError"
            icon="i-lucide-alert-circle"
            class="text-xs"
          />

          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="font-black text-sm shadow-xl transition-all duration-300 w-full block"
            :loading="submitLoading"
          >
            <span class="flex items-center justify-center gap-2 py-1 w-full">
              <UIcon
                name="i-lucide-rocket"
                class="size-5"
              />
              {{
                !hasRouteData
                  ? "NHẬP THÔNG TIN ĐỂ XEM GIÁ"
                  : (isLoggedIn && formSelectedAmount > 0)
                    ? `ĐẶT CHUYẾN • ${numberToCurrency(formCustomerPay)}`
                    : "ĐẶT CHUYẾN NGAY"
              }}
            </span>
          </UButton>
          <div class="text-center text-xs text-slate-500 mt-2">
            Bằng việc đặt chuyến, chúng tôi hiểu rằng bạn đồng ý với
            <SharedPolicy>
              <div class="text-primary uppercase inline cursor-pointer font-semibold">
                Điều khoản và lưu ý khi đặt xe
              </div>
            </SharedPolicy>
            của Happy Trip.
          </div>
        </UForm>
      </div>

      <template #footer>
        <div class="p-5 text-slate-600">
          <ol class="text-xs list-decimal w-full text-left space-y-1">
            <li>Giá xe riêng, đã bao gồm phí và đi cao tốc, không phát sinh</li>
            <li>Đón trả tận nơi theo giờ yêu cầu, <b>không cần cọc</b></li>
            <li>Kết thúc chuyến xe thanh toán cho tài xế, xe bao mới sạch</li>
          </ol>
        </div>
      </template>
    </UCard>

    <LazyUiOrderContactModal
      v-model:open="isModalOpen"
      :order="order"
      :id-service="order.id_service"
      :previews="previews"
      :service-name="selectedServiceName"
      :initial-name="initialCustomerName"
      :initial-phone="initialCustomerPhone"
      @confirmed="onOrderConfirmed"
    />

    <LazyUiOrderSuccessModal
      v-model:open="openDepositModal"
      :success-data="successData"
    />
  </div>
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
import { useOrderForm } from '~/composables/useOrderForm'
import { getDefaultRouteEndpoints } from '~/utils/routes'
import type { SuccessData } from '~/components/ui/order/OrderSuccessModal.vue'

const { token, getCustomer, isLoggedIn, syncMe } = useAuth()
const { trackViewPrice, trackBookingStart, trackPurchase } = useGtagEvent()
const { trackPixelViewPrice, trackPixelBookingStart, trackPixelBookingSuccess } = useMetaPixelEvent()

interface RouteData {
  name: string
  slug: string
  id?: string
  parentId?: string
  data?: string
}

const props = defineProps<{
  fromData?: RouteData
  toData?: RouteData
}>()

// ─── Order state ──────────────────────────────────────────
const isRoutePage = computed(() => !!(props.fromData || props.toData))
const initialEndpoints = computed(() => {
  if (!isRoutePage.value) {
    return {
      dep: { city: '', district: '', address: '' },
      dest: { city: '', district: '', address: '' }
    }
  }
  return getDefaultRouteEndpoints(props.fromData?.slug, props.toData?.slug)
})

const order = ref<OrderPreview>({
  id_service: '',
  date_of_destination: null,
  departure_city: initialEndpoints.value.dep.city,
  departure_dictrict: initialEndpoints.value.dep.district,
  departure_address_1: initialEndpoints.value.dep.address,
  destination_city: initialEndpoints.value.dest.city,
  destination_dictrict: initialEndpoints.value.dest.district,
  destination_address_1: initialEndpoints.value.dest.address,
  note: ''
})

const services = ref([
  {
    id: '66947d0917482239472b9807',
    name: 'Bao chuyến 5 chỗ (1 chiều)',
    description: 'Tối đa 4 hành khách'
  },
  {
    id: '66947cea17482239472b88e8',
    name: 'Bao chuyến 7 chỗ (1 chiều)',
    description: 'Tối đa 6 hành khách'
  }
])

const previews = ref<OrderDetail[]>([])
const formKey = ref(0)

// ─── Modal visibility ─────────────────────────────────────
const isModalOpen = ref(false)
const openDepositModal = ref(false)

const initialCustomerName = ref('')
const initialCustomerPhone = ref('')
const showPhoneWarning = ref(false)

// ─── Logged-in user flow state ────────────────────────────
const loggedInContact = reactive({
  name: '',
  phone: ''
})
const formDiscountOptions = ref<DiscountOption[]>([])
const formSelectedDiscount = ref<OrderDiscountInput | null>({ type: null })
const formReferrerLoading = ref(false)
const submitLoading = ref(false)
const formOrderError = ref('')

// Đồng bộ thông tin profile vào form khi đã login
watch(
  getCustomer,
  (cust) => {
    if (cust) {
      if (!loggedInContact.name) loggedInContact.name = cust.full_name || ''
      if (!loggedInContact.phone) loggedInContact.phone = cust.phone || ''
    }
  },
  { immediate: true }
)

// Kiểm tra xem SĐT trên form có khác với SĐT tài khoản (đặt hộ)
const isDifferentPhone = computed(() => {
  if (!isLoggedIn.value || !getCustomer.value?.phone) return false
  const cleanEntered = loggedInContact.phone.trim().replace(/\s+/g, '')
  const cleanAccount = getCustomer.value.phone.trim().replace(/\s+/g, '')
  return cleanEntered.length > 0 && cleanEntered !== cleanAccount
})

// ─── Success state ────────────────────────────────────────
const successData = ref<SuccessData>({
  departure_city: '',
  departure_district: '',
  departure_address_1: '',
  destination_city: '',
  destination_district: '',
  destination_address_1: '',
  service_name: '',
  price: 0,
  price_customer_pay: 0,
  discount: undefined
})

onMounted(async () => {
  // Sync profile nếu có token mà chưa có profile
  if (token.value && !getCustomer.value) {
    syncMe()
  }

  const { getOrderFormData, clearOrderFormData } = useOrderForm()
  const savedOrderData = getOrderFormData()

  if (savedOrderData) {
    order.value.departure_city = savedOrderData.departure_city
    order.value.departure_dictrict = savedOrderData.departure_dictrict
    order.value.departure_address_1 = savedOrderData.departure_address_1
    order.value.destination_city = savedOrderData.destination_city
    order.value.destination_dictrict = savedOrderData.destination_dictrict
    order.value.destination_address_1 = savedOrderData.destination_address_1
    if (savedOrderData.date_of_destination) {
      order.value.date_of_destination = new Date(savedOrderData.date_of_destination)
    }
    if (savedOrderData.customer_name) {
      initialCustomerName.value = savedOrderData.customer_name
      if (!loggedInContact.name) loggedInContact.name = savedOrderData.customer_name
    }
    if (savedOrderData.customer_phone) {
      initialCustomerPhone.value = savedOrderData.customer_phone
      if (!loggedInContact.phone) loggedInContact.phone = savedOrderData.customer_phone
    }
    clearOrderFormData()
    await calcPreviews()
    if (!order.value.id_service) {
      order.value.id_service = services.value[0]?.id || ''
    }
    fetchDiscountOptions()
    return
  }

  // Pre-fill from route props (fromData / toData)
  if (props.fromData || props.toData) {
    try {
      const endpoints = getDefaultRouteEndpoints(props.fromData?.slug, props.toData?.slug)
      order.value.departure_city = endpoints.dep.city
      order.value.departure_dictrict = endpoints.dep.district
      order.value.departure_address_1 = endpoints.dep.address
      order.value.destination_city = endpoints.dest.city
      order.value.destination_dictrict = endpoints.dest.district
      order.value.destination_address_1 = endpoints.dest.address

      await calcPreviews()
      if (!order.value.id_service) {
        order.value.id_service = services.value[0]?.id || ''
      }
      fetchDiscountOptions()
    } catch {
      // API failed, leave form empty
    }
  }
})

// ─── Computed ─────────────────────────────────────────────
const addressReady = computed(() => {
  const o = order.value
  return !!(
    o.departure_city
    && o.departure_dictrict
    && o.departure_address_1
    && o.destination_city
    && o.destination_dictrict
    && o.destination_address_1
  )
})

const hasRouteData = computed(() => previews.value.length > 0)

const getPreview = (id: string) =>
  previews.value.find(p => p.id_service === id && p.price_guest_after > 0)

const selectedServiceName = computed(
  () => services.value.find(s => s.id === order.value.id_service)?.name || ''
)

const selectedTripPrice = computed(() => {
  const p = getPreview(order.value.id_service)
  return p?.price_guest_after || 0
})

// Tính số tiền giảm giá đang chọn trên form
const formSelectedAmount = computed(() => {
  if (!formSelectedDiscount.value || !formSelectedDiscount.value.type) return 0
  if (formSelectedDiscount.value.type === 'Voucher') {
    const v = formDiscountOptions.value.find(
      o => o.type === 'Voucher' && o.campaign_id === (formSelectedDiscount.value as { type: 'Voucher', campaign_id: string }).campaign_id
    )
    return v?.eligible ? (v.amount || 0) : 0
  }
  if (formSelectedDiscount.value.type === 'ReferralCredit') {
    const c = formDiscountOptions.value.find(o => o.type === 'ReferralCredit')
    return c?.eligible ? (c.amount || 0) : 0
  }
  if (formSelectedDiscount.value.type === 'ReferralWelcome') {
    const w = formDiscountOptions.value.find(o => o.type === 'ReferralWelcome')
    return w?.eligible ? (w.amount || 0) : 0
  }
  return 0
})

const formCustomerPay = computed(() => {
  return Math.max(0, selectedTripPrice.value - formSelectedAmount.value)
})

const canSubmit = computed(
  () =>
    previews.value.some(p => p.price_guest_after > 0)
    && !!order.value.id_service
)

// ─── Schema ───────────────────────────────────────────────
const schema = z.object({
  departure_city: z.string().min(1, 'Vui lòng chọn Tỉnh/TP'),
  departure_dictrict: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  departure_address_1: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  destination_city: z.string().min(1, 'Vui lòng chọn Tỉnh/TP'),
  destination_dictrict: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  destination_address_1: z.string().min(1, 'Vui lòng nhập địa chỉ')
})

type Schema = z.infer<typeof schema>

// ─── Handlers ─────────────────────────────────────────────
async function onSubmit(_e: FormSubmitEvent<Schema>) {
  if (!canSubmit.value) return

  // Track GA4 & Meta Pixel booking_start event
  const preview = getPreview(order.value.id_service)
  const params = {
    route_from: order.value.departure_city,
    route_to: order.value.destination_city,
    service_name: selectedServiceName.value,
    price: preview?.price_guest_after
  }
  trackBookingStart(params)
  trackPixelBookingStart(params)

  if (!isLoggedIn.value) {
    // Luồng A: Khách ẩn danh -> Mở modal liên hệ & xác thực OTP
    isModalOpen.value = true
  } else {
    // Luồng B: Khách đã đăng nhập -> Tạo đơn trực tiếp qua by-ajax (1 chạm)
    await submitLoggedInOrder()
  }
}

function selectService(item: { id: string }) {
  if (!getPreview(item.id)) return
  order.value.id_service = item.id
  fetchDiscountOptions()
}

// Luồng B: Submit đơn hàng cho khách đã đăng nhập
async function submitLoggedInOrder() {
  if (!token.value) return
  submitLoading.value = true
  formOrderError.value = ''

  const preview = getPreview(order.value.id_service)
  const discountToSend = isDifferentPhone.value ? { type: null } : formSelectedDiscount.value

  const payload: CreateOrderByAjaxPayload = {
    departure_city: order.value.departure_city,
    departure_dictrict: order.value.departure_dictrict,
    departure_address_1: order.value.departure_address_1,
    destination_city: order.value.destination_city,
    destination_dictrict: order.value.destination_dictrict,
    destination_address_1: order.value.destination_address_1,
    date_of_destination: order.value.date_of_destination,
    id_service: order.value.id_service,
    full_name: loggedInContact.name || getCustomer.value?.full_name || 'Khách hàng',
    phone: loggedInContact.phone || getCustomer.value?.phone || '',
    price_guest_after: preview?.price_guest_after ?? 0,
    price_guest: preview?.price_guest ?? 0,
    price: preview?.price_original ?? 0,
    note: order.value.note?.trim() || '',
    discount: discountToSend || { type: null }
  }

  try {
    const res = await orderService.createOrderByAjax(token.value, payload)

    onOrderConfirmed({
      departure_city: order.value.departure_city,
      departure_district: order.value.departure_dictrict,
      departure_address_1: order.value.departure_address_1,
      destination_city: order.value.destination_city,
      destination_district: order.value.destination_dictrict,
      destination_address_1: order.value.destination_address_1,
      service_name: selectedServiceName.value,
      price: res.price_guest_after || preview?.price_guest_after || 0,
      price_customer_pay: res.price_customer_pay,
      discount: res.discount
    })

    // Track purchase event
    const trackingParams = {
      route_from: order.value.departure_city,
      route_to: order.value.destination_city,
      service_name: selectedServiceName.value,
      price: res.price_customer_pay || res.price_guest_after || 0
    }
    trackPurchase(trackingParams)
    trackPixelBookingSuccess(trackingParams)

    $fetch('/api/logs/booking', {
      method: 'POST',
      body: trackingParams
    }).catch(console.error)
  } catch (err: unknown) {
    formOrderError.value = err?.message || 'Có lỗi xảy ra khi tạo chuyến xe. Vui lòng thử lại.'
    // Khi lỗi ưu đãi, gọi lại discount-options cho khách chọn lại
    fetchDiscountOptions()
  } finally {
    submitLoading.value = false
  }
}

// Áp dụng SĐT người giới thiệu trong Form khi đã đăng nhập
async function handleFormApplyReferrer(phone: string) {
  if (!token.value || !selectedTripPrice.value) return
  formReferrerLoading.value = true
  formOrderError.value = ''
  try {
    formDiscountOptions.value = await orderService.getDiscountOptions(token.value, {
      price_guest_after: selectedTripPrice.value,
      referrer_phone: phone
    })
  } catch (err: unknown) {
    formOrderError.value
      = err?.data?.message
        || (typeof err?.data === 'string' && err.data)
        || 'Không thể áp dụng số điện thoại người giới thiệu.'
  } finally {
    formReferrerLoading.value = false
  }
}

// Gọi API lấy danh sách ưu đãi cho khách đã login
async function fetchDiscountOptions() {
  if (!isLoggedIn.value || !token.value || isDifferentPhone.value) {
    formDiscountOptions.value = []
    formSelectedDiscount.value = { type: null }
    return
  }
  const price = selectedTripPrice.value
  if (price <= 0) {
    formDiscountOptions.value = []
    return
  }

  try {
    const opts = await orderService.getDiscountOptions(token.value, {
      price_guest_after: price
    })
    formDiscountOptions.value = Array.isArray(opts) ? opts : []
  } catch (err) {
    console.warn('Lỗi discount-options:', err)
    formDiscountOptions.value = []
  }
}

function onOrderConfirmed(data: SuccessData) {
  order.value = {
    id_service: '',
    date_of_destination: null,
    departure_city: '',
    departure_dictrict: '',
    departure_address_1: '',
    destination_city: '',
    destination_dictrict: '',
    destination_address_1: '',
    note: ''
  }
  previews.value = []
  formDiscountOptions.value = []
  formSelectedDiscount.value = { type: null }
  formOrderError.value = ''
  formKey.value++
  successData.value = data
  openDepositModal.value = true

  // Track Meta Pixel Purchase event
  if (typeof window !== 'undefined' && 'fbq' in window) {
    (window as typeof window & { fbq: (...args: unknown[]) => void }).fbq(
      'track',
      'Purchase',
      { value: data.price_customer_pay || data.price, currency: 'VND' }
    )
  }
}

// ─── Watch ────────────────────────────────────────────────
const dateOnly = computed(() => {
  const d = order.value.date_of_destination
  if (!d) return null
  return String(d).slice(0, 10)
})

const addressFingerprint = computed(() => {
  const o = order.value
  return [
    o.departure_city,
    o.departure_dictrict,
    o.departure_address_1,
    o.destination_city,
    o.destination_dictrict,
    o.destination_address_1
  ].join('|')
})

watch(
  [addressReady, addressFingerprint, dateOnly],
  async ([isReady]) => {
    if (!isReady) {
      previews.value = []
      order.value.id_service = ''
      formDiscountOptions.value = []
      return
    }
    await calcPreviews()
    if (!order.value.id_service) {
      order.value.id_service = services.value[0]?.id || ''
    }
    fetchDiscountOptions()
  }
)

watch(isDifferentPhone, (diff) => {
  if (diff) {
    formDiscountOptions.value = []
    formSelectedDiscount.value = { type: null }
  } else {
    fetchDiscountOptions()
  }
})

// Watch note to detect and mask phone numbers
watch(
  () => order.value.note,
  (newVal) => {
    if (!newVal) {
      showPhoneWarning.value = false
      return
    }

    const phoneRegex = /(?:\+84|84|0)(?:\s*[.-]?\s*\d){9,10}/g

    if (phoneRegex.test(newVal)) {
      showPhoneWarning.value = true
      const masked = newVal.replace(phoneRegex, match => match.replace(/\d/g, '*'))
      if (masked !== newVal) {
        order.value.note = masked
      }
    } else if (!newVal.includes('*')) {
      showPhoneWarning.value = false
    }
  }
)

// ─── API ──────────────────────────────────────────────────
async function calcPreviews() {
  try {
    const results = await orderService.previewOrderV2(order.value)
    previews.value = Array.isArray(results) ? results : []
  } catch {
    previews.value = []
  }

  // Track GA4 view_price event khi xem được giá
  if (previews.value.length > 0) {
    const firstPreview = previews.value.find(p => p.price_guest_after > 0)
    const params = {
      route_from: order.value.departure_city,
      route_to: order.value.destination_city,
      service_name: services.value.find(
        s => s.id === firstPreview?.id_service
      )?.name,
      price: firstPreview?.price_guest_after
    }
    trackViewPrice(params)
    trackPixelViewPrice(params)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
