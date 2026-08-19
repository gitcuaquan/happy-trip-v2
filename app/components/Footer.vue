<template>
  <footer class="relative bg-gray-50 text-gray-600 mt-16 border-t border-gray-200">
    <UContainer class="py-14">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div class="md:col-span-5 flex flex-col gap-4">
          <AppLogo class="h-9 w-auto" />
          <p class="text-sm leading-relaxed text-gray-600 max-w-md">
            Tất cả những gì chúng tôi làm là nỗ lực mang đến cho khách hàng
            một chuyến đi <span class="text-gray-900 font-semibold">an toàn</span>,
            <span class="text-gray-900 font-semibold">thuận tiện</span>,
            <span class="text-gray-900 font-semibold">vui vẻ</span> và
            <span class="text-gray-900 font-semibold">hạnh phúc</span>.
          </p>
          <div class="flex flex-col gap-1">
            <p class="text-xs text-gray-400 italic">
              — Công ty TNHH 8Express Việt Nam
            </p>
            <p class="text-xs text-gray-500">
              MST: <span class="text-gray-700 font-medium">0110607661</span>
            </p>
          </div>
        </div>

        <div class="md:col-span-3 flex flex-col gap-3">
          <h3 class="text-gray-900 font-bold uppercase tracking-wide text-sm mb-1">
            Liên hệ
          </h3>
          <a
            href="https://maps.google.com/?q=Số 4, ngách 45, ngõ 218 Lĩnh Nam, Hoàng Mai, Hà Nội"
            target="_blank"
            rel="noopener"
            class="flex items-start gap-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="size-4 mt-0.5 shrink-0 text-gray-400"
            />
            <span>Số 4, ngách 45, ngõ 218 Lĩnh Nam, Hoàng Mai, Hà Nội</span>
          </a>
          <a
            href="tel:0972970000"
            class="flex items-center gap-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <UIcon
              name="i-lucide-phone"
              class="size-4 shrink-0 text-gray-400"
            />
            <span>0972 97 00 00</span>
          </a>
          <a
            href="mailto:happytripexpress@gmail.com"
            class="flex items-center gap-2.5 text-sm text-gray-600 hover:text-primary transition-colors break-all"
          >
            <UIcon
              name="i-lucide-mail"
              class="size-4 shrink-0 text-gray-400"
            />
            <span>happytripexpress@gmail.com</span>
          </a>
        </div>

        <div class="md:col-span-2 flex flex-col gap-3">
          <h3 class="text-gray-900 font-bold uppercase tracking-wide text-sm mb-1">
            Dịch vụ
          </h3>
          <NuxtLink
            v-for="l in serviceLinks"
            :key="l.to"
            :to="l.to"
            class="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all w-fit"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="size-3.5 inline mr-1 text-primary"
            />
            {{ l.label }}
          </NuxtLink>
        </div>

        <div class="md:col-span-2 flex flex-col gap-3">
          <h3 class="text-gray-900 font-bold uppercase tracking-wide text-sm mb-1">
            Thông tin
          </h3>
          <NuxtLink
            v-for="l in infoLinks"
            :key="l.to"
            :to="l.to"
            class="text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all w-fit"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="size-3.5 inline mr-1 text-primary"
            />
            {{ l.label }}
          </NuxtLink>
        </div>
      </div>
    </UContainer>

    <div class="border-t border-gray-200 bg-white">
      <UContainer class="py-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p class="text-xs text-gray-500">
          © {{ year }} <span class="text-gray-900 font-semibold">HappyTrip</span>. All rights reserved.
        </p>
        <p class="text-xs text-gray-500">
          Made with <UIcon
            name="i-lucide-heart"
            class="size-3 inline text-red-500"
          /> by 8Express Việt Nam
        </p>
      </UContainer>
    </div>

    <!-- Radial Menu -->
    <div
      ref="radialRef"
      class="fixed bottom-6 right-4 md:right-6 z-40"
      @mouseenter="openRadial"
      @mouseleave="closeRadial"
    >
      <div class="relative">
        <div
          v-for="f in floats"
          :key="f.label"
          class="radial-item absolute right-0 pointer-events-none scale-0 opacity-0"
        >
          <a
            :href="f.href"
            :aria-label="f.label"
            target="_blank"
            rel="noopener"
            class="w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            :class="f.bg"
          >
            <UIcon
              :name="f.icon"
              class="size-5 text-white"
            />
            <span class="sr-only">{{ f.label }}</span>
          </a>
        </div>

        <div
          class="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center"
        >
          <UIcon
            name="i-lucide-message-circle"
            class="size-7 text-white"
          />
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'

const year = new Date().getFullYear()

const serviceLinks = [
  { label: 'Đặt xe trực tuyến', to: '/' },
  { label: 'Xe riêng 5 chỗ', to: '/#dich-vu-5-cho' },
  { label: 'Xe riêng 7 chỗ', to: '/#dich-vu-7-cho' },
  { label: 'Đưa đón Sân bay TSN', to: '/xe-rieng-tphcm-di-san-bay-tan-son-nhat' },
  { label: 'Tuyến đi tỉnh 2 chiều', to: '/#dich-vu' }
]

const infoLinks = [
  { label: 'Giới thiệu', to: '/introduce' },
  { label: 'Chính sách', to: '/policy' },
  { label: 'Liên hệ', to: '/contact' }
]

const floats = [
  {
    label: 'Chat Zalo',
    icon: 'i-simple-icons-zalo',
    href: 'https://zalo.me/0972970000',
    bg: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    label: 'Chat Messenger',
    icon: 'i-simple-icons-messenger',
    href: 'https://www.facebook.com/share/17kFPUGXDn/',
    bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'
  },
  {
    label: 'Gọi ngay',
    icon: 'i-lucide-phone',
    href: 'tel:0972970000',
    bg: 'bg-primary hover:bg-orange-600'
  }
]

const isOpen = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const radialRef = ref<HTMLElement | null>(null)

const GAP = 14

let radialTween: gsap.core.Timeline | null = null

function getItems(): HTMLElement[] {
  if (!radialRef.value) return []
  return Array.from(radialRef.value.querySelectorAll('.radial-item'))
}

function animateItems(reverse = false) {
  const items = getItems()
  if (!items.length) return

  radialTween?.kill()
  radialTween = gsap.timeline()

  if (!reverse) {
    items.forEach((el, i) => {
      const y = -(i + 1) * (48 + GAP)

      gsap.set(el, { x: 0, y: 0, scale: 0, opacity: 0 })

      radialTween!.to(el, {
        x: -5,
        y,
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)'
      }, i * 0.08)

      radialTween!.set(el, { pointerEvents: 'auto' }, i * 0.08)
    })
  } else {
    items.forEach((el, i) => {
      radialTween!.to(el, {
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in'
      }, i * 0.04)

      radialTween!.set(el, { pointerEvents: 'none' }, i * 0.04)
    })
  }
}

function openRadial() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  if (isOpen.value) return
  isOpen.value = true
  animateItems(false)
}

function closeRadial() {
  closeTimer = setTimeout(() => {
    if (!isOpen.value) return
    isOpen.value = false
    animateItems(true)
  }, 150)
}

onUnmounted(() => {
  radialTween?.kill()
  if (closeTimer) clearTimeout(closeTimer)
})
</script>
