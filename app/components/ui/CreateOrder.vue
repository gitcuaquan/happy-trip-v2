<template>
  <div class="relative w-full max-w-md mx-auto my-10 p-2">
    <!-- Main card -->
    <UCard :key="formKey" class="relative z-10 backdrop-blur-md bg-white/95 border-2 border-white" :ui="{
      root: 'w-full overflow-visible shadow-2xl rounded-4xl',
      header: 'overflow-hidden rounded-t-4xl bg-primary',
      body: 'p-3 space-y-6',
      footer: 'px-1 pb-1 pt-0 border-t-0',
    }">
      <template #header>
        <div class="flex items-center uppercase justify-center gap-2 relative z-10">
          <span v-if="hasActiveRide" class="text-white font-black text-lg tracking-tight">
            Chuyến xe của bạn.
          </span>
          <span v-else class="text-white font-black text-lg tracking-tight">Bạn Muốn Đi Đâu</span>
        </div>
      </template>

      <div v-if="hasActiveRide" class="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
        <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center animate-pulse">
          <UIcon name="i-lucide-car-front" class="size-10 text-primary mb-4" />
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800 mb-1">
            Chuyến xe đang diễn ra
          </h3>
          <p class="text-sm text-slate-500 font-medium">
            Bạn đang có một chuyến xe chưa hoàn thành. Vui lòng kết thúc chuyến
            hiện tại trước khi đặt chuyến mới.
          </p>
        </div>
        <UButton to="/history" color="primary" variant="soft" size="lg"
          class="rounded-xl font-bold w-full mt-2 flex justify-center">
          <UIcon name="i-lucide-history" class="size-5 mr-1" />
          Xem hành trình hiện tại
        </UButton>
      </div>

      <div v-else>
        <UForm :schema="schema" :state="order" class="space-y-4 text-left" @submit="onSubmit"
          :validate-on="['input', 'blur', 'change']">
          <!-- Điểm đón -->
          <div class="mb-2">
            <div class="flex items-center gap-2 mb-2">
              <div class="p-1.5 bg-primary/10 rounded-lg">
                <div class="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Điểm đón</span>
            </div>
            <ElementAddress namePrefix="departure" icon="i-lucide-locate-fixed" label="Điểm đón"
              placeholder="Bạn đang ở đâu?" v-model:city="order.departure_city"
              v-model:province="order.departure_dictrict" v-model:address="order.departure_address_1"
              :exclude-district="order.destination_dictrict" />
          </div>

          <!-- Điểm đến -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="p-1.5 bg-blue-500/10 rounded-lg">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Điểm đến</span>
            </div>
            <ElementAddress namePrefix="destination" icon="i-lucide-map-pin" label="Điểm đến"
              placeholder="Điểm đến của bạn?" v-model:city="order.destination_city"
              v-model:province="order.destination_dictrict" v-model:address="order.destination_address_1"
              :exclude-district="order.departure_dictrict" />
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
              <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Chọn loại xe
              </p>
              <div class="grid grid-cols-1 gap-2">
                <div v-for="item in services" :key="item.id" @click="selectService(item)" :class="[
                  'relative overflow-hidden rounded-md border-2 p-2.5 cursor-pointer transition-all duration-200',
                  !getPreview(item.id)
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100'
                    : 'active:scale-95',
                  order.id_service === item.id
                    ? 'border-primary/50 shadow-sm shadow-primary/10'
                    : 'border-slate-100 bg-white',
                ]">
                  <div v-if="order.id_service === item.id"
                    class="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/10 rounded-full blur-lg" />
                  <div class="relative z-10">
                    <p class="text-sm font-black text-slate-800 leading-tight mb-0.5 truncate">
                      {{ item.name }}
                    </p>
                    <div v-if="getPreview(item.id)"
                      class="inline-flex items-center text-lg py-0.5 text-primary rounded-md font-bold tracking-tight">
                      {{
                        numberToCurrency(
                          getPreview(item.id)?.price_guest_after || 0,
                        )
                      }}
                    </div>
                    <p v-else
                      class="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-md inline-block">
                      Chưa hỗ trợ
                    </p>
                    <div v-if="item.description" class="text-[11px] text-slate-500 mt-1">
                      {{ item.description }}
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="hasValidPrice" class="text-[12px] text-slate-500 leading-relaxed mt-3">
                Giá tiền này đã bao gồm tất cả các khoản phí.
                <b>Không phát sinh thêm</b>. Chúng tôi có thể hủy chuyến nếu
                phát hiện thông tin số lượng khách hàng không chính xác để tuần
                theo <b>Nghị định 168/2024/NĐ-CP</b>.
              </p>
            </div>
          </Transition>

          <!-- Ghi chú -->
          <UFormField name="note" :ui="{ error: 'text-xs text-left' }">
            <template #label>
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-widest"
              >Ghi chú</span>
            </template>
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
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            class="rounded-2xl font-black text-sm shadow-xl transition-all duration-300 w-full block"
          >
            <span class="flex items-center justify-center gap-2 py-1 w-full">
              <UIcon name="i-lucide-rocket" class="size-5" />
              ĐẶT CHUYẾN NGAY
            </span>
          </UButton>
        </UForm>
      </div>

      <template #footer>
        <div class="flex items-center justify-center gap-2 py-3">
          <div class="flex -space-x-2">
            <img class="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1"
              alt="Avatar" />
            <img class="w-6 h-6 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2"
              alt="Avatar" />
            <div
              class="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">
              +
            </div>
          </div>
          <span class="text-[11px] text-slate-500 font-medium">
            Hơn <strong class="text-slate-800">1.200+</strong> người đã đặt hôm
            nay
          </span>
        </div>
      </template>
    </UCard>

    <!-- Modal: Thông tin liên hệ & OTP -->
    <UModal
      v-model:open="isModalOpen"
      title="Thông tin liên hệ"
      description="Thông tin để tài xế liên hệ và xác nhận chuyến đi của bạn"
      @update:open="handleModalClose"
      :ui="{ content: 'sm:w-120 overflow-hidden', body: 'p-5 sm:p-6' }"
    >
      <template #body>
        <!-- Bước 1: Nhập thông tin liên hệ -->
        <template v-if="!showOtpModal">
          <UAlert title="Xin chú ý" color="success" class="mb-5" variant="subtle" description="Thông tin này để gửi mã OTP xác nhận chuyến đi của bạn. Vui lòng đảm bảo
            số điện thoại chính xác và ưu tiên số điện thoại đăng ký Zalo để nhận OTP nhanh chóng." />
          <div class="flex flex-col gap-3.5">
            <UForm :schema="contactSchema" :state="contact" class="flex flex-col gap-3.5" @submit="onSubmitContact">
              <UFormField name="name" label="Họ và tên" required size="lg">
                <UInput v-model="contact.name" placeholder="Nguyễn Văn A" leading-icon="i-lucide-user" class="w-full"
                  size="lg" />
              </UFormField>
              <UFormField name="phone" label="Số điện thoại" description="Ưu tiên số có đăng ký Zalo" required
                size="lg">
                <UInput v-model="contact.phone" placeholder="0901 234 567" type="tel" leading-icon="i-lucide-phone"
                  class="w-full" size="lg" />
              </UFormField>
              <UAlert v-if="hookError" color="error" variant="soft" :description="hookError"
                icon="i-lucide-circle-alert" />
              <UButton type="submit" block color="primary" icon="i-lucide-send" label="Gửi mã OTP"
                :loading="hookLoading" class="mt-1" />
            </UForm>

            <div class="flex items-center gap-2">
              <div class="flex-1 h-px bg-slate-100" />
              <span class="text-[10px] text-slate-400">bảo mật & an toàn</span>
              <div class="flex-1 h-px bg-slate-100" />
            </div>
          </div>
        </template>

        <!-- Bước 2: Nhập OTP -->
        <template v-else>
          <p class="text-sm text-left font-medium mb-6">
            Mã OTP đã gửi về số điện thoại {{ contact.phone }} vui lòng kiểm tra
            Zalo hoặc SMS của bạn.
          </p>

          <div class="sm:py-6 flex flex-col gap-3.5">
            <div class="flex justify-center">
              <UPinInput v-model="otpValue" otp :length="6" size="xl" />
            </div>
            <UAlert v-if="otpError" color="error" variant="soft" :description="otpError" icon="i-lucide-circle-x" />
            <UButton block color="primary" size="lg" icon="i-lucide-check-circle" label="Xác nhận OTP"
              :loading="otpLoading" :disabled="otpValue.length < 6" @click="confirmOTP" />

            <!-- Gửi lại OTP -->
            <p class="text-center text-xs text-slate-500">
              Không nhận được mã?
              <button type="button" class="text-primary font-semibold disabled:opacity-40"
                :disabled="resendCooldown > 0 || otpLoading" @click="handleResend">
                {{
                  resendCooldown > 0
                    ? `Gửi lại (${resendCooldown}s)`
                    : "Gửi lại"
                }}
              </button>
            </p>

            <UButton block size="sm" color="neutral" variant="ghost" icon="i-lucide-arrow-left"
              label="Đổi số điện thoại" @click="handleBackToInfo" />

            <div class="flex items-center gap-2">
              <div class="flex-1 h-px bg-slate-100" />
              <span class="text-[10px] text-slate-400">bảo mật & an toàn</span>
              <div class="flex-1 h-px bg-slate-100" />
            </div>
          </div>
        </template>
      </template>
    </UModal>

    <!-- Modal: Đặt xe thành công -->
    <UModal v-model:open="openDepositModal" prevent-close :ui="{
      content:
        'bg-transparent shadow-none sm:max-w-sm md:max-w-lg overflow-hidden p-0',
      overlay: 'bg-black/40 backdrop-blur-sm',
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
            <h3 class="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">
              Đặt xe thành công!
            </h3>
            <p class="text-slate-500 text-left text-sm mb-6 leading-relaxed">
              Hệ thống đã ghi nhận chuyến đi của bạn. Vui lòng kiểm tra lại
              thông tin chuyến đi được gửi qua Zalo hoặc SMS. Tài xế sẽ liên hệ
              bạn sớm nhất để xác nhận và hỗ trợ trong quá trình di chuyển.
            </p>

            <div class="bg-slate-50 rounded-xl mb-6 text-left border border-slate-100 shadow-sm flex flex-col">
              <div class="p-4 space-y-3">
                <div class="flex justify-between items-start gap-4">
                  <span class="text-xs text-slate-500 font-medium whitespace-nowrap">Điểm đón:</span>
                  <span class="text-sm font-bold text-slate-800 text-right">{{
                    successData.departure_city
                  }}</span>
                </div>
                <div class="flex justify-between items-start gap-4">
                  <span class="text-xs text-slate-500 font-medium whitespace-nowrap">Điểm đến:</span>
                  <span class="text-sm font-bold text-slate-800 text-right">{{
                    successData.destination_city
                  }}</span>
                </div>
                <div class="flex justify-between items-center gap-4">
                  <span class="text-xs text-slate-500 font-medium">Loại xe:</span>
                  <span class="text-sm font-bold text-slate-800">{{
                    successData.service_name
                  }}</span>
                </div>
              </div>
              <div class="bg-orange-50 p-4 rounded-b-xl border-t border-orange-100 flex justify-between items-center">
                <span class="text-xs text-primary font-bold uppercase tracking-wide">Tổng tiền:</span>
                <span class="text-lg font-black text-primary">{{
                  numberToCurrency(successData.price)
                }}</span>
              </div>
            </div>

            <div class="mb-6">
              <SharedSafetyNotice />
            </div>

            <div class="grid-cols-2 grid gap-3.5">
              <UButton color="primary" block variant="outline" size="lg" label="Về trang chủ" @click="resetAll" />
              <UButton to="/history" color="neutral" block size="lg" variant="outline" icon="i-lucide-history"
                label="Xem lịch sử chuyến đi" />
            </div>
          </div>

          <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";
import type { OrderDetail, OrderPreview } from "~/type";
import { orderService } from "../../services/order.service";
import { useOrderForm } from "~/composables/useOrderForm";

const BASE = "https://sysdev.happytrip.vn";
const { token } = useAuth();
const SECRET = "123";
import type { CustomerProfile } from "~/type";
const { setAuth } = useAuth();
// ─── Order state ──────────────────────────────────────────
const order = ref<OrderPreview>({
  id_service: "",
  date_of_destination: null,
  departure_city: "",
  departure_dictrict: "",
  departure_address_1: "",
  destination_city: "",
  destination_dictrict: "",
  destination_address_1: "",
  note: "",
});

const services = ref([
  {
    id: "66947d0917482239472b9807",
    name: "Bao chuyến 5 chỗ",
    description:
      "Tối đa 4 hành khách ( trẻ sơ sinh cũng được coi là 1 hành khách)",
  },
  {
    id: "66947cea17482239472b88e8",
    name: "Bao chuyến 7 chỗ",
    description:
      "Tối đa 6 hành khách ( trẻ sơ sinh cũng được coi là 1 hành khách)",
  },
]);

const previews = ref<OrderDetail[]>([]);

// ─── Contact & OTP state ──────────────────────────────────
const contact = reactive({ name: "", phone: "" });
const isModalOpen = ref(false);
const showOtpModal = ref(false);
const otpValue = ref<string[]>([]);
const resendCooldown = ref(0);
const hookLoading = ref(false);
const otpLoading = ref(false);
const hookError = ref("");
const otpError = ref("");

// kiểm tra cuốc đang chạy
const hasActiveRide = ref<boolean>(false);
const isLoadingActiveRide = ref<boolean>(true);

async function checkActiveRide() {
  isLoadingActiveRide.value = true;
  try {
    const res = await orderService.getActiveRide(token.value!);

    if (!res) {
      hasActiveRide.value = false;
    } else if (Array.isArray(res)) {
      hasActiveRide.value = res.length > 0;
    } else {
      hasActiveRide.value = Object.keys(res).length > 0;
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra cuốc xe đang chạy:", error);
    hasActiveRide.value = false;
  } finally {
    isLoadingActiveRide.value = false;
  }
}

onMounted(() => {
  checkActiveRide();

  // Kiểm tra xem có dữ liệu từ "Đặt lại chuyến" không
  const { getOrderFormData, clearOrderFormData } = useOrderForm();
  const savedOrderData = getOrderFormData();

  if (savedOrderData) {
    // Fill dữ liệu vào form
    order.value.departure_city = savedOrderData.departure_city;
    order.value.departure_dictrict = savedOrderData.departure_dictrict;
    order.value.departure_address_1 = savedOrderData.departure_address_1;
    order.value.destination_city = savedOrderData.destination_city;
    order.value.destination_dictrict = savedOrderData.destination_dictrict;
    order.value.destination_address_1 = savedOrderData.destination_address_1;

    // Xóa dữ liệu đã lưu để không fill lại lần tới
    clearOrderFormData();

    // Tự động gọi API lấy giá
    calcPreviews();
  }
});

// ─── Success state ────────────────────────────────────────
const openDepositModal = ref(false);
const savedPrice = ref(0);
const successData = ref({
  departure_city: "",
  destination_city: "",
  service_name: "",
  price: 0,
});

// ─── Computed ─────────────────────────────────────────────
const addressReady = computed(() => {
  const o = order.value;
  return !!(
    o.departure_city &&
    o.departure_dictrict &&
    o.departure_address_1 &&
    o.destination_city &&
    o.destination_dictrict &&
    o.destination_address_1
  );
});

const hasRouteData = computed(() => previews.value.length > 0);
const hasValidPrice = computed(() =>
  previews.value.some((p) => p.price_guest_after > 0),
);
const getPreview = (id: string) =>
  previews.value.find((p) => p.id_service === id && p.price_guest_after > 0);
const canSubmit = computed(() => hasValidPrice.value && order.value.id_service);

// ─── Schemas ──────────────────────────────────────────────
const schema = z.object({
  departure_city: z.string().min(1, "Vui lòng chọn Tỉnh/TP"),
  departure_dictrict: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  departure_address_1: z.string().min(1, "Vui lòng nhập địa chỉ"),
  destination_city: z.string().min(1, "Vui lòng chọn Tỉnh/TP"),
  destination_dictrict: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  destination_address_1: z.string().min(1, "Vui lòng nhập địa chỉ"),
});

const contactSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ và tên"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
});

type Schema = z.infer<typeof schema>;
type ContactSchema = z.infer<typeof contactSchema>;

// ─── Handlers ─────────────────────────────────────────────
function onSubmit(_e: FormSubmitEvent<Schema>) {
  if (!canSubmit.value) return;

  isModalOpen.value = true;
  hookError.value = "";
  otpError.value = "";
}

function onSubmitContact(_e: FormSubmitEvent<ContactSchema>) {
  sendOTP();
}

function selectService(item: { id: string }) {
  if (!getPreview(item.id)) return;
  order.value.id_service = item.id;
}

function handleModalClose(value: boolean) {
  // Nếu click outside ở bước OTP (showOtpModal = true) → quay lại bước info (không đóng modal)
  if (value === false && showOtpModal.value) {
    showOtpModal.value = false;
  } else {
    // Nếu ở bước info → cho phép đóng modal
    isModalOpen.value = value;
  }
}

function handleBackToInfo() {
  showOtpModal.value = false;
  otpValue.value = [];
  otpError.value = "";
}

async function handleResend() {
  if (resendCooldown.value > 0 || hookLoading.value) return;

  hookLoading.value = true;
  hookError.value = "";
  const preview = getPreview(order.value.id_service);
  savedPrice.value = preview?.price_guest_after || 0;

  try {
    await $fetch(`${BASE}/api/order/hook`, {
      method: "POST",
      params: { secret: SECRET },
      headers: { "Content-Type": "application/json" },
      body: {
        ...order.value,
        full_name: contact.name,
        phone: contact.phone,
        price_guest_after: preview?.price_guest_after ?? 0,
        price_guest: preview?.price_guest ?? 0,
        price: preview?.price_original ?? 0,
        note: order.value.note?.trim() || "",
      },
    });
    otpValue.value = [];
    otpError.value = "";
    startResendCooldown();
  } catch {
    otpError.value = "Không thể gửi lại OTP. Vui lòng thử lại.";
  } finally {
    hookLoading.value = false;
  }
}

function startResendCooldown() {
  resendCooldown.value = 60;
  const interval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) clearInterval(interval);
  }, 1000);
}

function resetAll() {
  openDepositModal.value = false;
  navigateTo("/");
}

// ─── Watch ────────────────────────────────────────────────
watch(addressReady, async (val) => {
  if (!val) {
    previews.value = [];
    order.value.id_service = "";
    return;
  }
  await calcPreviews();
  order.value.id_service = services.value[0]?.id || "";
});

// ─── API ──────────────────────────────────────────────────
async function calcPreviews() {
  const results = await Promise.allSettled(
    services.value.map((s) =>
      $fetch<OrderDetail>(`${BASE}/api/order/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "https://happytrip.vn",
          referer: "https://happytrip.vn/",
        },
        body: { ...order.value, id_service: s.id },
      }),
    ),
  );
  previews.value = results
    .filter(
      (r): r is PromiseFulfilledResult<OrderDetail> => r.status === "fulfilled",
    )
    .map((r) => r.value);
}

async function sendOTP() {
  hookLoading.value = true;
  hookError.value = "";
  const preview = getPreview(order.value.id_service);
  savedPrice.value = preview?.price_guest_after || 0;

  try {
    await $fetch(`${BASE}/api/order/hook`, {
      method: "POST",
      params: { secret: SECRET },
      headers: { "Content-Type": "application/json" },
      body: {
        ...order.value,
        full_name: contact.name,
        phone: contact.phone,
        price_guest_after: preview?.price_guest_after ?? 0,
        price_guest: preview?.price_guest ?? 0,
        price: preview?.price_original ?? 0,
        note: order.value.note?.trim() || "",
      },
    });
    showOtpModal.value = true;
    startResendCooldown();
  } catch {
    hookError.value = "Không thể gửi OTP. Vui lòng thử lại.";
  } finally {
    hookLoading.value = false;
  }
}

const formKey = ref(0);
async function confirmOTP() {
  otpLoading.value = true;
  otpError.value = "";
  try {
    const res = await $fetch<{ token: string; customer: CustomerProfile }>( // ← typed
      `${BASE}/api/order/confirm-otp/${SECRET}`,
      {
        method: "POST",
        params: { otp: otpValue.value.join("") },
      },
    );

    if (res.token && res.customer) {
      setAuth(res.token, res.customer);
    }
    isModalOpen.value = false;
    showOtpModal.value = false;
    otpValue.value = [];
    successData.value = {
      departure_city: order.value.departure_city,
      destination_city: order.value.destination_city,
      service_name:
        services.value.find((s) => s.id === order.value.id_service)?.name || "",
      price: savedPrice.value,
    };

    // Reset toàn bộ state
    order.value = {
      id_service: "",
      date_of_destination: null,
      departure_city: "",
      departure_dictrict: "",
      departure_address_1: "",
      destination_city: "",
      destination_dictrict: "",
      destination_address_1: "",
      note: "",
    };
    previews.value = [];
    contact.name = "";
    contact.phone = "";
    resendCooldown.value = 0;
    formKey.value++;
    openDepositModal.value = true;
  } catch {
    otpError.value = "Mã OTP không đúng hoặc đã hết hạn.";
  } finally {
    otpLoading.value = false;
  }
}

// Nếu người dùng click outside modal ở bước nhập OTP, sẽ không đóng modal mà quay lại bước nhập thông tin liên hệ
watch(isModalOpen, (val) => {
  if (!val && showOtpModal.value) {
    nextTick(() => {
      isModalOpen.value = true;
      showOtpModal.value = false;
    });
  }
});
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
  animation:
    fill 0.4s ease-in-out 0.4s forwards,
    scale 0.3s ease-in-out 0.9s both;
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

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {

  0%,
  100% {
    transform: none;
  }

  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 50px #f97316;
  }
}
</style>
