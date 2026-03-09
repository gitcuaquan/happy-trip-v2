<template>
  <div
    class="p-5 drop-shadow-2xl inline-flex flex-col rounded-xl bg-white md:w-[450px] w-full gap-4 md:gap-y-6"
  >
    <ElementAddress
      :icon="'i-lucide-locate-fixed'"
      :placeholder="'Bạn đang ở đâu ?'"
    />
    <ElementAddress
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
      <UiDatePicker v-model="pickupDateTime" class="w-full" />
      {{ pickupDateTime }}
    </UFormField>
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
        >
        Đã có 1.2k lượt đặt trong ngày
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const pickupDateTime = ref<Date | null>(null);
</script>

<style></style>
