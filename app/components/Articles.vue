<template>
  <section class="py-20 bg-slate-50/50 dark:bg-slate-900/30">
    <UContainer>
      <!-- Section Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <UIcon name="i-lucide-sparkles" class="size-3.5" />
          <span>Cẩm Nang & Du Lịch</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          Kinh Nghiệm Di Chuyển Xe Riêng
        </h2>
        <div class="mx-auto w-16 h-1 rounded-full bg-primary mt-3" />
        <p class="mt-3 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Cập nhật những bí quyết du lịch, kinh nghiệm đặt xe riêng đi tỉnh và mẹo di chuyển thông thái từ HappyTrip
        </p>
      </div>

      <!-- Skeleton Loading -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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
      <div v-else-if="error" class="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <UIcon name="i-lucide-wifi-off" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-400">Không thể tải bài viết. Vui lòng thử lại sau.</p>
        <UButton variant="ghost" color="primary" class="mt-4 font-semibold" @click="refresh()">
          Thử lại
        </UButton>
      </div>

      <!-- Articles Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="article in displayedArticles"
          :key="article.id"
          class="group rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
          @click="navigateTo(`/blog/${article.slug}`)"
        >
          <!-- Image -->
          <div class="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              v-if="article.thumbnail"
              :src="resolveImageUrl(article.thumbnail)"
              :alt="article.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400"
            >
              <UIcon name="i-lucide-image" class="size-10" />
            </div>
            <div class="absolute top-3 left-3">
              <UBadge label="Cẩm Nang" color="primary" variant="solid" size="xs" class="font-bold shadow-sm" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="flex items-center gap-3 text-xs text-slate-400">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" class="size-3.5" />
                  {{ formatDate(article.published_at || article.created_at) }}
                </span>
                <span>•</span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-clock" class="size-3.5" />
                  {{ article.reading_time || 3 }} phút đọc
                </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {{ article.title }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {{ article.excerpt || 'Khám phá ngay bài viết để có chuyến đi an toàn và tối ưu chi phí cùng Happy Trip...' }}
              </p>
            </div>

            <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary">
              <span>Đọc tiếp</span>
              <UIcon name="i-lucide-arrow-right" class="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!pending && !error && displayedArticles.length === 0" class="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <UIcon name="i-lucide-newspaper" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 font-medium">Chưa có bài viết cẩm nang nào được xuất bản.</p>
      </div>

      <!-- CTA Button -->
      <div v-if="!pending && displayedArticles.length > 0" class="mt-12 text-center">
        <UButton
          to="/blog"
          size="lg"
          variant="outline"
          color="primary"
          class="rounded-full px-8 font-bold hover:bg-primary hover:text-white transition-colors duration-200 shadow-sm"
          trailing-icon="i-lucide-arrow-right"
        >
          Xem Tất Cả Cẩm Nang Du Lịch
        </UButton>
      </div>
    </UContainer>
  </section>
</template>

<script lang="ts" setup>
import { blogService } from '~/services/blog.service'
import { resolveImageUrl } from '~/utils'
import type { PageListResponse } from '~/type'

const { data, pending, error, refresh } = await useLazyAsyncData<PageListResponse>(
  'home-blog-articles',
  () => blogService.getBlogList({
    page: 1,
    limit: 6,
  }),
)

const displayedArticles = computed(() => {
  return (data.value?.data ?? []).filter(article => article.title).slice(0, 6)
})

function formatDate(value?: string): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return value
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  } catch {
    return value
  }
}
</script>