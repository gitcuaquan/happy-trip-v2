<template>
  <div class="py-12 bg-slate-50/50 dark:bg-slate-900/30 min-h-screen">
    <UContainer>
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <UIcon name="i-lucide-compass" class="size-3.5" />
          <span>Happy Trip Blog</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
          Cẩm Nang & Kinh Nghiệm Du Lịch
        </h1>
        <div class="w-20 h-1.5 bg-primary mx-auto rounded-full mt-4" />
        <p class="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Tổng hợp kinh nghiệm đặt xe riêng trọn gói, bí quyết di chuyển an toàn và lịch trình du lịch các tỉnh miền Nam & Tây Nguyên
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="max-w-md mx-auto mb-10">
        <UInput
          v-model="searchKeyword"
          icon="i-lucide-search"
          placeholder="Tìm kiếm kinh nghiệm du lịch, tuyến xe..."
          size="lg"
          class="w-full shadow-sm rounded-full"
          @update:model-value="onSearchDebounced"
        />
      </div>

      <!-- Skeleton Loading -->
      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <USkeleton class="h-52 w-full rounded-none" />
          <div class="p-5 space-y-3">
            <USkeleton class="h-4 w-24 rounded-full" />
            <USkeleton class="h-6 w-full rounded" />
            <USkeleton class="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <UIcon name="i-lucide-wifi-off" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-400">Không thể tải danh sách bài viết. Vui lòng thử lại.</p>
        <UButton variant="ghost" color="primary" class="mt-4 font-bold" @click="refresh()">Thử lại</UButton>
      </div>

      <!-- Empty -->
      <div v-else-if="!articles?.length" class="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <UIcon name="i-lucide-file-question" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 font-medium text-base">Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.</p>
      </div>

      <!-- Articles Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="article in articles"
          :key="article.id"
          class="group rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
          @click="navigateTo(`/blog/${article.slug}`)"
        >
          <!-- Thumbnail Image -->
          <div class="relative aspect-[1200/630] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
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

          <!-- Article Info -->
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
              <h2 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {{ article.title }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {{ article.excerpt || 'Khám phá ngay bài viết để có chuyến đi an toàn và tối ưu chi phí cùng Happy Trip...' }}
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary">
              <span>Đọc toàn bộ bài viết</span>
              <UIcon name="i-lucide-arrow-right" class="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </article>
      </div>

      <!-- Load More / Pagination -->
      <div v-if="!pending && !error && (articles?.length ?? 0) > 0 && hasMore" class="mt-12 text-center">
        <UButton
          size="lg"
          variant="outline"
          color="primary"
          :loading="loadingMore"
          class="rounded-full px-8 font-bold shadow-sm"
          trailing-icon="i-lucide-chevron-down"
          @click="loadMore"
        >
          Xem Thêm Bài Viết
        </UButton>
      </div>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
import { blogService } from '~/services/blog.service'
import { resolveImageUrl } from '~/utils'
import type { Article, PageListResponse } from '~/type'

useSeoMeta({
  title: 'Cẩm Nang & Kinh Nghiệm Du Lịch - Happy Trip',
  description: 'Tổng hợp bí quyết đặt xe riêng 100% không ghép, kinh nghiệm du lịch các tỉnh miền Nam và cẩm nang di chuyển an toàn từ Happy Trip.',
  ogTitle: 'Cẩm Nang & Kinh Nghiệm Du Lịch - Happy Trip',
  ogDescription: 'Tổng hợp bí quyết đặt xe riêng 100% không ghép, kinh nghiệm du lịch các tỉnh miền Nam và cẩm nang di chuyển an toàn từ Happy Trip.',
})

const PAGE_LIMIT = 9
const currentPage = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)
const searchKeyword = ref('')

const { data: initialData, pending, error, refresh } = await useAsyncData<PageListResponse>(
  'blog-page-list',
  () => blogService.getBlogList({
    page: 1,
    limit: PAGE_LIMIT,
    keyword: searchKeyword.value,
  }),
)

const articles = ref<Article[]>([])

watch(initialData, (newVal) => {
  if (newVal?.data) {
    articles.value = [...newVal.data]
    hasMore.value = newVal.data.length >= PAGE_LIMIT
  }
}, { immediate: true })

let searchTimeout: any = null
function onSearchDebounced() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    refresh()
  }, 350)
}

async function loadMore() {
  loadingMore.value = true
  try {
    currentPage.value++
    const more = await blogService.getBlogList({
      page: currentPage.value,
      limit: PAGE_LIMIT,
      keyword: searchKeyword.value,
    })
    if (more?.data?.length) {
      articles.value.push(...more.data)
      hasMore.value = more.data.length >= PAGE_LIMIT
    } else {
      hasMore.value = false
    }
  } finally {
    loadingMore.value = false
  }
}

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
