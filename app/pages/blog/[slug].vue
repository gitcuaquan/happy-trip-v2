<template>
  <div class="py-10 bg-white dark:bg-slate-950 min-h-screen">
    <!-- Breadcrumbs -->
    <UContainer class="mb-6">
      <nav class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Trang chủ</NuxtLink>
        <span>/</span>
        <NuxtLink to="/blog" class="hover:text-primary transition-colors">Cẩm nang du lịch</NuxtLink>
        <span>/</span>
        <span class="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-xs md:max-w-md">
          {{ article?.title }}
        </span>
      </nav>
    </UContainer>

    <!-- Main Content Container -->
    <UContainer class="max-w-4xl">
      <!-- Loading state -->
      <div v-if="pending" class="space-y-6">
        <USkeleton class="h-10 w-3/4 rounded-xl" />
        <USkeleton class="h-5 w-1/3 rounded-md" />
        <USkeleton class="h-80 w-full rounded-2xl" />
        <div class="space-y-3">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-5/6" />
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error || !article" class="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
        <UIcon name="i-lucide-file-warning" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-slate-800 dark:text-white">Không tìm thấy bài viết</h2>
        <p class="text-gray-400 mt-2">Bài viết này có thể đã bị gỡ bỏ hoặc đường dẫn không chính xác.</p>
        <UButton to="/blog" variant="solid" color="primary" class="mt-6 rounded-full px-6 font-bold">
          Xem các bài viết khác
        </UButton>
      </div>

      <!-- Article Detail -->
      <article v-else class="space-y-8">
        <!-- Article Header -->
        <header class="space-y-4 text-left">
          <div class="inline-flex items-center gap-2">
            <UBadge label="Cẩm Nang Du Lịch" color="primary" variant="subtle" size="sm" class="font-bold" />
          </div>

          <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {{ article.title }}
          </h1>

          <!-- Meta Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <UIcon name="i-lucide-user" class="size-4 text-primary" />
                {{ article.author_name || 'Happy Trip' }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-calendar" class="size-4" />
                {{ formatDate(article.published_at || article.created_at) }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-clock" class="size-4" />
                {{ article.reading_time || 3 }} phút đọc
              </span>
            </div>

            <!-- Share Buttons -->
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-600 dark:text-slate-300">Chia sẻ:</span>
              <UButton
                icon="i-lucide-facebook"
                size="xs"
                variant="ghost"
                color="neutral"
                class="hover:text-blue-600"
                @click="shareFacebook"
                aria-label="Chia sẻ lên Facebook"
              />
              <UButton
                icon="i-lucide-copy"
                size="xs"
                variant="ghost"
                color="neutral"
                class="hover:text-primary"
                @click="copyLink"
                aria-label="Sao chép liên kết"
              />
            </div>
          </div>
        </header>

        <!-- Excerpt Callout -->
        <div v-if="article.excerpt" class="p-4 sm:p-5 rounded-2xl bg-primary/5 border-l-4 border-primary text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed italic">
          {{ article.excerpt }}
        </div>

        <!-- Featured Image -->
        <div v-if="article.thumbnail" class="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 aspect-[1200/630] w-full bg-slate-100 dark:bg-slate-800">
          <img
            :src="resolveImageUrl(article.thumbnail)"
            :alt="article.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Article Content -->
        <div
          class="article-content"
          v-html="article.content"
        />

        <!-- CTA Box: Book private car -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="space-y-2 text-center sm:text-left">
            <h3 class="text-lg sm:text-xl font-bold text-white">
              Cần Đặt Xe Riêng Đi Tỉnh 100% Không Ghép?
            </h3>
            <p class="text-xs sm:text-sm text-slate-300">
              Đón trả tận nhà · Giá trọn gói 0đ phụ phí ẩn · Tài xế lịch sự chu đáo
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <UButton
              to="/#dat-xe"
              size="lg"
              color="primary"
              variant="solid"
              class="rounded-full font-bold px-6 shadow-md"
            >
              Đặt Xe Ngay
            </UButton>
            <a
              href="tel:0972970000"
              class="inline-flex items-center gap-2 py-2.5 px-5 rounded-full border border-white/20 hover:bg-white/10 text-white text-sm font-bold transition-colors"
            >
              <UIcon name="i-lucide-phone-call" class="size-4 text-primary" />
              0972 97 0000
            </a>
          </div>
        </div>

        <!-- Related Articles -->
        <div v-if="relatedArticles?.length" class="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-extrabold text-slate-900 dark:text-white">
              Bài Viết Cùng Chuyên Mục
            </h3>
            <NuxtLink to="/blog" class="text-xs font-bold text-primary hover:underline">
              Xem tất cả →
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div
              v-for="rel in relatedArticles"
              :key="rel.id"
              class="group rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
              @click="navigateTo(`/blog/${rel.slug}`)"
            >
              <div class="aspect-[1200/630] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  v-if="rel.thumbnail"
                  :src="resolveImageUrl(rel.thumbnail)"
                  :alt="rel.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {{ rel.title }}
                </h4>
                <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{{ formatDate(rel.published_at || rel.created_at) }}</span>
                  <span class="text-primary font-semibold">Đọc tiếp →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
import { blogService } from '~/services/blog.service'
import { resolveImageUrl } from '~/utils'
import type { Article } from '~/type'

const route = useRoute()
const toast = useToast()
const slug = computed(() => (route.params.slug as string) || '')

const { data: responseData, pending, error } = await useAsyncData(
  `blog-detail-${slug.value}`,
  () => blogService.getBlogDetail(slug.value),
)

const article = computed<Article | undefined>(() => (responseData.value as any)?.data || responseData.value)
const relatedArticles = computed<Article[]>(() => (responseData.value as any)?.related || (article.value as any)?.related || [])

// === Cấu Hình SEO & Schema.org ===
const siteUrl = 'https://happytrip.vn'
const pageTitle = computed(() => article.value?.meta_title || `${article.value?.title || 'Cẩm Nang Du Lịch'} - Happy Trip`)
const pageDescription = computed(() => article.value?.meta_description || article.value?.excerpt || 'Kinh nghiệm du lịch và đặt xe riêng an toàn, tiện lợi từ Happy Trip.')
const pageImage = computed(() => {
  const raw = article.value?.og_image || article.value?.thumbnail || ''
  const resolved = resolveImageUrl(raw)
  if (!resolved) return `${siteUrl}/images/banner.webp`
  if (resolved.startsWith('http')) return resolved
  return `${siteUrl}${resolved}`
})
const canonicalUrl = computed(() => article.value?.canonical_url || `${siteUrl}/blog/${slug.value}`)

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: pageImage,
  ogUrl: canonicalUrl,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: pageImage,
  robots: computed(() => article.value?.noindex ? 'noindex, nofollow' : 'index, follow'),
})

useSchemaOrg([
  defineArticle({
    headline: pageTitle.value,
    description: pageDescription.value,
    image: pageImage.value,
    datePublished: article.value?.published_at || article.value?.created_at,
    dateModified: article.value?.updated_at || article.value?.created_at,
    author: {
      name: article.value?.author_name || 'Happy Trip',
    },
  }),
])

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

function shareFacebook() {
  if (typeof window === 'undefined') return
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
}

function copyLink() {
  if (typeof window === 'undefined') return
  navigator.clipboard.writeText(window.location.href)
  toast.add({
    title: 'Đã sao chép liên kết bài viết',
    color: 'success',
    icon: 'i-lucide-check-circle',
  })
}
</script>
