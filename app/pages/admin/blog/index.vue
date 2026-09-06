<template>
  <UContainer class="py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white">Quản lý bài viết</h1>
        <p class="text-sm text-muted mt-1">
          Hệ thống quản lý Cẩm nang du lịch & Chính sách điều khoản Happy Trip
        </p>
      </div>
      <UButton
        color="primary"
        size="md"
        icon="i-lucide-plus"
        label="Tạo Bài Viết Mới"
        class="font-bold shadow-sm"
        @click="navigateTo('/admin/blog/action')"
      />
    </div>

    <!-- Filters & Search Bar -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      <!-- Category Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto">
        <button
          v-for="tab in categoryTabs"
          :key="tab.value"
          class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
          :class="selectedCategory === tab.value ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
          @click="onSelectCategory(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Search Input -->
      <div class="w-full md:w-72">
        <UInput
          v-model="searchKeyword"
          icon="i-lucide-search"
          placeholder="Tìm kiếm bài viết..."
          size="sm"
          class="w-full"
          @update:model-value="onSearchDebounced"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="listPending" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <USkeleton class="w-12 h-12 rounded-xl" />
        <USkeleton class="h-4 flex-1" />
        <USkeleton class="h-4 w-32" />
        <USkeleton class="h-6 w-24 rounded-full" />
        <USkeleton class="h-8 w-20" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="listError" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
      <UIcon name="i-lucide-wifi-off" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-400">Không thể tải danh sách bài viết. Vui lòng thử lại.</p>
      <UButton variant="ghost" color="primary" class="mt-4 font-semibold" @click="refresh()">Thử lại</UButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!articles?.length"
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center"
    >
      <UIcon name="i-lucide-file-text" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 font-medium">Chưa có bài viết nào trong danh mục này</p>
      <UButton
        variant="soft"
        color="primary"
        class="mt-4 font-semibold"
        icon="i-lucide-plus"
        label="Tạo bài viết đầu tiên"
        @click="navigateTo('/admin/blog/action')"
      />
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase px-4 py-3.5 w-16">
                Ảnh
              </th>
              <th class="text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase px-4 py-3.5">
                Tiêu đề bài viết
              </th>
              <th class="text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase px-4 py-3.5 w-36">
                Chuyên mục
              </th>
              <th class="text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase px-4 py-3.5 w-40">
                Lượt xem / Đọc
              </th>
              <th class="text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase px-4 py-3.5 w-36">
                Trạng thái
              </th>
              <th class="text-right text-xs font-bold text-slate-600 dark:text-slate-300 uppercase px-4 py-3.5 w-28">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="article in articles"
              :key="article.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="px-4 py-3">
                <img
                  v-if="article.thumbnail"
                  :src="resolveImageUrl(article.thumbnail)"
                  :alt="article.title"
                  class="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  @error="onImgError"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"
                >
                  <UIcon name="i-lucide-image" class="size-5 text-slate-400" />
                </div>
              </td>
              <td class="px-4 py-3">
                <p class="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                  {{ article.title || article.name || '(Không tiêu đề)' }}
                </p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs text-slate-400 font-mono">/{{ article.slug }}</span>
                  <a
                    :href="`/${article.category === 'policy' ? 'policy' : 'blog'}/${article.slug}`"
                    target="_blank"
                    class="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                    title="Xem trên web"
                  >
                    <UIcon name="i-lucide-external-link" class="size-3" />
                  </a>
                </div>
                <div v-if="article.route_slug" class="flex items-center gap-1.5 mt-1">
                  <UBadge
                    :label="`Landing Page: /${article.route_slug}`"
                    color="warning"
                    variant="subtle"
                    size="xs"
                    class="font-mono text-[10px]"
                  />
                  <a
                    :href="`/${article.route_slug}`"
                    target="_blank"
                    class="text-xs text-amber-600 hover:underline inline-flex items-center"
                    title="Xem trang Tuyến Landing Page"
                  >
                    <UIcon name="i-lucide-external-link" class="size-2.5" />
                  </a>
                </div>
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :label="article.category === 'policy' ? 'Chính Sách' : 'Cẩm Nang Blog'"
                  :color="article.category === 'policy' ? 'info' : 'primary'"
                  variant="subtle"
                  size="xs"
                  class="font-semibold text-[11px]"
                />
              </td>
              <td class="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                <div class="flex items-center gap-1">
                  <UIcon name="i-lucide-eye" class="size-3.5 text-slate-400" />
                  <span>{{ article.views || 0 }} lượt xem</span>
                </div>
                <div class="flex items-center gap-1 text-[11px] text-slate-400">
                  <UIcon name="i-lucide-clock" class="size-3" />
                  <span>{{ article.reading_time || 3 }} phút đọc</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :color="article.status ? 'success' : 'neutral'"
                  variant="subtle"
                  class="cursor-pointer font-semibold text-xs"
                  @click="toggleStatus(article)"
                >
                  {{ article.status ? 'Công khai' : 'Bản nháp' }}
                </UBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="sm"
                    @click="askDelete(article)"
                    aria-label="Xóa bài viết"
                  />
                  <UButton
                    icon="i-lucide-square-pen"
                    color="primary"
                    variant="ghost"
                    size="sm"
                    @click="goEdit(article)"
                    aria-label="Chỉnh sửa bài viết"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-end mt-6">
      <UPagination
        v-model:page="currentPage"
        :total="totalItems"
        :items-per-page="PAGE_LIMIT"
        :sibling-count="1"
        show-edges
        @update:page="onPageChange"
      />
    </div>

    <!-- Confirm delete -->
    <SharedConfirmModal
      v-model="deleteModalOpen"
      title="Xác nhận xóa bài viết"
      :message="deleteTarget ? `Bạn có chắc muốn xóa bài viết “${deleteTarget.title || deleteTarget.name}”? Dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống.` : ''"
      confirm-label="Xóa bài viết"
      :is-loading="deleting"
      @confirm="confirmDelete"
    />
  </UContainer>
</template>

<script lang="ts" setup>
import { blogService } from '~/services/blog.service'
import { resolveImageUrl } from '~/utils'
import type { Article } from '~/type'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { adminToken } = useAuth()
const toast = useToast()

const PAGE_LIMIT = 10
const currentPage = ref(1)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / PAGE_LIMIT))

const categoryTabs = [
  { label: 'Tất Cả', value: '' },
  { label: 'Cẩm Nang Du Lịch', value: 'blog' },
  { label: 'Chính Sách & Điều Khoản', value: 'policy' },
]
const selectedCategory = ref('')
const searchKeyword = ref('')

const articles = ref<Article[]>([])
const listPending = ref(false)
const listError = ref(false)

let searchTimeout: any = null
function onSearchDebounced() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchList()
  }, 350)
}

function onSelectCategory(cat: string) {
  selectedCategory.value = cat
  currentPage.value = 1
  fetchList()
}

async function fetchList() {
  if (!adminToken.value) return
  listPending.value = true
  listError.value = false
  try {
    const res = await blogService.getAdminArticles(adminToken.value, {
      page: currentPage.value,
      limit: PAGE_LIMIT,
      keyword: searchKeyword.value,
      category: (selectedCategory.value as 'blog' | 'policy') || undefined,
    })
    articles.value = res.data || []
    totalItems.value = res.pagination?.count || res.data?.length || 0
  } catch (err) {
    console.error('Lỗi tải danh sách bài viết:', err)
    listError.value = true
  } finally {
    listPending.value = false
  }
}

function refresh() {
  fetchList()
}

function onPageChange(p: number) {
  currentPage.value = p
  fetchList()
}

async function toggleStatus(article: Article) {
  if (!adminToken.value) return
  const next = !article.status
  article.status = next
  try {
    await blogService.togglePageStatus(adminToken.value, article.id, next)
    toast.add({
      title: next ? 'Đã chuyển thành Công khai' : 'Đã chuyển thành Bản nháp',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (err) {
    article.status = !next
    console.error(err)
    toast.add({
      title: 'Không thể cập nhật trạng thái',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
}

function goEdit(article: Article) {
  navigateTo(`/admin/blog/action?id=${article.id}`)
}

// ===== Delete =====
const deleteModalOpen = ref(false)
const deleteTarget = ref<Article | null>(null)
const deleting = ref(false)

function askDelete(article: Article) {
  deleteTarget.value = article
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value || !adminToken.value) return
  deleting.value = true
  try {
    await blogService.deletePage(adminToken.value, deleteTarget.value.id)
    toast.add({
      title: 'Đã xóa bài viết thành công',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    deleteModalOpen.value = false
    deleteTarget.value = null
    await fetchList()
  } catch (err) {
    console.error(err)
    toast.add({
      title: 'Không thể xóa bài viết',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    deleting.value = false
  }
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  fetchList()
})
</script>