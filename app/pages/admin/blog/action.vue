<template>
  <UContainer class="py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          @click="navigateTo('/admin/blog')"
          aria-label="Quay lại danh sách bài viết"
        />
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white">
            {{ isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới' }}
          </h1>
          <p class="text-sm text-muted mt-0.5">
            {{ isEditMode ? `Đang chỉnh sửa: ${form.title || '(không tiêu đề)'}` : 'Điền đầy đủ thông tin bài viết và cấu hình chuẩn SEO' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading detail -->
    <div v-if="detailLoading" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
      <UIcon name="i-lucide-loader-2" class="size-8 text-primary mx-auto mb-3 animate-spin" />
      <p class="text-sm text-muted">Đang tải dữ liệu bài viết...</p>
    </div>

    <UForm
      v-else
      :schema="schema"
      :state="form"
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      @submit="onSubmit"
    >
      <!-- Cột trái (2 cols): Nội dung chính & Cấu hình SEO -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Thông tin cơ bản -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 class="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="size-4.5 text-primary" />
            <span>Nội dung bài viết</span>
          </h3>

          <UFormField label="Tiêu đề bài viết" name="title" required>
            <UInput
              v-model="form.title"
              placeholder="Nhập tiêu đề bài viết (H1)..."
              class="w-full"
              size="lg"
            />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Chuyên mục" name="category" required>
              <USelect
                v-model="form.category"
                :items="categoryOptions"
                value-key="value"
                label-key="label"
                class="w-full"
                size="md"
              />
            </UFormField>

            <UFormField label="Đường dẫn tĩnh (Slug)" name="slug" required>
              <UInput
                v-model="form.slug"
                placeholder="duong-dan-bai-viet"
                leading-icon="i-lucide-link"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    type="button"
                    size="xs"
                    variant="ghost"
                    color="primary"
                    icon="i-lucide-wand-sparkles"
                    label="Tạo slug"
                    @click="form.slug = slugify(form.title || '')"
                  />
                </template>
              </UInput>
            </UFormField>
          </div>

          <UFormField
            label="Gắn vào Tuyến xe / Landing Page (Tùy chọn)"
            name="route_slug"
            help="Chọn hoặc tìm kiếm tuyến xe nếu muốn bài viết này tự động hiển thị trên trang Landing Page của tuyến đó"
          >
            <div ref="routeContainerRef" class="relative space-y-2">
              <!-- Search box / Trigger Input -->
              <div class="relative">
                <UInput
                  v-model="routeSearch"
                  :placeholder="selectedRouteObj ? `Đang chọn: ${selectedRouteObj.name}` : 'Tìm kiếm và chọn tuyến xe (VD: Vũng Tàu, Đà Lạt, Sân bay...)'"
                  leading-icon="i-lucide-search"
                  class="w-full cursor-pointer"
                  @focus="showRouteDropdown = true"
                  @click="showRouteDropdown = true"
                >
                  <template #trailing>
                    <div class="flex items-center gap-1">
                      <UButton
                        v-if="form.route_slug"
                        type="button"
                        size="xs"
                        variant="ghost"
                        color="error"
                        icon="i-lucide-x"
                        class="p-1"
                        title="Bỏ gắn tuyến xe"
                        @click.stop="clearRoute"
                      />
                      <UIcon
                        name="i-lucide-chevron-down"
                        class="size-4 text-slate-400 transition-transform duration-200"
                        :class="{ 'rotate-180': showRouteDropdown }"
                      />
                    </div>
                  </template>
                </UInput>

                <!-- Search Results Dropdown -->
                <div
                  v-if="showRouteDropdown"
                  class="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 p-1.5 space-y-0.5"
                >
                  <!-- Option: Độc lập -->
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                    :class="!form.route_slug ? 'text-primary bg-primary/10' : 'text-slate-600 dark:text-slate-300'"
                    @click="selectRoute('')"
                  >
                    <span>-- Không gắn vào tuyến xe nào (Bài viết độc lập) --</span>
                    <UIcon v-if="!form.route_slug" name="i-lucide-check" class="size-4 text-primary" />
                  </button>

                  <div class="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                  <!-- Filtered Routes -->
                  <div v-if="filteredRouteOptions.length === 0" class="px-3 py-4 text-xs text-center text-slate-400">
                    Không tìm thấy tuyến xe nào khớp với "{{ routeSearch }}"
                  </div>

                  <button
                    v-for="r in filteredRouteOptions"
                    :key="r.slug"
                    type="button"
                    class="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                    :class="form.route_slug === r.slug ? 'text-primary bg-primary/10 font-bold' : 'text-slate-700 dark:text-slate-200'"
                    @click="selectRoute(r.slug)"
                  >
                    <div class="min-w-0 flex-1 pr-2">
                      <div class="font-medium truncate">{{ r.name }}</div>
                      <div class="text-[11px] text-slate-400 font-mono">/{{ r.slug }}</div>
                    </div>
                    <UIcon v-if="form.route_slug === r.slug" name="i-lucide-check" class="size-4 text-primary shrink-0" />
                  </button>
                </div>
              </div>

              <!-- Selected Route Preview Badge -->
              <div v-if="selectedRouteObj" class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                <div class="flex items-center gap-2 min-w-0">
                  <UIcon name="i-lucide-route" class="size-4 text-emerald-600 shrink-0" />
                  <div class="truncate">
                    <span class="font-bold text-emerald-800 dark:text-emerald-300">Đang gắn vào: </span>
                    <span class="text-emerald-700 dark:text-emerald-400 font-semibold">{{ selectedRouteObj.name }}</span>
                    <span class="text-emerald-600/80 font-mono ml-1.5">(/{{ selectedRouteObj.slug }})</span>
                  </div>
                </div>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-x"
                  label="Gỡ gắn tuyến"
                  @click="clearRoute"
                />
              </div>
            </div>
          </UFormField>

          <UFormField label="Đoạn tóm tắt mở đầu (Excerpt)" name="excerpt">
            <UTextarea
              v-model="form.excerpt"
              placeholder="Mô tả ngắn gọn về bài viết để hiển thị ngoài danh sách và hỗ trợ SEO..."
              :rows="3"
              :maxrows="5"
              autoresize
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Trình soạn thảo Rich Text -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
          <label class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Chi tiết nội dung <span class="text-red-500">*</span></span>
            <span class="text-xs text-muted font-normal">Hỗ trợ chèn ảnh, định dạng H2, H3, bảng, danh sách</span>
          </label>
          <UiRichEditor
            v-model="form.content"
            placeholder="Soạn thảo nội dung bài viết tại đây..."
            @upload-image="onUploadImage"
          />
          <p v-if="contentError" class="text-xs text-red-500 mt-2 font-medium">
            {{ contentError }}
          </p>
        </div>

        <!-- Khối Tối Ưu Hóa SEO Google & Mạng Xã Hội -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-search-check" class="size-5 text-emerald-500" />
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Cấu Hình SEO & Mạng Xã Hội (Google & Open Graph)
              </h3>
            </div>
            <UBadge label="Chuẩn SEO 2026" color="success" variant="subtle" size="sm" />
          </div>

          <!-- SERP Google Preview -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-left font-sans">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Xem trước kết quả trên Google Search</p>
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
              <span class="text-emerald-700 dark:text-emerald-400 font-semibold">https://happytrip.vn</span>
              <span>›</span>
              <span class="truncate">{{ form.category === 'policy' ? 'policy' : 'blog' }} › {{ form.slug || 'duong-dan-bai-viet' }}</span>
            </div>
            <h4 class="text-base font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1 leading-snug">
              {{ form.meta_title || form.title || 'Tiêu đề bài viết hiển thị trên Google' }}
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {{ form.meta_description || form.excerpt || 'Đoạn mô tả tóm tắt nội dung bài viết sẽ xuất hiện dưới tiêu đề trên trang tìm kiếm của Google...' }}
            </p>
          </div>

          <!-- Meta Title -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Thẻ Meta Title</label>
              <span
                class="text-[11px] font-semibold"
                :class="(form.meta_title?.length || 0) > 60 ? 'text-amber-500' : 'text-slate-400'"
              >
                {{ form.meta_title?.length || 0 }}/60 ký tự (Khuyến nghị 50-60)
              </span>
            </div>
            <UInput
              v-model="form.meta_title"
              :placeholder="form.title || 'Tiêu đề tối ưu SEO...'"
              class="w-full"
            />
          </div>

          <!-- Meta Description -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Thẻ Meta Description</label>
              <span
                class="text-[11px] font-semibold"
                :class="(form.meta_description?.length || 0) > 160 ? 'text-amber-500' : 'text-slate-400'"
              >
                {{ form.meta_description?.length || 0 }}/160 ký tự (Khuyến nghị 150-160)
              </span>
            </div>
            <UTextarea
              v-model="form.meta_description"
              :placeholder="form.excerpt || 'Đoạn mô tả thu hút người dùng nhấp vào kết quả tìm kiếm...'"
              :rows="2"
              autoresize
              class="w-full"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Focus Keyword -->
            <UFormField label="Từ khóa chính (Focus Keyword)" name="focus_keyword">
              <UInput
                v-model="form.focus_keyword"
                placeholder="VD: thuê xe riêng đà lạt"
                leading-icon="i-lucide-key-round"
                class="w-full"
              />
            </UFormField>

            <!-- Canonical URL -->
            <UFormField label="Canonical URL (Tùy chọn)" name="canonical_url">
              <UInput
                v-model="form.canonical_url"
                placeholder="https://happytrip.vn/..."
                leading-icon="i-lucide-globe"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Noindex Toggle -->
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Chặn Google lập chỉ mục (noindex)</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Bật nếu không muốn bài viết này xuất hiện trên kết quả tìm kiếm Google</p>
            </div>
            <USwitch v-model="form.noindex" color="error" />
          </div>
        </div>
      </div>

      <!-- Cột phải (1 col): Ảnh đại diện + Tác giả + Trạng thái & Nút Lưu -->
      <div class="space-y-6">
        <!-- Ảnh đại diện (Thumbnail) -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 block">Ảnh đại diện (Thumbnail)</h3>

          <div
            v-if="form.thumbnail"
            class="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <img :src="resolveImageUrl(form.thumbnail)" alt="thumbnail" class="w-full h-44 object-cover" />
            <UButton
              icon="i-lucide-x"
              color="error"
              variant="solid"
              size="xs"
              class="absolute top-2 right-2 rounded-full"
              @click="form.thumbnail = ''"
              aria-label="Xóa ảnh đại diện"
            />
          </div>

          <div
            v-else
            class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center"
          >
            <UIcon name="i-lucide-image" class="size-10 text-slate-300 mx-auto mb-2" />
            <p class="text-xs text-slate-500">Kích thước chuẩn: 1200 x 630 px</p>
          </div>

          <UButton
            type="button"
            block
            color="primary"
            variant="outline"
            icon="i-lucide-upload"
            :label="form.thumbnail ? 'Đổi ảnh đại diện' : 'Tải ảnh đại diện'"
            :loading="uploadingThumb"
            class="font-bold"
            @click="pickThumbnail"
          />
          <input
            ref="thumbInput"
            type="file"
            accept="image/*"
            style="position:absolute;width:0;height:0;opacity:0;pointer-events:none;"
            @change="onThumbnailSelected"
          />
        </div>

        <!-- Tác giả & Thời gian đọc -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <UFormField label="Tác giả hiển thị" name="author_name">
            <UInput
              v-model="form.author_name"
              placeholder="Happy Trip"
              leading-icon="i-lucide-user"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Thời gian đọc ước tính (phút)" name="reading_time">
            <UInput
              v-model.number="form.reading_time"
              type="number"
              min="1"
              max="60"
              leading-icon="i-lucide-clock"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Trạng thái xuất bản -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold text-slate-800 dark:text-slate-200">Trạng thái bài viết</p>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ form.status ? 'Công khai trên website' : 'Lưu ở chế độ bản nháp' }}
              </p>
            </div>
            <USwitch v-model="form.status" color="success" />
          </div>
        </div>

        <!-- Hành động Lưu & Đăng -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
          <UButton
            type="submit"
            block
            color="primary"
            size="lg"
            :icon="isEditMode ? 'i-lucide-save' : 'i-lucide-rocket'"
            :label="isEditMode ? 'Cập nhật bài viết' : 'Đăng bài viết ngay'"
            :loading="submitting"
            class="font-bold shadow-md"
          />
          <UButton
            type="button"
            block
            variant="ghost"
            color="neutral"
            label="Quay lại danh sách"
            @click="navigateTo('/admin/blog')"
          />
        </div>

        <UAlert
          v-if="submitError"
          color="error"
          variant="subtle"
          :description="submitError"
          icon="i-lucide-circle-x"
        />
      </div>
    </UForm>
  </UContainer>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'
import { blogService } from '~/services/blog.service'
import { resolveImageUrl } from '~/utils'
import { generateAllRoutes } from '~/utils/routes'
import type { PagePayload } from '~/type'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { adminToken } = useAuth()
const toast = useToast()

const editId = computed(() => (route.query.id as string) || '')
const isEditMode = computed(() => !!editId.value)

const categoryOptions = [
  { label: 'Cẩm Nang & Kinh Nghiệm Du Lịch (Blog)', value: 'blog' },
  { label: 'Chính Sách & Điều Khoản Pháp Lý (Policy)', value: 'policy' },
]

import { onClickOutside } from '@vueuse/core'

const allRoutes = computed(() => generateAllRoutes())
const routeSearch = ref('')
const showRouteDropdown = ref(false)
const routeContainerRef = ref<HTMLElement | null>(null)

onClickOutside(routeContainerRef, () => {
  showRouteDropdown.value = false
})

const filteredRouteOptions = computed(() => {
  const query = routeSearch.value.trim().toLowerCase()
  if (!query) return allRoutes.value
  return allRoutes.value.filter(
    r => r.name.toLowerCase().includes(query) || r.slug.toLowerCase().includes(query)
  )
})

const selectedRouteObj = computed(() => {
  if (!form.route_slug) return null
  return allRoutes.value.find(r => r.slug === form.route_slug) ?? {
    name: form.route_slug,
    slug: form.route_slug
  }
})

function selectRoute(slug: string) {
  form.route_slug = slug
  showRouteDropdown.value = false
  routeSearch.value = ''
}

function clearRoute() {
  form.route_slug = ''
  routeSearch.value = ''
}

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề bài viết'),
  slug: z
    .string()
    .min(1, 'Vui lòng nhập slug')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
})

const form = reactive<PagePayload & {
  title: string
  slug: string
  thumbnail: string
  content: string
  status: boolean
  category: 'blog' | 'policy'
  route_slug: string
  excerpt: string
  reading_time: number
  author_name: string
  meta_title: string
  meta_description: string
  focus_keyword: string
  canonical_url: string
  noindex: boolean
}>({
  title: '',
  slug: '',
  thumbnail: '',
  content: '',
  status: true,
  category: 'blog',
  route_slug: '',
  excerpt: '',
  reading_time: 3,
  author_name: 'Happy Trip',
  meta_title: '',
  meta_description: '',
  focus_keyword: '',
  canonical_url: '',
  noindex: false,
})

const detailLoading = ref(false)
const submitting = ref(false)
const submitError = ref('')
const contentError = ref('')

// === Thumbnail upload ===
const thumbInput = ref<HTMLInputElement | null>(null)
const uploadingThumb = ref(false)

function pickThumbnail() {
  if (!thumbInput.value) return
  thumbInput.value.click()
}

async function onThumbnailSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !adminToken.value) return
  uploadingThumb.value = true
  try {
    const url = await blogService.uploadFile(adminToken.value, file)
    if (url) {
      form.thumbnail = url
      toast.add({
        title: 'Đã tải ảnh đại diện thành công',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    } else {
      throw new Error('Không nhận được đường dẫn ảnh từ máy chủ')
    }
  } catch (err: any) {
    console.error(err)
    toast.add({
      title: 'Không thể tải ảnh',
      description: err?.message || 'Vui lòng thử lại',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    uploadingThumb.value = false
    if (thumbInput.value) thumbInput.value.value = ''
  }
}

async function onUploadImage(file: File, cb: (url: string) => void) {
  if (!adminToken.value) return
  try {
    const url = await blogService.uploadFile(adminToken.value, file)
    if (url) {
      cb(resolveImageUrl(url))
    }
  } catch (err) {
    console.error(err)
    toast.add({
      title: 'Không thể tải ảnh vào nội dung',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  }
}

// === Auto-slug từ title khi đang mode tạo và slug chưa được edit thủ công ===
let slugTouched = false
watch(() => form.slug, (newVal) => {
  if (newVal !== slugify(form.title || '')) slugTouched = true
})
watch(() => form.title, (newTitle) => {
  if (!isEditMode.value && !slugTouched) {
    form.slug = slugify(newTitle || '')
  }
})

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// === Load detail nếu mode sửa ===
async function loadDetail() {
  if (!isEditMode.value || !adminToken.value) return
  detailLoading.value = true
  try {
    const data = await blogService.getAdminArticleDetail(adminToken.value, editId.value)
    form.title = data.title || data.name || ''
    form.slug = data.slug || ''
    form.thumbnail = data.thumbnail || ''
    form.content = typeof data.content === 'string' ? data.content : ''
    form.excerpt = data.excerpt || ''
    form.category = data.category || 'blog'
    form.route_slug = data.route_slug || ''
    form.status = data.status !== false
    form.reading_time = data.reading_time || 3
    form.author_name = data.author_name || 'Happy Trip'
    form.meta_title = data.meta_title || ''
    form.meta_description = data.meta_description || ''
    form.focus_keyword = data.focus_keyword || ''
    form.canonical_url = data.canonical_url || ''
    form.noindex = Boolean(data.noindex)
    slugTouched = true
  } catch (err) {
    console.error(err)
    toast.add({
      title: 'Không thể tải thông tin bài viết',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    navigateTo('/admin/blog')
  } finally {
    detailLoading.value = false
  }
}

// === Submit ===
async function onSubmit(_e: FormSubmitEvent<{ title: string; slug: string }>) {
  if (!adminToken.value) {
    toast.add({
      title: 'Chưa đăng nhập tài khoản quản trị',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    await navigateTo('/admin/login')
    return
  }

  contentError.value = ''
  if (!form.content || form.content.replace(/<[^>]*>/g, '').trim() === '') {
    contentError.value = 'Vui lòng nhập nội dung bài viết'
    return
  }

  submitting.value = true
  submitError.value = ''
  try {
    const payload: PagePayload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      thumbnail: form.thumbnail || '',
      content: form.content,
      status: form.status,
      category: form.category,
      route_slug: form.route_slug || '',
      excerpt: form.excerpt || '',
      reading_time: form.reading_time || 3,
      author_name: form.author_name || 'Happy Trip',
      meta_title: form.meta_title || '',
      meta_description: form.meta_description || '',
      focus_keyword: form.focus_keyword || '',
      canonical_url: form.canonical_url || '',
      noindex: form.noindex,
    }

    if (isEditMode.value) {
      await blogService.updatePage(adminToken.value, editId.value, payload)
      toast.add({
        title: 'Đã cập nhật bài viết thành công',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    } else {
      await blogService.createPage(adminToken.value, payload)
      toast.add({
        title: 'Đã tạo và đăng bài viết thành công',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    }
    navigateTo('/admin/blog')
  } catch (err: any) {
    submitError.value =
      err?.data?.message || err?.data?.statusMessage || err?.message || 'Không thể lưu bài viết. Vui lòng thử lại.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>
