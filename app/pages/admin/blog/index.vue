<template>
  <UContainer class="py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800">Quản lý bài viết</h1>
        <p class="text-sm text-muted mt-1">
          Danh sách bài viết, chính sách, tài liệu trên trang
        </p>
      </div>
      <UButton
        color="primary"
        size="md"
        icon="i-lucide-plus"
        label="Tạo Mới"
        @click="navigateTo('/admin/blog/action')"
      />
    </div>

    <!-- Loading -->
    <div v-if="listPending" class="bg-white rounded-lg border border-slate-200 p-4">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
        <USkeleton class="w-12 h-12 rounded-md" />
        <USkeleton class="h-4 flex-1" />
        <USkeleton class="h-4 w-32" />
        <USkeleton class="h-6 w-24 rounded-full" />
        <USkeleton class="h-8 w-20" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="listError" class="bg-white rounded-lg border border-slate-200 p-12 text-center">
      <UIcon name="i-lucide-wifi-off" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-400">Không thể tải danh sách. Vui lòng thử lại.</p>
      <UButton variant="ghost" color="primary" class="mt-4" @click="refresh()">Thử lại</UButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!articles?.length"
      class="bg-white rounded-lg border border-slate-200 p-12 text-center"
    >
      <UIcon name="i-lucide-file-text" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 font-medium">Chưa có bài viết nào</p>
      <UButton
        variant="soft"
        color="primary"
        class="mt-4"
        icon="i-lucide-plus"
        label="Tạo bài đầu tiên"
        @click="navigateTo('/admin/blog/action')"
      />
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3 w-20">
              Ảnh
            </th>
            <th class="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3">
              Tiêu đề bài viết
            </th>
            <th class="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3 w-48">
              Ngày tạo
            </th>
            <th class="text-left text-xs font-bold text-slate-600 uppercase px-4 py-3 w-36">
              Trạng thái
            </th>
            <th class="text-right text-xs font-bold text-slate-600 uppercase px-4 py-3 w-28">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="article in articles"
            :key="article.id"
            class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <td class="px-4 py-3">
              <img
                v-if="article.thumbnail"
                :src="resolveImageUrl(article.thumbnail)"
                :alt="article.title || article.name"
                class="w-12 h-12 rounded-md object-cover border border-slate-200"
                @error="onImgError"
              />
              <div
                v-else
                class="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center"
              >
                <UIcon name="i-lucide-image" class="size-5 text-slate-400" />
              </div>
            </td>
            <td class="px-4 py-3">
              <p class="font-semibold text-slate-800 text-sm">
                {{ article.title || article.name || '(Không tiêu đề)' }}
              </p>
              <p v-if="article.slug" class="text-xs text-slate-400 mt-0.5">
                /{{ article.slug }}
              </p>
            </td>
            <td class="px-4 py-3 text-sm text-slate-600">
              {{ formatDate(article.created_at) }}
            </td>
            <td class="px-4 py-3">
              <UBadge
                :color="getStatus(article) ? 'success' : 'neutral'"
                variant="subtle"
                class="cursor-pointer"
                @click="toggleStatus(article)"
              >
                {{ getStatus(article) ? 'Đang hoạt động' : 'Đã tắt' }}
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
      :message="deleteTarget ? `Bạn có chắc muốn xóa bài viết “${deleteTarget.title || deleteTarget.name || '(không tiêu đề)'}”? Hành động này không thể hoàn tác.` : ''"
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

const PAGE_LIMIT = 12
const currentPage = ref(1)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / PAGE_LIMIT))

const articles = ref<Article[]>([])
const listPending = ref(false)
const listError = ref(false)

// Local cờ status để toggle ngay trên UI (Article model không có status field)
const statusMap = ref<Record<string, boolean>>({})

async function fetchList() {
  listPending.value = true
  listError.value = false
  try {
    const res = await blogService.getPageList({
      page: currentPage.value,
      limit: PAGE_LIMIT,
      sort_by: 'created_at',
      field: 'id,slug,name,thumbnail,title,created_at,status',
    })
    articles.value = res.data || []
    totalItems.value = res.pagination?.count || res.data?.length || 0
    // Hydrate status map: nếu API trả status thì dùng, không thì mặc định true
    articles.value.forEach((a) => {
      const status = (a as Article & { status?: boolean }).status
      if (!(a.id in statusMap.value)) {
        statusMap.value[a.id] = status !== false
      }
    })
  } catch (err) {
    console.error('Lỗi tải list:', err)
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

function getStatus(article: Article): boolean {
  return statusMap.value[article.id] ?? true
}

async function toggleStatus(article: Article) {
  if (!adminToken.value) return
  const next = !getStatus(article)
  statusMap.value[article.id] = next
  try {
    await blogService.togglePageStatus(adminToken.value, article.id, next)
    toast.add({
      title: next ? 'Đã bật bài viết' : 'Đã tắt bài viết',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (err) {
    statusMap.value[article.id] = !next
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
      title: 'Đã xóa bài viết',
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
  console.warn('[blog list] img load failed:', img.src)
  img.style.display = 'none'
}

function formatDate(value?: string): string {
  if (!value) return '-'
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return value
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return value
  }
}

onMounted(() => {
  fetchList()
})
</script>