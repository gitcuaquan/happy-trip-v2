<template>
  <div class="p-5 drop-shadow-2xl inline-flex flex-col rounded-xl bg-white md:w-[450px] w-full gap-4 md:gap-y-3">
    <ElementAddress v-model:city="ojectPreview.departure_city" v-model:address="ojectPreview.departure_address_1"
      v-model:province="ojectPreview.departure_dictrict" :exclude-city="ojectPreview.destination_city"
      :icon="'i-lucide-locate-fixed'" label="Điểm đón" :placeholder="'Bạn đang ở đâu ?'" />
    <ElementAddress v-model:city="ojectPreview.destination_city" v-model:address="ojectPreview.destination_address_1"
      v-model:province="ojectPreview.destination_dictrict" :exclude-city="ojectPreview.departure_city"
      :icon="'i-lucide-map-pinned'" label="Điểm đến" :placeholder="'Điểm đến của bạn ?'" />
    <UFormField :ui="{
      label:
        'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
    }" size="lg" label="Ngày Đi" name="time">
      <UiDatePicker v-model="ojectPreview.date_of_destination" class="w-full" />
    </UFormField>
    <div class="text-sm text-left italic text-muted">
      Vui lòng nhập đầy đủ thông tin địa chỉ để có giá chính xác nhất
    </div>
    <div v-if="listOrderPreview.length" class="text-left">
      <label class="font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Chọn loại xe
      </label>
      <div class="flex flex-col gap-4">
        <div v-for="item in service" :key="item.id" @click="() => {
          if (listOrderPreview?.find((i) => i.id_service === item.id)?.price_guest_after) {
            ojectPreview.id_service = item.id;
          }
        }" :class="[
          'relative flex-1 p-3 rounded-xl border-2 transition-all duration-200',
          !listOrderPreview?.find((i) => i.id_service === item.id)?.price_guest_after ? 'opacity-60 cursor-not-allowed bg-slate-50 border-gray-100' : 'cursor-pointer',
          ojectPreview.id_service === item.id
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-gray-200 hover:border-primary/40 bg-white',
        ]">
          <!-- Icon Radio góc phải -->
          <div class="absolute top-3 right-3 flex items-center justify-center">
            <UIcon v-if="ojectPreview.id_service === item.id" name="i-lucide-circle-check-big"
              class="size-5 text-primary" />
            <div v-else class="size-5 rounded-full border-2 border-slate-300"></div>
          </div>

          <div class="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5 mb-0.5"
            :class="{ 'text-primary': ojectPreview.id_service === item.id }">
            <UIcon name="i-lucide-car-front" class="size-4" />
            {{ item.name }}
          </div>
          <div class="text-xs text-slate-500 italic w-10/12 mb-2">
            {{ item.description }}
          </div>
          <div class="text-left flex items-center gap-2 mt-auto">
            <template v-if="listOrderPreview?.find((i) => i.id_service === item.id)?.price_guest_after">
              Giá:
              <div class="font-extrabold text-primary">
                {{
                  numberToCurrency(
                    listOrderPreview.find((i) => i.id_service === item.id)!.price_guest_after!
                  )
                }}
              </div>
            </template>
            <template v-else>
              <div class="text-red-500 text-[11px] font-bold mt-1">
                Tuyến đường chưa được hỗ trợ
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <UButton color="primary" @click="isOpenModal = !isOpenModal" size="lg" :disabled="!isOrderReady"
      class="w-full text-lg uppercase italic justify-center text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 dark:shadow-none hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50">
      <UIcon name="i-lucide-car-taxi-front" class="mr-2 size-7" />
      Đặt Ngay
    </UButton>
    <div class="flex items-center justify-center gap-2 pt-2">
      <div class="flex -space-x-2">
        <div class="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
        <div class="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
        <div class="w-6 h-6 rounded-full bg-slate-400 border-2 border-white"></div>
      </div>
      <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
        Trung bình có 1.2k lượt đặt mỗi ngày
      </span>
    </div>
  </div>
  <UModal v-model:open="isOpenModal" title="Xác nhận đăt xe" :ui="{ body: 'sm:p-4' }" class="w-[350px]">
    <template #body>
      <div class="flex w-full flex-col items-center gap-3">
        <UFormField label="Họ và tên" required class="w-full">
          <UInput placeholder="Nhập họ và tên" class="w-full" />
        </UFormField>
        <UFormField label="Số điện thoại" description="Xin hãy ưu tiên số điện thoại có đăng ký Zalo" required
          class="w-full">
          <UInput placeholder="Nhập số điện thoại" class="w-full" />
        </UFormField>
        <UButton color="primary" size="lg">
          Gửi mã OTP
        </UButton>
      </div>
      <!-- <UStepper :items="items">
        <template #contact> </template>
  <template #otp>
          <div class="flex flex-col gap-2">
            <div class="text-sm text-slate-500 italic">
              Mã OTP đã được gửi đến số điện thoại của bạn
            </div>
            <UPinInput otp :length="6" />
          </div>
        </template>
  </UStepper> -->
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { OrderDetail, OrderPreview } from "~/type";
import type { StepperItem } from "@nuxt/ui";

const items = ref<StepperItem[]>([
  {
    title: "Liên hệ",
    icon: "i-lucide-house",
    slot: "contact",
  },
  {
    title: "Xác minh OTP",
    icon: "i-lucide-truck",
    slot: "otp",
  },
]);
const isOpenModal = ref(false);

const ojectPreview = ref<OrderPreview>({
  id_service: "",
  date_of_destination: null,
  departure_city: "",
  departure_dictrict: "",
  destination_city: "",
  destination_dictrict: "",
  departure_address_1: "",
  destination_address_1: "",
});

const listOrderPreview = ref<OrderDetail[]>([]);

const service = ref([
  {
    id: "66947d0917482239472b9807",
    name: "Bao chuyến 5 chỗ (1 chiều)",
    description: "Phù hợp cho nhóm 1-4 người ",
    service_name: "Bao chuyến",
  },
  {
    id: "66947cea17482239472b88e8",
    name: "Bao chuyến 7 chỗ (1 chiều)",
    description: "Phù hợp cho nhóm 3-6 người ",
    service_name: "Bao chuyến",
  },
]);

const validateData = computed(() => {
  const v = ojectPreview.value;
  return Object.values({
    departure_city: v.departure_city,
    destination_city: v.destination_city,
    departure_dictrict: v.departure_dictrict,
    destination_dictrict: v.destination_dictrict,
  }).every(Boolean);
});

const isOrderReady = computed(() => {
  const v = ojectPreview.value;
  return Boolean(
    v.departure_city?.trim() &&
    v.destination_city?.trim() &&
    v.departure_dictrict?.trim() &&
    v.destination_dictrict?.trim() &&
    v.departure_address_1?.trim() &&
    v.destination_address_1?.trim() &&
    v.id_service
  );
});

watch(
  () => [
    ojectPreview.value.departure_city,
    ojectPreview.value.destination_city,
    ojectPreview.value.departure_dictrict,
    ojectPreview.value.destination_dictrict,
  ],
  async () => {
    const data = await calcPriceService();
    if (data && data.length > 0) {
      listOrderPreview.value = data;
    }
  },
);

async function calcPriceService() {
  if (!validateData.value) return 0;
  const promise = service.value.map((item) => {
    return $fetch<OrderDetail>(
      "https://sysdev.happytrip.vn/api/order/preview",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          origin: "https://happytrip.vn",
          referer: "https://happytrip.vn/",
        },
        body: {
          ...ojectPreview.value,
          id_service: item.id,
        },
      },
    );
  });

  const data = await Promise.all(promise);
  return data;
}
</script>

<style></style>
