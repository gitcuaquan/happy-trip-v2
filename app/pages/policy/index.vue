<template>
  <UContainer class="py-10">
    <div class="text-center mb-12">
      <h3 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
        Tài Liệu & Chính Sách
      </h3>
      <div class="w-20 h-2 bg-primary mx-auto rounded-full" />
      <p class="mt-4 text-gray-500 max-w-xl mx-auto text-base">
        Tổng hợp các quy định, điều khoản và chính sách dịch vụ của HappyTrip
      </p>
    </div>

    <div v-if="listPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <USkeleton class="h-52 w-full rounded-none" />
        <div class="p-5 space-y-3">
          <USkeleton class="h-4 w-24 rounded-full" />
          <USkeleton class="h-6 w-full rounded" />
          <USkeleton class="h-4 w-3/4 rounded" />
        </div>
      </div>
    </div>

    <div v-else-if="listError" class="text-center py-20">
      <UIcon name="i-lucide-wifi-off" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-400">Không thể tải danh sách. Vui lòng thử lại.</p>
      <UButton variant="ghost" color="primary" class="mt-4" @click="refresh()">Thử lại</UButton>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <ModalBlogItem
        v-for="article in articles"
        :key="article.id"
        :article="article"
        @click="navigateTo(`/policy/${article.slug}`)"
      />
    </div>

    <div v-if="!listPending && !listError && (articles?.length ?? 0) > 0 && hasMore" class="mt-10 text-center">
      <UButton
        size="lg" variant="outline" color="primary" :loading="loadingMore"
        class="rounded-full px-8 font-semibold" trailing-icon="i-lucide-chevron-down"
        @click="loadMore"
      >
        Xem thêm bài viết
      </UButton>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import ModalBlogItem from '~/components/blog/modal-blog-item.vue'
import { BlogService } from '~/services/blog.service'
import type { PageListResponse } from '~/type'

const blogService = new BlogService()
const PAGE_LIMIT = 12
const loadingMore = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

const { data: articles, pending: listPending, error: listError, refresh } = await useAsyncData(
  'policy-articles',
  () => blogService.getPageList({
    page: 1, limit: PAGE_LIMIT, sort_by: 'created_at',
    field: 'id,slug,name,thumbnail,title,created_at,excerpt',
  }),
  {
    transform: (res: PageListResponse) => {
      hasMore.value = res.data.length >= PAGE_LIMIT
      return res.data
    },
  },
)

async function loadMore() {
  loadingMore.value = true
  try {
    currentPage.value++
    const more = await blogService.getPageList({
      page: currentPage.value, limit: PAGE_LIMIT, sort_by: 'created_at',
      field: 'id,slug,name,thumbnail,title,created_at,excerpt',
    })
    if (more?.data?.length && articles.value) {
      articles.value.push(...more.data)
      hasMore.value = more.data.length >= PAGE_LIMIT
    } else {
      hasMore.value = false
    }
  } finally {
    loadingMore.value = false
  }
}
</script>