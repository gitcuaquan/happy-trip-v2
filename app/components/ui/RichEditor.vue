<template>
  <div class="rich-editor border border-default rounded-lg overflow-hidden bg-default">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap gap-1 p-2 border-b border-default bg-elevated">
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-bold"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        aria-label="In đậm"
      />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-italic"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        aria-label="In nghiêng"
      />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-strikethrough"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
        aria-label="Gạch ngang"
      />
      <div class="w-px bg-default mx-1" />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-heading-1"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        aria-label="Tiêu đề 1"
      />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-heading-2"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        aria-label="Tiêu đề 2"
      />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-heading-3"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        aria-label="Tiêu đề 3"
      />
      <div class="w-px bg-default mx-1" />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-list"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        aria-label="Danh sách không thứ tự"
      />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-list-ordered"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
        aria-label="Danh sách có thứ tự"
      />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-quote"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
        aria-label="Trích dẫn"
      />
      <div class="w-px bg-default mx-1" />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-link"
        :class="{ 'bg-primary/10 text-primary': editor.isActive('link') }"
        @click="setLink"
        aria-label="Chèn liên kết"
      />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-image"
        @click="addImage"
        aria-label="Chèn ảnh"
      />
      <div class="w-px bg-default mx-1" />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-undo"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
        aria-label="Hoàn tác"
      />
      <UButton
        size="xs" variant="ghost" color="neutral" icon="i-lucide-redo"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
        aria-label="Làm lại"
      />
    </div>
    <!-- Editor -->
    <EditorContent :editor="editor" class="rich-content p-4 min-h-[280px] focus:outline-none" />
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'upload-image', file: File, callback: (url: string) => void): void
}>()

const editor = ref<Editor>()

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue || '',
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: props.placeholder ?? 'Viết nội dung bài viết...' }),
    ],
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
  })
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val || '', { emitUpdate: false })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setLink() {
  if (!editor.value) return
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl ?? '')
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function addImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file || !editor.value) return
    emit('upload-image', file, (url) => {
      editor.value?.chain().focus().setImage({ src: url }).run()
    })
  }
  input.click()
}
</script>

<style>
.rich-editor .ProseMirror { outline: none; min-height: 240px; line-height: 1.6; }
.rich-editor .ProseMirror p { margin: 0.5em 0; }
.rich-editor .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin: 1em 0 0.5em; }
.rich-editor .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 1em 0 0.5em; }
.rich-editor .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 1em 0 0.5em; }
.rich-editor .ProseMirror ul, .rich-editor .ProseMirror ol { padding-left: 1.5rem; margin: 0.5em 0; }
.rich-editor .ProseMirror ul { list-style: disc; }
.rich-editor .ProseMirror ol { list-style: decimal; }
.rich-editor .ProseMirror blockquote {
  border-left: 3px solid var(--ui-border);
  padding-left: 1rem; color: var(--ui-text-muted); font-style: italic;
  margin: 1em 0;
}
.rich-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left; color: var(--ui-text-muted);
  pointer-events: none; height: 0;
}
.rich-editor .ProseMirror img { max-width: 100%; height: auto; border-radius: 8px; }
.rich-editor .ProseMirror a { color: var(--ui-primary); text-decoration: underline; }
.rich-editor .ProseMirror strong { font-weight: 700; }
.rich-editor .ProseMirror em { font-style: italic; }
</style>
