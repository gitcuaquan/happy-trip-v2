import { UInput } from '../../../.nuxt/components';
<template>
  <div
    class="p-5 drop-shadow-2xl inline-flex flex-col rounded-xl bg-white md:w-[450px] w-full gap-4 md:gap-y-6"
  >
    <UFormField
      size="lg"
      label="Điểm Đón"
      required
      name="pickup"
      :ui="{
        label:
          'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
      }"
      class="w-full"
    >
      <UInput
        :ui="{
          leadingIcon: 'text-primary',
        }"
        icon="i-lucide-locate-fixed"
        placeholder="Bạn đang ở đâu?"
        size="lg"
        class="w-full"
      />
    </UFormField>
    <UFormField
      size="lg"
      label="Điểm Đến"
      required
      name="destination"
      class="w-full"
      :ui="{
        label:
          'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
      }"
    >
      <UInput
        icon="i-lucide-map-pinned"
        :ui="{
          leadingIcon: 'text-primary',
        }"
        placeholder="Bạn muốn đến đâu?"
        size="lg"
        class="w-full"
      />
    </UFormField>
    <div class="md:flex gap-4">
      <UFormField
        :ui="{
          label:
            'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
        }"
        size="lg"
        label="Dịch Vụ"
        name="vehicleType"
        class="md:w-1/2"
      >
        <USelect v-model="value" class="w-full" :items="items" />
      </UFormField>
      <UFormField
        :ui="{
          label:
            'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
        }"
        size="lg"
        label="Ngày Đi"
        name="time"
        class="md:w-1/2"
      >
        <UiDatePicker v-model="pickupDateTime" class="w-full" />
      </UFormField>
    </div>
    <div class="md:flex gap-4">
      <UFormField
        :ui="{
          label:
            'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
        }"
        size="lg"
        label="Họ và Tên"
        name="vehicleType"
        class="md:w-1/2"
      >
        <UInput placeholder="Họ và tên của bạn"  class="w-full" />
      </UFormField>
      <UFormField
        :ui="{
          label:
            'font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
        }"
        size="lg"
        label="Số Điện Thoại"
        name="phone"
        class="md:w-1/2"
      >
        <UInput placeholder="Số liên lạc"  class="w-full" />
      </UFormField>
    </div>
    <UButton
      color="primary"
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
        >Đã có 1.2k lượt đặt trong ngày</span
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
const items = ref([
  "Xe 5 chỗ (1 chiều)",
  "Xe 7 chỗ (1 chiều)",
  "Xe 5 chỗ (2 chiều)",
  "Xe 7 chỗ (2 chiều)",
]);
const value = ref("Xe 5 chỗ (1 chiều)");
const pickupDateTime = ref<Date | null>(null);
</script>

<style></style>
