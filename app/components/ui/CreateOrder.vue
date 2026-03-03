<template>
  <div
    class="p-3 drop-shadow-2xl inline-flex flex-col rounded-xl bg-white md:w-[80%] w-full gap-4"
  >
    <UFormField
      size="xl"
      label="Điểm Đón"
      required
      name="pickup"
      class="w-full"
    >
      <UInput
        :ui="{
          leadingIcon: 'text-primary',
        }"
        icon="i-lucide-locate-fixed"
        placeholder="Bạn đang ở đâu?"
        size="xl"
        class="w-full"
      />
    </UFormField>
    <UFormField
      size="xl"
      label="Điểm Đến"
      required
      name="destination"
      class="w-full"
    >
      <UInput
        icon="i-lucide-map-pinned"
        :ui="{
          leadingIcon: 'text-primary',
        }"
        placeholder="Bạn muốn đến đâu?"
        size="xl"
        class="w-full"
      />
    </UFormField>
    <div class="md:flex gap-4">
      <UFormField size="xl" label="Dịch Vụ" name="vehicleType" class="md:w-1/2">
        <USelect v-model="value" class="w-full" :items="items" />
      </UFormField>
      <UFormField size="xl" label="Ngày Đi" name="time" class="md:w-1/2">
        <UiDatePicker class="w-full" />
      </UFormField>
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
</script>

<style></style>
