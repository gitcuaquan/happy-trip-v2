<template>
  <div class="py-12 bg-slate-50/50 dark:bg-slate-900/30 min-h-screen">
    <UContainer>
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          <UIcon name="i-lucide-shield-check" class="size-3.5 text-primary" />
          <span>Văn Bản Pháp Lý</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
          Chính Sách & Quy Chế Hoạt Động
        </h1>
        <div class="w-20 h-1.5 bg-primary mx-auto rounded-full mt-4" />
        <p class="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-base">
          Tổng hợp các quy định, điều khoản dịch vụ, chính sách bảo mật và tiêu chuẩn an toàn của HappyTrip
        </p>
      </div>

      <!-- Loading -->
      <div v-if="listPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-3">
          <USkeleton class="h-6 w-3/4 rounded" />
          <USkeleton class="h-4 w-full rounded" />
          <USkeleton class="h-4 w-1/2 rounded" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="listError" class="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <UIcon name="i-lucide-wifi-off" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-400">Không thể tải danh sách tài liệu. Vui lòng thử lại.</p>
        <UButton variant="ghost" color="primary" class="mt-4 font-bold" @click="refresh()">Thử lại</UButton>
      </div>

      <!-- Empty -->
      <div v-else-if="!articles?.length" class="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <UIcon name="i-lucide-file-text" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 font-medium text-base">Hiện chưa có văn bản chính sách nào được công bố.</p>
      </div>

      <!-- Policies Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="article in articles"
          :key="article.id"
          :to="`/policy/${article.slug}`"
          class="group p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
        >
          <div class="space-y-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <UIcon name="i-lucide-file-text" class="size-5" />
            </div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {{ article.title }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {{ article.excerpt || 'Xem chi tiết toàn văn điều khoản và chính sách quy định của Happy Trip...' }}
            </p>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary">
            <span>Xem văn bản</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </NuxtLink>
      </div>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
import { blogService } from '~/services/blog.service'
import type { PageListResponse } from '~/type'

useSeoMeta({
  title: 'Chính Sách & Điều Khoản Dịch Vụ - Happy Trip',
  description: 'Tổng hợp quy chế hoạt động, điều khoản dịch vụ, chính sách bảo mật và tiêu chuẩn an toàn của nền tảng đặt xe riêng Happy Trip.',
  ogTitle: 'Chính Sách & Điều Khoản Dịch Vụ - Happy Trip',
  ogDescription: 'Tổng hợp quy chế hoạt động, điều khoản dịch vụ, chính sách bảo mật và tiêu chuẩn an toàn của nền tảng đặt xe riêng Happy Trip.',
})

const { data: responseData, pending: listPending, error: listError, refresh } = await useAsyncData<PageListResponse>(
  'policy-articles-list',
  () => blogService.getPolicyList({
    page: 1,
    limit: 50,
  }),
)

const articles = computed(() => responseData.value?.data || [])
</script>