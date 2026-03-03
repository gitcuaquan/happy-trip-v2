<template>
  <ClientOnly>
    <div class="bg-gray-900 p-2">
      <UContainer>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2 text-[12px] text-white">
            <UIcon name="i-lucide-mail" />
            HAPPYTRIPEXPRESS@GMAIL.COM
          </div>
          <div class="flex items-center gap-2 text-[12px] text-white">
            <UIcon name="i-lucide-phone" />
            HOTLINE: 0987654321
          </div>
        </div>
      </UContainer>
    </div>
    <UHeader mode="drawer">
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>
      <UNavigationMenu
        :items="items"
        :ui="{
          linkLabel: 'font-bold text-gray-900',
          list: 'gap-10',
        }"
        class="uppercase"
      />
      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
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
  </ClientOnly>
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
    active: route.path.startsWith("/docs/getting-started"),
  },
  {
    label: "Chính sách",
    to: "/docs/components",
    active: route.path.startsWith("/docs/components"),
  },
  {
    label: "Dịch vụ",
    to: "https://go.nuxt.com/figma-ui",
  },
  {
    label: "Về chúng tôi",
    to: "https://github.com/nuxt/ui/releases",
  },
  {
    label: "Liên hệ",
    to: "https://github.com/nuxt/ui/releases",
  },
]);
</script>

<style></style>
