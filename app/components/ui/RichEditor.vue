<template>
  <div class="rich-editor border border-default rounded-lg overflow-hidden bg-default">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap gap-1 p-2 border-b border-default bg-elevated">
      <UTooltip text="In đậm">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-bold"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('bold') }"
          @click="void editor.chain().focus().toggleBold().run()"
        />
      </UTooltip>
      <UTooltip text="In nghiêng">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-italic"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('italic') }"
          @click="void editor.chain().focus().toggleItalic().run()"
        />
      </UTooltip>
      <UTooltip text="Gạch ngang">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-strikethrough"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('strike') }"
          @click="void editor.chain().focus().toggleStrike().run()"
        />
      </UTooltip>
      <div class="w-px bg-default mx-1" />
      <UTooltip text="Tiêu đề 1">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-heading-1"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('heading', { level: 1 }) }"
          @click="void editor.chain().focus().toggleHeading({ level: 1 }).run()"
        />
      </UTooltip>
      <UTooltip text="Tiêu đề 2">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-heading-2"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('heading', { level: 2 }) }"
          @click="void editor.chain().focus().toggleHeading({ level: 2 }).run()"
        />
      </UTooltip>
      <UTooltip text="Tiêu đề 3">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-heading-3"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('heading', { level: 3 }) }"
          @click="void editor.chain().focus().toggleHeading({ level: 3 }).run()"
        />
      </UTooltip>
      <div class="w-px bg-default mx-1" />
      <UTooltip text="Danh sách không thứ tự">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-list"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('bulletList') }"
          @click="void editor.chain().focus().toggleBulletList().run()"
        />
      </UTooltip>
      <UTooltip text="Danh sách có thứ tự">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-list-ordered"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('orderedList') }"
          @click="void editor.chain().focus().toggleOrderedList().run()"
        />
      </UTooltip>
      <UTooltip text="Trích dẫn">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-quote"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('blockquote') }"
          @click="void editor.chain().focus().toggleBlockquote().run()"
        />
      </UTooltip>
      <div class="w-px bg-default mx-1" />
      <UTooltip text="Chèn liên kết">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-link"
          :class="{ 'bg-primary/10 text-primary': editor.isActive('link') }"
          @click="setLink"
        />
      </UTooltip>
      <UTooltip text="Chèn ảnh (Khuyến nghị rộng 800 - 1200px, < 5MB)">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-image"
          @click="addImage"
        />
      </UTooltip>
      <div class="w-px bg-default mx-1" />
      <!-- Table controls -->
      <UTooltip text="Chèn bảng (3×3)">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-table"
          @click="insertTable"
        />
      </UTooltip>
      <UTooltip text="Thêm cột bên trái">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-between-horizontal-start"
          :disabled="!editor.can().addColumnBefore()"
          @click="void editor.chain().focus().addColumnBefore().run()"
        />
      </UTooltip>
      <UTooltip text="Thêm cột bên phải">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-between-horizontal-end"
          :disabled="!editor.can().addColumnAfter()"
          @click="void editor.chain().focus().addColumnAfter().run()"
        />
      </UTooltip>
      <UTooltip text="Thêm hàng bên dưới">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-table-rows-split"
          :disabled="!editor.can().addRowAfter()"
          @click="void editor.chain().focus().addRowAfter().run()"
        />
      </UTooltip>
      <UTooltip text="Xóa cột">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-columns-3"
          :disabled="!editor.can().deleteColumn()"
          @click="void editor.chain().focus().deleteColumn().run()"
        />
      </UTooltip>
      <UTooltip text="Xóa hàng">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-rows-3"
          :disabled="!editor.can().deleteRow()"
          @click="void editor.chain().focus().deleteRow().run()"
        />
      </UTooltip>
      <UTooltip text="Gộp các ô đã chọn">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-table-cells-merge"
          :disabled="!editor.can().mergeCells()"
          @click="void editor.chain().focus().mergeCells().run()"
        />
      </UTooltip>
      <UTooltip text="Tách ô đã gộp">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-table-cells-split"
          :disabled="!editor.can().splitCell()"
          @click="void editor.chain().focus().splitCell().run()"
        />
      </UTooltip>
      <UTooltip text="Xóa toàn bộ bảng">
        <UButton
          size="xs" variant="ghost" icon="i-lucide-trash-2"
          :disabled="!editor.can().deleteTable()"
          @click="void editor.chain().focus().deleteTable().run()"
          color="error"
        />
      </UTooltip>
      <div class="w-px bg-default mx-1" />
      <UTooltip text="Hoàn tác (Ctrl+Z)">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-undo"
          :disabled="!editor.can().undo()"
          @click="void editor.chain().focus().undo().run()"
        />
      </UTooltip>
      <UTooltip text="Làm lại (Ctrl+Y)">
        <UButton
          size="xs" variant="ghost" color="neutral" icon="i-lucide-redo"
          :disabled="!editor.can().redo()"
          @click="void editor.chain().focus().redo().run()"
        />
      </UTooltip>
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
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

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
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
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

function insertTable() {
  if (!editor.value) return
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
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

/* Table styles */
.rich-editor .ProseMirror table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
  margin: 1em 0;
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid var(--ui-border);
}
.rich-editor .ProseMirror td,
.rich-editor .ProseMirror th {
  min-width: 1em;
  padding: 8px 12px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
  border-bottom: 1px solid var(--ui-border);
  border-right: 1px solid var(--ui-border);
}
.rich-editor .ProseMirror th:last-child,
.rich-editor .ProseMirror td:last-child {
  border-right: none;
}
.rich-editor .ProseMirror tr:last-child td {
  border-bottom: none;
}
.rich-editor .ProseMirror th {
  font-weight: 700;
  text-align: left;
  background-color: var(--ui-primary);
  color: #fff;
}
.rich-editor .ProseMirror .selectedCell::after {
  z-index: 2;
  position: absolute;
  content: '';
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(var(--ui-primary-rgb, 59 130 246) / 0.18);
  pointer-events: none;
}
.rich-editor .ProseMirror .column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  background-color: var(--ui-primary);
  pointer-events: none;
}
.rich-editor .ProseMirror.resize-cursor { cursor: col-resize; }
</style>
