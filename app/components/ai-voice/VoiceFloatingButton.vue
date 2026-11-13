<script setup lang="ts">
import { ref } from 'vue'
import { useVoiceModalState } from '~/composables/useTripVoice'

const isVoiceModalOpen = useVoiceModalState()
const isHovered = ref(false)

const handleClick = () => {
  isVoiceModalOpen.value = true
}
</script>

<template>
  <div class="fixed z-40 select-none">
    <!-- MOBILE DISPLAY (< sm): Nút Pill gọn gàng ở góc dưới bên trái (không che cụm liên hệ góc phải) -->
    <div class="sm:hidden fixed bottom-6 left-4">
      <button
        type="button"
        class="flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-primary hover:bg-orange-600 text-white shadow-xl active:scale-95 transition-all border border-white/40 cursor-pointer"
        aria-label="Đặt xe bằng Giọng nói AI"
        @click="handleClick"
      >
        <div class="relative flex items-center justify-center">
          <span class="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-60" />
          <UIcon name="i-lucide-mic" class="size-4 text-white relative z-10" />
        </div>
        <span class="text-xs font-bold tracking-tight">Đặt xe bằng AI</span>
      </button>
    </div>

    <!-- DESKTOP DISPLAY (>= sm): Nút tròn nổi ở góc dưới bên phải -->
    <div
      class="hidden sm:flex fixed bottom-24 right-4 md:right-6 items-center group"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- Tooltip nhãn mở rộng -->
      <div
        class="flex items-center gap-2 mr-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 transform group-hover:scale-105"
      >
        <span class="size-2 rounded-full bg-primary animate-pulse" />
        <span>Đặt xe bằng AI Voice</span>
        <UBadge color="primary" variant="solid" size="xs" class="font-bold">
          Mới
        </UBadge>
      </div>

      <!-- Nút Micro tròn màu cam HappyTrip -->
      <button
        type="button"
        class="relative size-14 rounded-full bg-primary hover:bg-orange-600 shadow-xl flex items-center justify-center text-white transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/60"
        aria-label="Đặt xe bằng Giọng nói AI"
        @click="handleClick"
      >
        <span class="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-60" />
        <UIcon name="i-lucide-mic" class="size-6 text-white drop-shadow-sm relative z-10" />
      </button>
    </div>
  </div>
</template>
