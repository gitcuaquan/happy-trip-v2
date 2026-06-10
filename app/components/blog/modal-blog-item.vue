<template>
  <div class="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
   @click="emit('click', article)">
    <!-- Thumbnail -->
    <div class="relative h-52 overflow-hidden bg-gray-50">
      <img v-if="article.thumbnail" :src="`https://happytrip.vn${article.thumbnail}`"
        :alt="article.title || article.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
      <div v-else class="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-50 to-orange-100">
        <span class="text-3xl font-extrabold text-primary/60 select-none">HappyTrip</span>
      </div>

      <!-- Date badge -->
      <UBadge color="neutral" variant="solid"
        class="absolute top-3 left-3 bg-white/90 text-gray-600 backdrop-blur-sm shadow-sm" size="sm">
        <UIcon name="i-lucide-calendar" class="w-3 h-3 mr-1" />
        {{ formatDate(article.created_at) }}
      </UBadge>

    </div>

    <!-- Card body -->
    <div class="p-5">
      <h3
        class="font-bold text-gray-900 text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
        {{ article.title || article.name }}
      </h3>
      <p class="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
        {{ article.excerpt || 'Khám phá những thông tin hữu ích và cập nhật mới nhất từ dịch vụ xe tiện chuyến hàng đầu HappyTrip.' }}
      </p>

      <div
        class="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all duration-200">
        <span>Đọc tiếp</span>
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Article } from '~/type'


const props = defineProps<{
  article: Article
}>()

const emit = defineEmits<{
  click: [article: Article]
}>()

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Hôm nay'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }
  catch {
    return 'Hôm nay'
  }
}
</script>