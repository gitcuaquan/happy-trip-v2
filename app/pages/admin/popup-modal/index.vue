<template>
  <UContainer class="py-6 max-w-7xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink to="/admin/blog" class="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1 font-medium">
            <UIcon name="i-lucide-arrow-left" class="size-3.5" />
            Về quản lý bài viết
          </NuxtLink>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
          <UIcon name="i-lucide-megaphone" class="size-6 text-primary" />
          Quản lý Modal thông báo (Popup Banner)
        </h1>
        <p class="text-sm text-muted mt-1">
          Cài đặt banner pop-up xuất hiện khi người dùng truy cập trang chủ, tải ảnh và gắn liên kết bài viết
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Trạng thái tự lưu -->
        <div
          class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
          :class="saving ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800' : lastSavedText ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'"
        >
          <UIcon v-if="saving" name="i-lucide-loader-2" class="size-3.5 animate-spin text-amber-500" />
          <UIcon v-else-if="lastSavedText" name="i-lucide-check-circle-2" class="size-3.5 text-emerald-500" />
          <UIcon v-else name="i-lucide-cloud" class="size-3.5" />
          <span>{{ saving ? 'Đang lưu...' : lastSavedText ? 'Đã tự lưu lúc ' + lastSavedText : 'Tự động lưu' }}</span>
        </div>

        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          size="md"
          :loading="loading"
          @click="loadData"
        >
          Làm mới
        </UButton>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-7 space-y-6">
        <USkeleton class="h-44 rounded-2xl" />
        <USkeleton class="h-64 rounded-2xl" />
        <USkeleton class="h-52 rounded-2xl" />
      </div>
      <div class="lg:col-span-5">
        <USkeleton class="h-96 rounded-2xl" />
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Cột Trái: Form Cấu Hình (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- 1. Trạng thái kích hoạt & Tiêu đề -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UIcon name="i-lucide-power" class="size-4 text-primary" />
                Trạng thái hiển thị
              </h2>
              <p class="text-xs text-muted mt-0.5">
                Bật để modal pop-up tự động hiển thị cho khách truy cập trang chủ
              </p>
            </div>
            <div class="flex items-center gap-2.5">
              <UBadge
                :label="form.is_active ? 'Đang bật' : 'Đang tắt'"
                :color="form.is_active ? 'success' : 'neutral'"
                variant="subtle"
                class="font-bold"
              />
              <USwitch
                v-model="form.is_active"
                size="lg"
                color="primary"
                @update:model-value="onToggleActive"
              />
            </div>
          </div>

          <!-- Tiêu đề thông báo -->
          <UFormField
            label="Tiêu đề thông báo"
            name="title"
            help="Tên chiến dịch hoặc tiêu đề gợi ý của banner thông báo (tự lưu khi rời chuột)"
          >
            <UInput
              v-model="form.title"
              placeholder="VD: Khuyến Mãi Hè - Đặt Xe Giá Sốc"
              class="w-full"
              size="md"
              @blur="autoSave"
            />
          </UFormField>
        </div>

        <!-- 2. Tải lên hình ảnh banner -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UIcon name="i-lucide-image" class="size-4 text-primary" />
                Hình ảnh banner thông báo <span class="text-red-500">*</span>
              </h2>
              <p class="text-xs text-muted mt-0.5">
                Kích thước khuyến nghị: tỷ lệ 4:5, 3:4 hoặc 1:1 (VD: 800x1000px, 800x800px)
              </p>
            </div>
            <UBadge
              v-if="form.image"
              label="Đã có ảnh"
              color="success"
              variant="subtle"
              size="xs"
              class="font-bold"
            />
          </div>

          <!-- Hidden File Input -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            class="hidden"
            @change="onFileSelected"
          />

          <!-- Preview & Actions khi ĐÃ CÓ ẢNH -->
          <div v-if="form.image" class="space-y-3">
            <div
              class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900/5 dark:bg-slate-800/60 max-h-80 flex items-center justify-center group cursor-pointer"
              @click="triggerFileInput"
            >
              <img
                :src="resolveImageUrl(form.image)"
                alt="Banner preview"
                class="w-full max-h-80 object-contain mx-auto"
                @load="onImageLoaded"
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <span class="text-white text-xs font-bold bg-black/70 px-3.5 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                  <UIcon name="i-lucide-upload-cloud" class="size-4" />
                  Bấm để đổi ảnh khác
                </span>
              </div>

              <!-- Nút xóa ảnh -->
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="solid"
                size="xs"
                class="absolute top-3 right-3 rounded-full shadow-md z-10"
                title="Xóa ảnh"
                @click.stop="clearImage"
              />

              <!-- Thông số kích thước ảnh -->
              <div
                v-if="imageDimensions.width"
                class="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1.5 shadow"
              >
                <UIcon name="i-lucide-check-circle" class="size-3 text-emerald-400" />
                <span>{{ imageDimensions.width }} × {{ imageDimensions.height }} px</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <UButton
                type="button"
                color="primary"
                variant="outline"
                icon="i-lucide-upload"
                label="Đổi hình ảnh khác"
                :loading="uploading"
                class="font-bold flex-1"
                @click="triggerFileInput"
              />
              <UButton
                type="button"
                color="error"
                variant="ghost"
                icon="i-lucide-trash"
                label="Xóa ảnh"
                @click="clearImage"
              />
            </div>
          </div>

          <!-- Dropzone khi CHƯA CÓ ẢNH -->
          <div
            v-else
            class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer select-none"
            :class="isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-slate-200 dark:border-slate-700 hover:border-primary/60 hover:bg-slate-50/70'"
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDropFile"
          >
            <div class="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <UIcon v-if="uploading" name="i-lucide-loader-2" class="size-7 animate-spin" />
              <UIcon v-else name="i-lucide-upload-cloud" class="size-7" />
            </div>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-200">
              {{ uploading ? 'Đang tải ảnh lên...' : 'Nhấp hoặc kéo thả ảnh banner vào đây' }}
            </p>
            <p class="text-xs text-muted mt-1">
              Định dạng hỗ trợ: JPG, PNG, WEBP, GIF (Dung lượng tối đa 5MB)
            </p>
          </div>
        </div>

        <!-- 3. Gán link bài viết (Article Link) -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UIcon name="i-lucide-link-2" class="size-4 text-primary" />
                Gán liên kết bài viết
              </h2>
              <p class="text-xs text-muted mt-0.5">
                Khi người dùng nhấp vào banner hoặc nút xem chi tiết, họ sẽ được dẫn đến liên kết này
              </p>
            </div>
          </div>

          <!-- Selector chế độ: Chọn bài viết vs Tự nhập link -->
          <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1 w-full sm:w-fit">
            <button
              type="button"
              class="flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              :class="linkMode === 'article' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
              @click="linkMode = 'article'"
            >
              <UIcon name="i-lucide-file-text" class="size-3.5 inline-block mr-1 align-text-bottom" />
              Chọn từ bài viết có sẵn
            </button>
            <button
              type="button"
              class="flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              :class="linkMode === 'custom' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
              @click="linkMode = 'custom'"
            >
              <UIcon name="i-lucide-globe" class="size-3.5 inline-block mr-1 align-text-bottom" />
              Tự nhập đường dẫn URL
            </button>
          </div>

          <!-- Chế độ 1: Chọn từ bài viết sẵn có -->
          <div v-if="linkMode === 'article'" class="space-y-3">
            <div class="relative">
              <UInput
                v-model="articleSearch"
                placeholder="Tìm kiếm bài viết theo tiêu đề hoặc từ khóa..."
                leading-icon="i-lucide-search"
                class="w-full cursor-pointer"
                @focus="showArticleDropdown = true"
                @click="showArticleDropdown = true"
                @update:model-value="onSearchArticles"
              >
                <template #trailing>
                  <div class="flex items-center gap-1">
                    <UButton
                      v-if="form.article_id"
                      type="button"
                      size="xs"
                      variant="ghost"
                      color="error"
                      icon="i-lucide-x"
                      class="p-1"
                      title="Bỏ gán bài viết"
                      @click.stop="clearSelectedArticle"
                    />
                    <UIcon
                      name="i-lucide-chevron-down"
                      class="size-4 text-slate-400 transition-transform duration-200"
                      :class="{ 'rotate-180': showArticleDropdown }"
                    />
                  </div>
                </template>
              </UInput>

              <!-- Dropdown danh sách bài viết -->
              <div
                v-if="showArticleDropdown"
                class="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 p-1.5 space-y-1"
              >
                <div v-if="articleSearchLoading" class="p-3 text-center text-xs text-muted">
                  <UIcon name="i-lucide-loader-2" class="size-4 animate-spin inline-block mr-1" />
                  Đang tìm kiếm bài viết...
                </div>
                <div v-else-if="articleOptions.length === 0" class="p-4 text-center text-xs text-muted">
                  Không tìm thấy bài viết nào phù hợp
                </div>
                <button
                  v-for="art in articleOptions"
                  v-else
                  :key="art.id"
                  type="button"
                  class="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors cursor-pointer"
                  :class="form.article_id === art.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-800 dark:text-slate-200'"
                  @click="selectArticle(art)"
                >
                  <div class="size-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      v-if="art.thumbnail"
                      :src="resolveImageUrl(art.thumbnail)"
                      :alt="art.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                      <UIcon name="i-lucide-file-text" class="size-4" />
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-semibold truncate">{{ art.title }}</div>
                    <div class="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                      <UBadge
                        :label="art.category === 'policy' ? 'Chính sách' : 'Cẩm nang'"
                        :color="art.category === 'policy' ? 'warning' : 'primary'"
                        variant="subtle"
                        size="xs"
                      />
                      <span class="font-mono text-slate-400">{{ art.url }}</span>
                    </div>
                  </div>
                  <UIcon
                    v-if="form.article_id === art.id"
                    name="i-lucide-check-circle-2"
                    class="size-4 text-primary shrink-0"
                  />
                </button>
              </div>
            </div>

            <!-- Bài viết đang được chọn -->
            <div
              v-if="form.article_title"
              class="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <UIcon name="i-lucide-link" class="size-4 text-emerald-600 shrink-0" />
                <div class="truncate">
                  <span class="font-bold text-emerald-900 dark:text-emerald-200">Đã gán bài viết: </span>
                  <span class="text-emerald-700 dark:text-emerald-300 font-semibold">{{ form.article_title }}</span>
                  <span class="font-mono text-[11px] text-emerald-600/80 ml-1.5">({{ form.link }})</span>
                </div>
              </div>
              <UButton
                size="xs"
                variant="ghost"
                color="error"
                icon="i-lucide-x"
                class="shrink-0 ml-2"
                title="Bỏ gán bài viết này"
                @click="clearSelectedArticle"
              />
            </div>
          </div>

          <!-- Chế độ 2: Tự nhập đường dẫn URL -->
          <div v-else class="space-y-2">
            <UFormField
              label="Đường dẫn liên kết (URL)"
              name="link"
              help="Có thể nhập link nội bộ (VD: /blog/uu-dai-he, /xe-rieng-sai-gon-di-vung-tau) hoặc link ngoài (https://...)"
            >
              <UInput
                v-model="form.link"
                placeholder="VD: /blog/bi-quyet-du-lich-da-lat"
                leading-icon="i-lucide-external-link"
                class="w-full"
                size="md"
                @blur="autoSave"
              />
            </UFormField>
          </div>
        </div>

        <!-- 4. Nút bấm & Tần suất hiển thị -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <h2 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <UIcon name="i-lucide-sliders-horizontal" class="size-4 text-primary" />
            Tùy chỉnh nút bấm & Tần suất
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Chữ trên nút bấm -->
            <UFormField
              label="Chữ trên nút kêu gọi (CTA Button)"
              name="button_text"
              help="Hiển thị ở chân modal thông báo (tự lưu khi rời chuột)"
            >
              <UInput
                v-model="form.button_text"
                placeholder="Xem chi tiết"
                class="w-full"
                size="md"
                @blur="autoSave"
              />
            </UFormField>

            <!-- Tần suất hiển thị -->
            <UFormField
              label="Tần suất xuất hiện cho khách"
              name="display_frequency"
              help="Kiểm soát số lần bật popup để không làm phiền khách"
            >
              <select
                v-model="form.display_frequency"
                class="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-primary"
                @change="autoSave"
              >
                <option value="new_only">Chỉ hiển thị khi có popup mới (Khuyên dùng)</option>
                <option value="daily">1 lần mỗi ngày</option>
                <option value="session">1 lần mỗi phiên duyệt (Session)</option>
                <option value="always">Luôn hiển thị (Mỗi lần tải trang - Dùng test)</option>
              </select>
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Cột Phải: Xem Trước Trực Quan (Live Preview) (5 cols) -->
      <div class="lg:col-span-5 sticky top-20 space-y-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="size-4 text-primary" />
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Xem trước trực tiếp (Live Preview)</h3>
            </div>
            <UBadge
              :label="form.is_active ? 'Khách sẽ nhìn thấy' : 'Đang ẩn'"
              :color="form.is_active ? 'success' : 'neutral'"
              variant="subtle"
              size="xs"
              class="font-bold"
            />
          </div>

          <!-- Giả lập màn hình Popup -->
          <div class="relative bg-slate-900/60 p-6 rounded-2xl flex items-center justify-center min-h-[440px] overflow-hidden backdrop-blur-xs">
            <!-- Khung Modal Popup Giả lập (Co giãn theo ảnh) -->
            <div class="relative w-fit max-w-[340px] max-h-[480px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <!-- Nút đóng (X) giả lập -->
              <button
                type="button"
                class="absolute -top-3 -right-3 size-8 rounded-full bg-slate-900/90 text-white hover:bg-black shadow-lg border border-white/20 flex items-center justify-center backdrop-blur-sm z-30 cursor-pointer transition-transform active:scale-95"
                title="Đóng modal"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>

              <div class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col w-fit max-h-[460px]">
                <!-- Ảnh Banner -->
                <div class="relative overflow-hidden flex items-center justify-center bg-slate-950/5">
                  <img
                    v-if="form.image"
                    :src="resolveImageUrl(form.image)"
                    :alt="form.title || 'Thông báo'"
                    class="w-auto h-auto max-w-[320px] max-h-[340px] object-contain block"
                  />
                  <div v-else class="w-64 h-64 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <UIcon name="i-lucide-image" class="size-12 mb-2 text-slate-300" />
                    <p class="text-xs font-semibold">Chưa có ảnh banner</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">Vui lòng tải ảnh lên ở cột bên trái</p>
                  </div>
                </div>

                <!-- Chân modal gọn gàng -->
                <div
                  v-if="form.link || form.title"
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 flex items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800"
                >
                  <p v-if="form.title" class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex-1">
                    {{ form.title }}
                  </p>

                  <button
                    v-if="form.link"
                    type="button"
                    class="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white font-extrabold text-xs shadow-md shadow-primary/30 transition-all hover:scale-105 active:scale-95 cursor-pointer ml-auto"
                  >
                    <span>{{ form.button_text || 'Xem chi tiết' }}</span>
                    <UIcon name="i-lucide-arrow-right" class="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-muted flex items-center gap-2">
            <UIcon name="i-lucide-info" class="size-4 text-primary shrink-0" />
            <span>Modal này chỉ hiển thị tại <strong>Trang chủ</strong> theo đúng cấu hình tần suất bạn đã chọn.</span>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { uploadService } from '~/services/upload.service'
import { popupService, type PopupModalData, type ArticleOption } from '~/services/popup.service'
import { resolveImageUrl } from '~/utils'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { adminToken } = useAuth()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const lastSavedText = ref('')
const uploading = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const linkMode = ref<'article' | 'custom'>('article')
const showArticleDropdown = ref(false)
const articleSearch = ref('')
const articleSearchLoading = ref(false)
const articleOptions = ref<ArticleOption[]>([])

const imageDimensions = reactive({
  width: 0,
  height: 0,
})

const form = reactive<PopupModalData>({
  title: 'Ưu đãi đặt xe Happy Trip',
  image: '',
  link: '',
  article_id: null,
  article_slug: '',
  article_title: '',
  button_text: 'Xem chi tiết',
  is_active: false,
  display_frequency: 'new_only',
})

// Load modal data
async function loadData() {
  if (!adminToken.value) return
  loading.value = true
  try {
    const data = await popupService.getAdminPopupModal(adminToken.value)
    if (data) {
      form.title = data.title || ''
      form.image = data.image || ''
      form.link = data.link || ''
      form.article_id = data.article_id || null
      form.article_slug = data.article_slug || ''
      form.article_title = data.article_title || ''
      form.button_text = data.button_text || 'Xem chi tiết'
      form.is_active = Boolean(data.is_active)
      form.display_frequency = data.display_frequency || 'daily'

      if (form.article_id || form.article_title) {
        linkMode.value = 'article'
      } else if (form.link) {
        linkMode.value = 'custom'
      }
    }

    // Load initial article options
    await fetchArticleOptions()
  } catch (error: any) {
    toast.add({
      title: 'Không thể tải cấu hình',
      description: error?.message || 'Vui lòng thử lại sau',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    loading.value = false
  }
}

// Fetch article suggestions
async function fetchArticleOptions(keyword = '') {
  if (!adminToken.value) return
  articleSearchLoading.value = true
  try {
    const res = await popupService.searchArticleOptions(adminToken.value, keyword)
    articleOptions.value = res
  } catch {
    articleOptions.value = []
  } finally {
    articleSearchLoading.value = false
  }
}

let searchTimer: any = null
function onSearchArticles() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchArticleOptions(articleSearch.value)
  }, 300)
}

function onToggleActive(val: boolean) {
  if (val && !form.image) {
    nextTick(() => {
      form.is_active = false
    })
    toast.add({
      title: 'Chưa có ảnh banner',
      description: 'Vui lòng tải ảnh lên trước khi bật hiển thị modal',
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }
  autoSave()
}

function selectArticle(art: ArticleOption) {
  form.article_id = art.id
  form.article_title = art.title
  form.article_slug = art.slug
  form.link = art.url
  showArticleDropdown.value = false
  autoSave()
}

function clearSelectedArticle() {
  form.article_id = null
  form.article_title = ''
  form.article_slug = ''
  form.link = ''
  articleSearch.value = ''
  autoSave()
}

// Image handling
function triggerFileInput() {
  fileInputRef.value?.click()
}

async function uploadFile(file: File) {
  if (!file) return

  // Validate file type & size
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    toast.add({
      title: 'Định dạng không hỗ trợ',
      description: 'Chỉ chấp nhận file ảnh PNG, JPG, WEBP, GIF',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      title: 'Dung lượng ảnh quá lớn',
      description: 'Dung lượng ảnh không được vượt quá 5MB',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  uploading.value = true
  try {
    const res = await uploadService.upload(file)
    if (res?.url) {
      form.image = res.url
      toast.add({
        title: 'Tải ảnh thành công',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
      await autoSave()
    }
  } catch (error: any) {
    toast.add({
      title: 'Tải ảnh thất bại',
      description: error?.message || 'Có lỗi khi upload file',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    uploading.value = false
  }
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    uploadFile(input.files[0])
  }
}

function onDropFile(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    uploadFile(event.dataTransfer.files[0])
  }
}

function clearImage() {
  form.image = ''
  form.is_active = false // Không có ảnh thì mặc định tắt
  imageDimensions.width = 0
  imageDimensions.height = 0
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  autoSave()
}

function onImageLoaded(e: Event) {
  const img = e.target as HTMLImageElement
  imageDimensions.width = img.naturalWidth
  imageDimensions.height = img.naturalHeight
}

// Tự động lưu cấu hình
async function autoSave(showToast = false) {
  if (!adminToken.value) return

  // Nếu không có ảnh thì mặc định tắt hiển thị
  if (!form.image) {
    form.is_active = false
  }

  saving.value = true
  try {
    await popupService.saveAdminPopupModal(adminToken.value, {
      title: form.title,
      image: form.image,
      link: form.link,
      article_id: form.article_id,
      button_text: form.button_text,
      is_active: form.is_active,
      display_frequency: form.display_frequency,
    })

    const now = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date())

    lastSavedText.value = now

    if (showToast) {
      toast.add({
        title: 'Đã lưu cấu hình',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Tự động lưu thất bại',
      description: error?.message || 'Có lỗi xảy ra',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    saving.value = false
  }
}

// Giữ lại hàm saveConfig nếu cần gọi thủ công
const saveConfig = () => autoSave(true)

// Click outside to close article dropdown
onMounted(() => {
  loadData()
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showArticleDropdown.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
