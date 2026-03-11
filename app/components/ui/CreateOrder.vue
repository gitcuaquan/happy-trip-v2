<template>
  <div
    class="p-5 drop-shadow-2xl inline-flex flex-col rounded-xl bg-white md:w-[450px] w-full gap-4 md:gap-y-3"
  >
    <div class="text-left text-muted text-sm">
      Nhập điểm đi và điểm đến của bạn để nhận được giá cước chính xác nhất
    </div>
    <ElementAddress
      v-model:city="ojectPreview.from_province"
      v-model:address="ojectPreview.address_from_name"
      v-model:province="ojectPreview.from_address"
      :icon="'i-lucide-locate-fixed'"
      :placeholder="'Bạn đang ở đâu ?'"
    />
    <ElementAddress
      v-model:city="ojectPreview.to_province"
      v-model:address="ojectPreview.address_to_name"
      v-model:province="ojectPreview.to_address"
      :icon="'i-lucide-map-pinned'"
      :placeholder="'Điểm đến của bạn ?'"
    />
    <UFormField
      :ui="{
        label:
          'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
      }"
      size="lg"
      label="Ngày Đi"
      name="time"
    >
      <UiDatePicker v-model="ojectPreview.date_go" class="w-full" />
    </UFormField>
    <div class="flex flex-col md:flex-row gap-4">
      <div
        v-for="item in service"
        :key="item.id"
        @click="ojectPreview.service_name = item.name"
        :class="[
          'flex-1 p-4 rounded-lg border hover:scale-105 cursor-pointer  transition-all',
          ojectPreview.service_name === item.name
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-200',
        ]"
      >
        <div class="text-xs mb-2 font-extrabold text-left">
          {{ item.name }}
        </div>
        <div
          class="text-xs text-slate-400 text-left italic max-w-[200px] font-light w-full"
        >
          {{ item.description }}
        </div>
      </div>
    </div>
    <UButton
      color="primary"
      @click="isOpenModal = !isOpenModal"
      size="lg"
      class="w-full text-lg uppercase italic justify-center text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 dark:shadow-none hover:scale-105 active:scale-95"
    >
      <UIcon name="i-lucide-car-taxi-front" class="mr-2 size-7" />
      Đặt Ngay
    </UButton>
    <div class="flex items-center justify-center gap-2 pt-2">
      <div class="flex -space-x-2">
        <div
          class="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"
        ></div>
        <div
          class="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"
        ></div>
        <div
          class="w-6 h-6 rounded-full bg-slate-400 border-2 border-white"
        ></div>
      </div>
      <span
        class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter"
      >
        Đã có 1.2k lượt đặt trong ngày
      </span>
    </div>
  </div>
  <UModal v-model:open="isOpenModal" title="Xác nhận đăt xe">
    <template #body>
      <div class="flex flex-col gap-4">
        <div class="text-sm text-muted">
          Vui lòng kiểm tra lại thông tin đặt xe của bạn trước khi xác nhận
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="size-6 text-primary" />
            <div class="text-sm">
              {{
                [
                  ojectPreview.address_from_name,
                  ojectPreview.from_address,
                  ojectPreview.from_province,
                ]
                  .filter(Boolean)
                  .join(" - ")
              }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="size-6 text-primary" />
            <div class="text-sm">
              {{
                [
                  ojectPreview.address_to_name,
                  ojectPreview.to_address,
                  ojectPreview.to_province,
                ]
                  .filter(Boolean)
                  .join(" - ")
              }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar" class="size-6 text-primary" />
            <div class="text-sm">
              {{
                ojectPreview.date_go
                  ? new Date(ojectPreview.date_go).toLocaleString()
                  : "Chưa chọn ngày đi"
              }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-car" class="size-6 text-primary" />
            <div class="text-sm">
              {{ ojectPreview.service_name }}
            </div>
          </div>
        </div>
         <UStepper :items="items" />
          <UPinInput otp :length="6" />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { OrderDetail, OrderPreview } from "~/type";
import type { StepperItem } from '@nuxt/ui'

const items = ref<StepperItem[]>([
  {
    title: 'Liên hệ',
    description: 'Thông tin để tài xế liên hệ',
    icon: 'i-lucide-house'
  },
  {
    title: 'Xác minh OTP',
    description: 'Nhập mã OTP được gửi đi',
    icon: 'i-lucide-truck'
  }
])
const isOpenModal = ref(true);
const ojectPreview = ref<OrderPreview>({
  date_go: null,
  service_name: "Bao chuyến 5 chỗ (1 chiều)",
  from_province: "",
  from_address: "",
  to_province: "",
  to_address: "",
  address_from_name: "",
  address_to_name: "",
  fullname: "",
  phone: "",
});

const pickupDateTime = ref<Date | null>(null);
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
</script>

<style></style>
