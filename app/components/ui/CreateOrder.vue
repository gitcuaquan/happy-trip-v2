<template>
  <div class="relative w-full max-w-md mx-auto md:my-10 md:p-2">
    <!-- Main card -->
    <UCard :key="formKey" class="relative z-10 backdrop-blur-md bg-white/95 border-2 border-white text-slate-800" :ui="{
      root: 'w-full overflow-hidden shadow-2xl',

      body: 'sm:p-3 space-y-6',
      footer: 'px-1 pb-1 pt-0 border-t-0',
    }">
      <div>
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
          <div>
            <UFormField size="sm" :ui="{ error: 'text-xs text-left' }">
              <template #label>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian khởi hành</span>
              </template>

              <UiDatePicker v-model="order.date_of_destination" class="flex-1 text-sm font-medium" />
            </UFormField>
            <div class="text-xs text-slate-500 mt-1">
              Nếu đặt xe hôm nay vui lòng đặt trước 30 phút để tài xế có thời
              gian chuẩn bị và di chuyển đến điểm đón.
            </div>
          </div>

          <!-- Chọn loại xe -->
          <Transition name="fade">
            <div v-if="hasRouteData" class="space-y-2 text-slate-600">
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
                <div v-for="item in services" :key="item.id" @click="selectService(item)" :class="[
                  'relative overflow-hidden rounded-md border-2 p-2.5 cursor-pointer transition-all duration-200',
                  !getPreview(item.id)
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100'
                    : 'active:scale-95 ',
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
                      class="inline-flex items-center text-xl py-0.5 text-primary rounded-md font-bold tracking-tight">
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
                    <div v-if="item.description" class="text-xs text-slate-500 mt-1">
                      {{ item.description }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-xs text-slate-500">
                Các dịch vụ 2 chiều dài ngày, cần xe ở lại phục vụ, số lượng khách lớn hơn 6, đón trả nhiều điểm hoặc các trường hợp khác vui lòng liên hệ: <a href="tel:0972970000" class="text-primary font-bold underline">0972970000</a> để được hỗ trợ.
              </div>
            </div>
          </Transition>

          <!-- Ghi chú -->
          <UFormField name="note" size="sm" :ui="{ error: 'text-xs text-left' }">
            <template #label>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Ghi chú</span>
            </template>
            <UTextarea v-model="order.note" placeholder="Ví dụ: có người già, trẻ em, thú cưng, cần xe xăng/xe điện..."
              :rows="3" :maxrows="6" autoresize :maxlength="500" class="w-full" :ui="{ base: 'text-sm' }" />
          </UFormField>

          <UButton type="submit" color="primary" size="lg"
            class="font-black text-sm shadow-xl transition-all duration-300 w-full block">
            <span class="flex items-center justify-center gap-2 py-1 w-full">
              <UIcon name="i-lucide-rocket" class="size-5" />
              {{
                hasRouteData ? "ĐẶT CHUYẾN NGAY" : "NHẬP THÔNG TIN ĐỂ XEM GIÁ"
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

    <LazyUiOrderContactModal v-model:open="isModalOpen" :order="order" :id-service="order.id_service"
      :previews="previews" :service-name="selectedServiceName" @confirmed="onOrderConfirmed" />

    <LazyUiOrderSuccessModal v-model:open="openDepositModal" :success-data="successData" />
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";
import type { OrderDetail, OrderPreview } from "~/type";
import { orderService } from "~/services/order.service";
import { useOrderForm } from "~/composables/useOrderForm";

interface RouteData {
  name: string;
  slug: string;
  id?: string;
  parentId?: string;
  data?: string;
}

const props = defineProps<{
  fromData?: RouteData;
  toData?: RouteData;
}>();

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
    name: "Bao chuyến 5 chỗ (1 chiều)",
    description: "Tối đa 4 hành khách",
  },
  {
    id: "66947cea17482239472b88e8",
    name: "Bao chuyến 7 chỗ (1 chiều)",
    description: "Tối đa 6 hành khách",
  },
]);

const previews = ref<OrderDetail[]>([]);
const formKey = ref(0);

// ─── Modal visibility ─────────────────────────────────────
const isModalOpen = ref(false);
const openDepositModal = ref(false);

// ─── Success state ────────────────────────────────────────
const successData = ref({
  departure_city: "",
  departure_district: "",
  departure_address_1: "",
  destination_city: "",
  destination_district: "",
  destination_address_1: "",
  service_name: "",
  price: 0,
});

onMounted(async () => {
  const { getOrderFormData, clearOrderFormData } = useOrderForm();
  const savedOrderData = getOrderFormData();

  if (savedOrderData) {
    order.value.departure_city = savedOrderData.departure_city;
    order.value.departure_dictrict = savedOrderData.departure_dictrict;
    order.value.departure_address_1 = savedOrderData.departure_address_1;
    order.value.destination_city = savedOrderData.destination_city;
    order.value.destination_dictrict = savedOrderData.destination_dictrict;
    order.value.destination_address_1 = savedOrderData.destination_address_1;
    if (savedOrderData.date_of_destination) {
      order.value.date_of_destination = new Date(savedOrderData.date_of_destination);
    }
    clearOrderFormData();
    calcPreviews();
    return;
  }

  // Pre-fill from route props (fromData / toData)
  if (props.fromData || props.toData) {
    try {
      const cities = await $fetch<{ id: string; name: string }[]>(
        "https://sys.happytrip.vn/api/city/list",
        {
          method: "POST",
          body: { status: true },
          params: { fields: "id,name" },
        },
      );

      if (props.fromData) {
        const targetId = props.fromData.id || props.fromData.parentId;
        if (targetId) {
          const city = cities.find((c) => c.id === targetId);
          if (city) {
            order.value.departure_city = city.name;
          }
        }
        if (props.fromData.data) {
          order.value.departure_dictrict = props.fromData.data;
        }
      }

      if (props.toData) {
        const targetId = props.toData.id || props.toData.parentId;
        if (targetId) {
          const city = cities.find((c) => c.id === targetId);
          if (city) {
            order.value.destination_city = city.name;
          }
        }
        if (props.toData.data) {
          order.value.destination_dictrict = props.toData.data;
        }
      }

      // Validate: phải tìm thấy city và district trước khi gọi preview
      if (
        order.value.departure_city &&
        order.value.destination_city &&
        order.value.destination_dictrict
      ) {
        await calcPreviews();
        // Tự chọn dịch vụ đầu tiên nếu chưa chọn
        if (!order.value.id_service) {
          order.value.id_service = services.value[0]?.id || "";
        }
      }
    } catch {
      // API failed, leave form empty
    }
  }
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

const getPreview = (id: string) =>
  previews.value.find((p) => p.id_service === id && p.price_guest_after > 0);

const selectedServiceName = computed(
  () => services.value.find((s) => s.id === order.value.id_service)?.name || "",
);

const canSubmit = computed(
  () =>
    previews.value.some((p) => p.price_guest_after > 0) &&
    !!order.value.id_service,
);

// ─── Schema ───────────────────────────────────────────────
const schema = z.object({
  departure_city: z.string().min(1, "Vui lòng chọn Tỉnh/TP"),
  departure_dictrict: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  departure_address_1: z.string().min(1, "Vui lòng nhập địa chỉ"),
  destination_city: z.string().min(1, "Vui lòng chọn Tỉnh/TP"),
  destination_dictrict: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  destination_address_1: z.string().min(1, "Vui lòng nhập địa chỉ"),
});

type Schema = z.infer<typeof schema>;

// ─── Handlers ─────────────────────────────────────────────
function onSubmit(_e: FormSubmitEvent<Schema>) {
  if (!canSubmit.value) return;
  isModalOpen.value = true;
}

function selectService(item: { id: string }) {
  if (!getPreview(item.id)) return;
  order.value.id_service = item.id;
}

function onOrderConfirmed(data: {
  departure_city: string;
  departure_district: string;
  departure_address_1: string;
  destination_city: string;
  destination_district: string;
  destination_address_1: string;
  service_name: string;
  price: number;
}) {
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
  formKey.value++;
  successData.value = data;
  openDepositModal.value = true;
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
    services.value.map((s) => orderService.previewOrder(order.value, s.id)),
  );
  previews.value = results
    .filter(
      (r): r is PromiseFulfilledResult<OrderDetail> => r.status === "fulfilled",
    )
    .map((r) => r.value);
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
