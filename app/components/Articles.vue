<template>
  <section class="py-16 bg-white">
    <UContainer>
      <!-- Section Header -->
      <div class="text-center mb-12">
        <p class="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
          Blog
        </p>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Tin Tức & Kinh Nghiệm
        </h2>
        <div class="mx-auto w-16 h-1 rounded-full bg-primary" />
        <p class="mt-4 text-gray-500 max-w-xl mx-auto text-base">
          Cập nhật những thông tin hữu ích và kinh nghiệm du lịch từ HappyTrip
        </p>
      </div>

      <!-- Skeleton Loading -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <USkeleton class="h-52 w-full rounded-none" />
          <div class="p-5 space-y-3">
            <USkeleton class="h-4 w-24 rounded-full" />
            <USkeleton class="h-6 w-full rounded" />
            <USkeleton class="h-4 w-3/4 rounded" />
            <USkeleton class="h-4 w-1/2 rounded" />
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-12">
        <UIcon name="i-lucide-wifi-off" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-400">Không thể tải bài viết. Vui lòng thử lại sau.</p>
        <UButton variant="ghost" color="primary" class="mt-4" @click="refresh()">
          Thử lại
        </UButton>
      </div>

      <!-- Articles Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article v-for="(article, index) in displayedArticles" :key="article.id"
          class="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          :class="index === 1 ? 'md:scale-[1.02]' : ''" @click="navigateTo(`/bai-viet/${article.slug}`)">
          <!-- Thumbnail -->
          <div class="relative h-52 overflow-hidden bg-gray-50">
            <img v-if="article.thumbnail" :src="article.thumbnail" :alt="article.title || article.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <!-- Fallback placeholder with brand -->
            <div v-else
              class="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-50 to-orange-100">
              <span class="text-3xl font-extrabold text-primary/60 select-none">HappyTrip</span>
            </div>

            <!-- Date badge -->
            <UBadge color="neutral" variant="solid"
              class="absolute top-3 left-3 bg-white/90 text-gray-600 backdrop-blur-sm shadow-sm" size="sm">
              <UIcon name="i-lucide-calendar" class="w-3 h-3 mr-1" />
              {{ formatDate(article.created_at) }}
            </UBadge>

            <!-- Featured tag for center card -->
            <UBadge v-if="index === 1" color="primary" variant="solid" class="absolute top-3 right-3" size="sm">
              Nổi bật
            </UBadge>
          </div>

          <!-- Card body -->
          <div class="p-5">
            <h3
              class="font-bold text-gray-900 text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {{ article.title || article.name }}
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
              {{ article.excerpt || 'Khám phá những thông tin hữu ích và cập nhật mới nhất từ dịch vụ xe ghép hàng đầu HappyTrip.' }}
            </p>

            <!-- Read more -->
            <div
              class="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all duration-200">
              <span>Đọc tiếp</span>
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </div>
          </div>

          <!-- Bottom accent line -->
          <div
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </article>
      </div>

      <!-- Empty state -->
      <div v-if="!pending && !error && displayedArticles.length === 0" class="text-center py-16">
        <UIcon name="i-lucide-newspaper" class="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p class="text-gray-400">Chưa có bài viết nào.</p>
      </div>

      <!-- CTA Button -->
      <div v-if="!pending && displayedArticles.length > 0" class="mt-10 text-center">
        <UButton to="/bai-viet" size="lg" variant="outline" color="primary"
          class="rounded-full px-8 font-semibold hover:bg-primary hover:text-white transition-colors duration-200"
          trailing-icon="i-lucide-arrow-right">
          Xem Tất Cả Bài Viết
        </UButton>
      </div>
    </UContainer>
  </section>
</template>

<script lang="ts" setup>
import type { PageListResponse } from '~/type'

const { data, pending, error, refresh } = await useLazyAsyncData<PageListResponse>(
  'articles',
  () => $fetch('https://sys.happytrip.vn/api/page/list', {
    method: 'POST',
    query: {
      page: 1,
      limit: 3,
      sort_by: 'created_at',
      field: 'id,slug,name,thumbnail,title,created_at'
    },
    body: {}
  }),
  {
    default: () => ({ data: [] })
  }
)

const displayedArticles = computed(() => {
  return (data.value?.data ?? []).slice(0, 3)
})

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Hôm nay'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateStr))
  }
  catch {
    return 'Hôm nay'
  }
}
</script>