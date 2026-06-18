<template>
  <footer class="relative bg-gray-900 text-gray-300 mt-16">
    <!-- top accent bar -->
    <div class="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-primary" />

    <UContainer class="py-14">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
        <!-- Brand -->
        <div class="md:col-span-5 flex flex-col gap-4">
          <AppLogo class="h-9 w-auto" />
          <p class="text-sm leading-relaxed text-gray-400 max-w-md">
            Tất cả những gì chúng tôi làm là nỗ lực mang đến cho khách hàng
            một chuyến đi <span class="text-white font-semibold">an toàn</span>,
            <span class="text-white font-semibold">thuận tiện</span>,
            <span class="text-white font-semibold">vui vẻ</span> và
            <span class="text-white font-semibold">hạnh phúc</span>.
          </p>
          <div class="flex flex-col gap-1">
            <p class="text-xs text-gray-500 italic">
              — Công ty TNHH 8Express Việt Nam
            </p>
            <p class="text-xs text-gray-500">
              MST: <span class="text-gray-300 font-medium">0110607661</span>
            </p>
          </div>
        </div>

        <!-- Liên hệ -->
        <div class="md:col-span-3 flex flex-col gap-3">
          <h3 class="text-white font-bold uppercase tracking-wide text-sm mb-1">
            Liên hệ
          </h3>
          <a
            href="https://maps.google.com/?q=Số 4, ngách 45, ngõ 218 Lĩnh Nam, Hoàng Mai, Hà Nội"
            target="_blank"
            rel="noopener"
            class="flex items-start gap-2.5 text-sm text-gray-400 hover:text-primary transition-colors"
          >
            <UIcon name="i-lucide-map-pin" class="size-4 mt-0.5 shrink-0" />
            <span>Số 4, ngách 45, ngõ 218 Lĩnh Nam, Hoàng Mai, Hà Nội</span>
          </a>
          <a
            href="tel:0972970000"
            class="flex items-center gap-2.5 text-sm text-gray-400 hover:text-primary transition-colors"
          >
            <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
            <span>0972 97 00 00</span>
          </a>
          <a
            href="mailto:happytripexpress@gmail.com"
            class="flex items-center gap-2.5 text-sm text-gray-400 hover:text-primary transition-colors break-all"
          >
            <UIcon name="i-lucide-mail" class="size-4 shrink-0" />
            <span>happytripexpress@gmail.com</span>
          </a>
        </div>

        <!-- Dịch vụ -->
        <div class="md:col-span-2 flex flex-col gap-3">
          <h3 class="text-white font-bold uppercase tracking-wide text-sm mb-1">
            Dịch vụ
          </h3>
          <NuxtLink
            v-for="l in serviceLinks"
            :key="l.to"
            :to="l.to"
            class="text-sm text-gray-400 hover:text-primary hover:translate-x-1 transition-all w-fit"
          >
            <UIcon name="i-lucide-chevron-right" class="size-3.5 inline mr-1 text-primary" />
            {{ l.label }}
          </NuxtLink>
        </div>

        <!-- Thông tin -->
        <div class="md:col-span-2 flex flex-col gap-3">
          <h3 class="text-white font-bold uppercase tracking-wide text-sm mb-1">
            Thông tin
          </h3>
          <NuxtLink
            v-for="l in infoLinks"
            :key="l.to"
            :to="l.to"
            class="text-sm text-gray-400 hover:text-primary hover:translate-x-1 transition-all w-fit"
          >
            <UIcon name="i-lucide-chevron-right" class="size-3.5 inline mr-1 text-primary" />
            {{ l.label }}
          </NuxtLink>
        </div>
      </div>
    </UContainer>

    <!-- bottom bar -->
    <div class="border-t border-white/10">
      <UContainer class="py-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p class="text-xs text-gray-500">
          © {{ year }} <span class="text-white font-semibold">HappyTrip</span>. All rights reserved.
        </p>
        <p class="text-xs text-gray-500">
          Made with <UIcon name="i-lucide-heart" class="size-3 inline text-red-500" /> by 8Express Việt Nam
        </p>
      </UContainer>
    </div>

    <!-- Floating contact buttons -->
    <div class="fixed bottom-6 right-4 md:right-6 z-40 flex flex-col gap-3">
      <a
        v-for="f in floats"
        :key="f.label"
        :href="f.href"
        :aria-label="f.label"
        target="_blank"
        rel="noopener"
        :class="[
          'group w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110',
          f.bg,
        ]"
      >
        <UIcon :name="f.icon" class="size-6 text-white" />
        <span class="sr-only">{{ f.label }}</span>
      </a>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const year = new Date().getFullYear()

const serviceLinks = [
  { label: 'Đặt chuyến', to: '/' },
  { label: 'Bao xe', to: '/service' },
  { label: 'Ghép xe', to: '/service' },
]

const infoLinks = [
  { label: 'Giới thiệu', to: '/introduce' },
  { label: 'Chính sách', to: '/policy' },
  { label: 'Liên hệ', to: '/contact' },
]

const floats = [
  {
    label: 'Chat Zalo',
    icon: 'i-simple-icons-zalo',
    href: 'https://zalo.me/0972970000',
    bg: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    label: 'Chat Messenger',
    icon: 'i-simple-icons-messenger',
    href: 'https://www.facebook.com/share/1JXBotWN8m/?mibextid=wwXIfr',
    bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
  },
  {
    label: 'Gọi ngay',
    icon: 'i-lucide-phone',
    href: 'tel:0972970000',
    bg: 'bg-primary hover:bg-orange-600',
  },
]
</script>
