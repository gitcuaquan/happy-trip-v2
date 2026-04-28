<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="pending" class="py-20 text-center">
      <USkeleton class="h-8 w-64 mx-auto mb-4 rounded" />
      <USkeleton class="h-4 w-full max-w-2xl mx-auto mb-2 rounded" />
      <USkeleton class="h-4 w-3/4 max-w-2xl mx-auto rounded" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center py-32 px-4 text-center">
      <UIcon name="i-lucide-file-x" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-400 mb-6">Không tìm thấy bài viết </p>
      <UButton color="primary" icon="i-lucide-arrow-left" @click="navigateTo('/policy')">
        Quay lại trang chủ
      </UButton>
    </div>

    <template v-else>
      <div class="relative min-h-56 lg:min-h-72 overflow-hidden bg-slate-800 flex flex-col justify-end">
        <img v-if="article?.thumbnail" :src="`https://happytrip.vn${article.thumbnail}`"
          :alt="article.title || article.name" class="absolute inset-0 w-full h-full object-cover opacity-60">

        <div
          class="relative z-10 w-full pt-10 pb-5 bg-linear-to-t from-slate-900/95 to-transparent cursor-pointer transition-all duration-300">
          <UContainer class="max-w-3xl">
            <div class="flex items-center gap-2 text-white/80 text-xs mb-2 lg:mb-3">
              <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
              {{ formatDate(article?.created_at) }}
            </div>

            <h1 class="text-sm lg:text-3xl font-extrabold text-white leading-snug transition-all duration-300">
              {{ article?.title || article?.name }}
            </h1>

            <p v-if="subtitle" class="mt-1 lg:mt-2 text-xs lg:text-sm text-white/60 italic transition-all duration-300">
              {{ subtitle }}
            </p>

          
          </UContainer>
        </div>
      </div>

      <UContainer class="max-w-3xl pt-10 px-4 sm:px-6 pb-20">
        <div class="bg-white rounded-xs shadow-sm border border-slate-100 p-6 sm:p-10">
          <div class="doc-content" v-html="formatContent(article?.content)"></div>
        </div>
      </UContainer>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { BlogService } from '~/services/blog.service';

const route = useRoute()
const slug = route.params.slug as string
const blogService = new BlogService()




const { data: article, pending, error } = await useAsyncData(
  `policy-${slug}`,
  () => blogService.getPageDetail(slug)
)

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date))
  } catch {
    return ''
  }
}
// Trích xuất subtitle từ nội dung thô (đoạn văn đầu tiên hợp lệ)
function extractSubtitle(raw?: string): string {
  if (!raw) return ''
  const matches = [...raw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
  for (const m of matches) {
    const text = (m[1] ?? '').replace(/<[^>]+>/g, '').trim()
    if (!text) continue
    if (/^\d+[\.\s]/.test(text)) break
    if (/^cập nhật:/i.test(text)) continue
    if (/^điều khoản/i.test(text)) continue
    return text
  }
  return ''
}

const RE_H2 = /^\d{1,2}\.\s+\p{L}/u
const RE_H3 = /^\d+\.\d+\.\s+\p{L}/u
const RE_SUB = /^\d+\.\d+\.\d+[\.\s]/
// Chuyển đổi nội dung: H2 thường → H2 uppercase, H3 thường → H3, loại bỏ thẻ p thừa
function formatContent(raw?: string): string {
  if (!raw || import.meta.server) return raw ?? ''

  const doc = new DOMParser().parseFromString(raw, 'text/html')
  const body = doc.body

  body.querySelectorAll('h1').forEach(el => el.remove())

  body.querySelectorAll('p').forEach(p => {
    const plain = p.textContent?.trim() ?? ''
    if (!plain) { p.remove(); return }

    const children = [...p.children]

    if (
      children.length === 1 &&
      children[0] && children[0].tagName === 'STRONG' &&
      RE_H2.test(plain) &&
      !RE_H3.test(plain)
    ) {
      const h2 = doc.createElement('h2')
      h2.textContent = plain
      return p.replaceWith(h2)
    }

    if (RE_H3.test(plain) && !RE_SUB.test(plain)) {
      const h3 = doc.createElement('h3')
      h3.innerHTML = p.innerHTML
      return p.replaceWith(h3)
    }
  })

  const firstH2 = body.querySelector('h2')
  if (firstH2) {
    let node: ChildNode | null = body.firstChild
    while (node && node !== firstH2) {
      const next = node.nextSibling
      node.remove()
      node = next
    }
  }

  return body.innerHTML
}

const subtitle = computed(() => extractSubtitle(article.value?.content))
</script>

<style scoped>
/* ══════════════════════════════════════════
   BASE
══════════════════════════════════════════ */
:deep(.doc-content) {
  font-size: 15px;
  line-height: 1.85;
  color: #374151;
}

/* ══════════════════════════════════════════
   PARAGRAPH
══════════════════════════════════════════ */
:deep(.doc-content p) {
  margin: 0 0 10px 0;
  padding-left: 0;
  text-align: justify;
}

/* Dòng trống → ẩn */
:deep(.doc-content p:empty) {
  display: none;
}

/* ══════════════════════════════════════════
   H2
══════════════════════════════════════════ */
:deep(.doc-content h2) {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.5;
  margin: 32px 0 8px 0;
  padding: 0;
}

:deep(.doc-content h2:first-child) {
  margin-top: 0;
}

/* ══════════════════════════════════════════
   H3
══════════════════════════════════════════ */
:deep(.doc-content h3) {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.6;
  margin: 14px 0 6px 0;
  padding-left: 20px;
}

:deep(.doc-content h3 + p) {
  padding-left: 20px;
}

/* ══════════════════════════════════════════
   DOC-INDENT
══════════════════════════════════════════ */
:deep(.doc-content p.doc-indent),
:deep(.doc-content .ql-indent-1) {
  padding-left: 36px;
  margin-bottom: 6px;
}

:deep(.doc-content .ql-indent-2) {
  padding-left: 52px;
}

:deep(.doc-content .ql-indent-3) {
  padding-left: 68px;
}

/* ══════════════════════════════════════════
   STRONG / BOLD
══════════════════════════════════════════ */
:deep(.doc-content strong),
:deep(.doc-content b) {
  font-weight: 600;
  color: #111827;
}

/* ══════════════════════════════════════════
   QUILL ALIGNMENT
══════════════════════════════════════════ */
:deep(.doc-content .ql-align-justify) {
  text-align: justify;
}

:deep(.doc-content .ql-align-center) {
  text-align: center;
}

:deep(.doc-content .ql-align-right) {
  text-align: right;
}

:deep(.doc-content .ql-align-left) {
  text-align: left;
}

/* ══════════════════════════════════════════
   LINKS
══════════════════════════════════════════ */
:deep(.doc-content a) {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ══════════════════════════════════════════
   QUILL LIST
══════════════════════════════════════════ */
:deep(.doc-content ol),
:deep(.doc-content ul) {
  padding-left: 0;
  margin: 4px 0 10px 0;
  list-style: none;
  counter-reset: list-0 list-1 list-2;
}

:deep(.doc-content li) {
  position: relative;
  padding-left: 1.8em;
  margin-bottom: 6px;
  line-height: 1.75;
}

:deep(.doc-content li::before) {
  position: absolute;
  left: 0;
  width: 1.4em;
  text-align: right;
}

:deep(.doc-content li[data-list="bullet"]::before) {
  content: '•';
  color: #6b7280;
}

:deep(.doc-content li[data-list="ordered"]) {
  counter-increment: list-0;
}

:deep(.doc-content li[data-list="ordered"]::before) {
  content: counter(list-0, decimal) '.';
  color: #374151;
  font-weight: 500;
}

:deep(.doc-content li[data-list="bullet"].ql-indent-1) {
  padding-left: 3.2em;
}

:deep(.doc-content li[data-list="bullet"].ql-indent-1::before) {
  content: '○';
  left: 1.6em;
  color: #9ca3af;
}

:deep(.doc-content li[data-list="bullet"].ql-indent-2) {
  padding-left: 4.8em;
}

:deep(.doc-content li[data-list="bullet"].ql-indent-2::before) {
  content: '▪';
  left: 3.2em;
  color: #9ca3af;
}

:deep(.doc-content li[data-list="ordered"].ql-indent-1) {
  counter-increment: list-1;
  padding-left: 3.2em;
}

:deep(.doc-content li[data-list="ordered"].ql-indent-1::before) {
  content: counter(list-1, lower-alpha) '.';
  left: 1.6em;
}

:deep(.doc-content ul:not([data-list]) li),
:deep(.doc-content ol:not([data-list]) li) {
  list-style: revert;
  padding-left: 0;
}

:deep(.doc-content ul:not([data-list])),
:deep(.doc-content ol:not([data-list])) {
  padding-left: 1.5em;
}

/* ══════════════════════════════════════════
   IMAGE
══════════════════════════════════════════ */
:deep(.doc-content img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px auto;
  display: block;
}

/* ══════════════════════════════════════════
   TABLE
══════════════════════════════════════════ */
:deep(.doc-content table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0 18px;
  font-size: 14px;
}

:deep(.doc-content th) {
  background: #f1f5f9;
  font-weight: 600;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

:deep(.doc-content td) {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  vertical-align: top;
}

:deep(.doc-content tr:nth-child(even) td) {
  background: #f8fafc;
}
</style>