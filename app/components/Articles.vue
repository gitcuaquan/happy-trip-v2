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
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ModalBlogItem 
          v-for="(article, index) in displayedArticles"
          :key="article.id"
          :article="article"
          @click="navigateTo({ path: '/policy', query: { slug: article.slug } })"
        />
      </div>

      <!-- Empty state -->
      <div v-if="!pending && !error && displayedArticles.length === 0" class="text-center py-16">
        <UIcon name="i-lucide-newspaper" class="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p class="text-gray-400">Chưa có bài viết nào.</p>
      </div>

      <!-- CTA Button -->
      <div v-if="!pending && displayedArticles.length > 0" class="mt-10 text-center">
        <UButton to="/policy" size="lg" variant="outline" color="primary"
          class="rounded-full px-8 font-semibold hover:bg-primary hover:text-white transition-colors duration-200"
          trailing-icon="i-lucide-arrow-right">
          Xem Tất Cả Bài Viết
        </UButton>
      </div>
    </UContainer>
  </section>
</template>

<script lang="ts" setup>
import { BlogService } from '~/services/blog.service'
import type { PageListResponse } from '~/type'
import ModalBlogItem from './blog/modal-blog-item.vue'

const blogService = new BlogService()

const { data, pending, error, refresh } = await useLazyAsyncData<PageListResponse>(
  'articles',
  () => blogService.getPageList({
    page: 1,
    limit: 3,
    sort_by: 'created_at',
    field: 'id,slug,name,thumbnail,title,created_at'
  }),
)

const displayedArticles = computed(() => {
  return (data.value?.data ?? []).filter(article => article.title).slice(0, 3)
})


</script>