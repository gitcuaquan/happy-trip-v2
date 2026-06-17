<template>
  <UContainer class="py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          @click="navigateTo('/admin/quan-ly/blog')"
        />
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800">
            {{ isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới' }}
          </h1>
          <p class="text-sm text-muted mt-0.5">
            {{ isEditMode ? `Đang chỉnh sửa bài viết: ${form.title || '(không tiêu đề)'}` : 'Điền thông tin để tạo bài viết mới' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading detail -->
    <div v-if="detailLoading" class="bg-white rounded-lg border border-slate-200 p-12 text-center">
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
      <!-- Cột trái: nội dung -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <UFormField label="Tiêu đề bài viết" name="title" required>
            <UInput
              v-model="form.title"
              placeholder="Nhập tiêu đề bài viết..."
              class="w-full"
              size="lg"
            />
          </UFormField>

          <UFormField label="Đường dẫn (slug)" name="slug" required>
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
                  color="neutral"
                  icon="i-lucide-wand-sparkles"
                  label="Tự sinh"
                  @click="form.slug = slugify(form.title || '')"
                />
              </template>
            </UInput>
            <template #help>
              Đường dẫn URL của bài viết. Chỉ dùng chữ thường, số và dấu gạch ngang.
            </template>
          </UFormField>

          <UFormField label="Mô tả ngắn (excerpt)" name="excerpt">
            <UTextarea
              v-model="excerpt"
              placeholder="Mô tả ngắn về bài viết, hiển thị ở danh sách..."
              :rows="3"
              :maxrows="5"
              autoresize
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 p-6">
          <label class="text-sm font-bold text-slate-700 mb-3 block">
            Nội dung bài viết <span class="text-red-500">*</span>
          </label>
          <UiRichEditor
            v-model="form.content"
            placeholder="Bắt đầu viết nội dung bài viết..."
            @upload-image="onUploadImage"
          />
          <p v-if="contentError" class="text-xs text-red-500 mt-2">
            {{ contentError }}
          </p>
        </div>
      </div>

      <!-- Cột phải: thumbnail + status + submit -->
      <div class="space-y-6">
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <label class="text-sm font-bold text-slate-700 block">Ảnh đại diện</label>

          <div
            v-if="form.thumbnail"
            class="relative rounded-lg overflow-hidden border border-slate-200"
          >
            <img :src="resolveImageUrl(form.thumbnail)" alt="thumbnail" class="w-full h-48 object-cover" />
            <UButton
              icon="i-lucide-x"
              color="error"
              variant="solid"
              size="xs"
              class="absolute top-2 right-2"
              @click="form.thumbnail = ''"
            />
          </div>

          <div
            v-else
            class="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center"
          >
            <UIcon name="i-lucide-image" class="size-10 text-slate-300 mx-auto mb-2" />
            <p class="text-xs text-slate-500 mb-3">Chưa có ảnh đại diện</p>
          </div>

          <UButton
            type="button"
            block
            color="primary"
            variant="outline"
            icon="i-lucide-upload"
            :label="form.thumbnail ? 'Đổi ảnh đại diện' : 'Tải ảnh đại diện'"
            :loading="uploadingThumb"
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

        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold text-slate-700">Trạng thái</p>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ form.status ? 'Bài viết hiển thị công khai' : 'Bài viết đang tắt' }}
              </p>
            </div>
            <USwitch v-model="form.status" color="success" />
          </div>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-3">
          <UButton
            type="submit"
            block
            color="primary"
            size="lg"
            :icon="isEditMode ? 'i-lucide-save' : 'i-lucide-rocket'"
            :label="isEditMode ? 'Cập nhật bài viết' : 'Đăng bài viết'"
            :loading="submitting"
          />
          <UButton
            type="button"
            block
            variant="ghost"
            color="neutral"
            label="Hủy"
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

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  slug: z
    .string()
    .min(1, 'Vui lòng nhập slug')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
})

const form = reactive<PagePayload & { content: string; thumbnail: string; title: string; slug: string }>({
  title: '',
  slug: '',
  thumbnail: '',
  content: '',
  status: true,
})

// excerpt không thuộc PagePayload — track riêng để gửi kèm body
const excerpt = ref('')

const detailLoading = ref(false)
const submitting = ref(false)
const submitError = ref('')
const contentError = ref('')

// === Thumbnail upload ===
const thumbInput = ref<HTMLInputElement | null>(null)
const uploadingThumb = ref(false)

function pickThumbnail() {
  console.log('[pickThumbnail] click trigger, input ref:', thumbInput.value)
  if (!thumbInput.value) {
    console.error('[pickThumbnail] thumbInput ref is NULL — input chưa mount')
    return
  }
  thumbInput.value.click()
}

async function onThumbnailSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) {
    console.warn('[onThumbnailSelected] no file selected')
    return
  }
  uploadingThumb.value = true
  try {
    const url = await blogService.uploadFile(adminToken.value || '', file, 'page')
    if (url) {
      form.thumbnail = url
      toast.add({
        title: 'Tải ảnh thành công',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    } else {
      throw new Error('No URL returned')
    }
  } catch (err) {
    console.error(err)
    toast.add({
      title: 'Không thể tải ảnh',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    uploadingThumb.value = false
    if (thumbInput.value) thumbInput.value.value = ''
  }
}

// === Inline image upload trong RichEditor ===
async function onUploadImage(file: File, cb: (url: string) => void) {
  try {
    const url = await blogService.uploadFile(adminToken.value || '', file, 'page')
    if (url) cb(resolveImageUrl(url))  // resolve URL đầy đủ để ảnh hiển thị được ở mọi domain
  } catch (err) {
    console.error(err)
    toast.add({
      title: 'Không thể tải ảnh nội dung',
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
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// === Load detail nếu mode sửa ===
async function loadDetail() {
  if (!isEditMode.value) return
  detailLoading.value = true
  try {
    const data = await blogService.getPageDetail(editId.value)
    form.title = data.title || data.name || ''
    form.slug = data.slug || ''
    form.thumbnail = data.thumbnail || ''
    form.content = typeof data.content === 'string' ? data.content : ''
    excerpt.value = data.excerpt || ''
    const status = (data as typeof data & { status?: boolean }).status
    form.status = status !== false
    slugTouched = true
  } catch (err) {
    console.error(err)
    toast.add({
      title: 'Không thể tải bài viết',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    navigateTo('/admin/quan-ly/blog')
  } finally {
    detailLoading.value = false
  }
}

// === Submit ===
async function onSubmit(_e: FormSubmitEvent<{ title: string; slug: string }>) {
  if (!adminToken.value) {
    toast.add({
      title: 'Chưa đăng nhập admin',
      description: 'Vui lòng đăng nhập lại để tiếp tục',
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
    const payload: PagePayload & { excerpt?: string } = {
      title: form.title,
      slug: form.slug,
      thumbnail: form.thumbnail || undefined,
      content: form.content,
      status: form.status,
      excerpt: excerpt.value || undefined,
    }

    if (isEditMode.value) {
      payload.id = editId.value
      await blogService.updatePage(adminToken.value, editId.value, payload)
      toast.add({
        title: 'Đã cập nhật bài viết',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    } else {
      await blogService.createPage(adminToken.value, payload)
      toast.add({
        title: 'Đã đăng bài viết',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    }
    navigateTo('/admin/quan-ly/blog')
  } catch (err) {
    const e = err as { data?: { message?: string }; message?: string }
    submitError.value =
      e?.data?.message || e?.message || 'Không thể lưu bài viết. Vui lòng thử lại.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>
