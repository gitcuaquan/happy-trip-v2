<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
    <!-- Breadcrumbs -->
    <UContainer class="max-w-4xl mb-6">
      <nav class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Trang chủ</NuxtLink>
        <span>/</span>
        <NuxtLink to="/policy" class="hover:text-primary transition-colors">Chính sách & Quy định</NuxtLink>
        <span>/</span>
        <span class="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-xs md:max-w-md">
          {{ article?.title }}
        </span>
      </nav>
    </UContainer>

    <!-- Loading -->
    <div v-if="pending" class="max-w-4xl mx-auto py-20 text-center space-y-4">
      <USkeleton class="h-10 w-3/4 mx-auto rounded-xl" />
      <USkeleton class="h-4 w-1/2 mx-auto rounded" />
      <USkeleton class="h-96 w-full mx-auto rounded-2xl" />
    </div>

    <!-- Error -->
    <div v-else-if="error || !article" class="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <UIcon name="i-lucide-file-x" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 class="text-xl font-bold text-slate-800 dark:text-white">Không tìm thấy văn bản chính sách</h2>
      <p class="text-gray-400 mt-2 mb-6">Văn bản này không tồn tại hoặc đã được cập nhật sang đường dẫn mới.</p>
      <UButton color="primary" variant="solid" class="rounded-full px-6 font-bold" icon="i-lucide-arrow-left" @click="navigateTo('/policy')">
        Quay lại danh sách chính sách
      </UButton>
    </div>

    <!-- Detail Content -->
    <UContainer v-else class="max-w-4xl space-y-8">
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 space-y-6">
        <!-- Header -->
        <div class="border-b border-slate-100 dark:border-slate-800 pb-6 space-y-3">
          <UBadge label="Văn Bản Chính Thức" color="info" variant="subtle" size="sm" class="font-bold" />
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {{ article.title }}
          </h1>
          <div class="flex items-center gap-4 text-xs text-slate-400">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-calendar" class="size-3.5" />
              Cập nhật: {{ formatDate(article.updated_at || article.created_at) }}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-shield" class="size-3.5 text-emerald-500" />
              Bản quyền HappyTrip Express
            </span>
          </div>
        </div>

        <!-- Excerpt -->
        <div v-if="article.excerpt" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic">
          {{ article.excerpt }}
        </div>

        <!-- Document Content -->
        <div
          class="prose prose-slate dark:prose-invert prose-base max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-primary prose-table:border-collapse prose-td:border prose-th:border"
          v-html="article.content"
        />
      </div>

      <!-- Other Policies Quick Links -->
      <div v-if="otherPolicies?.length" class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Các Văn Bản & Chính Sách Khác:
        </h3>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="item in otherPolicies"
            :key="item.id"
            :to="`/policy/${item.slug}`"
            class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
import { blogService } from '~/services/blog.service'
import type { Article } from '~/type'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || '')

const { data: responseData, pending, error } = await useAsyncData(
  `policy-detail-${slug.value}`,
  () => blogService.getPolicyDetail(slug.value),
)

const article = computed<Article | undefined>(() => (responseData.value as any)?.data || responseData.value)
const otherPolicies = computed<Article[]>(() => (responseData.value as any)?.other_policies || [])

const pageTitle = computed(() => article.value?.meta_title || `${article.value?.title || 'Chính Sách'} - Happy Trip`)
const pageDescription = computed(() => article.value?.meta_description || article.value?.excerpt || 'Chính sách và điều khoản dịch vụ chính thức từ Happy Trip.')

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: 'article',
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