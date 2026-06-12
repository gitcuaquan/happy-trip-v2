<template>
  <section class="relative bg-linear-to-br from-orange-500 to-orange-600 pt-24 pb-32 overflow-hidden">
    <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

    <UContainer class="relative z-10">
      <div class="text-center text-white space-y-6">
        <h1 class="text-5xl lg:text-6xl font-black leading-tight">
          Trở Thành Đối Tác <br>
          <span class="text-orange-200">Tài Xế Happy Trip</span>
        </h1>

        <p class="text-lg md:text-xl text-orange-50 max-w-2xl mx-auto">
          Gia tăng thu nhập, làm chủ thời gian và nhận hàng ngàn ưu đãi hấp dẫn.
          Hệ thống thông minh giúp bạn tối ưu từng chuyến đi.
        </p>

        <div class="flex justify-center pt-6">
          <UButton
            size="lg"
            color="neutral"
            icon="i-lucide-download"
            class="rounded-full font-bold text-lg"
            @click="handleDownload"
          >
            Tải ứng dụng
          </UButton>
        </div>
      </div>
    </UContainer>

    <!-- Modal chọn store (hiện trên desktop) -->
    <UModal
      v-model:open="showStoreModal"
      title="Tải HT Driver"
      description="Chọn nền tảng phù hợp với thiết bị của bạn"
      :ui="{ content: 'sm:max-w-md', body: 'p-5 sm:p-6' }"
    >
      <template #body>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UCard
            class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
            :ui="{
              root: 'bg-slate-900 text-white border-0',
              body: 'p-4 flex items-center gap-3'
            }"
            @click="openStore(APP_STORE)"
          >
            <UIcon name="i-simple-icons-apple" class="size-9 shrink-0" />
            <div class="flex flex-col text-left leading-tight">
              <span class="text-[10px] uppercase tracking-wider opacity-80">Tải về trên</span>
              <span class="text-base font-bold">App Store</span>
            </div>
          </UCard>

          <UCard
            class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
            :ui="{
              root: 'bg-slate-900 text-white border-0',
              body: 'p-4 flex items-center gap-3'
            }"
            @click="openStore(PLAY_STORE)"
          >
            <UIcon name="i-simple-icons-googleplay" class="size-9 shrink-0" />
            <div class="flex flex-col text-left leading-tight">
              <span class="text-[10px] uppercase tracking-wider opacity-80">Tải về trên</span>
              <span class="text-base font-bold">Google Play</span>
            </div>
          </UCard>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
const APP_STORE = 'https://apps.apple.com/vn/app/ht-driver/id6739839386'
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.happytrip.happytripdriver&hl=vi'

const showStoreModal = ref(false)

function detectPlatform(): 'ios' | 'android' | 'other' {
  if (import.meta.server) return 'other'
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (
    /iphone|ipad|ipod/i.test(ua)
    || (/macintosh/i.test(ua) && 'ontouchend' in document)
  ) return 'ios'
  return 'other'
}

function handleDownload() {
  const platform = detectPlatform()
  if (platform === 'ios') {
    window.open(APP_STORE, '_blank', 'noopener')
  } else if (platform === 'android') {
    window.open(PLAY_STORE, '_blank', 'noopener')
  } else {
    showStoreModal.value = true
  }
}

function openStore(url: string) {
  window.open(url, '_blank', 'noopener')
  showStoreModal.value = false
}
</script>
