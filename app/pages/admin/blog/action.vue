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
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
            <label class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>Chi tiết nội dung</span>
              <span class="text-red-500">*</span>
            </label>
            <span class="text-xs text-muted font-normal flex items-center gap-1.5">
              <UIcon name="i-lucide-info" class="size-3.5 text-primary shrink-0" />
              <span>Gợi ý ảnh chèn bài viết: Chiều rộng 800 – 1200px (16:9), dung lượng &lt; 5MB</span>
            </span>
          </div>
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
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UIcon name="i-lucide-image" class="size-4 text-primary" />
              <span>Ảnh đại diện (Thumbnail)</span>
            </h3>
            <UBadge label="Chuẩn SEO 1.91:1" color="primary" variant="subtle" size="xs" class="font-bold" />
          </div>

          <!-- Khung Preview khi đã có ảnh -->
          <div
            v-if="form.thumbnail"
            class="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[1200/630] bg-slate-900/5 dark:bg-slate-800/60 group cursor-pointer"
            @click="pickThumbnail"
          >
            <img
              :src="resolveImageUrl(form.thumbnail)"
              alt="thumbnail"
              class="w-full h-full object-cover"
              @load="onImageLoaded"
            />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span class="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                <UIcon name="i-lucide-camera" class="size-3.5" />
                Đổi ảnh đại diện
              </span>
            </div>

            <!-- Badge thông số kích thước thực tế của ảnh đã tải -->
            <div
              v-if="thumbMeta"
              class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1.5 shadow-md"
            >
              <UIcon
                :name="thumbMeta.isOptimal ? 'i-lucide-check-circle-2' : 'i-lucide-info'"
                class="size-3.5"
                :class="thumbMeta.isOptimal ? 'text-emerald-400' : 'text-amber-400'"
              />
              <span>{{ thumbMeta.width }} × {{ thumbMeta.height }} px ({{ thumbMeta.ratioText }})</span>
            </div>

            <!-- Nút xóa ảnh -->
            <UButton
              icon="i-lucide-x"
              color="error"
              variant="solid"
              size="xs"
              class="absolute top-2 right-2 rounded-full shadow-md z-10"
              @click.stop="clearThumbnail"
              aria-label="Xóa ảnh đại diện"
            />
          </div>

          <!-- Dropzone khi chưa có ảnh -->
          <div
            v-else
            class="border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer select-none"
            :class="isDragging ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[0.99]' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'"
            @click="pickThumbnail"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDropThumbnail"
          >
            <div class="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5">
              <UIcon name="i-lucide-upload-cloud" class="size-6" />
            </div>
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
              Nhấp hoặc kéo thả ảnh vào đây
            </p>
            <p class="text-[11px] text-muted mt-0.5">
              Khuyến nghị chuẩn SEO: <span class="font-semibold text-slate-700 dark:text-slate-300">1200 × 630 px</span>
            </p>
          </div>

          <!-- Nút hành động -->
          <div class="flex items-center gap-2">
            <UButton
              type="button"
              block
              color="primary"
              variant="outline"
              icon="i-lucide-upload"
              :label="form.thumbnail ? 'Đổi ảnh đại diện' : 'Tải ảnh đại diện'"
              :loading="uploadingThumb"
              class="font-bold flex-1"
              @click="pickThumbnail"
            />
            <UButton
              v-if="form.thumbnail"
              type="button"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              title="Xóa ảnh đại diện"
              aria-label="Xóa ảnh đại diện"
              @click="clearThumbnail"
            />
          </div>

          <input
            ref="thumbInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
            style="position:absolute;width:0;height:0;opacity:0;pointer-events:none;"
            @change="onThumbnailSelected"
          />

          <!-- Bảng hướng dẫn & gợi ý kích thước ảnh upload (LUÔN HIỂN THỊ) -->
          <div class="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-left">
            <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <UIcon name="i-lucide-sparkles" class="size-3.5 text-amber-500 shrink-0" />
              <span>Gợi ý kích thước & Định dạng chuẩn</span>
            </div>
            <ul class="text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed pl-0.5">
              <li class="flex items-start gap-1.5">
                <span class="text-primary font-bold">▪</span>
                <span>
                  <strong class="text-slate-800 dark:text-white font-semibold">Kích thước chuẩn:</strong>
                  <code class="px-1 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-primary font-bold text-[10.5px]">1200 × 630 px</code>
                  (Tỷ lệ <strong>1.91:1</strong> tối ưu Facebook, Zalo Open Graph và giao diện HappyTrip).
                </span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-primary font-bold">▪</span>
                <span>
                  <strong class="text-slate-800 dark:text-white font-semibold">Tỷ lệ tương thích:</strong>
                  <code class="px-1 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10.5px]">16:9</code>
                  (<code class="text-[10px]">1200×675</code> hoặc <code class="text-[10px]">1920×1080</code>, hệ thống tự động căn giữa).
                </span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-primary font-bold">▪</span>
                <span>
                  <strong class="text-slate-800 dark:text-white font-semibold">Định dạng & Dung lượng:</strong> JPG, PNG, WebP (Tối đa <strong>10MB</strong>, khuyến nghị ≤ 2MB để tải trang nhanh).
                </span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-primary font-bold">▪</span>
                <span>
                  <strong class="text-slate-800 dark:text-white font-semibold">Bố cục:</strong> Đặt nội dung/chủ thể trọng tâm ở giữa ảnh để hiển thị trọn vẹn trên cả mobile và desktop.
                </span>
              </li>
            </ul>
          </div>
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

// === Thumbnail upload & Metadata ===
const thumbInput = ref<HTMLInputElement | null>(null)
const uploadingThumb = ref(false)
const isDragging = ref(false)
const thumbMeta = ref<{ width: number; height: number; ratioText: string; isOptimal: boolean } | null>(null)

function inspectImageDimensions(url: string) {
  if (!url) {
    thumbMeta.value = null
    return
  }
  const resolved = resolveImageUrl(url)
  const img = new Image()
  img.onload = () => {
    const width = img.naturalWidth
    const height = img.naturalHeight
    const ratio = width / (height || 1)
    let ratioText = `${ratio.toFixed(2)}:1`
    let isOptimal = false

    if (Math.abs(ratio - (1200 / 630)) < 0.05) {
      ratioText = '1.91:1 Chuẩn SEO'
      isOptimal = true
    } else if (Math.abs(ratio - (16 / 9)) < 0.05) {
      ratioText = '16:9 Tương thích'
      isOptimal = true
    } else if (Math.abs(ratio - (4 / 3)) < 0.05) {
      ratioText = '4:3'
    } else if (Math.abs(ratio - 1) < 0.05) {
      ratioText = '1:1 Vuông'
    }

    thumbMeta.value = {
      width,
      height,
      ratioText,
      isOptimal,
    }
  }
  img.src = resolved
}

function onImageLoaded(e: Event) {
  const img = e.target as HTMLImageElement
  if (!img || !img.naturalWidth || !img.naturalHeight) return
  const width = img.naturalWidth
  const height = img.naturalHeight
  const ratio = width / (height || 1)
  let ratioText = `${ratio.toFixed(2)}:1`
  let isOptimal = false

  if (Math.abs(ratio - (1200 / 630)) < 0.05) {
    ratioText = '1.91:1 Chuẩn SEO'
    isOptimal = true
  } else if (Math.abs(ratio - (16 / 9)) < 0.05) {
    ratioText = '16:9 Tương thích'
    isOptimal = true
  } else if (Math.abs(ratio - (4 / 3)) < 0.05) {
    ratioText = '4:3'
  } else if (Math.abs(ratio - 1) < 0.05) {
    ratioText = '1:1 Vuông'
  }

  thumbMeta.value = {
    width,
    height,
    ratioText,
    isOptimal,
  }
}

watch(
  () => form.thumbnail,
  (newVal) => {
    if (newVal) {
      inspectImageDimensions(newVal)
    } else {
      thumbMeta.value = null
    }
  },
  { immediate: true },
)

function clearThumbnail() {
  form.thumbnail = ''
  thumbMeta.value = null
  if (thumbInput.value) thumbInput.value.value = ''
}

function pickThumbnail() {
  if (!thumbInput.value) return
  thumbInput.value.click()
}

async function uploadThumbnailFile(file: File) {
  if (!file) return
  if (!adminToken.value) {
    toast.add({
      title: 'Chưa đăng nhập tài khoản quản trị',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    return
  }

  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Định dạng tệp không hợp lệ',
      description: 'Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP, GIF, SVG, AVIF)',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    return
  }

  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    toast.add({
      title: 'Dung lượng ảnh quá lớn',
      description: 'Vui lòng chọn ảnh có dung lượng dưới 10MB (Khuyến nghị ≤ 2MB)',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    return
  }

  uploadingThumb.value = true
  try {
    const url = await blogService.uploadFile(adminToken.value, file)
    if (url) {
      form.thumbnail = url
      inspectImageDimensions(url)
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
      description: err?.data?.statusMessage || err?.data?.message || err?.message || 'Vui lòng thử lại',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    uploadingThumb.value = false
    if (thumbInput.value) thumbInput.value.value = ''
  }
}

async function onThumbnailSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    await uploadThumbnailFile(file)
  }
}

async function onDropThumbnail(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    await uploadThumbnailFile(file)
  }
}

async function onUploadImage(file: File, cb: (url: string) => void) {
  if (!adminToken.value) return
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Định dạng tệp không hợp lệ',
      description: 'Vui lòng chọn tệp hình ảnh để chèn vào nội dung',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    return
  }
  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    toast.add({
      title: 'Dung lượng ảnh quá lớn',
      description: 'Ảnh chèn vào bài viết tối đa 10MB (Khuyến nghị 800-1200px, < 5MB)',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    return
  }

  try {
    const url = await blogService.uploadFile(adminToken.value, file)
    if (url) {
      cb(resolveImageUrl(url))
    }
  } catch (err: any) {
    console.error(err)
    toast.add({
      title: 'Không thể tải ảnh vào nội dung',
      description: err?.data?.statusMessage || err?.data?.message || err?.message || 'Vui lòng thử lại',
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
      title: form.title,
      slug: form.slug,
      thumbnail: form.thumbnail || undefined,
      content: form.content,
      status: form.status,
      category: form.category,
      excerpt: form.excerpt || undefined,
      reading_time: form.reading_time || 3,
      author_name: form.author_name || undefined,
      meta_title: form.meta_title || undefined,
      meta_description: form.meta_description || undefined,
      focus_keyword: form.focus_keyword || undefined,
      canonical_url: form.canonical_url || undefined,
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
