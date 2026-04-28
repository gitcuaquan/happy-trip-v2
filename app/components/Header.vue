<template>
  <div class="bg-gray-900 hidden md:block p-2">
    <UContainer>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 text-[12px] text-white">
          <UIcon name="i-lucide-mail" />
          HAPPYTRIPEXPRESS@GMAIL.COM
        </div>
        <div class="flex items-center gap-2 text-[12px] text-white">
          <UIcon name="i-lucide-phone" />
          HOTLINE: 0972 97 0000
        </div>
      </div>
    </UContainer>
  </div>
  <UHeader mode="drawer">
    <template #left>
      <AppLogo class="w-auto h-6 shrink-0" />
    </template>
    <UNavigationMenu
      :items="items"
      variant="link"
      :ui="{
        linkLabel: 'font-bold text-gray-900 hover:text-primary transition-colors duration-300 hover:border-b-2 hover:border-primary border-transparent border-b-2',
        list: 'gap-10',
      }"
      class="uppercase"
    />
    <template #body>
      <UNavigationMenu  :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
    <template #right>
      <UButton
        to="/contact"
        size="md"
        icon="i-lucide-phone"
        label="Hotline"
        color="primary"
        class="rounded-4xl"
      />
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
const route = useRoute();
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Đặt xe",
    to: "/docs/getting-started",
  },
  {
    label: "Tài xế",
    to: '/driver/landing',
  },
  {
    label: "Chính sách",
    to: "/policy",
  },
  {
    label: "Dịch vụ",
    to: "/service",
  },
  {
    label: "Về chúng tôi",
    to: "/introduce",
  },
  {
    label: "Liên hệ",
    to: "/contact",
  },
]);
</script>

<style></style>
